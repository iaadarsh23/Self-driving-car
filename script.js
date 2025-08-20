const canvas = document.getElementById("myCanvas");
canvas.width = 200;
const ctx = canvas.getContext("2d");

const roadWidth = 150;
const sideWidth = 20;

const car = new Car(100, 100, 30, 50);
car.color = "blue";

// // Load building and tree images
// const buildingImg = new Image();
// buildingImg.src = "building.png"; // make sure the file exists!

// const treeImg = new Image();
// treeImg.src = "tree.png"; // make sure the file exists!

animate();

function animate() {
	canvas.height = window.innerHeight;

	// Draw the car
	car.update();
	car.draw(ctx);

	requestAnimationFrame(animate);
}
