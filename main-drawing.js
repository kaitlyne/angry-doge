const num_wall_blocks = {
    x: 7,
    y: 2,
    z: 6
};
const wall_scale_factor = 8;
//world coordinates
const BOUNDARY_LEFT = -56;
const BOUNDARY_RIGHT = BOUNDARY_LEFT + num_wall_blocks.x * 2 * wall_scale_factor;
const BOUNDARY_FRONT = -56;
const BOUNDARY_BACK = BOUNDARY_FRONT + num_wall_blocks.z * 2 * wall_scale_factor;
const BOUNDARY_TOP = FLOOR_Y_POS + num_wall_blocks.y * 2 * wall_scale_factor;

// constants to state whether we're playing or in a menu
const ANIMATION_STATE = {
    IN_GAME: 1,
    MENU_SCREEN: 2,
    INTRO_ANIM: 3
};

const SCREEN_ID = {
  WIN: 0,
  LOSE: 1,
  START: 2
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
                  "tetra": new Tetrahedron(),
                  "swept_curve": new Surface_Of_Revolution(10, 10, [vec3(2, 0, -1), vec3(1, 0, 0), vec3(1, 0, 1), vec3(0, 0, 2)], 120, [
                      [0, 7][0, 7]
                  ])
              };

              // initialized a shared variable which indicates current state
              // for now, start in game
              this.graphics_state.current_state = ANIMATION_STATE.MENU_SCREEN;
              this.graphics_state.current_screen_id = SCREEN_ID.START;
              this.is_in_intro_anim = false;

              this.beginning_song = new Audio("finalboss.mp3")
              this.beginning_song.loop = true
              this.beginning_song.volume = 0.25

              this.DEF_RAD = 2.5;
              //doge
              //this.doge = new Moving_Ball("dogecoin2x1.jpg", vec3(-5, 2, -5), this.DEF_RAD, vec3(.01, .05, .013));
			           this.init_center = vec3(-1, FLOOR_Y_POS + this.DEF_RAD, -5);
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
              this.graphics_state.current_level_num = 0;
              // take a reference to the level array
              this.current_level_arr = this.level_arr[this.graphics_state.current_level_num];
              this.audio = {
                  launch: new Audio("launch.mp3"),
                  meow: new Audio("meow.mp3"),
                  boink: new Audio("boink.mp3"),
                  ow: new Audio("ow.mp3")
              };

              this.left_door_transform = mat4();
              this.right_door_transform = mat4();

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use
          },
		  'init_keys': function (controls) {
			  controls.add("Enter", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Fire the doge
				  if (this.at_init_pos == true) {
					this.audio.launch.play();
					this.change_velocity(this.doge, this.yaw, this.pitch, this.roll, this.magnitude);
					this.at_init_pos = false;
					console.log(this.doge.velocity);
					//console.log(length(this.doge.velocity));
				  }
			  });
			  controls.add("left", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Change angle to fire left
				  if (this.at_init_pos == true) {
					  this.yaw -= 5;
				  }
			  });
			  controls.add("right", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Change angle to fire right
				  if (this.at_init_pos == true) {
					  this.yaw += 5;
				 }
			  });
			  controls.add("up", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Change angle to fire up
				  if (this.at_init_pos == true) {
					  this.pitch += 5;
				  }
			  });
			  controls.add("down", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Change angle to fire down
				  if (this.at_init_pos == true) {
					  this.pitch -= 5;
				  }
			  });
			  controls.add(",", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Decrease magnitude
				  if (this.at_init_pos == true) {
					  this.magnitude -= 0.05;
				  }
			  });
			  controls.add(".", this, function() {
                  if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                      return;
                  }
				  // Increase magnitude
				  if (this.at_init_pos == true) {
					  this.magnitude += 0.05;
				  }
			  });
			  controls.add("r", this, function() {
				  // Make doge come back, and reset angles and magnitude
				  var reset_angles_magnitude = false;
				  if (this.at_init_pos) {
					  reset_angles_magnitude = true;
				  }
				  this.reset_doge(reset_angles_magnitude);
			  });
        controls.add("1", this, function() {
          // cheat
          if (this.graphics_state.current_level_num <= 3) {
            this.graphics_state.current_level_num++;
            this.current_level_arr = this.level_arr[this.graphics_state.current_level_num];
          }
          this.reset_doge(true);
        });
		  },
          'change_velocity': function(ball, yaw, pitch, roll, magnitude) {
            var newx = Math.sin(radians(yaw)) * Math.cos(radians(pitch)) * magnitude;
            var newy = Math.sin(radians(pitch)) * magnitude;
            var newz = Math.cos(radians(pitch)) * Math.cos(radians(yaw)) * -magnitude;
            var velocity = vec3(newx, newy, newz);
            ball.velocity = velocity;
          },
		  'reset_doge': function(reset_angles_magnitude) {
			  if (this.at_init_pos == false) {
				  this.doge.velocity = vec3(0, 0, 0);
				  this.doge.center_pos = this.init_center;
				  this.doge.init_transform();
				  this.at_init_pos = true;
          // check if player lost
          if (this.current_level_arr.length != 0) {
            // decrement # attempts
            this.level_attempts[this.graphics_state.current_level_num]--;
            console.log("number of attempts left: " + this.level_attempts[this.graphics_state.current_level_num])
            // if no attempts, show losing screen and restart level
            if (this.level_attempts[this.graphics_state.current_level_num] == 0) {
              this.graphics_state.current_screen_id = SCREEN_ID.LOSE;
              this.graphics_state.current_state = ANIMATION_STATE.MENU_SCREEN;
              this.initialize_levels();
              this.current_level_arr = this.level_arr[this.graphics_state.current_level_num];
            }
          }
			  }
			  if (reset_angles_magnitude) {
				this.yaw = 0;
				this.pitch = 45;
				this.roll = 0;
				this.magnitude = 0.75;
			  }
		  },
          'draw_falling_objects': function() {
              // get the time since last frame
              var frame_delta = this.graphics_state.animation_time - this.last_animation_time;
              // save the new frame's timestamp
              this.last_animation_time = this.graphics_state.animation_time;
              const gravity_const = 6.5e-4, bounce_factor = 0.4, friction_factor = 0.05;
              this.doge.apply_gravity_and_friction(30, gravity_const, bounce_factor, friction_factor, true, this.audio.boink);
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
                          gravity_const, bounce_factor, friction_factor, false);
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
              switch(this.graphics_state.current_level_num) {
                  case 2:
                    this.animate_level3();
                    break;
                  case 3:
                    this.animate_level4();
                    break;
                  case 4:
                    this.animate_level5();
                    break;
              }
          },
          'draw_enemies': function() {
              for (var i = this.current_level_arr.length - 1; i >= 0; i--) {
                  var ball = this.current_level_arr[i];
                  shapes_in_use["good_sphere"].draw(this.graphics_state,
                          ball.transform, ball.material);
              }
          },
          'check_collision_detection': function() {
              //collision detection code
              for (var i = this.current_level_arr.length - 1; i >= 0; i--) {
                  var ball = this.current_level_arr[i];
                  shapes_in_use["good_sphere"].draw(this.graphics_state,
                          ball.transform, ball.material);
                  if (do_balls_collide(this.doge, ball)) {
                    if (this.graphics_state.current_level_num == 4) {
                      if (this.current_level_arr[i].already_collided == false) {
                        //insert audio here
                        this.audio.ow = new Audio("ow.mp3");
                        this.audio.ow.play();
                        this.current_level_arr[i].hp--;
                        this.current_level_arr[i].already_collided = true;
                        if (this.current_level_arr[i].hp == 0) {
                          this.current_level_arr.splice(i, 1);
                        }
                      }
                    }

                    else {
                      this.audio.meow = new Audio("meow.mp3");
                      this.audio.meow.play();
                      this.current_level_arr.splice(i, 1);
                    }
                }

                  else {
                    if (this.graphics_state.current_level_num == 4) {
                      this.current_level_arr[i].already_collided = false
                    }
                  }
              }
              var wall_collision = collide_with_wall(this.doge, true)
              if (wall_collision != false) {
                // Play boink audio if doge collides with wall
                this.audio.boink = new Audio("boink.mp3");
                this.audio.boink.play();
              }
          },
          'check_level_state': function() {
              // wow all enemies gone, we won!
              if (!this.current_level_arr.length) {
                  if (this.graphics_state.current_level_num <= 4 && this.at_init_pos == true) {
                      this.graphics_state.current_level_num++;
                      this.current_level_arr = this.level_arr[this.graphics_state.current_level_num];
					            this.reset_doge(true);
                      this.graphics_state.current_screen_id = SCREEN_ID.WIN;
                      this.graphics_state.current_state = ANIMATION_STATE.MENU_SCREEN;
                  }
                  /*if (this.graphics_state.current_level_num == 4) {
                    console.log("A winner is you");
                  }*/
              }
              // if doge is still, i.e., zero velocity for all components
              // which is the same as if speed squared (dot product) is 0
              // (again, square root is expensive and unnecessary)
              if (this.at_init_pos == false && dot(this.doge.velocity, this.doge.velocity) == 0) {
                  //console.log("wow much still");
				  this.reset_doge(false);
              }
          },
		  'draw_walls': function(left_door_rotation=0, right_door_rotation=0) {
			  var wall_transform = mat4();

			  var indoorwall_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 0, "indoorwall.jpg");
        var outdoorwall_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 0, "wall.jpg");
        var door_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 0, "door.jpg");
			  wall_transform = mult(wall_transform, translation(0, FLOOR_Y_POS, BOUNDARY_FRONT));
			  wall_transform = mult(wall_transform, scale(wall_scale_factor, wall_scale_factor, wall_scale_factor));
			  // Number of blocks to draw in x,y,z directions

			  // Draw the back wall
			  for (var i = 0; i < num_wall_blocks.x; i++) {
				  for (var j = 0; j < num_wall_blocks.y; j++) {
					  var translate_transf = translation((i - (num_wall_blocks.x-1)/2)*2*wall_scale_factor, (j * 2 + 1)*wall_scale_factor, 0);
					  var final_transf = mult(translate_transf, wall_transform);
					  shapes_in_use["strip"].draw(this.graphics_state, final_transf, indoorwall_material);
				  }
			  }
        // Draw the front wall
        for (var i = 0; i < num_wall_blocks.x; i++) {
          for (var j = 0; j < num_wall_blocks.y; j++) {
            // Draw wall blocks everywhere except the door hole
            if (!((j == 0) && (i == (num_wall_blocks.x - 1) / 2))) {
              var translate_transf = translation((i - (num_wall_blocks.x-1)/2)*2*wall_scale_factor, (j *2 + 1)*wall_scale_factor, BOUNDARY_BACK - BOUNDARY_FRONT);
              var final_transf = mult(translate_transf, wall_transform);
              shapes_in_use["strip"].draw(this.graphics_state, final_transf, outdoorwall_material);
            }
            // Draw doors at the door hole
            else {
              // Left door
              var translate_transf = translation((i - (num_wall_blocks.x-1)/2)*2*wall_scale_factor - wall_scale_factor/2, (j *2 + 1)*wall_scale_factor, BOUNDARY_BACK - BOUNDARY_FRONT);
              var left_door_transform = mult(translate_transf, wall_transform);
              left_door_transform = mult(left_door_transform, translation(-0.5, 0, 0));
              left_door_transform = mult(left_door_transform, rotation(left_door_rotation, 0, 1, 0));
              left_door_transform = mult(left_door_transform, translation(0.5, 0, 0));
              left_door_transform = mult(left_door_transform, scale(0.5, -1, 1));
              shapes_in_use["strip"].draw(this.graphics_state, left_door_transform, door_material);
              // Right door
              translate_transf = translation((i - (num_wall_blocks.x-1)/2)*2*wall_scale_factor + wall_scale_factor/2, (j *2 + 1)*wall_scale_factor, BOUNDARY_BACK - BOUNDARY_FRONT);
              var right_door_transform = mult(translate_transf, wall_transform);
              right_door_transform = mult(right_door_transform, translation(0.5, 0, 0));
              right_door_transform = mult(right_door_transform, rotation(right_door_rotation, 0, 1, 0));
              right_door_transform = mult(right_door_transform, translation(-0.5, 0, 0));
              right_door_transform = mult(right_door_transform, scale(-0.5, -1, 1));
              shapes_in_use["strip"].draw(this.graphics_state, right_door_transform, door_material);
            }
          }
        }
			  wall_transform = mult(wall_transform, rotation(90, 0, 1, 0));
			  // Draw the left wall
			  for (var i = 0; i < num_wall_blocks.z; i++) {
				  for (var j = 0; j < num_wall_blocks.y; j++) {
					  var translate_transf = translation(BOUNDARY_LEFT, (j*2+1)*wall_scale_factor, (i*2+1)*wall_scale_factor);
					  var final_transf = mult(translate_transf, wall_transform);
					  shapes_in_use["strip"].draw(this.graphics_state, final_transf, indoorwall_material);
				  }
			  }
			  // Draw the right wall
			  for (var i = 0; i < num_wall_blocks.z; i++) {
				  for (var j = 0; j < num_wall_blocks.y; j++) {
					  var translate_transf = translation(BOUNDARY_RIGHT, (j*2+1)*wall_scale_factor, (i*2+1)*wall_scale_factor);
					  var final_transf = mult(translate_transf, wall_transform);
					  shapes_in_use["strip"].draw(this.graphics_state, final_transf, indoorwall_material);
				  }
			  }

        var pic_transf = mat4();
      	pic_transf = mult(pic_transf, translation(-24, 15, BOUNDARY_FRONT + 1));
      	pic_transf = mult(pic_transf, scale(6, -8, 2));
      	var paint_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, "mona_lisa.jpg");
      	shapes_in_use['strip'].draw(this.graphics_state, pic_transf, paint_material);

        pic_transf = mat4();
        pic_transf = mult(pic_transf, translation(24, 15, BOUNDARY_FRONT + 1));
      	pic_transf = mult(pic_transf, scale(8, -6, 2));
      	paint_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, "starry-night.jpg");
      	shapes_in_use['strip'].draw(this.graphics_state, pic_transf, paint_material);

        pic_transf = mat4();
        pic_transf = mult(pic_transf, translation(0, 15, BOUNDARY_FRONT + 1));
      	pic_transf = mult(pic_transf, scale(6, -6, 2));
      	paint_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, "intro.jpg");
      	shapes_in_use['strip'].draw(this.graphics_state, pic_transf, paint_material);

		  },
          'draw_floor': function(floor_or_ceiling) {
              // Takes parameters "floor" or "ceiling" to determine which one to draw
              var floor_transform = mat4();
              const floor_scale_factor = wall_scale_factor;
              var y_diff = 0;
              if (floor_or_ceiling == "ceiling") {
                  var floor_material = new Material(Color(0, 0, 0, 1), .8, 0, 0, 40, "ceiling.jpg");
                  y_diff = BOUNDARY_TOP - FLOOR_Y_POS;
              }
              else {
                  var floor_material = new Material(Color(0, 0, 0, 1), .8, .5, 0, 40, "floor.jpg");
              }
              floor_transform = mult(floor_transform, translation(0, FLOOR_Y_POS + y_diff, 0));
              floor_transform = mult(floor_transform, scale(floor_scale_factor,
                          floor_scale_factor, floor_scale_factor));
              floor_transform = mult(floor_transform, rotation(90, 1, 0, 0));
              // number of rows and columns of blocks
              const num_floor_blocks = {
                  x: num_wall_blocks.x,
                  z: num_wall_blocks.z
              };
              for (var i = 0; i < num_floor_blocks.x; i++) {
                  for (var j = 0; j < num_floor_blocks.z; j++) {
                      // draw the floor block in the ith row, jth column
                      var translate_transf = translation((i - (num_floor_blocks.x-1)/2) * 2 * floor_scale_factor,
                             0, (j - num_floor_blocks.z / 2) * 2 * floor_scale_factor);
                      var final_transf = mult(translate_transf, floor_transform);
                      shapes_in_use["strip"].draw(this.graphics_state, final_transf, floor_material);
                  }
              }
          },
          'draw_all_shapes': function() {
                 this.draw_floor("floor");
                 this.draw_floor("ceiling");
			           this.draw_walls();
                 this.draw_falling_objects();
                 this.draw_enemies();
                 this.check_collision_detection();
                 this.check_level_state();
                 return;
          },
          'draw_text': function() {
              document.getElementById('top-left-text').style.visibility = 'visible';
              var attempts_str = String(this.level_attempts[this.graphics_state.current_level_num]);
              if (attempts_str == '1') {
                  attempts_str += ' attempt';
              }
              else {
                  attempts_str += ' attempts';
              }
              attempts_str += ' remaining';
              document.getElementById('top-left-text').innerText = attempts_str;

              if (this.graphics_state.current_level_num == 4) {
                document.getElementById('top-right-text').style.visibility = 'visible'
                var hp_str = 0
                for (var i = 0; i < this.current_level_arr.length; i++) {
                  hp_str += this.current_level_arr[i].hp
                }
                hp_str = String(hp_str)
                hp_str += ' hp remaining'
                document.getElementById('top-right-text').innerText = hp_str
              }
          },
          'display': function(time) {
              if (this.graphics_state.current_state == ANIMATION_STATE.INTRO_ANIM) {
                  this.intro_animation();
              }
              // don't draw if we're not in game
              if (this.graphics_state.current_state != ANIMATION_STATE.IN_GAME) {
                  return;
              }
              var model_transform = mat4();
              shaders_in_use["Default"].activate();


              for (var i = 0; i < 1; i++) {
                  this.graphics_state.lights = [new Light(vec4(this.doge.center_pos[0],
                    this.doge.center_pos[1], this.doge.center_pos[2], 1), Color(1, 1, 0, 1), 1000000),
                      new Light(vec4(300, 3,7, 1), Color(1, 1, 0, 1), 1)
                  ];

                  //this.draw_all_shapes(); // *** How to call a function and still have a single matrix state ***
                  //model_transform = mult(model_transform, rotation(360 / 13, 0, 0, 1));
              }
              this.draw_all_shapes();
              //this.draw_roof();
              //this.draw_sky();
              this.draw_text();
          }
      }, Animation);
