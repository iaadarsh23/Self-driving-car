// spriteFactory.js
// Generates and caches simple car sprites (body + roof highlight + wheels) procedurally.
// Avoids external image dependencies while replacing placeholder rectangle.

const CarSpriteCache = new Map();

function getCarSprite(
	width,
	height,
	baseColor = "#222",
	{ wheelColor = "#111", roofColor = null } = {}
) {
	const key =
		width +
		"x" +
		height +
		"|" +
		baseColor +
		"|" +
		wheelColor +
		"|" +
		(roofColor || "auto");
	if (CarSpriteCache.has(key)) return CarSpriteCache.get(key);

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");

	// Body gradient
	const g = ctx.createLinearGradient(0, 0, 0, height);
	g.addColorStop(0, lighten(baseColor, 0.25));
	g.addColorStop(0.5, baseColor);
	g.addColorStop(1, darken(baseColor, 0.25));
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, width, height);

	// Roof / cabin
	const rColor = roofColor || lighten(baseColor, 0.5);
	const cabinMarginX = width * 0.18;
	const cabinMarginY = height * 0.18;
	ctx.fillStyle = rColor;
	ctx.fillRect(
		cabinMarginX,
		cabinMarginY,
		width - cabinMarginX * 2,
		height - cabinMarginY * 2
	);

	// Wheels (simple dark rectangles); positions relative to car orientation before rotation
	ctx.fillStyle = wheelColor;
	const wheelW = width * 0.22;
	const wheelH = height * 0.12;
	const wheelYOffFront = height * 0.08;
	const wheelYOffRear = height - wheelYOffFront - wheelH;
	const wheelXOff = 2;
	// Front axle
	ctx.fillRect(wheelXOff, wheelYOffFront, wheelW, wheelH);
	ctx.fillRect(width - wheelXOff - wheelW, wheelYOffFront, wheelW, wheelH);
	// Rear axle
	ctx.fillRect(wheelXOff, wheelYOffRear, wheelW, wheelH);
	ctx.fillRect(width - wheelXOff - wheelW, wheelYOffRear, wheelW, wheelH);

	CarSpriteCache.set(key, canvas);
	return canvas;
}

function lighten(hex, amt) {
	return shadeColor(hex, amt);
}
function darken(hex, amt) {
	return shadeColor(hex, -amt);
}
function shadeColor(hex, amt) {
	// Accept #rgb or #rrggbb
	if (!hex.startsWith("#")) return hex;
	const h =
		hex.length === 4
			? "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
			: hex;
	const num = parseInt(h.slice(1), 16);
	let r = (num >> 16) & 0xff;
	let g = (num >> 8) & 0xff;
	let b = num & 0xff;
	r = clamp(Math.round(r + 255 * amt), 0, 255);
	g = clamp(Math.round(g + 255 * amt), 0, 255);
	b = clamp(Math.round(b + 255 * amt), 0, 255);
	return "#" + toHex(r) + toHex(g) + toHex(b);
}
function toHex(n) {
	return n.toString(16).padStart(2, "0");
}
function clamp(v, a, b) {
	return Math.min(b, Math.max(a, v));
}

// Expose globally (no module system used here)
window.getCarSprite = getCarSprite;
