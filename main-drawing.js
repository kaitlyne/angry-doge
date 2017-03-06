// y position for the floor (constant)
const FLOOR_Y_POS = -8;

// Class for a ball capable of motion. Just used es6 syntax here since it's simple,
// and Declare_Any_Class doesn't seem to work? Don't need to inherit Shape or any of those classes anyway.
class Moving_Ball {
    constructor(center_pos, radius, velocity=vec3(0,0,0)) {
        // position of the ball's center
        this.center_pos = center_pos;
        // ball's radius
        this.radius = radius;
        // ball's initial velocity
        this.velocity = velocity;

        // ball's model transform
        this.transform = mat4();
        // set the initial transform to scale with the radius and translate to the initial position
        this.transform = mult(this.transform,
                translation(this.center_pos[0],
                    this.center_pos[1], this.center_pos[2]));
        // rotate the ball 90 degrees so the center of the picture faces the front of the camera
        this.transform = mult(this.transform,
                rotation(-90, 0, 1, 0));
        this.transform = mult(this.transform,
                scale(this.radius, this.radius, this.radius));
    }
    // modify the ball's center, radius, velocity, and transform to simulate falling
    // frame_delta is the change in time, used to calculate velocity
    // gravity_const is the gravitational acceleration to multiply by
    // bounce_factor specifies how much the velocity is multiplied by when bouncing back up
    // from the ground
    apply_gravity(frame_delta, gravity_const, bounce_factor) {
              // change in velocity is acceleration * change in time
              // acceleration in this case is just a constant that looks good
              this.velocity[1] -= frame_delta * gravity_const;
              // set displacement to be velocity
              var displacement = this.velocity;
              // calculate new position with given velocity
              var new_pos = add(this.center_pos, this.velocity);
              // if sphere's bottom is below the floor
              if (new_pos[1] - this.radius < FLOOR_Y_POS) {
                  const bounce_factor = 0.85;
                  // flip the ball's y velocity to make it bounce, multiply by bounce factor
                  this.velocity[1] *= -bounce_factor;
                  // don't want the ball to appear partly "inside" the floor, so adjust the displacement
                  // so that it's right above the floor
                  //new_pos = add(this.center_pos, this.velocity);
                  new_pos = add(vec3(this.center_pos[0],
                              FLOOR_Y_POS + this.radius, this.center_pos[2]),
                              this.velocity);
                  displacement = subtract(new_pos, this.center_pos);
                  console.log(this.center_pos[1], new_pos[1], this.velocity);
              }
              this.center_pos = new_pos;
              // translate the ball by the displacement
              this.transform = mult(translation(displacement[0],
                          displacement[1], displacement[2]),
                          this.transform);
    }
}

  Declare_Any_Class("Main_Drawing", // An example of a displayable object that our class Canvas_Manager can manage.  This one draws the scene's 3D shapes.
      {
          'construct': function(context) {
              this.graphics_state = context.shared_scratchpad.graphics_state;

              this.newest_shapes = {
                  "good_sphere": new Subdivision_Sphere(4),
                  "box": new Cube(),
                  "strip": new Square(),
                  "septagon": new Regular_2D_Polygon(2, 7),
                  "tube": new Cylindrical_Tube(10, 10),
                  "open_cone": new Cone_Tip(3, 10),
                  "donut": new Torus(15, 15),
                  "bad_sphere": new Sphere(10, 10),
                  "cone": new Closed_Cone(10, 10),
                  "capped": new Capped_Cylinder(4, 12),
                  "axis": new Axis_Arrows(),
                  "prism": Capped_Cylinder.prototype.auto_flat_shaded_version(10, 10),
                  "gem": Subdivision_Sphere.prototype.auto_flat_shaded_version(2),
                  "gem2": Torus.prototype.auto_flat_shaded_version(20, 20),
                  "swept_curve": new Surface_Of_Revolution(10, 10, [vec3(2, 0, -1), vec3(1, 0, 0), vec3(1, 0, 1), vec3(0, 0, 2)], 120, [
                      [0, 7][0, 7]
                  ])
              };

              this.doge= new Moving_Ball(vec3(-5, 2, -5), 2.5, vec3(.0, .05, .0));
              this.grumpy = new Moving_Ball(vec3(7, FLOOR_Y_POS + 2.5, 7), 2.5);
              this.chairman = new Moving_Ball(vec3(7, FLOOR_Y_POS + 7.5, 7), 2.5);
              this.sylvester = new Moving_Ball(vec3(3, FLOOR_Y_POS + 2.5, 3), 2.5);
              this.meowth = new Moving_Ball(vec3(3, FLOOR_Y_POS + 7.5, 3), 2.5);
              // save animation time to calculate time difference b/w frames
              this.last_animation_time = 0;

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use
          },
          'draw_falling_objects': function() {
              // get the time since last frame
              var frame_delta = this.graphics_state.animation_time - this.last_animation_time;
              // save the new frame's timestamp
              this.last_animation_time = this.graphics_state.animation_time;
              const gravity_const = 1e-4, bounce_factor = 0.85;
              this.doge.apply_gravity(frame_delta, gravity_const, bounce_factor);
              var ball_material1 = new Material(Color(0, 0, 0, 1), .7, .5, .0, 40, "dogecoin2x1.jpg");
              var ball_material2 = new Material(Color(0, 0, 0, 1), .7, .5, .0, 40, "sylvester2x1.jpg");
              var ball_material3 = new Material(Color(0, 0, 0, 1), .7, .5, .0, 40, "chairman2x1.jpg");
              var ball_material4 = new Material(Color(0, 0, 0, 1), .7, .5, .0, 40, "grumpy2x1.jpg");
              var ball_material5 = new Material(Color(0, 0, 0, 1), .7, .5, .0, 40, "meowth2x1.jpg");
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.doge.transform, ball_material1);
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.grumpy.transform, ball_material2);
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.chairman.transform, ball_material3);
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.sylvester.transform, ball_material4);
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.meowth.transform, ball_material5);
          },
          'draw_floor': function() {
              var floor_transform = mat4();
              const floor_scale_factor = 8;
              var floor_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 0, "floor.jpg");
              floor_transform = mult(floor_transform, translation(0, FLOOR_Y_POS, 0));
              floor_transform = mult(floor_transform, scale(floor_scale_factor,
                          floor_scale_factor, floor_scale_factor));
              floor_transform = mult(floor_transform, rotation(90, 1, 0, 0));
              // number of rows and columns of blocks
              const num_floor_blocks = {
                  x: 12,
                  y: 12
              };
              for (var i = 0; i < num_floor_blocks.x; i++) {
                  for (var j = 0; j < num_floor_blocks.y; j++) {
                      // draw the floor block in the ith row, jth column
                      var translate_transf = translation((i - num_floor_blocks.x / 2) * floor_scale_factor,
                             0, (j - num_floor_blocks.y / 2) * floor_scale_factor);
                      var final_transf = mult(translate_transf, floor_transform);
                      shapes_in_use["strip"].draw(this.graphics_state, final_transf, floor_material);
                  }
              }
          },
          'draw_all_shapes': function(model_transform) {
              this.draw_floor();
              this.draw_falling_objects();
              return;
          },
          'display': function(time) {
              var model_transform = mat4();
              shaders_in_use["Default"].activate();

              for (var i = 0; i < 1; i++) {
                  this.graphics_state.lights = [new Light(vec4(3, 3, 3, 1), Color(1, 0, 0, 1), 100000000),
                      new Light(vec4(3, 3,7, 1), Color(0, 1, 0, 1), 100000000)
                  ];

                  this.draw_all_shapes(model_transform); // *** How to call a function and still have a single matrix state ***
                  //model_transform = mult(model_transform, rotation(360 / 13, 0, 0, 1));
              }
          }
      }, Animation);
