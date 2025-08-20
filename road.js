class Road {
	constructor(x, width, laneCount = 3) {
		this.x = x;
		this.width = width;
		this.laneCount = laneCount;

		this.left = this.x - width / 2;
		this.right = this.x + width / 2;
		//i want to make sure that lane is moving infinitely
		const infinity = 1000000000000;
	}
}
