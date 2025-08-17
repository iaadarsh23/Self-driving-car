const canvas = document.getElementById("myCanvas");

canvas.height = window.innerHeight;
canvas.width = 200;
//lets draw the car

const ctx = canvas.getContext("2d");

const car = new Car(100, 100, 30, 50);
car.color = "blue";
car.draw(ctx);
