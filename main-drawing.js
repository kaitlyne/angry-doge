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

              this.floor_y = -8;
              this.bouncing_ball = {
                  velocity: vec3(0.03, 0.03, 0.03),
                  center_pos: vec3(1, 1, 1),
                  transform: mat4(),
                  radius: 2.5
              };
              this.bouncing_ball.transform = mult(this.bouncing_ball.transform,
                      translation(this.bouncing_ball.center_pos[0],
                          this.bouncing_ball.center_pos[1], this.bouncing_ball.center_pos[2]));
              this.bouncing_ball.transform = mult(this.bouncing_ball.transform, 
                      scale(this.bouncing_ball.radius, this.bouncing_ball.radius, this.bouncing_ball.radius));
              // save animation time to calculate time difference b/w frames
              this.last_animation_time = 0;

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use
          },
          'draw_falling_objects': function() {
              var frame_delta = this.graphics_state.animation_time - this.last_animation_time;
              this.last_animation_time = this.graphics_state.animation_time;
              this.bouncing_ball.velocity[1] -= frame_delta / 1e4;
              var displacement = this.bouncing_ball.velocity;
              var new_pos = add(this.bouncing_ball.center_pos, this.bouncing_ball.velocity);
              if (new_pos[1] - this.bouncing_ball.radius < this.floor_y) {
                  console.log(this.bouncing_ball.center_pos[1], new_pos[1]);
                  this.bouncing_ball.velocity[1] *= -0.85;
                  //new_pos = add(this.bouncing_ball.center_pos, this.bouncing_ball.velocity);
                  new_pos = add(vec3(this.bouncing_ball.center_pos[0],
                              this.floor_y + this.bouncing_ball.radius, this.bouncing_ball.center_pos[2]),
                              this.bouncing_ball.velocity);
                  displacement = subtract(new_pos, this.bouncing_ball.center_pos);
              }
              this.bouncing_ball.center_pos = new_pos;
              this.bouncing_ball.transform = mult(translation(displacement[0],
                          displacement[1], displacement[2]),
                          this.bouncing_ball.transform);
              var ball_material = new Material(Color(1, 0, 0, 1), .5, .5, .8, 40);
              shapes_in_use["good_sphere"].draw(this.graphics_state,
                      this.bouncing_ball.transform, ball_material);
          },
          'draw_floor': function() {
              var floor_transform = mat4();
              const floor_scale_factor = 8;
              var floor_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 0, "floor.jpg");
              floor_transform = mult(floor_transform, translation(0, this.floor_y, 0));
              floor_transform = mult(floor_transform, scale(floor_scale_factor, 
                          floor_scale_factor, floor_scale_factor));
              floor_transform = mult(floor_transform, rotation(90, 1, 0, 0));
              const num_floor_blocks = {
                  x: 12,
                  y: 12
              };
              for (var i = 0; i < num_floor_blocks.x; i++) {
                  for (var j = 0; j < num_floor_blocks.y; j++) {
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
