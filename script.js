const canvas = document.getElementById("myCanvas");

canvas.width = 200;
//lets draw the car

const ctx = canvas.getContext("2d");

const car = new Car(100, 100, 30, 50);
car.color = "blue";

animate();

function animate() {
	car.update();
	//this is stop the stretching of the car, it just let it move upward and downward
	canvas.height = window.innerHeight;
	car.draw(ctx);
	requestAnimationFrame(animate);
}
