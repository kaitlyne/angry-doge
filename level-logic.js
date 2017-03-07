// Mmmk these functions were bloating main-drawing.js so I found out that the template just places the Main_Drawing
// class under the global `window` object by default, soooo with prototype shenanigans I moved these functions
// to this new file and main-drawing.js still works just the same when I call these functions!
// Clearly prototypes = magic. QED.
window.Main_Drawing.prototype.initialize_levels = function() {
    //cube
    this.level1_arr = [];
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                this.level1_arr.push(new Moving_Ball("meowth2x1.jpg", vec3((i*5) + x, FLOOR_Y_POS+2.5 + (5*j), (k*5) + z), 2.5));
            }
        }
    }

    //pyramid
    this.level2_arr = [];
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            this.level2_arr.push(new Moving_Ball("sylvester2x1.jpg", vec3((i*2*DEF_RAD) + x, FLOOR_Y_POS+DEF_RAD, (j*2*DEF_RAD) + z), DEF_RAD));
        }
    }
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            this.level2_arr.push(new Moving_Ball("sylvester2x1.jpg", vec3((i*2*DEF_RAD) + x+(2*DEF_RAD), FLOOR_Y_POS+(3*DEF_RAD), (j*2*DEF_RAD) + z+(2*DEF_RAD)), DEF_RAD));
        }
    }
    this.level2_arr.push(new Moving_Ball("sylvester2x1.jpg", vec3(x+(4*DEF_RAD), FLOOR_Y_POS+(5*DEF_RAD), z+(4*DEF_RAD)), DEF_RAD));

    //moving square
    this.level3_arr = [];
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 7; j++) {
            this.level3_arr.push(new Moving_Ball("chairman2x1.jpg", vec3((i*2*DEF_RAD) + x, FLOOR_Y_POS+DEF_RAD, (j*2*DEF_RAD) + z), DEF_RAD));
        }
    }

    upper_left_corner = this.level3_arr[0].center_pos;
    upper_right_corner = this.level3_arr[6].center_pos;
    lower_left_corner = this.level3_arr[42].center_pos;
    lower_right_corner = this.level3_arr[48].center_pos;

    //level 4
    this.level4_arr = [];
        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 7; j++) {
                this.level4_arr.push(new Moving_Ball("grumpy2x1.jpg", vec3(x + (i*2*DEF_RAD), FLOOR_Y_POS + (8*DEF_RAD), z + (j*2*DEF_RAD)), DEF_RAD));
            }
        }

    for (var i = 0; i < this.level4_arr.length; i+=2) {
        this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, -7*DEF_RAD, 0));
        this.level4_arr[i].transform = mult(translation(0, -7*DEF_RAD, 0), this.level4_arr[i].transform);
    }

    upper_bound = FLOOR_Y_POS + 8*DEF_RAD;
    lower_bound = FLOOR_Y_POS + DEF_RAD;

    //final boss
    this.final_arr = []
        for (var i = 0; i < 10; i++) {
            this.final_arr.push(new Moving_Ball("finalboss.jpg", vec3(6 + (i*2*FINAL_BOSS_RAD), FLOOR_Y_POS + 5*FINAL_BOSS_RAD , 6), FINAL_BOSS_RAD));
        }
};

// ***HERE BE DRAGONS***
window.Main_Drawing.prototype.animate_level3 = function() {
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
};

// ***HERE BE MORE DRAGONS***
window.Main_Drawing.prototype.animate_level4 = function() {
    //animate level 4
    for (var i = 0; i < this.level4_arr.length; i+=2) {
        if (move_dir[i] == UP) {
            this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, -0.5, 0));
            this.level4_arr[i].transform = mult(translation(0, -0.5, 0), this.level4_arr[i].transform);
        }
        else {
            this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, 0.5, 0));
            this.level4_arr[i].transform = mult(translation(0, 0.5, 0), this.level4_arr[i].transform);
        }
        if (this.level4_arr[i].center_pos[1] <= lower_bound) {
            move_dir[i] = DOWN;
        }
        else if (this.level4_arr[i].center_pos[1] >= upper_bound) {
            move_dir[i] = UP;
        }
    }

    for (var i = 1; i < this.level4_arr.length; i+=2) {
        if (move_dir[i] == UP) {
            this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, -0.5, 0));
            this.level4_arr[i].transform = mult(translation(0, -0.5, 0), this.level4_arr[i].transform);
        }
        else {
            this.level4_arr[i].center_pos = add(this.level4_arr[i].center_pos, vec3(0, 0.5, 0));
            this.level4_arr[i].transform = mult(translation(0, 0.5, 0), this.level4_arr[i].transform);
        }
        if (this.level4_arr[i].center_pos[1] <= lower_bound) {
            move_dir[i] = DOWN;
        }
        else if (this.level4_arr[i].center_pos[1] >= upper_bound) {
            move_dir[i] = UP;
        }
    }
};
