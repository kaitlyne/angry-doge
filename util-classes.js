// y position for the floor (constant)
const FLOOR_Y_POS = -8;
// y position for the ceiling (constant)
const CEILING_Y_POS = 32;
// if a velocity is below this constant, force the velocity to be 0
const ZERO_VELOCITY_THRESHOLD = 0.05;

// Class for a ball capable of motion. Just used es6 syntax here since it's simple,
// and Declare_Any_Class doesn't seem to work? Don't need to inherit Shape or any of those classes anyway.
class Moving_Ball {
    constructor(texture_filename, center_pos, radius, velocity=vec3(0,0,0)) {
        // material for ball's texture
        if (texture_filename == "FLIGHT_TRACKING") {
            this.material = new Material(Color(1, 0, 0, 1), 1, 0, 0, 0);
        }
        else if (texture_filename == "dogecoin2x1.jpg") {
            this.material = new Material(Color(0, 0, 0, 1), 1, 0, 0, 0, texture_filename);
        }
        else {
            this.material = new Material(Color(0.5, 0.5, 0.5, 0.8), .5, .4, .4, 200, texture_filename);
        }
        // position of the ball's center; this is a vec3
        this.center_pos = center_pos;
        // ball's radius; this should be constant
        this.radius = radius;
        // ball's initial velocity; this is a vec3
        this.velocity = velocity;

		this.init_transform();
    }
	init_transform() {
		// ball's model transform; this is a mat4
        this.transform = mat4();
        // set the initial transform to scale with the radius and translate to the initial position
        this.transform = mult(this.transform,
                translation(this.center_pos[0],
                    this.center_pos[1], this.center_pos[2]));
        // rotate the ball 90 degrees so the center of the picture faces the front of the camera
        this.transform = mult(this.transform,
                rotation(-90, 0, 1, 0));
        this.transform = mult(this.transform,
                scale(this.radius, this.radius, this.radius));
	}
    // modify the ball's center, radius, velocity, and transform to simulate falling
    // frame_delta is the change in time, used to calculate velocity
    // gravity_const is the gravitational acceleration to multiply by
    // bounce_factor specifies how much the velocity is multiplied by when bouncing back up
    // from the ground
    // friction_factor is what fraction to reduce the velocity by if ball is on floor
    apply_gravity_and_friction(frame_delta, gravity_const, bounce_factor, friction_factor, is_doge, boink_audio) {
        var ball_on_floor_pos = FLOOR_Y_POS + this.radius;
        // if y velocity is 0 and the ball is touching the floor
        if (this.velocity[1] == 0.0 && this.center_pos[1].toFixed(1) == ball_on_floor_pos.toFixed(1)) {
            // leave velocity untouched
            // apply kinetic friction to slow the ball down
            // if total velocity is small enough, force it to 0
            // dot of velocity and velocity is velocity squared, so check if that's less than
            // minimum velocity squared
            if (dot(this.velocity, this.velocity) < ZERO_VELOCITY_THRESHOLD * ZERO_VELOCITY_THRESHOLD) {
                this.velocity = vec3(0, 0, 0);
            }
            else {
                this.velocity[0] *= (1 - friction_factor);
                this.velocity[2] *= (1 - friction_factor);
            }
        }
        else {
            // change in velocity is acceleration * change in time
            // acceleration in this case is just a constant that looks good
            this.velocity[1] -= frame_delta * gravity_const;
        }
        // set displacement to be velocity
        var displacement = this.velocity;
        // calculate new position with given velocity
        var new_pos = add(this.center_pos, this.velocity);
        // if sphere's bottom is below the floor
        if (new_pos[1] - this.radius < FLOOR_Y_POS) {
            //console.log(this.velocity[1]);
            // if y velocity is small enough, force it to 0
            if (Math.abs(this.velocity[1]) < ZERO_VELOCITY_THRESHOLD) {
                this.velocity[1] = 0.0;
            }
            // flip the ball's y velocity to make it bounce, multiply by bounce factor
            else {
                if (is_doge) {
                   boink_audio.play();
                }
                this.velocity[1] *= -bounce_factor;
            }
            // don't want the ball to appear partly "inside" the floor, so adjust the displacement
            // so that it's right above the floor
            //new_pos = add(this.center_pos, this.velocity);
            new_pos = add(vec3(this.center_pos[0],
                        FLOOR_Y_POS + this.radius, this.center_pos[2]),
                    this.velocity);
            displacement = subtract(new_pos, this.center_pos);
            //console.log(this.center_pos[1], new_pos[1], this.velocity);
        }
        this.center_pos = new_pos;
        // translate the ball by the displacement
        this.transform = mult(translation(displacement[0],
                    displacement[1], displacement[2]),
                this.transform);
    }
}

function collide_with_wall(ball) {
    //define wall boundaries
    var left_edge = -56
    var right_edge = 48
    var front_edge = -56
    var back_edge = 48
    var top_edge = 32
    //define ball attributes
    var radius = ball.radius
    var center = ball.center_pos
    var front_point = center[2] - radius
    var back_point = center[2] + radius
    var upper_point = center[1] + radius
    //var lower_point = center[1] - radius
    var left_point = center[0] - radius
    var right_point = center[0] + radius
    //check if hitting boundaries
    if (front_point <= front_edge) {
      this.ball.center_pos[2] = BOUNDARY_FRONT + this.ball.radius
      this.ball.velocity[2] *= -1
      return true
    }
    if (back_point >= back_edge) {
      this.ball.center_pos[2] = BOUNDARY_BACK - this.ball.radius
      this.ball.velocity[2] *= -1
      return true
    }
    if (left_point <= left_edge) {
      this.ball.center_pos[0] = BOUNDARY_LEFT + this.ball.radius
      this.ball.velocity[0] *= -1
      return true
    }
    if (right_point >= right_edge) {
      this.ball.center_pos[0] = BOUNDARY_RIGHT - this.ball.radius
      this.ball.velocity[0] *= -1
      return true
    }
    if (upper_point >= top_edge) {
      this.ball.center_pos[1] = BOUNDARY_TOP - this.ball.radius
      this.ball.velocity[1] *= -1
      return true
    }
    return false
}


function do_balls_collide(ball1, ball2) {
    // get the difference between the two balls' centers as a vector
    var position_difference = subtract(ball1.center_pos, ball2.center_pos);
    // calculate the length of this vector squared; don't need the length
    // itself as square root is expensive and unnecessary
    // the length squared is the same as the vector dotted with itself:
    // x*x + y*y + z*z
    var distance_squared = dot(position_difference, position_difference);
    // calculate (sum of the balls' radii)^2
    var radii_sum_squared = Math.pow(ball1.radius + ball2.radius, 2);
    // if squared distance is less than squared sum of radii,
    // that's the same as saying the distance is less than the sum of the radii
    // aka the balls collided
    if (distance_squared < radii_sum_squared) {
        return true;
    }
    return false;
}
