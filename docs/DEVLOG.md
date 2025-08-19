# Development Log (Step-by-step)

This log explains every change in small, beginner-friendly steps you can revisit during interviews.

How to use this log:

- Each entry answers: What changed? Why? Where (files/lines)? How do we test it? What to commit?
- Add a new entry at the top when you modify code. Keep steps short and plain.

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
