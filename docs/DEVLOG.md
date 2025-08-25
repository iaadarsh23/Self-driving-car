# Development Log (Step-by-step)

This log explains every change in small, beginner-friendly steps you can revisit during interviews.

How to use this log:

- Each entry answers: What changed? Why? Where (files/lines)? How do we test it? What to commit?
- Add a new entry at the top when you modify code. Keep steps short and plain.

---

## 2025-08-25 — 0007: Sprites, dynamic traffic spawn button, dummy autopilot, brain safety guards

Summary

- Replaced plain rectangles with PNG car sprites (aspect ratio preserved), added "+ Cars" button to inject new dummy traffic ahead, ensured dummy cars move autonomously, restored visible lane dividers, and added safety logic to prevent crashes when a saved brain becomes incompatible after sensor changes.

Changes

1. `car.js`
   - Added sprite loader with cache (`CarImageCache`) and aspect ratio correction on image load (adjust height based on natural dimensions when aspect differs > 0.15).
   - Differentiates AI vs dummy image selection (player gets `1.png`, dummy picks from pool) kept inside `_selectImage` helper.
   - Added simple autopilot for dummy traffic (forces `forward = true`).
   - Added safety rebuild: if an AI car's `brain` is missing (e.g., incompatible saved data), instantiate a fresh `NeuralNetwork` instead of leaving `undefined`.
   - Wrapped feedForward usage in a guard so it only executes when `brain` exists.
2. `script.js`
   - Introduced explicit DOM grabs for `carCanvas` / `networkCanvas` instead of relying on implicit global IDs.
   - Added `#addCarsBtn` listener → `spawnTrafficBatch(3)` to push new dummy cars ahead of best car.
   - On loading `bestBrain`: now rebuilds a new brain when the saved one has mismatched sensor input size (instead of deleting and causing runtime errors).
   - Added try/catch around animation loop to surface runtime errors in console without halting RAF scheduling.
3. `index.html`
   - Added control panel `<div id="controlsPanel">` with "+ Cars" button.
4. `road.js`
   - Restored dashed lane dividers (they had been commented out temporarily) and kept solid outer borders; ensures immediate visual feedback that rendering is working.
5. `style.css`
   - Styled control panel and button (position absolute, dark theme) for unobtrusive overlay.
6. `README.md`
   - (Will be updated) to document sprites, dynamic traffic spawning, autopilot behavior, and brain compatibility safeguards.

Why

- Visual sprites increase clarity / realism and reveal orientation.
- Dynamic traffic injection allows observing learned overtaking behavior without reloads.
- Brain safety eliminates frequent console spam and blank canvas when sensor layout changes.
- Lane dividers reintroduced to avoid “empty gray rectangle” confusion during debugging.

Testing steps

1. Load page → verify road with dashed inner lane lines and solid borders shows.
2. Observe initial static traffic set; dummy cars move forward (autopilot forward flag) instead of staying frozen.
3. Click "+ Cars" multiple times → new dummy cars appear ahead (smaller `y`) and begin moving.
4. Open DevTools Console; if `localStorage.bestBrain` was saved under a different sensor configuration, confirm no `Cannot read properties of undefined (reading 'levels')` errors appear—brains are rebuilt.
5. Temporarily rename an image file; observe fallback rectangle until sprite loads (gray placeholder rectangle logic still present).

Potential follow-ups

- Add UI buttons for Save / Discard best brain (currently only callable via console `save()` / `discard()`).
- Provide mutation rate slider and real-time stat overlay (distance, generation, alive count).
- Add speed variance or slight lateral drift back to dummy cars (was tested then reverted) behind a toggle.
- Combine lane divider drawing and curved mode into a unified path sampler for consistent line curvature.

Suggested commit message

"UI/Traffic: add sprites, dynamic traffic spawn button, brain safety guard & lane divider restore"

---

## 2025-08-25 — 0006: Neural network, AI population, mutation, visualizer & persistence

Summary

- Added a custom feed‑forward neural network (`network.js`), per-car brains for AI control, population generation with mutation, live visualization canvas, and LocalStorage save/discard of the best performing brain.

Changes

1. `network.js`
   - `NeuralNetwork(neuronCounts[])` builds array of `Level` objects (layers).
   - `Level` stores `inputs`, `outputs`, `weights[input][output]`, `biases[output]`.
   - Activation: binary step (sum > bias → 1 else 0).
   - `mutate(network, amount)` lerps each weight/bias toward a new random value.
2. `car.js`
   - Added `useBrain` flag for controlType `"AI"`.
   - Constructed `Sensor` without car coupling; feeds readings → offsets (inverted distance) → `NeuralNetwork.feedForward` outputs map to `controls` booleans (forward, left, right, reverse).
   - Damage detection adapted to polygon arrays sometimes needing closure; uses road border polylines.
3. `sensor.js`
   - API changed: `update(x,y,angle, roadBorders, traffic)` to decouple from car instance (simplifies feeding multiple cars with same class).
   - Reads border polylines (supports curvature) segment-by-segment.
4. `road.js`
   - Procedural curved border using sinusoidal horizontal perturbation for variety; stored as polylines in `borders[0]` & `borders[1]`.
5. `visualizer.js`
   - Renders each level with weight-colored edges, activation-filled nodes, bias ring, and labels output layer with arrow glyphs.
6. `script.js`
   - Dual canvases: `carCanvas`, `networkCanvas` sized to window each frame.
   - Generates population `N` cars; loads `bestBrain` from LocalStorage if present, copies to all, mutating all except index 0 (elitism).
   - Selects `bestCar` = car with smallest `y` (furthest forward).
   - Draw order: traffic → semi-transparent other cars → bestCar (opaque) → network visualization.
   - Exposed `save()` / `discard()` for manual persistence.
