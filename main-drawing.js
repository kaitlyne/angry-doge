//position variables
var x = -15
var z = -50

//level 3 variables
var upper_left_corner;
var upper_right_corner;
var lower_left_corner;
var lower_right_corner;

//level 4 variables
const UP = 1
const DOWN = 0
var upper_bound;
var lower_bound;
var move_dir_odd = new Array(49);
move_dir_odd.fill(UP);
var move_dir_even = new Array(49);
move_dir_even.fill(DOWN);

console.log(move_dir_even);

var DEF_RAD = 2.5;
var FINAL_BOSS_RAD = 5;
var FINAL_BOSS_HP = 10;

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

              //doge
              //this.doge = new Moving_Ball("dogecoin2x1.jpg", vec3(-5, 2, -5), DEF_RAD, vec3(.01, .05, .013));
			  this.init_center = vec3(-5, FLOOR_Y_POS + DEF_RAD, -5);
              this.doge = new Moving_Ball("dogecoin2x1.jpg", this.init_center, DEF_RAD, vec3(0, 0, 0));
              this.initialize_levels();
			  
			  this.xzangle = 90;
			  this.yzangle = 45;
			  this.xyangle = 90;
			  this.magnitude = .2;
			  this.at_init_pos = true;

              //this.change_velocity(this.xzangle, this.yzangle, this.xyangle, this.magnitude);
              //console.log(this.doge.velocity);
              //console.log(length(this.doge.velocity));
              // save animation time to calculate time difference b/w frames
              this.last_animation_time = 0;

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use
          },
		  'init_keys': function (controls) {
			  controls.add("Enter", this, function() {
				  // Fire the doge
				  if (this.at_init_pos == true) {
					this.change_velocity(this.xzangle, this.yzangle, this.xyangle, this.magnitude);
					this.at_init_pos = false;
					console.log(this.doge.velocity);
					console.log(length(this.doge.velocity));
				  }
			  });
		  },
          'change_velocity': function(xzangle, yzangle, xyangle, magnitude) {
            var newx = (Math.cos(radians(xzangle)) * Math.cos(radians(xyangle))) * magnitude;
            var newy = (Math.sin(radians(yzangle)) * Math.sin(radians(xyangle))) * magnitude;
            var newz = (Math.cos(radians(yzangle)) * Math.sin(radians(xzangle))) * -magnitude;
            var velocity = vec3(newx, newy, newz);
            this.doge.velocity = velocity;
          },
          'draw_falling_objects': function() {
              // get the time since last frame
              var frame_delta = this.graphics_state.animation_time - this.last_animation_time;
              // save the new frame's timestamp
              this.last_animation_time = this.graphics_state.animation_time;
              const gravity_const = 1.5e-4, bounce_factor = 0.85, friction_factor = 0.02;
              this.doge.apply_gravity_and_friction(frame_delta, gravity_const, bounce_factor, friction_factor);
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.doge.transform, this.doge.material);


              this.animate_level3();
              this.animate_level4();

              //collision detection code
              for (var i = this.level4_arr.length - 1; i >= 0; i--) {
                  var ball = this.level4_arr[i];
                  shapes_in_use["good_sphere"].draw(this.graphics_state,
                          ball.transform, ball.material);
                  if (do_balls_collide(this.doge, ball)) {
                      console.log("wow such collision", this.doge.center_pos, ball.center_pos);
                      this.level4_arr.splice(i, 1);
                      console.log(move_dir_even);
                      move_dir_even.splice(i, 1);
                      move_dir_odd.splice(i, 1);
                  }
              }
              // if doge is still, i.e., zero velocity for all components
              // which is the same as if speed squared (dot product) is 0
              // (again, square root is expensive and unnecessary)
              if (dot(this.doge.velocity, this.doge.velocity) == 0) {
                  //console.log("wow much still");
				  this.doge.center_pos = this.init_center;
				  this.at_init_pos = true;
				  this.doge.init_transform();
              }
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
