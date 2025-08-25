const CarImageCache = {};

class Car {
	constructor(
		x,
		y,
		width,
		height,
		controlType,
		maxSpeed = 3,
		imageFile = null
	) {
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

		this.useBrain = controlType == "AI";

		// Image sprite (loaded from assets). Main player uses 1.png (passed explicitly)
		this._image = null;
		this._imageLoaded = false;
		this._selectImage(controlType, imageFile);

		if (controlType != "DUMMY") {
			this.sensor = new Sensor();
			this.brain = new NeuralNetwork([this.sensor.rayCount, 4]);
		}
		this.controls = new Controls(controlType);
	}

	update(roadBorders, traffic) {
		// Reverted simple autopilot: constant forward motion for dummy cars
		if (this.sensor == null && roadBorders && this.maxSpeed > 0) {
			this.controls.forward = true;
			this.controls.left = false;
			this.controls.right = false;
			this.controls.reverse = false;
		}
		// Safety: if AI lost its brain due to incompatible saved data, rebuild it
		if (this.sensor && !this.brain) {
			this.brain = new NeuralNetwork([this.sensor.rayCount, 4]);
		}
		if (!this.damaged) {
			this.#move();
			this.polygon = this.#createPolygon();
			this.damaged = this.#assessDamage(roadBorders, traffic);
		}
		if (this.sensor) {
			this.sensor.update(this.x, this.y, this.angle, roadBorders, traffic);
			const offsets = this.sensor.readings.map((s) =>
				s == null ? 0 : 1 - s.offset
			);
			if (this.brain) {
				const outputs = NeuralNetwork.feedForward(offsets, this.brain);
				if (this.useBrain) {
					this.controls.forward = outputs[0];
					this.controls.left = outputs[1];
					this.controls.right = outputs[2];
					this.controls.reverse = outputs[3];
				}
			}
		}
	}

	#assessDamage(roadBorders, traffic) {
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect([...this.polygon, this.polygon[0]], roadBorders[i])) {
				return true;
			}
		}
		for (let i = 0; i < traffic.length; i++) {
			const poly = traffic[i].polygon;
			if (
				polysIntersect([...this.polygon, this.polygon[0]], [...poly, poly[0]])
			) {
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

		if (this.speed != 0) {
			const flip = this.speed > 0 ? 1 : -1;
			if (this.controls.left) {
				this.angle += 0.03 * flip;
			}
			if (this.controls.right) {
				this.angle -= 0.03 * flip;
			}
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

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}

	draw(ctx, drawSensor = false) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.angle);
		ctx.translate(-this.width / 2, -this.height / 2);
		if (this._imageLoaded) {
			if (this.damaged) ctx.globalAlpha = 0.5;
			ctx.drawImage(this._image, 0, 0, this.width, this.height);
		} else {
			// Fallback: gray rectangle while image loads
			ctx.fillStyle = "#555";
			ctx.fillRect(0, 0, this.width, this.height);
		}
		ctx.restore();

		if (this.sensor && drawSensor) {
			this.sensor.draw(ctx);
		}
	}
}

// Private helper to pick and load image
Car.prototype._selectImage = function (controlType, explicitFile) {
	let file = explicitFile;
	if (!file) {
		if (controlType === "DUMMY") {
			// Extended pool includes new realistic renders
			const pool = [
				"3.png",
				"3.png",
				"4.png",
				"vecteezy_realistic-sport-car-isolated-on-background-3d-rendering_48430893.png",
				"vecteezy_realistic-sport-car-isolated-on-background-3d-rendering_48430998.png",
			];
			file = pool[Math.floor(Math.random() * pool.length)];
		} else {
			// AI (main) default
			file = "1.png";
		}
	}
	if (CarImageCache[file]) {
		this._image = CarImageCache[file];
		this._imageLoaded = true;
		return;
	}
	const img = new Image();
	img.onload = () => {
		this._imageLoaded = true;
		// Adjust height to preserve real aspect ratio of image (avoid slim look)
		if (this.width && this.height) {
			const naturalAspect = img.width / img.height;
			// If current aspect differs significantly, recompute height from width
			const currentAspect = this.width / this.height;
			if (Math.abs(naturalAspect - currentAspect) > 0.15) {
				this.height = Math.round(this.width / naturalAspect);
			}
		}
	};
	img.src = `assests/${file}`; // NOTE: folder 'assests'
	this._image = img;
	CarImageCache[file] = img;
};
