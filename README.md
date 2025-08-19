# Self‑driving Car (Canvas) — Interview Notes

This project is a minimal canvas setup that draws a car and sets the stage for adding movement, road, and sensors later. Use this as a quick reference when explaining the code and your choices to an interviewer.

## Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript for logic
- CSS for basic layout and background

## Project structure

- `index.html` — Boots the app; loads scripts in the correct order
- `style.css` — Page and canvas styling
- `controls.js` — Keyboard input handler (`Controls` class)
- `car.js` — `Car` class (state, simple physics, draw routine)
- `script.js` — App entry: canvas init + animation loop

## File‑by‑file walkthrough

### `index.html`

- Declares a full‑page `<canvas id="myCanvas">`.
- Loads scripts in this order:
  1. `controls.js` (defines `Controls` used by `Car`)
  2. `car.js` (defines the `Car` class)
  3. `script.js` (boots the app and runs the loop)
- Why order matters: If you use a class before it’s defined, the browser throws a runtime error and stops executing, so nothing is drawn.

### `style.css`

- Removes default margins and hides scrollbars (clean canvas presentation).
- Sets a neutral grey background on the canvas so a dark car is visible.

### `car.js`

- Defines `class Car` with properties: `x`, `y`, `width`, `height`, `color`, plus movement state: `speed`, `acceleration`, `maxSpeed`, `friction`, and `controls`.
- `update()`: reads keyboard input (`forward`/`backward`) to change `speed`, caps speed, applies friction to slow down when no key is pressed, then moves along Y with `this.y -= this.speed` (up is forward on canvas).
- `draw(ctx)`: draws a centered rectangle and fills it with `this.color`.
- Centering math: subtract half width/height so the car’s position is the center, not top‑left.

### `script.js`

- Grabs the canvas/context; sets width to `200` (narrow lane feel).
- Starts an `animate()` loop with `requestAnimationFrame`.
- Each frame: `car.update(); canvas.height = window.innerHeight; car.draw(ctx);`.
- Note: resetting `canvas.height` each frame clears the canvas to avoid stretch/smear and keeps the car crisp.

## Render & input flow (what happens on page load)

1. HTML loads and creates the canvas.
2. `controls.js` defines `Controls` and attaches keyboard listeners for Arrow keys.
3. `car.js` defines `Car` and simple movement/physics.
4. `script.js` initializes the canvas, creates a `Car`, sets its color, then starts the animation loop that updates input/physics and draws every frame.

## Key fixes and additions

- Script order: `controls.js` → `car.js` → `script.js` so dependencies exist before use.
- Fill color: `Car.draw()` uses `ctx.fillStyle = this.color`.
- Animation: added a `requestAnimationFrame` loop; clearing by resetting `canvas.height` each frame.
- Movement: acceleration, max speed, and friction create a simple car‑like feel; ArrowUp drives forward, ArrowDown reverses.

## How to run locally

1. Open `index.html` in a browser (no server required).
2. You should see a grey canvas with a blue rectangle (the car). Use ArrowUp/ArrowDown to move.
3. If the car doesn’t appear, open DevTools (F12) → Console and check for errors.

## Push to GitHub (PowerShell)

If this folder is not a git repo yet:

```powershell
# From the project root; paths with spaces are fine in PowerShell
git init
git add .
git commit -m "Initial canvas + Car class; fix script order and color handling"

# Create a new empty repo on GitHub named "Self-driving-car", then:
git branch -M main
git remote add origin https://github.com/<your-username>/Self-driving-car.git
git push -u origin main
```

If it’s already a git repo and remote is set:

```powershell
git add .
git commit -m "Docs: add interview-ready README and code walkthrough"
git push
```

Tip: If pushing from a corporate or restricted network, you may need a Personal Access Token (PAT) for HTTPS auth.

## Troubleshooting: “I can’t see the car”

- Check the browser console for errors like `ReferenceError: Car is not defined` → indicates wrong script order.
- Confirm `car.color` is set before `car.draw(ctx)`.
- Ensure the canvas isn’t 0×0 (we set width=200, height=window.innerHeight).
- The car is at `(100, 100)`; on a very tall screen it might look near the top—this is expected.

## Interview talking points

- Canvas coordinate system (top‑left origin, y increases downward) and why we center the car with `x - width/2`, `y - height/2`.
- Separation of concerns: `Car` encapsulates draw logic; `script.js` orchestrates app bootstrapping.
- Importance of script load order in the browser and failure modes when violated.
- Why the canvas width is narrow (200px) to simulate a road lane and make future lane‑keeping logic clearer.
- Extensibility: easy to add wheels, rotation, movement, keyboard controls, a road with lanes, and sensors (rays) later.

## Next steps (nice to mention)

- Add an animation loop with `requestAnimationFrame` for movement.
- Keyboard controls to update `Car` position/heading.
- Draw a road and lane markers; add collision detection and simple AI later.

## Ongoing documentation

- For step-by-step updates in simple language, see `docs/DEVLOG.md`.
- Add a new entry there whenever you change code so you’re always interview-ready.
