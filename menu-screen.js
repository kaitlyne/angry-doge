  Declare_Any_Class("Menu_Screen", // An example of a displayable object that our class Canvas_Manager can manage.  This one draws the scene's 3D shapes.
      {
          'construct': function(context) {
              this.graphics_state = context.shared_scratchpad.graphics_state;

              this.newest_shapes = {
                  "good_sphere": new Subdivision_Sphere(4),
                  "strip": new Square()
              };

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use

              // *** Mouse controls: ***
              this.mouse = {
                  "from_center": vec2()
              };
              var mouse_position = function(e) {
                  return vec2(e.clientX - canvas.width / 2, e.clientY - canvas.height / 2);
              };
              // Measure mouse steering, for rotating the flyaround camera.
              document.getElementById('bot-left').addEventListener("mouseup", (function(self) {
                  return function(e) {
                      if (self.graphics_state.current_state != ANIMATION_STATE.MENU_SCREEN) {
                          return;
                      }
                      e = e || window.event;
                      self.graphics_state.current_state = ANIMATION_STATE.IN_GAME;
                      document.getElementById('top-right-text').style.visibility = 'hidden';
                      this.style.visibility = 'hidden';
                      document.getElementById('bot-right').style.visibility = 'hidden';
                      self.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
                      console.log('mouseup');
                  }
              })(this), false);

              document.getElementById('bot-right').addEventListener("mouseup", (function(self) {
                  return function(e) {
                      if (self.graphics_state.current_state != ANIMATION_STATE.MENU_SCREEN) {
                          return;
                      }
                      e = e || window.event;
                      self.graphics_state.current_state = ANIMATION_STATE.MENU_SCREEN;
                      self.graphics_state.current_screen_id = SCREEN_ID.START;
                      self.graphics_state.current_level_num = 0;
                      document.getElementById('top-right-text').style.visibility = 'hidden';
                      this.style.visibility = 'hidden';
                      document.getElementById('bot-left').style.visibility = 'hidden';
                      //self.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
                      console.log('mouseup');
                  }
              })(this), false);

              document.getElementById('start-game').addEventListener("mouseup", (function(self) {
                  return function(e) {
                      if (self.graphics_state.current_state != ANIMATION_STATE.MENU_SCREEN) {
                          return;
                      }
                      e = e || window.event;
                      self.graphics_state.current_state = ANIMATION_STATE.INTRO_ANIM;
                      document.getElementById('start-screen').style.visibility = 'hidden';
                      self.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
                      console.log('mouseup');
                  }
              })(this), false);

          },
          'draw_win_lose_screen': function(model_transform) {
              var lose_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, "scott.jpg");
              var pic_transf = mat4();
              // flip picture so it's upright
              pic_transf = mult(pic_transf, translation(-0.8, 0, 0));
              pic_transf = mult(pic_transf, scale(0.7, -0.7, 0.7));
              document.getElementById('top-left-text').style.visibility = 'hidden';
              document.getElementById('top-right-text').style.visibility = 'visible';
              document.getElementById('bot-left').style.visibility = 'visible';
              document.getElementById('bot-right').style.visibility = 'visible';
              
              if (this.graphics_state.current_screen_id == SCREEN_ID.WIN) {
                var upper_right_text = "<h1>WOW<br/>SUCH<br/>WIN!</h1>";
                var texture_filename = "doge-sunglasses.jpg";
                if (this.graphics_state.current_level_num == 4) {
                  upper_right_text = "I'd pay you, but you used lookat(), so now you must die.";
                  texture_filename = "finalboss_square.jpg";
                }
                document.getElementById('bot-left').innerText = "Click for next level";
                if (this.graphics_state.current_level_num == 5) {
                  upper_right_text = "Okay fine, you can use lookat()";
                  texture_filename = "scott3.jpg";
                  document.getElementById('bot-left').style.visibility = 'hidden';
                }
                else {
                  document.getElementById('bot-left').style.visibility = 'visible';
                }
                var win_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, texture_filename);
                shapes_in_use['strip'].draw(this.graphics_state, pic_transf, win_material);
                document.getElementById('top-right-text').innerHTML = upper_right_text;
                document.getElementById('bot-right').innerText = "Click for main menu";
              }
              else {
                shapes_in_use['strip'].draw(this.graphics_state, pic_transf, lose_material);
                document.getElementById('top-right-text').innerText =
                  "If this were architecture school, you'd be out on day 1!";
                document.getElementById('bot-left').innerText = "Click to replay";
                document.getElementById('bot-right').innerText = "Click for main menu";
              }
          },
          'draw_start_screen': function() {
              document.getElementById('start-screen').style.visibility = 'visible';
              var start_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, "scott2.jpg");
              var pic_transf = mat4();
              // flip picture so it's upright
              pic_transf = mult(pic_transf, translation(0, -0.4, 0));
              pic_transf = mult(pic_transf, scale(0.6, -0.6, 1));
              shapes_in_use['strip'].draw(this.graphics_state, pic_transf, start_material);
          },
          'display': function(time) {
              // don't draw if we're not in menu
              if (this.graphics_state.current_state != ANIMATION_STATE.MENU_SCREEN) {
                  return;
              }
              // orthographic projection to show a flat picture; pictures should be at z = 0
              this.graphics_state.camera_transform = ortho(-2.5, 2.5, -2.5, 2.5, 0, 0.5);
              //this.graphics_state.camera_transform = mat4();

              var model_transform = mat4();
              shaders_in_use["Default"].activate();

              for (var i = 0; i < 1; i++) {
                  this.graphics_state.lights = [new Light(vec4(i % 7 - 3, i % 6 - 3, i % 5 - 3, 1), Color(1, 0, 0, 1), 100000000),
                      new Light(vec4(i % 6 - 3, i % 5 - 3, i % 7 - 3, 1), Color(0, 1, 0, 1), 100000000)
                  ];

                  if (this.graphics_state.current_screen_id == SCREEN_ID.WIN ||
                      this.graphics_state.current_screen_id == SCREEN_ID.LOSE) {
                      this.draw_win_lose_screen();
                  }
                  else if (this.graphics_state.current_screen_id == SCREEN_ID.START) {
                      this.draw_start_screen();
                      //console.log('start');
                  }
              }
          }
      }, Animation);
