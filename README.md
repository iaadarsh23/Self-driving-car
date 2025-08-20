## Project Title

Self‑driving Car — HTML5 Canvas Playground

![Badge: HTML5 Canvas](https://img.shields.io/badge/Render-HTML5%20Canvas-orange)
![Badge: Vanilla JS](https://img.shields.io/badge/Stack-Vanilla%20JS-blue)
![Badge: No Build](https://img.shields.io/badge/Build-None-success)
![Badge: Works Offline](https://img.shields.io/badge/Offline-Yes-brightgreen)

### Introduction

This is a minimal, dependency‑free demo that renders a car on an HTML5 canvas and moves it using keyboard input. It’s designed as a foundation for learning self‑driving car concepts step‑by‑step (movement, rotation, road, sensors, and later simple AI).

- Runs in any modern browser
- Tiny codebase: just HTML, CSS, and two JavaScript classes
- Great for experiments, teaching, and interview walkthroughs

### Features

- Real‑time keyboard controls (Arrow keys via `Controls`)
- Simple car‑like motion: acceleration, max speed, friction, reverse clamped to half speed
- Rotation with correct left/right behavior when reversing (steering flip)
- Clean animation loop with `requestAnimationFrame`
- Narrow canvas width (200px) to simulate a lane and keep focus on motion

### Installation

No build tools required.

1. Download or clone the repo

- Download ZIP and extract, or
- Clone with Git (PowerShell):

```powershell
git clone https://github.com/<your-username>/Self-driving-car.git
cd Self-driving-car
```

2. Open `index.html` in your browser

- Double‑click `index.html`, or use a simple static server if you prefer.

### Usage Examples

Open the page and use ArrowUp / ArrowDown to move, ArrowLeft / ArrowRight to steer. The car starts as a blue rectangle centered by its (x, y) with rotation.

- Change appearance:

```js
// script.js
const car = new Car(100, 100, 30, 50);
car.color = "royalblue"; // or any CSS color
```

- Tweak handling (after creating the car):

```js
car.acceleration = 0.25; // faster pick‑up
car.maxSpeed = 4; // higher top speed
car.friction = 0.06; // stronger natural slowdown
```

- Create a different car size or starting position:

```js
const car = new Car(150, 300, 40, 70);
```

### Capabilities & Limitations

Capabilities

- Smooth motion with acceleration and friction
- Rotation using basic trigonometry (sin/cos)
- Reverse speed limited to half of forward top speed

Limitations (by design for simplicity)

- No road, walls, or collision detection yet
- No sensors or AI control
- Uses a rectangle placeholder, not a sprite

### Configuration Options

You can tune these properties on a `Car` instance:

- `acceleration` (default `0.2`) — How quickly speed changes when pressing Up/Down
- `maxSpeed` (default `3`) — Forward top speed; reverse is clamped to half
- `friction` (default `0.05`) — Passive slowdown when not accelerating
- `color` (default `"black"`, set to `"blue"` in `script.js`) — Fill color when drawing

Constructor:

- `new Car(x, y, width, height)` — Position is interpreted as the car’s center

### Contributing Guidelines

1. Fork this repository and create a feature branch
2. Keep code small and readable; add comments where intent isn’t obvious
3. Test in a browser (desktop and mobile if possible)
4. Open a Pull Request with a clear description and before/after notes or screenshots

Ideas welcome: road drawing, lane markers, collisions, sensors (ray casting), basic path following.

### License

No license file currently detected. If you are the project owner, consider adding a LICENSE (e.g., MIT). Until then, assume default “All rights reserved.”

### Links

- App entry: `index.html`
- Source: `car.js`, `controls.js`, `script.js`
- Styles: `style.css`
- Dev notes and deeper internals: `docs/DEVLOG.md` and `devlog.md`
