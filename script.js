// Explicitly grab canvas elements (was relying on global IDs which can fail)
const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
if (!carCanvas || !networkCanvas) {
	console.error("Canvas elements not found. Check IDs in index.html");
}

carCanvas.height = window.innerHeight;
carCanvas.width = 200;
networkCanvas.height = window.innerHeight;
networkCanvas.width = 298;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
// Road sized to remain within canvas viewport; 3–4 lanes is sufficient
const LANE_COUNT = 3;
const road = new Road(carCanvas.width / 2, carCanvas.width * 1.0, LANE_COUNT, {
	mode: "straight",
});

// Population size
const N = 100; // reverted population size
const cars = generateCars(N);

// Static traffic (dummy cars) ahead of starting position spaced out
let traffic = generateTraffic([
	{ lane: 1, y: -250 },
	{ lane: 0, y: -550 },
	{ lane: 2, y: -850 },
	{ lane: 1, y: -1150 },
	{ lane: 0, y: -1450 },
	{ lane: 2, y: -1750 },
]);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
	const stored = JSON.parse(localStorage.getItem("bestBrain"));
	for (let i = 0; i < cars.length; i++) {
		cars[i].brain = JSON.parse(JSON.stringify(stored));
		if (
			!cars[i].brain.levels ||
			cars[i].brain.levels[0].weights.length !== cars[i].sensor.rayCount
		) {
			// Rebuild fresh brain instead of deleting (prevents undefined later)
			cars[i].brain = new NeuralNetwork([cars[i].sensor.rayCount, 4]);
		} else if (i > 0) {
			NeuralNetwork.mutate(cars[i].brain, 0.4);
		}
	}
}

animate();

// Toggle road mode with 'T'
window.addEventListener("keydown", (e) => {
	if (e.key === "t" || e.key === "T") {
		road.toggleMode();
	}
});

// Runtime: add more cars button
document.getElementById("addCarsBtn").addEventListener("click", () => {
	spawnTrafficBatch(3);
});

function spawnTrafficBatch(count) {
	// Determine reference Y (use bestCar if exists)
	const refY = bestCar ? bestCar.y : cars[0].y;
	for (let i = 0; i < count; i++) {
		const lane = Math.floor(Math.random() * LANE_COUNT);
		// Place ahead of bestCar (smaller y) with staggered spacing
		const y = refY - 400 - i * 220 - Math.random() * 120;
		traffic.push(new Car(road.getLaneCenter(lane), y, 55, 100, "DUMMY", 2));
	}
}

function animate() {
	try {
		// Update dummy traffic
		for (let i = 0; i < traffic.length; i++) {
			traffic[i].update(road.borders, []); // dummy cars move forward autonomously
		}
		// Update AI cars
		for (let i = 0; i < cars.length; i++) {
			cars[i].update(road.borders, traffic);
		}
		// Pick best (furthest ahead → smallest y)
		bestCar = cars.reduce((best, c) => (c.y < best.y ? c : best), cars[0]);

		carCanvas.height = window.innerHeight;
		networkCanvas.height = window.innerHeight;
		carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

		// Clear and fill background each frame (prevents trail if any)
		carCtx.fillStyle = "#999";
		carCtx.fillRect(
			0,
			bestCar.y - carCanvas.height * 0.7 - 10000,
			carCanvas.width,
			20000
		);
		road.draw(carCtx);
		traffic.forEach((t) => t.draw(carCtx));

		carCtx.globalAlpha = 0.15;
		cars.forEach((c) => c.draw(carCtx));
		carCtx.globalAlpha = 1;
		bestCar.draw(carCtx, true);

		Visualizer.drawNetwork(networkCtx, bestCar.brain);
	} catch (e) {
		console.error("Animation error", e);
	}
	requestAnimationFrame(animate);
}

function generateCars(N) {
	const arr = [];
	const spawnLane = Math.floor(LANE_COUNT / 2); // center lane
	for (let i = 0; i < N; i++) {
		// Larger car sprite (width 55, height 100) for improved visibility
		arr.push(
			new Car(
				road.getLaneCenter(spawnLane),
				140,
				55,
				100,
				"AI",
				3,
				i === 0 ? "1.png" : null
			)
		);
	}
	return arr;
}

function generateTraffic(entries) {
	return entries.map(
		(e) => new Car(road.getLaneCenter(e.lane), e.y, 55, 100, "DUMMY", 2)
	);
}

function save() {
	localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
	localStorage.removeItem("bestBrain");
}
