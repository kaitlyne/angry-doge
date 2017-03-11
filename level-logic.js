// Mmmk these functions were bloating main-drawing.js so I found out that the template just places the Main_Drawing
// class under the global `window` object by default, soooo with prototype shenanigans I moved these functions
// to this new file and main-drawing.js still works just the same when I call these functions!
// Clearly prototypes = magic. QED.
window.Main_Drawing.prototype.initialize_levels = function() {
    //position variables of the cat ball
    var x = -5;
    var z = -50;
    //cube
    this.level_arr = [];
    this.level_attempts = [5, 6, 7 ,8]
    this.level_arr[0] = [];
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                this.level_arr[0].push(new Moving_Ball("meowth2x1.jpg", vec3((i*5) + x, FLOOR_Y_POS+2.5 + (5*j), (k*5) + z), 2.5));
            }
        }
    }

    //pyramid
    this.level_arr[1] = [];
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            this.level_arr[1].push(new Moving_Ball("sylvester2x1.jpg", vec3((i*2*this.DEF_RAD) + x, FLOOR_Y_POS+this.DEF_RAD, (j*2*this.DEF_RAD) + z), this.DEF_RAD));
        }
    }
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            this.level_arr[1].push(new Moving_Ball("sylvester2x1.jpg", vec3((i*2*this.DEF_RAD) + x+(2*this.DEF_RAD), FLOOR_Y_POS+(3*this.DEF_RAD), (j*2*this.DEF_RAD) + z+(2*this.DEF_RAD)), this.DEF_RAD));
        }
    }
    this.level_arr[1].push(new Moving_Ball("sylvester2x1.jpg", vec3(x+(4*this.DEF_RAD), FLOOR_Y_POS+(5*this.DEF_RAD), z+(4*this.DEF_RAD)), this.DEF_RAD));

    //moving square
    this.level3_speed = 0.125;
    this.level_arr[2] = [];
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 7; j++) {
            this.level_arr[2].push(new Moving_Ball("chairman2x1.jpg", vec3((i*2*this.DEF_RAD) + x, FLOOR_Y_POS+this.DEF_RAD, (j*2*this.DEF_RAD) + z), this.DEF_RAD));
        }
    }

    this.upper_left_corner = this.level_arr[2][0].center_pos;
    this.upper_right_corner = this.level_arr[2][6].center_pos;
    this.lower_left_corner = this.level_arr[2][42].center_pos;
    this.lower_right_corner = this.level_arr[2][48].center_pos;

    //level 4
    this.level4_speed = 0.5;
    this.level_arr[3] = [];
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            this.level_arr[3].push(new Moving_Ball("grumpy2x1.jpg", vec3(x + (i*2*this.DEF_RAD), FLOOR_Y_POS + (8*this.DEF_RAD), z + (j*2*this.DEF_RAD)), this.DEF_RAD, vec3(0, -this.level4_speed, 0)));
        }
    }

    for (var i = 0; i < this.level_arr[3].length; i+=2) {
        this.level_arr[3][i].center_pos = add(this.level_arr[3][i].center_pos, vec3(0, -7*this.DEF_RAD, 0));
        this.level_arr[3][i].transform = mult(translation(0, -7*this.DEF_RAD, 0), this.level_arr[3][i].transform);
        this.level_arr[3][i].velocity[1] = this.level4_speed;
    }

    this.upper_bound = FLOOR_Y_POS + 8*this.DEF_RAD;
    this.lower_bound = FLOOR_Y_POS + this.DEF_RAD;

    //final boss
    this.FINAL_BOSS_RAD = 5;
    this.FINAL_BOSS_HP = 10;

    this.final_arr = [];
    for (var i = 0; i < 10; i++) {
        this.final_arr.push(new Moving_Ball("finalboss.jpg", vec3(6 + (i*2*this.FINAL_BOSS_RAD), FLOOR_Y_POS + 5*this.FINAL_BOSS_RAD , 6), this.FINAL_BOSS_RAD));
    }
};

