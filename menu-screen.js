  Declare_Any_Class("Menu_Screen", // An example of a displayable object that our class Canvas_Manager can manage.  This one draws the scene's 3D shapes.
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

              Object.assign(shapes_in_use, this.newest_shapes); // This appends newest_shapes onto shapes_in_use

              // *** Mouse controls: ***
              this.mouse = {
                  "from_center": vec2()
              };
              var mouse_position = function(e) {
                  return vec2(e.clientX - canvas.width / 2, e.clientY - canvas.height / 2);
              };
              // Measure mouse steering, for rotating the flyaround camera.
              canvas.addEventListener("mouseup", (function(self) {
                  return function(e) {
                      if (self.graphics_state.current_state != ANIMATION_STATE.MENU_SCREEN) {
                          return;
                      }
                      e = e || window.event;
                      self.graphics_state.current_state = ANIMATION_STATE.IN_GAME;
                      document.getElementById('top-text').style.visibility = 'hidden';
                      self.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
                      console.log('mouseup');
                  }
              })(this), false);

          },
          'draw_all_shapes': function(model_transform) {
              var i = 0,
                  t = this.graphics_state.animation_time / 1000,
                  textures = Object.keys(textures_in_use);

              var win_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, "doge-sunglasses.jpg");
              var pic_transf = mat4();
              // flip picture so it's upright
              pic_transf = mult(pic_transf, scale(1, -1, 1));
              shapes_in_use['strip'].draw(this.graphics_state, pic_transf, win_material);
          },
          'display': function(time) {
              // don't draw if we're not in menu
              if (this.graphics_state.current_state != ANIMATION_STATE.MENU_SCREEN) {
                  return;
              }
              // orthographic projection to show a flat picture; pictures should be at z = 0
              this.graphics_state.camera_transform = ortho(-2.5, 2.5, -2.5, 2.5, 0, 0.5);
              //this.graphics_state.camera_transform = mat4();
              document.getElementById('top-text').style.visibility = 'visible';
              var model_transform = mat4();
              shaders_in_use["Default"].activate();

              for (var i = 0; i < 1; i++) {
                  this.graphics_state.lights = [new Light(vec4(i % 7 - 3, i % 6 - 3, i % 5 - 3, 1), Color(1, 0, 0, 1), 100000000),
                      new Light(vec4(i % 6 - 3, i % 5 - 3, i % 7 - 3, 1), Color(0, 1, 0, 1), 100000000)
                  ];

                  this.draw_all_shapes();
              }
          }
      }, Animation);
