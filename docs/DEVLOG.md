# Development Log (Step-by-step)

This log explains every change in small, beginner-friendly steps you can revisit during interviews.

How to use this log:

- Each entry answers: What changed? Why? Where (files/lines)? How do we test it? What to commit?
- Add a new entry at the top when you modify code. Keep steps short and plain.

---

## 2025-08-19 — 0003: Fix reverse speed clamp so car stops after releasing ArrowDown

Summary

- Car kept sliding after releasing the backward key because reverse speed was clamped incorrectly.

Bug

- In `car.js`, we intended reverse max to be half of forward: `speed >= -maxSpeed/2`.
- Code mistakenly set `speed = -maxSpeed` when `speed < -maxSpeed/2`, making reverse too strong and prolonging deceleration.

Fix

- Change the clamp to `this.speed = -this.maxSpeed / 2;` when `this.speed < -this.maxSpeed / 2`.

Files touched

- `car.js`: correct reverse clamp value.

How to test

- Hold ArrowDown to reverse; release.
- The car should decelerate smoothly and come to a stop faster than before (since friction has less negative speed to counteract).

Suggested commit message

- "Physics: correct reverse speed clamp to -maxSpeed/2"

---

## 2025-08-19 — 0001: Initial canvas + Car class, visible render

Summary

- Draw a simple car (rectangle) on an HTML5 canvas with a visible color.

Steps

1. Create a full-page canvas in `index.html`.
2. Style with `style.css` to remove margins and show a grey canvas background.
3. Implement `Car` class in `car.js` with properties: `x`, `y`, `width`, `height`, `color` (default `"black"`).
4. In `script.js`, size the canvas (width 200, height `window.innerHeight`), create a car, set `car.color = "blue"`, and draw it.
5. Fix script order in `index.html`: load `car.js` BEFORE `script.js` so the `Car` class exists when used.
6. Ensure the car actually fills with the chosen color by setting `ctx.fillStyle = this.color` before `ctx.fill()` in `Car.draw()`.

Why this change

- Without correct script order, the browser throws `Car is not defined` and nothing renders.
- Without setting `fillStyle`, the fill might not use the car color.

Files touched

- `index.html`: script order (`car.js` before `script.js`).
- `car.js`: add `this.color` and `ctx.fillStyle = this.color` in `draw`.
- `script.js`: set color before calling `draw()`.

How to test

- Open `index.html` in a browser; you should see a grey canvas with a blue 30×50 rectangle centered at (100, 100).
- If you don’t see it, open DevTools → Console and check for runtime errors.

Suggested commit message

- "Initial canvas + Car class; fix script order and color handling"

---

## 2025-08-19 — 0002: Keyboard controls + animation loop + simple movement

Summary

- Add a `Controls` class for Arrow keys, an animation loop, and simple speed/acceleration/friction to move the car on the canvas.

Steps

1. Create `controls.js` with a `Controls` class that tracks `forward`, `backward`, `left`, `right` using keyboard events.
2. Update `index.html` to load scripts in this order: `controls.js`, `car.js`, then `script.js` (so dependencies are defined before use).
3. In `car.js` add fields: `speed`, `acceleration`, `maxSpeed`, `friction`, and `controls = new Controls()`.
4. Implement `update()` in `Car`:
   - If `forward`, increase `speed` by `acceleration`.
   - If `backward`, decrease `speed` by `acceleration`.
   - Clamp `speed` within `[-maxSpeed/2, maxSpeed]` (reverse is slower).
   - Apply `friction` toward zero each frame; snap to 0 when below friction so the car fully stops.
   - Move along Y with `this.y -= this.speed` (canvas up is forward).
5. In `script.js` add `animate()` with `requestAnimationFrame`:
   - Call `car.update()`.
   - Reset `canvas.height = window.innerHeight` to clear each frame (avoid stretching/smear).
   - Call `car.draw(ctx)`.

Why this change

- Introduces continuous rendering and basic physics so the car behaves more like a vehicle (accelerates and slows with friction) instead of teleporting.

Files touched

- `controls.js`: new file handling Arrow key input.
- `index.html`: ensure load order `controls.js` → `car.js` → `script.js`.
- `car.js`: add movement state + `update()` logic; keep `draw()` the same.
- `script.js`: add `animate()` loop; clear and redraw each frame.

How to test

- Open `index.html` in a browser.
- Press ArrowUp to accelerate forward (car moves upward). Release; it slows down and eventually stops due to friction.
- Press ArrowDown to reverse (moves downward) with a slower max reverse speed.

Suggested commit message

- "Controls + animation loop: add acceleration, friction, and continuous render"

---

## Template for future entries

Use this section as a copy-paste template when you add features.

Title: YYYY-MM-DD — 000X: Short description of the change

Summary

- One or two lines describing what you changed and why.

Steps

1. Step 1 in plain words.
2. Step 2… keep each step focused and small.
3. Mention any math/logic (e.g., centering, scaling, angles) in simple language.

Why this change

- What problem did it solve? What behavior does it enable?

Files touched

- File A: brief note of what changed.
- File B: brief note…

How to test

- What to open/run and what you should see.
- If inputs are involved, list one happy path and one edge case.

Suggested commit message

- A concise, imperative subject (50–72 chars) that clearly states the change.
