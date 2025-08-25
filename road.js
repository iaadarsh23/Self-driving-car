class Road {
	constructor(
		x,
		width,
		laneCount = 3,
		{
			mode = "straight",
			amplitude = 50,
			frequency = 0.01,
			span = 1000,
			step = 5,
		} = {}
	) {
		this.x = x;
		this.width = width;
		this.laneCount = laneCount;
		// Broadened road: use full declared width instead of quarter scaling
		this.left = x - width / 2;
		this.right = x + width / 2;

		const infinity = 10000;
		this.top = -infinity;
		this.bottom = infinity;

		// Curvature config
		this.mode = mode; // 'straight' | 'curvy'
		this._config = {
			amplitude,
			frequency,
			span,
			step,
			baseAmplitude: amplitude,
		};

		this.#buildBorders();
	}

	setMode(mode) {
		if (mode !== "straight" && mode !== "curvy") return;
		if (this.mode === mode) return;
		this.mode = mode;
		this.#buildBorders();
	}

	toggleMode() {
		this.setMode(this.mode === "straight" ? "curvy" : "straight");
	}

	#buildBorders() {
		const { amplitude, frequency, span, step } = this._config;
		const useCurvy = this.mode === "curvy";
		const topLeft = { x: this.left, y: this.top };
		const bottomLeft = { x: this.left, y: this.bottom };
		const topRight = { x: this.right, y: this.top };
		const bottomRight = { x: this.right, y: this.bottom };
		this.borders = [[topLeft], [topRight]];
		if (useCurvy) {
			for (let y = -span; y <= 0; y += step) {
				const off = Math.sin(y * frequency) * amplitude;
				this.borders[0].push({ x: off + this.left, y });
				this.borders[1].push({ x: off + this.right, y });
			}
		}
		this.borders[0].push(bottomLeft);
		this.borders[1].push(bottomRight);
	}

	getLaneCenter(laneIndex) {
		const laneWidth = this.width / this.laneCount;
		return (
			this.left +
			laneWidth / 2 +
			Math.min(laneIndex, this.laneCount - 1) * laneWidth
		);
	}

	draw(ctx) {
		ctx.lineWidth = 5;
		ctx.strokeStyle = "white";

		// Lane dividers (dashed) restored for better visual reference
		ctx.setLineDash([20, 20]);
		for (let i = 1; i <= this.laneCount - 1; i++) {
			const x = lerp(this.left, this.right, i / this.laneCount);
			ctx.beginPath();
			ctx.moveTo(x, this.top);
			ctx.lineTo(x, this.bottom);
			ctx.stroke();
		}

		// Solid borders
		ctx.setLineDash([]);
		this.borders.forEach((border) => {
			ctx.beginPath();
			ctx.moveTo(border[0].x, border[0].y);
			for (let i = 1; i < border.length; i++) {
				ctx.lineTo(border[i].x, border[i].y);
			}
			ctx.stroke();
		});

		// Mode label (debug)
		ctx.save();
		ctx.fillStyle = "white";
		ctx.font = "12px monospace";
		ctx.textAlign = "left";
		ctx.fillText(`Mode: ${this.mode}`, this.left + 4, -40);
		ctx.restore();
	}
}
