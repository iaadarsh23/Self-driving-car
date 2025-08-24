## DevLog — Self‑driving Car (Canvas)

Audience: developer. Purpose: keep an internal, detailed record of design decisions, data flow, and next steps.

---

### Development Workflow

- Zero‑build browser app: open `index.html` to run.
- Script order in HTML is critical: `controls.js` → `car.js` → `script.js`.
- Iterate by editing JS files and refreshing the browser. Keep DevTools console open.
- Clear the canvas each frame by resetting `canvas.height` (fast and simple for now).

Commands used (PowerShell examples):

```powershell
# Initialize and push (if needed)
git init
git add .
git commit -m "Canvas car baseline: Controls + Car + animation loop"
git branch -M main
git remote add origin https://github.com/<your-username>/Self-driving-car.git
git push -u origin main
```

---

### System Architecture

Modules

- `controls.js` — `Controls` class attaches key listeners to `document` and exposes booleans: `forward`, `backward`, `left`, `right`.
- `car.js` — `Car` class encapsulates state (position, velocity scalar as `speed`, `angle`) and rendering (`draw`). Depends on `Controls`.
- `road.js` — `Road` draws multi‑lane vertical road using large extents (`top=-∞`, `bottom=+∞` via big numbers), dashed interior lane lines, solid borders, lane center helper `getCenter(index)`.
- `utils.js` — Math helpers (`lerp` now; expandable for clamp, map, etc.).
- `script.js` — Entry point: builds `Road`, spawns `Car` in lane center, runs loop.

Key dependencies

- `Car` requires `Controls` during construction: `this.controls = new Controls()`.
- `script.js` references `Car`, so it must be loaded after `car.js`.

---

### Core Algorithms & Logic

Car kinematics (simplified)

- Scalar speed integrates acceleration commands from input.
- Friction passively reduces magnitude of speed toward 0 when no input is present.
- Steering applies when speed ≠ 0. Direction of angle change flips when reversing:
  - `flip = speed > 0 ? 1 : -1`
  - `angle += 0.03 * flip` (left), `angle -= 0.03 * flip` (right)
- Position update uses heading via sin/cos:
  - `x -= sin(angle) * speed`
  - `y -= cos(angle) * speed`

Constraints and clamps

- `maxSpeed` caps forward speed; reverse limited to `-maxSpeed / 2`.
- Friction threshold snap: if `abs(speed) < friction` then `speed = 0` to prevent endless micro‑drift.

Animation

- `requestAnimationFrame(animate)` loop.
- Each frame: clear (reset canvas height) → `car.update()` → `road.draw(ctx)` → `car.draw(ctx)`.

---

### Function & Module Descriptions

`class Controls`

- Public booleans: `forward`, `backward`, `left`, `right`.
- Private method `#addKeyboardListners()` (note: typo in name preserved) installs `document.onkeydown` and `document.onkeyup` handlers. Logs `console.table(this)` for debugging.
- Keys: ArrowUp → forward, ArrowDown → backward, ArrowLeft → left, ArrowRight → right.

`class Car(x, y, width, height)`

- Properties: `x, y, width, height, color`, motion: `speed, acceleration=0.2, maxSpeed=3, friction=0.05, angle=0`.
- `update()` implements acceleration, friction, steering flip, and pose integration.
- `draw(ctx)` translates to `(x,y)`, rotates by `-angle`, draws a centered rectangle, fills with `color`, and restores the context.

`script.js`

- Canvas: width fixed at 200; height set every frame to `window.innerHeight`.
- Creates `Road(canvas.width / 2, canvas.width * 0.9, 4)`.
- Spawns `Car(road.getCenter(0), 100, 30, 50)`; sets `car.color = "blue"`.
- `animate()` sequence: update → road draw → car draw.

---

### Data Flow Diagrams

High‑level flow

Controls (keyboard) → Car.update() → Pose (x,y,angle,speed) → Road.draw + Car.draw → Canvas

Sequence per frame

1. Read current `Controls` booleans.
2. Update `speed` with acceleration or deceleration; apply friction.
3. Apply steering if moving; possibly reverse steering sign.
4. Integrate `(x,y)` with sin/cos of `angle`.
5. Clear canvas (reset height) → render road → render car.

---

### Debugging Notes

- If nothing renders, verify script order in `index.html`.
- Keyboard not working? Ensure the page has focus; check console for blocked key events.
- Drifting at near‑zero speeds fixed via `abs(speed) < friction` snap‑to‑zero.
- Visual stretching avoided by resetting `canvas.height` each frame (clears buffer).
- Lane lines initially invisible: both endpoints positive; fixed with symmetric large extents and dashed pattern only for interior lines.

---

### Performance Benchmarks

Current scene is trivial; frame time ~sub‑millisecond on modern hardware. No measurable GC pressure. Future features (roads, multiple cars, sensors) may require batching draws and avoiding per‑frame allocations.

---

### Interview Prep Q&A

Q: Why reset `canvas.height` each frame instead of `clearRect`?
A: It guarantees a clear canvas and adapts to window resizes with one assignment; simple and fast for small scenes.

Q: How do you keep steering intuitive in reverse?
A: Multiply steering by `flip = speed > 0 ? 1 : -1` so left/right invert when backing up, mimicking real cars.

Q: Why center the rectangle around `(x,y)`?
A: Using the center makes rotation around the car’s center trivial and simplifies collision math later.

Q: Where would you plug in sensors or AI?
A: Extend `Car` with a `Sensor` component (ray casting from the car’s pose) and add an AI controller to set `Controls` flags programmatically.

---

### Next Steps & TODOs

- (Done) Road rendering: multi‑lane with dashed interior lines.
- Collision system: simple rectangles or polygons; later SAT or ray–segment tests.
- Collision system: simple rectangles or polygons; later SAT or ray–segment tests.
- Sensors: N rays with distances to obstacles; visualize as lines.
- AI controller: basic PID or heuristic to keep car centered in lane.
- Input abstraction: allow toggling between human controls and AI.
- Clean up: fix `#addKeyboardListners` typo; consider event listeners instead of overwriting `document.onkeydown/up`.
- Mobile support: add touch controls or on‑screen buttons.
- Diagnostics: FPS counter, input overlay; remove console.table in production.

---

References in source files

- `controls.js`: keyboard mapping and debug logs.
- `car.js`: physics constants, steering flip, drawing routine.
- `script.js`: canvas lifecycle and animation loop.
