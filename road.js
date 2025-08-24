class Road {
	constructor(x, width, laneCount = 3) {
		this.x = x;
		this.width = width;
		this.laneCount = laneCount;

		this.left = this.x - width / 2;
		this.right = this.x + width / 2;
		//i want to make sure that lane is moving infinitely
		const infinity = 10000000;
		this.top = -infinity;
		this.bottom = infinity;

		//lets have collision logic make the boundaries rigid
		const topleft = { x: this.left, y: this.top };
		const topright = { x: this.right, y: this.top };
		const bottomleft = { x: this.left, y: this.bottom };
		const bottomright = { x: this.right, y: this.bottom };
		//we are using the array because have straight lines
		this.border = [
			[topleft, bottomleft],
			[topright, bottomright],
		];
	}
	//this function will get the middle of the lane
	getCenter(index) {
		const laneWidth = this.width / this.laneCount;
		return this.left + laneWidth / 2 + index * laneWidth;
	}

	//lets draw the road
	draw(ctx) {
		ctx.lineWidth = 5;
		ctx.strokeStyle = "white";
		for (let i = 1; i <= this.laneCount - 1; i++) {
			const x = lerp(this.left, this.right, i / this.laneCount);
			//lets draw the dash lines

			ctx.setLineDash([20, 20]);

			ctx.beginPath();
			ctx.moveTo(x, this.top);
			ctx.lineTo(x, this.bottom);
			ctx.stroke();
		}
		ctx.setLineDash([]);
		this.border.forEach((border) => {
			ctx.beginPath();
			ctx.moveTo(border[0].x, border[0].y);
			ctx.lineTo(border[1].x, border[1].y);
			ctx.stroke();
		});
	}
}