7. `index.html`
   - Added second canvas and ensured script loading order: visualizer → network → sensor → utils → road → controls → car → script.
8. `README.md`
   - Rewritten to document AI workflow, data flow, mutation, visualization, interview talking points.

Why

- Demonstrates end-to-end reinforcement-style evolutionary loop without external ML libs.
- Binary activations keep logic transparent for education/interviews.
- Visualization aids debugging (weight polarity, dead nodes, saturation).
- Persistence enables incremental improvement across page reloads.

Testing steps

1. Load page: observe multiple cars; one leads the pack (others semi-transparent when drawing best).
2. Open DevTools → run `save()` when a car performs well; refresh → confirm population seeds from saved genome (others mutated).
3. Inspect network canvas: weights vary (color intensity). Rerun after several refreshes to see diversity.
4. Temporarily change `mutation` amount (e.g., 0.8) to verify faster divergence.

Potential follow-ups

- Swap step activation for tanh to enable proportional steering & throttle blending.
- Add reward shaping beyond distance (lane adherence, smoothness metrics).
- Visualization: highlight most recent active edges (heat effect).
- UI controls for mutation rate, population size, save/discard buttons.
- Multi-generation stats (best, median progress) overlay.

Suggested commit message

"AI: add neural network, population mutation, visualizer, and brain persistence"

---

## 2025-08-24 — 0005: Sensors, collision polygon & red crash animation

Summary

- Added car polygon collision detection against road borders, sensor ray casting, and a red crash pulse animation when the car hits a border.

Changes

1. `car.js`
   - Added `polygon` creation (`#createPolygon`) based on car rectangle rotated by current `angle`.
   - Added `polysIntersect` usage in `#assessDamage` to detect collision with each road border segment.
   - Introduced damage state (`damaged`) and crash animation counters (`_crashFrames`, `_crashMaxFrames`).
   - On first collision: set `damaged = true` and start countdown; movement stops updating after damage.
   - Draw routine now renders polygon and overlays red pulse + radial gradient halo while crash animation is active.
2. `road.js`
   - Renamed border array to `borders` (plural) for clarity and compatibility with GitHub-sourced sensor code.
   - Provides vertical infinite illusion with large top/bottom extents.
3. `utils.js`
   - Added `polysIntersect(polyA, polyB)` helper using edge–edge intersection (`getIntersection`).
4. `sensor.js`
   - Implemented ray casting (`#rayCast`) spread by `raySpread` around car heading.
   - For each ray, finds nearest intersection with road borders via `getIntersection` and records `reading` (shortest offset).
   - Draws each ray: visible portion in yellow, remainder (if hit) in black.
5. `index.html`
   - Ensured load order includes `sensor.js` before `car.js` so `Car` can instantiate `Sensor` safely.
6. `script.js`
   - Passes `road.borders` into `car.update()` so sensors and collision detection have geometry.

Why

- Polygon collision allows rotation-aware border detection vs naive AABB.
- Sensors lay groundwork for future AI (lane keeping, obstacle avoidance).
- Visual crash feedback improves UX and debugging clarity.

Testing steps

1. Drive forward into left or right border; car should flash red and stop moving (except crash animation fade-out).
2. Reload and steer gently—no crash animation until crossing border line.
3. Inspect rays (yellow) updating with car rotation; when near border, some rays should shorten (black remainder displayed).

Potential follow-ups

- Add traffic car polygons and include them in collision + sensor readings.
- Persist best performance (distance traveled before crash) to localStorage.
- Parameterize crash animation duration via a config object.
- Disable sensors after crash or fade them out visually.

Suggested commit message

"Collision & sensors: add polygon intersection, ray casting, and crash pulse animation"

---

## 2025-08-22 — 0004: Add multi-lane road with dashed lane lines

Summary

- Added a `Road` class (`road.js`) to render a vertically “infinite” multi-lane road. Interior lane lines are dashed; outer borders solid. Provides lane centers for spawning cars.

Steps

1. Create `utils.js` with `lerp(A,B,t)` (moved from inline usage for reuse).
2. Create `road.js` with constructor storing `left`, `right`, huge `top`/`bottom` extents (`±10,000,000`).
3. Implement `getCenter(index)` to compute center x of lane `index`.
4. In `road.draw(ctx)`, loop `i=0..laneCount`: dashed lines only when `0 < i < laneCount`; solid for borders.
5. Update `index.html` to load `utils.js` before `road.js` (so `lerp` is available) and include `road.js` before `script.js`.
6. Update `script.js`: instantiate `Road(canvas.width/2, canvas.width*0.9, 4)` and spawn car at `road.getCenter(0)`.
7. Draw order per frame: clear (reset height) → `car.update()` → `road.draw()` → `car.draw()`.

Why this change

- Establishes lane geometry early for future AI (lane keeping, multi-car scenarios) and sensor alignment.
- Dashed center dividers add motion perception and realism.

Files touched

- `utils.js` (new): extracted `lerp`.
- `road.js` (new): lane rendering + geometry helpers.
- `index.html`: added `<script src="utils.js">` and `<script src="road.js">`.
- `script.js`: replaced hard-coded car x with lane center; draw road each frame.

How to test

- Open `index.html`; verify 4 lanes (3 interior dashed lines + 2 solid borders).
- Change lane count to 5; interior dashed lines increase accordingly.
- Move car with Arrow keys; road lines remain static (infinite illusion from large extents).

Suggested commit message

- "Road: add multi-lane rendering with dashed interior dividers and lane centering"

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
