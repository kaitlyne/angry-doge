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
var move_dir_odd = UP;
var move_dir_even = DOWN;

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
              this.doge = new Moving_Ball("dogecoin2x1.jpg", vec3(-5, 2, -5), DEF_RAD);
              //cube
              this.level1_arr = [];
              for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                  for (var k = 0; k < 3; k++) {
                    this.level1_arr.push(new Moving_Ball("meowth2x1.jpg", vec3((i*5) + 3, FLOOR_Y_POS+2.5 + (5*j), (k*5) + 3), 2.5));
                  }
                }
              }

              //pyramid
              this.level2_arr = [];
              for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
                  this.level2_arr.push(new Moving_Ball("sylvester2x1.jpg", vec3((i*2*DEF_RAD) + 3, FLOOR_Y_POS+DEF_RAD, (j*2*DEF_RAD) + 3), DEF_RAD));
                }
              }
              for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                  this.level2_arr.push(new Moving_Ball("sylvester2x1.jpg", vec3((i*2*DEF_RAD) + 8, FLOOR_Y_POS+(3*DEF_RAD), (j*2*DEF_RAD) + 8), DEF_RAD));
                }
              }
              this.level2_arr.push(new Moving_Ball("sylvester2x1.jpg", vec3(13, FLOOR_Y_POS+(5*DEF_RAD), 13), DEF_RAD));

              //moving square
              this.level3_arr = []
              for (var i = 0; i < 7; i++) {
                for (var j = 0; j < 7; j++) {
                  this.level3_arr.push(new Moving_Ball("chairman2x1.jpg", vec3((i*2*DEF_RAD) + 3, FLOOR_Y_POS+DEF_RAD, (j*2*DEF_RAD) + 3), DEF_RAD));
                }
              }

              upper_left_corner = this.level3_arr[0].center_pos;
              upper_right_corner = this.level3_arr[6].center_pos;
              lower_left_corner = this.level3_arr[42].center_pos;
              lower_right_corner = this.level3_arr[48].center_pos;

              //level 4
              this.level4_arr = []
              for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                  this.level4_arr.push(new Moving_Ball("grumpy2x1.jpg", vec3(7 + (i*2*DEF_RAD), FLOOR_Y_POS + (7*DEF_RAD), 7 + (j*2*DEF_RAD)), DEF_RAD));
                }
              }

              for (var i = 0; i < this.level4_arr.length; i+=2) {
                this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, -6*DEF_RAD, 0));
                this.level4_arr[i].transform = mult(translation(0, -6*DEF_RAD, 0), this.level4_arr[i].transform);
              }

              upper_bound = FLOOR_Y_POS + 7*DEF_RAD;
              lower_bound = FLOOR_Y_POS + DEF_RAD;

              //final boss
              this.final_arr = []
              for (var i = 0; i < 10; i++) {
                this.final_arr.push(new Moving_Ball("finalboss.jpg", vec3(6 + (i*2*FINAL_BOSS_RAD), FLOOR_Y_POS + 5*FINAL_BOSS_RAD , 6), FINAL_BOSS_RAD));
              }

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
              shapes_in_use["good_sphere"].draw(this.graphics_state, this.doge.transform, this.doge.material);

              //animate level 3
              for (var i = 0; i < this.level3_arr.length; i++) {
                //7x7
                //top line
                if (this.level3_arr[i].center_pos[0] == upper_left_corner[0] && this.level3_arr[i].center_pos[2] > upper_left_corner[2]) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0, 0, -0.125));
                  this.level3_arr[i].transform = mult(translation(0, 0, -0.125), this.level3_arr[i].transform);
                }
                //left line
                else if (this.level3_arr[i].center_pos[0] < lower_left_corner[0] && this.level3_arr[i].center_pos[2] == lower_left_corner[2]) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0.125, 0, 0));
                  this.level3_arr[i].transform = mult(translation(0.125, 0, 0), this.level3_arr[i].transform);
                }
                //bottom line
                else if (this.level3_arr[i].center_pos[0] == lower_right_corner[0] && this.level3_arr[i].center_pos[2] < lower_right_corner[2]) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0, 0, 0.125));
                  this.level3_arr[i].transform = mult(translation(0, 0, 0.125), this.level3_arr[i].transform);
                }
                //right line
                else if (this.level3_arr[i].center_pos[0] > upper_right_corner[0] && this.level3_arr[i].center_pos[2] == upper_right_corner[2]) {
                    this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(-0.125, 0, 0));
                    this.level3_arr[i].transform = mult(translation(-0.125, 0, 0), this.level3_arr[i].transform);
                }
                //5x5
                //top line
                else if (this.level3_arr[i].center_pos[0] == (upper_left_corner[0] + (2*DEF_RAD)) &&
                  (this.level3_arr[i].center_pos[2] > (upper_left_corner[2] + (2*DEF_RAD))
                  && this.level3_arr[i].center_pos[2] <= (upper_left_corner[2] + (12*DEF_RAD)))) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0, 0, -0.125));
                  this.level3_arr[i].transform = mult(translation(0, 0, -0.125), this.level3_arr[i].transform);
                }
                //left line
                else if ((this.level3_arr[i].center_pos[0] < (lower_left_corner[0] - (2*DEF_RAD)) &&
                  this.level3_arr[i].center_pos[0] >= (lower_left_corner[0] - (12*DEF_RAD)))
                  && this.level3_arr[i].center_pos[2] == (lower_left_corner[2] + (2*DEF_RAD))) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0.125, 0, 0));
                  this.level3_arr[i].transform = mult(translation(0.125, 0, 0), this.level3_arr[i].transform);
                }
                //bottom line
                else if (this.level3_arr[i].center_pos[0] == (lower_right_corner[0] - (2*DEF_RAD)) &&
                  (this.level3_arr[i].center_pos[2] < (lower_right_corner[2] - (2*DEF_RAD))
                  && this.level3_arr[i].center_pos[2] >= (lower_right_corner[2] - (12*DEF_RAD)) )) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0, 0, 0.125));
                  this.level3_arr[i].transform = mult(translation(0, 0, 0.125), this.level3_arr[i].transform);
                }
                //right line
                else if ((this.level3_arr[i].center_pos[0] > (upper_right_corner[0] + (2*DEF_RAD)) &&
                  this.level3_arr[i].center_pos[0] <= (upper_right_corner[0] + (12*DEF_RAD)))
                  && this.level3_arr[i].center_pos[2] == (upper_right_corner[2] - (2*DEF_RAD))) {
                    this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(-0.125, 0, 0));
                    this.level3_arr[i].transform = mult(translation(-0.125, 0, 0), this.level3_arr[i].transform);
                }
                //3x3
                //top line
                else if (this.level3_arr[i].center_pos[0] == (upper_left_corner[0] + (4*DEF_RAD)) &&
                  (this.level3_arr[i].center_pos[2] > (upper_left_corner[2] + (4*DEF_RAD))
                  && this.level3_arr[i].center_pos[2] <= (upper_left_corner[2] + (8*DEF_RAD)))) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0, 0, -0.125));
                  this.level3_arr[i].transform = mult(translation(0, 0, -0.125), this.level3_arr[i].transform);
                }
                //left line
                else if ((this.level3_arr[i].center_pos[0] < (lower_left_corner[0] - (4*DEF_RAD)) &&
                  this.level3_arr[i].center_pos[0] >= (lower_left_corner[0] - (8*DEF_RAD)))
                  && this.level3_arr[i].center_pos[2] == (lower_left_corner[2] + (4*DEF_RAD))) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0.125, 0, 0));
                  this.level3_arr[i].transform = mult(translation(0.125, 0, 0), this.level3_arr[i].transform);
                }
                //bottom line
                else if (this.level3_arr[i].center_pos[0] == (lower_right_corner[0] - (4*DEF_RAD)) &&
                  (this.level3_arr[i].center_pos[2] < (lower_right_corner[2] - (4*DEF_RAD))
                  && this.level3_arr[i].center_pos[2] >= (lower_right_corner[2] - (8*DEF_RAD)) )) {
                  this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(0, 0, 0.125));
                  this.level3_arr[i].transform = mult(translation(0, 0, 0.125), this.level3_arr[i].transform);
                }
                //right line
                else if ((this.level3_arr[i].center_pos[0] > (upper_right_corner[0] + (4*DEF_RAD)) &&
                  this.level3_arr[i].center_pos[0] <= (upper_right_corner[0] + (8*DEF_RAD)))
                  && this.level3_arr[i].center_pos[2] == (upper_right_corner[2] - (4*DEF_RAD))) {
                    this.level3_arr[i].center_pos = add(this.level3_arr[i].center_pos, vec3(-0.125, 0, 0));
                    this.level3_arr[i].transform = mult(translation(-0.125, 0, 0), this.level3_arr[i].transform);
                }
              }

              //animate level 4
              for (var i = 0; i < this.level4_arr.length; i+=2) {
                if (move_dir_odd == UP) {
                  this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, -0.125, 0));
                  this.level4_arr[i].transform = mult(translation(0, -0.125, 0), this.level4_arr[i].transform);
                  if (this.level4_arr[i].center_pos[1] <= lower_bound) {
                    move_dir_odd = DOWN;
                  }
                }
                else {
                  this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, 0.125, 0));
                  this.level4_arr[i].transform = mult(translation(0, 0.125, 0), this.level4_arr[i].transform);
                  if (this.level4_arr[i].center_pos[1] >= upper_bound) {
                    move_dir_odd = UP;
                  }
                }
              }
              for (var i = 1; i < this.level4_arr.length; i+=2) {
                if (move_dir_even == UP) {
                  this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, -0.125, 0));
                  this.level4_arr[i].transform = mult(translation(0, -0.125, 0), this.level4_arr[i].transform);
                  if (this.level4_arr[i].center_pos[1] <= lower_bound) {
                    move_dir_even = DOWN;
                  }
                }
                else {
                  this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, 0.125, 0));
                  this.level4_arr[i].transform = mult(translation(0, 0.125, 0), this.level4_arr[i].transform);
                  if (this.level4_arr[i].center_pos[1] >= upper_bound) {
                    move_dir_even = UP;
                  }
                }
              }

              //collision detection code
              for (var i = this.level3_arr.length - 1; i >= 0; i--) {
                  var ball = this.level3_arr[i];
                  shapes_in_use["good_sphere"].draw(this.graphics_state,
                          ball.transform, ball.material);
                  if (do_balls_collide(this.doge, ball)) {
                      console.log("yo stuff collided", this.doge.center_pos, ball.center_pos);
                      this.level3_arr.splice(i, 1);
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
