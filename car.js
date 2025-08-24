class Car {
	//constructor for the car having its property;
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = "black";
		//this will create a control and fetch all the controls from the control.js file and class
		this.speed = 0;
		this.acceleration = 0.2;
		this.maxSpeed = 3;
		this.friction = 0.05;
		this.angle = 0;
		this.sensor = new Sensor(this);
		this.controls = new Controls();
	}

	//lets add a update function that will tell it move in forward and backward direction , this function will be called in main.js to draw the car in the particular direction

	update() {
		this.#move();
		this.sensor.update();
	}
	#move() {
		if (this.controls.forward) {
			//make it move like a car
			this.speed += this.acceleration;
		}
		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
		}
		if (this.controls.backward) {
			this.speed -= this.acceleration;
		}
		//here the minus sign indicates that we are going in reverse;
		if (this.speed < -this.maxSpeed / 2) {
			// clamp reverse speed to half of forward max speed
			this.speed = -this.maxSpeed / 2;
		}

		//if the speed is greater than or lesser than 0 then we will decrease and increase it with respect to the friction
		if (this.speed > 0) {
			this.speed -= this.friction;
		}
		if (this.speed < 0) {
			this.speed += this.friction;
		}

		//the car keeps moving even when i stopped pressing forward btn because the friction we have given will keep it bouncing so lets fix thi

		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0;
		}

		//lets move it left and write also
		if (this.speed != 0) {
			const flip = this.speed > 0 ? 1 : -1;
			if (this.controls.left) {
				this.angle += 0.03 * flip;
			}
			if (this.controls.right) {
				this.angle -= 0.03 * flip;
			}
		}

		//we are doing this to move the car in certain angles like a real car
		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	//draw method to draw the car
	draw(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.angle);
		ctx.beginPath();
		ctx.rect(
			//x of the car will be the center so we divide it using the width similarly for the y

			-this.width / 2,
			-this.height / 2,
			this.width,
			this.height
		);
		ctx.fillStyle = this.color;
		ctx.fill();
		//we are restoring this to prevent the infinite rotation after each frame;
		ctx.restore();
		this.sensor.draw(ctx);
	}
}
