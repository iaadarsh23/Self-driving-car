class Car {
	//constructor for the car having its property;
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = "black";
		//this will create a control and fetch all the controls from the control.js file and class
		this.controls = new Controls();
	}

	//lets add a update function that will tell it move in forward and backward direction , this function will be called in main.js to draw the car in the particular direction

	update() {
		if (this.controls.forward) {
			//y expand in forward direction
			this.y -= 2;
		}
		if (this.controls.backward) {
			this.y += 2;
		}
	}

	//draw method to draw the car
	draw(ctx) {
		ctx.beginPath();
		ctx.rect(
			//x of the car will be the center so we divide it using the width similarly for the y

			this.x - this.width / 2,
			this.y - this.height / 2,
			this.width,
			this.height
		);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}
