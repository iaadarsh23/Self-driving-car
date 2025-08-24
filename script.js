const canvas = document.getElementById("myCanvas");
canvas.width = 200;
const ctx = canvas.getContext("2d");

const roadWidth = 150;
const sideWidth = 20;
const road = new Road(canvas.width / 2, canvas.width * 0.9, 4);
const car = new Car(road.getCenter(0), 100, 30, 50);
car.color = "blue";

animate();

function animate() {
	car.update();
	canvas.height = window.innerHeight;

	//draw the road
	ctx.save();
	ctx.translate(0, -car.y + canvas.height * 0.65);

	road.draw(ctx);
	// Draw the car
	car.draw(ctx);
	ctx.restore();
	requestAnimationFrame(animate);
}