// ***HERE BE DRAGONS***
window.Main_Drawing.prototype.animate_level3 = function() {
    //animate level 3
    for (var i = 0; i < this.level_arr[2].length; i++) {
        //7x7
        //top line
        if (this.level_arr[2][i].center_pos[0] == this.upper_left_corner[0] && this.level_arr[2][i].center_pos[2] > this.upper_left_corner[2]) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(0, 0, -this.level3_speed));
            this.level_arr[2][i].transform = mult(translation(0, 0, -this.level3_speed), this.level_arr[2][i].transform);
        }
        //left line
        else if (this.level_arr[2][i].center_pos[0] < this.lower_left_corner[0] && this.level_arr[2][i].center_pos[2] == this.lower_left_corner[2]) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(this.level3_speed, 0, 0));
            this.level_arr[2][i].transform = mult(translation(this.level3_speed, 0, 0), this.level_arr[2][i].transform);
        }
        //bottom line
        else if (this.level_arr[2][i].center_pos[0] == this.lower_right_corner[0] && this.level_arr[2][i].center_pos[2] < this.lower_right_corner[2]) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(0, 0, this.level3_speed));
            this.level_arr[2][i].transform = mult(translation(0, 0, this.level3_speed), this.level_arr[2][i].transform);
        }
        //right line
        else if (this.level_arr[2][i].center_pos[0] > this.upper_right_corner[0] && this.level_arr[2][i].center_pos[2] == this.upper_right_corner[2]) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(-this.level3_speed, 0, 0));
            this.level_arr[2][i].transform = mult(translation(-this.level3_speed, 0, 0), this.level_arr[2][i].transform);
        }
        //5x5
        //top line
        else if (this.level_arr[2][i].center_pos[0] == (this.upper_right_corner[0] + (2*this.DEF_RAD)) &&
                (this.level_arr[2][i].center_pos[2] < (this.upper_right_corner[2] - (2*this.DEF_RAD))
                 && this.level_arr[2][i].center_pos[2] >= (this.upper_right_corner[2] - (12*this.DEF_RAD)))) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(0, 0, this.level3_speed));
            this.level_arr[2][i].transform = mult(translation(0, 0, this.level3_speed), this.level_arr[2][i].transform);
        }
        //right line
        else if ((this.level_arr[2][i].center_pos[0] < (this.lower_right_corner[0] - (2*this.DEF_RAD)) &&
                    this.level_arr[2][i].center_pos[0] >= (this.lower_right_corner[0] - (12*this.DEF_RAD)))
                && this.level_arr[2][i].center_pos[2] == (this.lower_right_corner[2] - (2*this.DEF_RAD))) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(this.level3_speed, 0, 0));
            this.level_arr[2][i].transform = mult(translation(this.level3_speed, 0, 0), this.level_arr[2][i].transform);
        }
        //bottom line
        else if (this.level_arr[2][i].center_pos[0] == (this.lower_left_corner[0] - (2*this.DEF_RAD)) &&
                (this.level_arr[2][i].center_pos[2] > (this.lower_left_corner[2] + (2*this.DEF_RAD))
                 && this.level_arr[2][i].center_pos[2] <= (this.lower_left_corner[2] + (12*this.DEF_RAD)) )) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(0, 0, -this.level3_speed));
            this.level_arr[2][i].transform = mult(translation(0, 0, -this.level3_speed), this.level_arr[2][i].transform);
        }
        //left line
        else if ((this.level_arr[2][i].center_pos[0] > (this.upper_left_corner[0] + (2*this.DEF_RAD)) &&
                    this.level_arr[2][i].center_pos[0] <= (this.upper_left_corner[0] + (12*this.DEF_RAD)))
                && this.level_arr[2][i].center_pos[2] == (this.upper_left_corner[2] + (2*this.DEF_RAD))) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(-this.level3_speed, 0, 0));
            this.level_arr[2][i].transform = mult(translation(-this.level3_speed, 0, 0), this.level_arr[2][i].transform);
        }
        //3x3
        //top line
        else if (this.level_arr[2][i].center_pos[0] == (this.upper_left_corner[0] + (4*this.DEF_RAD)) &&
                (this.level_arr[2][i].center_pos[2] > (this.upper_left_corner[2] + (4*this.DEF_RAD))
                 && this.level_arr[2][i].center_pos[2] <= (this.upper_left_corner[2] + (8*this.DEF_RAD)))) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(0, 0, -this.level3_speed));
            this.level_arr[2][i].transform = mult(translation(0, 0, -this.level3_speed), this.level_arr[2][i].transform);
        }
        //left line
        else if ((this.level_arr[2][i].center_pos[0] < (this.lower_left_corner[0] - (4*this.DEF_RAD)) &&
                    this.level_arr[2][i].center_pos[0] >= (this.lower_left_corner[0] - (8*this.DEF_RAD)))
                && this.level_arr[2][i].center_pos[2] == (this.lower_left_corner[2] + (4*this.DEF_RAD))) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(this.level3_speed, 0, 0));
            this.level_arr[2][i].transform = mult(translation(this.level3_speed, 0, 0), this.level_arr[2][i].transform);
        }
        //bottom line
        else if (this.level_arr[2][i].center_pos[0] == (this.lower_right_corner[0] - (4*this.DEF_RAD)) &&
                (this.level_arr[2][i].center_pos[2] < (this.lower_right_corner[2] - (4*this.DEF_RAD))
                 && this.level_arr[2][i].center_pos[2] >= (this.lower_right_corner[2] - (8*this.DEF_RAD)) )) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(0, 0, this.level3_speed));
            this.level_arr[2][i].transform = mult(translation(0, 0, this.level3_speed), this.level_arr[2][i].transform);
        }
        //right line
        else if ((this.level_arr[2][i].center_pos[0] > (this.upper_right_corner[0] + (4*this.DEF_RAD)) &&
                    this.level_arr[2][i].center_pos[0] <= (this.upper_right_corner[0] + (8*this.DEF_RAD)))
                && this.level_arr[2][i].center_pos[2] == (this.upper_right_corner[2] - (4*this.DEF_RAD))) {
            this.level_arr[2][i].center_pos = add(this.level_arr[2][i].center_pos, vec3(-this.level3_speed, 0, 0));
            this.level_arr[2][i].transform = mult(translation(-this.level3_speed, 0, 0), this.level_arr[2][i].transform);
        }
    }
};

