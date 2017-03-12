// Mmmk these functions were bloating main-drawing.js so I found out that the template just places the Main_Drawing
// class under the global `window` object by default, soooo with prototype shenanigans I moved these functions
// to this new file and main-drawing.js still works just the same when I call these functions!
// Clearly prototypes = magic. QED.
window.Main_Drawing.prototype.init_animation = function() {
	console.log('animate');
	this.is_in_intro_anim = true;
	this.animation_start_time = this.graphics_state.animation_time;
	this.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
	//this.doge.transform = mult(translation(0, 0, -300), this.doge.transform);
	//this.graphics_state.camera_transform = mult(this.graphics_state.camera_transform,
	//	translation(0, 0, -75));
};

window.Main_Drawing.prototype.draw_path = function() {
  // Draw the grass
  var grass_transform = mat4();
  var grass_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 40, "grass.jpg");
  const grass_scale_factor = 8;
  grass_transform = mult(grass_transform, translation(0, FLOOR_Y_POS-0.02, 100));
  grass_transform = mult(grass_transform, scale(grass_scale_factor, grass_scale_factor, grass_scale_factor));
  grass_transform = mult(grass_transform, rotation(90, 1, 0, 0));
  const num_grass_blocks = {
    x: 18,
    z: 52
  };
  for (var i = 0; i < num_grass_blocks.x; i++) {
    for (var j = 0; j < num_grass_blocks.z; j++) {
      // draw the floor block in the ith row, jth column
      var translate_transf = translation((i - num_grass_blocks.x / 2) * 2 * grass_scale_factor,
        0, (j - num_grass_blocks.z / 2) * 2 * grass_scale_factor);
      var final_transf = mult(translate_transf, grass_transform);
      shapes_in_use["strip"].draw(this.graphics_state, final_transf, grass_material);
    }
  }
  //shapes_in_use["strip"].draw(this.graphics_state, grass_transform, grass_material);
  // Draw the path
  var path_transform = mat4();
  var path_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 40, "path.jpg");
  path_transform = mult(path_transform, translation(0, FLOOR_Y_POS-0.01, 144));
  path_transform = mult(path_transform, scale(8, 1, 170));
  path_transform = mult(path_transform, rotation(90, 1, 0, 0));
  shapes_in_use["strip"].draw(this.graphics_state, path_transform, path_material);
};

window.Main_Drawing.prototype.draw_lawns = function() {
	var brown_material = new Material(Color(165/255, 42/255, 42/255, 1), 0.5, 0.5, 0.6, 80);
	var green_material = new Material(Color(0, 1, 0, 1), 0.5, 0.5, 0.6, 80);
	var tree_transf = mat4();
	tree_transf = mult(tree_transf, translation(-20, FLOOR_Y_POS, 110));
	tree_transf = mult(tree_transf, scale(3, 9, 3));
	tree_transf = mult(tree_transf, rotation(-90, 1, 0, 0));
	shapes_in_use["capped"].draw(this.graphics_state, tree_transf, brown_material);
	tree_transf = mult(translation(0, 22.5, 0), tree_transf);
	tree_transf = mult(tree_transf, scale(2, 1, 2));
	shapes_in_use["cone"].draw(this.graphics_state, tree_transf, green_material);
};

window.Main_Drawing.prototype.draw_roof = function() {
	var roof_material = new Material(Color(0, 0, 0, 1), 0.8, 0.5, 0, 0, "wall.jpg");
	var roof_transf = mat4();
	roof_transf = mult(roof_transf, translation((BOUNDARY_RIGHT + BOUNDARY_LEFT) / 2, 
		BOUNDARY_TOP + 0.01, (BOUNDARY_BACK + BOUNDARY_FRONT) / 2));
	roof_transf = mult(roof_transf, scale(BOUNDARY_RIGHT - BOUNDARY_LEFT,
		50, BOUNDARY_BACK - BOUNDARY_FRONT));
	//roof_transf = mult(roof_transf, scale(50, 50, 50));
	shapes_in_use["tetra"].draw(this.graphics_state, roof_transf, roof_material);
	roof_transf = mult(roof_transf, rotation(90, 0, 1, 0));
	shapes_in_use["tetra"].draw(this.graphics_state, roof_transf, roof_material);
	roof_transf = mult(roof_transf, rotation(90, 0, 1, 0));
	shapes_in_use["tetra"].draw(this.graphics_state, roof_transf, roof_material);
	roof_transf = mult(roof_transf, rotation(90, 0, 1, 0));
	shapes_in_use["tetra"].draw(this.graphics_state, roof_transf, roof_material);
};

window.Main_Drawing.prototype.intro_animation = function() {
	if (!this.is_in_intro_anim) {
		this.init_animation();
	}
	var time_diff = this.graphics_state.animation_time - this.animation_start_time;
	if (time_diff > 10000) {
		this.graphics_state.current_state = ANIMATION_STATE.IN_GAME;
		this.is_in_intro_anim = false;
		this.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
		this.at_init_pos = true;
		this.reset_doge(true);
		this.doge.init_transform();
		return;
	}

	this.graphics_state.lights = [new Light(vec4(this.doge.center_pos[0],
    this.doge.center_pos[1], this.doge.center_pos[2] + 300 - 30 * time_diff / 1000, 1), Color(1, 1, 0, 1), 1000000),
    	  new Light(vec4(300, 3,7, 1), Color(1, 1, 0, 1), 1)
  	];
	this.graphics_state.camera_transform = mult(PERSPECTIVE_TRANSFORM,
		translation(0, 0, -300 + 30 * time_diff / 1000));
	//console.log('animate');
	//var init_doge_transf = translation(this.init_center[0],
	//	this.init_center[1], this.init_center[2]);
	this.doge.init_transform();
	this.doge.transform = mult(translation(0, 0, 300 - 30 * time_diff / 1000), this.doge.transform);
	this.doge.transform = mult(this.doge.transform, rotation(time_diff * time_diff / 5000, 0, 0, 1));
	shapes_in_use["good_sphere"].draw(this.graphics_state, this.doge.transform, this.doge.material);
  this.draw_path();
	this.draw_walls();
	this.draw_floor("floor");
	this.draw_floor("ceiling");
	this.draw_enemies();
	this.draw_lawns();
	this.draw_roof();
};

