const canvas = document.getElementById("myCanvas");
canvas.width = 200;
const ctx = canvas.getContext("2d");

const roadWidth = 150;
const sideWidth = 20;
const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);
const car = new Car(100, 100, 30, 50);
car.color = "blue";

animate();

function animate() {
	canvas.height = window.innerHeight;
	//draw the road
	car.update();
	road.draw(ctx);
	// Draw the car
	car.draw(ctx);

	requestAnimationFrame(animate);
}
