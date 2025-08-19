# Self‑driving Car (Canvas) — Interview Notes

This project is a minimal canvas setup that draws a car and sets the stage for adding movement, road, and sensors later. Use this as a quick reference when explaining the code and your choices to an interviewer.

## Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript for logic
- CSS for basic layout and background

## Project structure

- `index.html` — Boots the app; loads scripts in the correct order
- `style.css` — Page and canvas styling
- `car.js` — `Car` class (data + draw routine)
- `script.js` — App entry: canvas init, `Car` instance, and draw call

## File‑by‑file walkthrough

### `index.html`

- Declares a full‑page `<canvas id="myCanvas">`.
- Loads scripts in this order:
  1.  `car.js` (defines the `Car` class)
  2.  `script.js` (uses the `Car`)
- Why order matters: If you use a class before it’s defined, the browser throws a runtime error and stops executing, so nothing is drawn.

### `style.css`

- Removes default margins and hides scrollbars (clean canvas presentation).
- Sets a neutral grey background on the canvas so a dark car is visible.

### `car.js`

- Defines `class Car` with properties: `x`, `y`, `width`, `height`, and `color` (default `"black"`).
- `draw(ctx)`: draws a rectangle centered at `(x, y)` using `ctx.rect(...)` and fills it using `ctx.fillStyle = this.color; ctx.fill();`.
- Centering math: we subtract half width/height so the car’s position is the center of the rectangle, not its top‑left corner.

### `script.js`

- Grabs the canvas: `const canvas = document.getElementById("myCanvas");`
- Sets size: width is `200` (narrow lane feel), height is `window.innerHeight`.
- Creates the car: `new Car(100, 100, 30, 50)`.
- Sets its color before drawing: `car.color = "blue"; car.draw(ctx);`.

## Render flow (what happens on page load)

1. HTML loads and creates the canvas.
2. `car.js` loads and defines the `Car` class.
3. `script.js` runs: sizes the canvas, gets the 2D context, creates a `Car`, sets color, draws the rectangle at the given center.

## Key fixes implemented (what to mention if asked “why wasn’t it showing?”)

- Script order: `script.js` was loading before `car.js`, so `Car` wasn’t defined when used. Fixed by loading `car.js` first.
- Fill color: added `this.color` on `Car` and set `ctx.fillStyle = this.color` before `ctx.fill()` to make the car visible and configurable.
- Draw timing: set `car.color` before `car.draw(ctx)` so the correct color renders.

## How to run locally

1. Open `index.html` in a browser (no server required).
2. You should see a grey canvas with a blue rectangle (the car) centered at `(100, 100)`.
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
