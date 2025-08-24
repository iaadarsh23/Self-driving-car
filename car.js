class Car {
	constructor(x, y, width, height, controlType, maxSpeed = 3) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = 0;
		this.acceleration = 0.2;
		this.maxSpeed = maxSpeed;
		this.friction = 0.05;
		this.angle = 0;
		this.damaged = false;
		// Crash animation state
		this._crashMaxFrames = 90; // duration of crash pulse
		this._crashFrames = 0; // countdown (0 = inactive)

		if (controlType != "DUMMY") {
			this.sensor = new Sensor(this);
		}
		this.controls = new Controls(controlType);
	}

	update(roadBorders, traffic) {
		const wasDamaged = this.damaged;
		if (!this.damaged) {
			this.#move();
			this.polygon = this.#createPolygon();
			this.damaged = this.#assessDamage(roadBorders, traffic);
		}
		// Trigger crash animation on first transition to damaged
		if (!wasDamaged && this.damaged) {
			this._crashFrames = this._crashMaxFrames;
		}
		// Decrement crash animation counter
		if (this._crashFrames > 0) {
			this._crashFrames--;
		}
		if (this.sensor) {
			this.sensor.update(roadBorders, traffic);
		}
	}

	#assessDamage(roadBorders, traffic) {
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				return true;
			}
		}
		for (let i = 0; i < traffic.length; i++) {
			if (polysIntersect(this.polygon, traffic[i].polygon)) {
				return true;
			}
		}
		return false;
	}

	#createPolygon() {
		const points = [];
		const rad = Math.hypot(this.width, this.height) / 2;
		const alpha = Math.atan2(this.width, this.height);
		points.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
		});
		return points;
	}

	#move() {
		if (this.controls.forward) {
			this.speed += this.acceleration;
		}
		if (this.controls.reverse) {
			this.speed -= this.acceleration;
		}

		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
		}
		if (this.speed < -this.maxSpeed / 2) {
			this.speed = -this.maxSpeed / 2;
		}

		if (this.speed > 0) {
			this.speed -= this.friction;
		}
		if (this.speed < 0) {
			this.speed += this.friction;
		}
		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0;
		}

		if (this.speed != 0) {
			const flip = this.speed > 0 ? 1 : -1;
			if (this.controls.left) {
				this.angle += 0.03 * flip;
			}
			if (this.controls.right) {
				this.angle -= 0.03 * flip;
			}
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	draw(ctx, color) {
		// Base car body fill
		ctx.fillStyle = this.damaged ? "#666" : color;
		ctx.beginPath();
		ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
		for (let i = 1; i < this.polygon.length; i++) {
			ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
		}
		ctx.fill();

		// Crash overlay & halo effect
		if (this.damaged && this._crashFrames > 0) {
			const progress = 1 - this._crashFrames / this._crashMaxFrames; // 0 -> 1
			// Pulsating inner polygon tint
			ctx.save();
			ctx.globalAlpha = 0.35 + 0.25 * Math.sin(progress * 12);
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
			for (let i = 1; i < this.polygon.length; i++) {
				ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
			}
			ctx.fill();
			ctx.restore();

			// Expanding radial halo
			const radius = lerp(40, 260, progress);
			const g = ctx.createRadialGradient(
				this.x,
				this.y,
				0,
				this.x,
				this.y,
				radius
			);
			g.addColorStop(0, `rgba(255,0,0,${(1 - progress) * 0.6 + 0.2})`);
			g.addColorStop(1, "rgba(255,0,0,0)");
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

		if (this.sensor) {
			this.sensor.draw(ctx);
		}
	}
}
