//world coordinates
var BOUNDARY_LEFT = -56
var BOUNDARY_RIGHT = 48
var BOUNDARY_FRONT = -56
var BOUNDARY_BACK = 48

// constants to state whether we're playing or in a menu
const ANIMATION_STATE = {
    IN_GAME: 1,
    MENU_SCREEN: 2
};

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

              // initialized a shared variable which indicates current state
              // for now, start in game
              this.graphics_state.current_state = ANIMATION_STATE.IN_GAME;

              this.DEF_RAD = 2.5;
              //doge
              //this.doge = new Moving_Ball("dogecoin2x1.jpg", vec3(-5, 2, -5), this.DEF_RAD, vec3(.01, .05, .013));
			  this.init_center = vec3(-5, FLOOR_Y_POS + this.DEF_RAD, -5);
              this.doge = new Moving_Ball("dogecoin2x1.jpg", this.init_center, this.DEF_RAD, vec3(0, 0, 0));
              this.initialize_levels();
              this.doge_flight_tracking_ball = new Moving_Ball("FLIGHT_TRACKING", this.init_center, 0.25);

			  this.yaw= 0;
			  this.pitch = 45;
			  this.roll = 0;
			  this.magnitude = 0.75;
			  this.at_init_pos = true;

              //this.change_velocity(this.xzangle, this.yzangle, this.xyangle, this.magnitude);
              //console.log(this.doge.velocity);
              //console.log(length(this.doge.velocity));
              // save animation time to calculate time difference b/w frames
              this.last_animation_time = 0;

              // start the level at first level, which has index 0 in this.level_arr
              this.current_level_num = 0;
              // take a reference to the level array
              this.current_level_arr = this.level_arr[this.current_level_num];

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use
          },
		  'init_keys': function (controls) {
			  controls.add("Enter", this, function() {
				  // Fire the doge
				  if (this.at_init_pos == true) {
					this.change_velocity(this.doge, this.yaw, this.pitch, this.roll, this.magnitude);
					this.at_init_pos = false;
					console.log(this.doge.velocity);
					//console.log(length(this.doge.velocity));
				  }
			  });
			  controls.add("j", this, function() {
				  // Change angle to fire left
				  if (this.at_init_pos == true) {
					  this.yaw -= 5;
				  }
			  });
			  controls.add("l", this, function() {
				  // Change angle to fire right
				  if (this.at_init_pos == true) {
					  this.yaw += 5;
				 }
			  });
			  controls.add("i", this, function() {
				  // Change angle to fire up
				  if (this.at_init_pos == true) {
					  this.pitch += 5;
				  }
			  });
			  controls.add("k", this, function() {
				  // Change angle to fire down
				  if (this.at_init_pos == true) {
					  this.pitch -= 5;
				  }
			  });
			  controls.add("o", this, function() {
				  // Decrease magnitude
				  if (this.at_init_pos == true) {
					  this.magnitude -= 0.05;
				  }
			  });
			  controls.add("p", this, function() {
				  // Increase magnitude
				  if (this.at_init_pos == true) {
					  this.magnitude += 0.05;
				  }
			  });
			  controls.add("r", this, function() {
				  // Make doge come back, and reset angles and magnitude
				  this.reset_doge();
			  });
		  },
          'change_velocity': function(ball, yaw, pitch, roll, magnitude) {
            var newx = Math.sin(radians(yaw)) * Math.cos(radians(pitch)) * magnitude;
            var newy = Math.sin(radians(pitch)) * magnitude;
            var newz = Math.cos(radians(pitch)) * Math.cos(radians(yaw)) * -magnitude;
            var velocity = vec3(newx, newy, newz);
            ball.velocity = velocity;
          },
		  'reset_doge': function() {
			  if (this.at_init_pos == false) {
				  this.doge.velocity = vec3(0, 0, 0);
				  this.doge.center_pos = this.init_center;
				  this.doge.init_transform();
				  this.at_init_pos = true;
			  }
			  this.yaw = 0;
			  this.pitch = 45;
			  this.roll = 0;
			  this.magnitude = 0.75;
		  },
          'draw_falling_objects': function() {
              // get the time since last frame
              var frame_delta = this.graphics_state.animation_time - this.last_animation_time;
              // save the new frame's timestamp
              this.last_animation_time = this.graphics_state.animation_time;
              const gravity_const = 6.5e-4, bounce_factor = 0.4, friction_factor = 0.05;
              this.doge.apply_gravity_and_friction(30, gravity_const, bounce_factor, friction_factor);
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.doge.transform, this.doge.material);

              // draw the dotted path that the doge will fly along
              // start the path at doge's initial position
              this.doge_flight_tracking_ball.center_pos = this.init_center;
              this.doge_flight_tracking_ball.init_transform();
              // simulate doge's movements due to initial velocity and gravity
              this.change_velocity(this.doge_flight_tracking_ball, this.yaw, this.pitch, this.roll, this.magnitude);
              var last_y_velocity;
              for (var i = 0; i < 100; i++) {
                  //var ball_on_floor_pos = FLOOR_Y_POS + this.doge_flight_tracking_ball.radius;
                  // stop drawing when this flight ball first hits the ground
                  // checking y position like the commented code doesn't seem to work
                  // so I just check for when the y velocity changes from negative to positive
                  last_y_velocity = this.doge_flight_tracking_ball.velocity[1];
                  this.doge_flight_tracking_ball.apply_gravity_and_friction(30,
                          gravity_const, bounce_factor, friction_factor);
                  //if (this.doge_flight_tracking_ball.center_pos[1].toFixed(1) == ball_on_floor_pos.toFixed(1)) {
                  if (last_y_velocity < 0 && this.doge_flight_tracking_ball.velocity[1] > 0) {
                      //console.log('break at ', i, ' pos = ', this.doge_flight_tracking_ball.center_pos[1]);
                      break;
                  }
                  // to make dots, only draw the sphere every third time
                  if (i % 3 == 0) {
                      shapes_in_use["good_sphere"].draw(this.graphics_state,
                              this.doge_flight_tracking_ball.transform, this.doge_flight_tracking_ball.material);
                  }
              }

              this.animate_level3();
              this.animate_level4();

              //collision detection code
              for (var i = this.current_level_arr.length - 1; i >= 0; i--) {
                  var ball = this.current_level_arr[i];
                  shapes_in_use["good_sphere"].draw(this.graphics_state,
                          ball.transform, ball.material);
                  if (do_balls_collide(this.doge, ball)) {
                      this.current_level_arr.splice(i, 1);
                  }
              }
              var wall_collision = collide_with_wall(this.doge)
              switch(wall_collision) {
                //since there are no boundaries, I had to hard code this.
                case 0:
                break
                case 1:
                this.doge.center_pos[2] = BOUNDARY_BACK - this.doge.radius
                this.doge.velocity[2] *= -1
                break
                case 2:
                this.doge.center_pos[2] = BOUNDARY_FRONT + this.doge.radius
                this.doge.velocity[2] *= -1
                break
                case 5:
                this.doge.center_pos[0] = BOUNDARY_RIGHT - this.doge.radius
                this.doge.velocity[0] *= -1
                break
                case 6:
                this.doge.center_pos[0] = BOUNDARY_LEFT + this.doge.radius
                this.doge.velocity[0] *= -1
                break
              }

              // wow all enemies gone, we won!
              if (!this.current_level_arr.length) {
                  if (this.current_level_num < 3 && this.at_init_pos == true) {
                      this.current_level_num++;
                      this.current_level_arr = this.level_arr[this.current_level_num];
                      this.graphics_state.current_state = ANIMATION_STATE.MENU_SCREEN;
                  }
                  else if (this.current_level_num == 3) {
                    console.log("A winner is you");
                  }
              }
              // if doge is still, i.e., zero velocity for all components
              // which is the same as if speed squared (dot product) is 0
              // (again, square root is expensive and unnecessary)
              if (this.at_init_pos == false && dot(this.doge.velocity, this.doge.velocity) == 0) {
                  //console.log("wow much still");
				  this.reset_doge();
              }
          },
		  'draw_walls': function() {
			  var wall_transform = mat4();
			  const wall_scale_factor = 8;
			  var wall_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 0, "wall.jpg");
			  wall_transform = mult(wall_transform, translation(0, FLOOR_Y_POS, BOUNDARY_FRONT));
			  wall_transform = mult(wall_transform, scale(wall_scale_factor, wall_scale_factor, wall_scale_factor));
			  // Number of blocks to draw in x,y,z directions
			  const num_wall_blocks = {
				x: 12,
				y: 4,
				z: 12
			  };
			  // Draw the back wall
			  for (var i = 0; i < num_wall_blocks.x; i++) {
				  for (var j = -1; j < num_wall_blocks.y-1; j++) {
					  var translate_transf = translation((i - num_wall_blocks.x/2)*wall_scale_factor, (j + num_wall_blocks.y/2)*wall_scale_factor, 0);
					  var final_transf = mult(translate_transf, wall_transform);
					  shapes_in_use["strip"].draw(this.graphics_state, final_transf, wall_material);
				  }
			  }
			  wall_transform = mult(wall_transform, rotation(90, 0, 1, 0));
			  // Draw the left wall
			  for (var i = 0; i < num_wall_blocks.z; i++) {
				  for (var j = -1; j < num_wall_blocks.y-1; j++) {
					  var translate_transf = translation(BOUNDARY_LEFT, (j + num_wall_blocks.y/2)*wall_scale_factor, (i - num_wall_blocks.x)*wall_scale_factor+104);
					  var final_transf = mult(translate_transf, wall_transform);
					  shapes_in_use["strip"].draw(this.graphics_state, final_transf, wall_material);
				  }
			  }
			  // Draw the right wall
			  for (var i = 0; i < num_wall_blocks.z; i++) {
				  for (var j = -1; j < num_wall_blocks.y-1; j++) {
					  var translate_transf = translation(BOUNDARY_RIGHT, (j + num_wall_blocks.y/2)*wall_scale_factor, (i - num_wall_blocks.x)*wall_scale_factor+104);
					  var final_transf = mult(translate_transf, wall_transform);
					  shapes_in_use["strip"].draw(this.graphics_state, final_transf, wall_material);
				  }
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
                  z: 12
              };
              for (var i = 0; i < num_floor_blocks.x; i++) {
                  for (var j = 0; j < num_floor_blocks.z; j++) {
                      // draw the floor block in the ith row, jth column
                      var translate_transf = translation((i - num_floor_blocks.x / 2) * floor_scale_factor,
                             0, (j - num_floor_blocks.z / 2) * floor_scale_factor);
                      var final_transf = mult(translate_transf, floor_transform);
                      shapes_in_use["strip"].draw(this.graphics_state, final_transf, floor_material);
                  }
              }
          },
          'draw_all_shapes': function(model_transform) {
                 this.draw_floor();
			           this.draw_walls();
                 this.draw_falling_objects();
                 return;
          },
          'display': function(time) {
              // don't draw if we're not in game
              if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                  return;
              }
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