// ***HERE BE MORE DRAGONS***
window.Main_Drawing.prototype.animate_level4 = function() {
    //animate level 4
    for (var i = 0; i < this.level_arr[3].length; i+=2) {
        if (this.level_arr[3][i].velocity[1] > 0) {
            this.level_arr[3][i].center_pos = add(this.level_arr[3][i].center_pos, vec3(0, -this.level4_speed, 0));
            this.level_arr[3][i].transform = mult(translation(0, -this.level4_speed, 0), this.level_arr[3][i].transform);
        }
        else {
            this.level_arr[3][i].center_pos = add(this.level_arr[3][i].center_pos, vec3(0, this.level4_speed, 0));
            this.level_arr[3][i].transform = mult(translation(0, this.level4_speed, 0), this.level_arr[3][i].transform);
        }
        if (this.level_arr[3][i].center_pos[1] <= this.lower_bound) {
            this.level_arr[3][i].velocity[1] = -this.level4_speed;
        }
        else if (this.level_arr[3][i].center_pos[1] >= this.upper_bound) {
            this.level_arr[3][i].velocity[1] = this.level4_speed;
        }
    }

    for (var i = 1; i < this.level_arr[3].length; i+=2) {
        if (this.level_arr[3][i].velocity[1] > 0) {
            this.level_arr[3][i].center_pos = add(this.level_arr[3][i].center_pos, vec3(0, -this.level4_speed, 0));
            this.level_arr[3][i].transform = mult(translation(0, -this.level4_speed, 0), this.level_arr[3][i].transform);
        }
        else {
            this.level_arr[3][i].center_pos = add(this.level_arr[3][i].center_pos, vec3(0, this.level4_speed, 0));
            this.level_arr[3][i].transform = mult(translation(0, this.level4_speed, 0), this.level_arr[3][i].transform);
        }
        if (this.level_arr[3][i].center_pos[1] <= this.lower_bound) {
            this.level_arr[3][i].velocity[1] = -this.level4_speed;
        }
        else if (this.level_arr[3][i].center_pos[1] >= this.upper_bound) {
            this.level_arr[3][i].velocity[1] = this.level4_speed;
        }
    }
};
