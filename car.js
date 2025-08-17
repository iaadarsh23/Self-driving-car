class Car {
	//constructor for the car having its property;
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = "black";
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
