// Mmmk these functions were bloating main-drawing.js so I found out that the template just places the Main_Drawing
// class under the global `window` object by default, soooo with prototype shenanigans I moved these functions
// to this new file and main-drawing.js still works just the same when I call these functions!
// Clearly prototypes = magic. QED.
window.Main_Drawing.prototype.init_animation = function() {
	console.log('animate');
	this.is_in_intro_anim = true;
	this.animation_start_time = this.graphics_state.animation_time;
	this.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
	//this.graphics_state.camera_transform = mult(this.graphics_state.camera_transform,
	//	translation(0, 0, -75));
};
window.Main_Drawing.prototype.draw_path = function() {
  var path_transform = mat4();
  var path_material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 40, "path.jpg");
  path_transform = mult(path_transform, translation(0, FLOOR_Y_POS-0.01, 144));
  path_transform = mult(path_transform, scale(8, 1, 170));
  path_transform = mult(path_transform, rotation(90, 1, 0, 0));
  shapes_in_use["strip"].draw(this.graphics_state, path_transform, path_material);
}
window.Main_Drawing.prototype.intro_animation = function() {
	if (!this.is_in_intro_anim) {
		this.init_animation();
	}
	var time_diff = this.graphics_state.animation_time - this.animation_start_time;
	if (time_diff > 10000) {
		this.graphics_state.current_state = ANIMATION_STATE.IN_GAME;
		this.is_in_intro_anim = false;
		this.graphics_state.camera_transform = PERSPECTIVE_TRANSFORM;
	}
	this.graphics_state.camera_transform = mult(PERSPECTIVE_TRANSFORM,
		translation(0, 0, -300 + 30 * time_diff / 1000));
	//console.log('animate');
  this.draw_path();
	this.draw_walls();
	this.draw_floor("floor");
	this.draw_floor("ceiling");
};
