## Self‑Driving Car (Vanilla JS, Canvas, From Scratch)

Offline, zero‑dependency simulation of a lane‑following self‑driving car with:

- Procedural road & borders (with optional curvature)
- Ray‑cast sensor array → input features
- Feed‑forward neural network (custom implementation, no libs)
- Genetic mutation loop to evolve better drivers
- Live network visualization (weights, activations, biases)
- LocalStorage persistence of the best performing brain
- PNG car sprites (aspect ratio preserved) replacing placeholder rectangles
- Dynamic traffic spawn button (+ Cars) injecting new dummy obstacles mid‑run
- Brain compatibility safeguards (auto rebuild on sensor mismatch)

Badges: HTML5 Canvas • Vanilla JS • No Build • Offline First

---

### 1. High‑Level Architecture

Canvas Layer 1 (carCanvas):

- Road geometry → Sensor rays → Multiple AI cars → Traffic obstacles → Best car highlighted.

Canvas Layer 2 (networkCanvas):

- Real‑time render of the selected car's neural network (levels, weights, activations, biases, control labels ↑ ← → ↓).

Core Modules:

- `road.js` (procedural border path + lane centers)
- `car.js` (physics, sensors, AI control integration, damage)
- `sensor.js` (ray emission + intersection sampling)
- `network.js` (NeuralNetwork & Level abstraction)
- `visualizer.js` (network rendering)
- `controls.js` (human & dummy input abstraction)
- `utils.js` (math helpers: lerp, intersections, polygon tests)
- `script.js` (orchestration: generation, mutation, persistence, animation loop)

---

### 2. Data Flow (Per Frame)

1. For each AI car: `sensor.update` casts rays → normalized distances (offsets 0..1).
2. Feature vector feeds `NeuralNetwork.feedForward`.
3. Output bits (4) map to control booleans: forward, left, right, reverse (if `useBrain`).
4. `car.update` applies physics & rotation → new polygon footprint.
5. Collision test vs road borders & traffic polygons → sets `damaged`.
6. Best car chosen = minimum `y` (furthest forward in scrolling space).
7. Render world (semi‑transparent others, opaque best) + overlay network visualization.
8. Optional: Persist best brain (manual save) or discard.

---

### 3. Physics & Movement (car.js)

- Scalar speed updated via acceleration (+/-) with friction linear decay.
- Steering sign flips when reversing for realism: `flip = speed > 0 ? 1 : -1`.
- Position integration: `x -= sin(angle)*speed`, `y -= cos(angle)*speed`.
- Reverse capped at half forward top speed to reduce oscillatory instability.
- Polygon generated each frame for rotation‑aware collision (4 corners via hypotenuse + angle offsets).

### 4. Sensors (sensor.js)

- `rayCount` evenly spread across `raySpread` (currently π/4) around the heading.
- Each ray is start/end (origin at car center) with fixed `rayLength`.
- Intersections collected with: (a) segmented road borders (supports curved path) (b) traffic polygons.
- Reading = nearest intersection (minimum parametric offset t). Null if no hit.
- Feature value fed to network = `1 - offset` (near = large activation, far = 0).

### 5. Neural Network (network.js)

Structure: `new NeuralNetwork([inputCount, hidden1, ..., outputCount])`.

Level internals:

- `weights[inputIndex][outputIndex]` ∈ [-1,1] (random on init).
- `biases[outputIndex]` ∈ [-1,1].
- Activation: binary step (sum > bias → 1 else 0). (Easily swapped with tanh / sigmoid for smoother control.)

Feed Forward:

```
outputs0 = Level(feed inputs)
outputs1 = Level(outputs0)
...
return finalOutputs
```

Mutation (genetic variation):

```
level.biases[i] = lerp(oldBias, random(-1..1), amount)
level.weights[i][j] = lerp(oldWeight, random(-1..1), amount)
```

Used after loading the best saved brain to diversify the population (skip index 0 so one elite is preserved).

### 6. Control Mapping

Outputs[4] → `[forward, left, right, reverse]` booleans if `useBrain` true.
Human mode ("KEYS") overrides with live keyboard state; dummy/traffic cars follow scripted or zero controls.

### 7. Road & Procedural Borders (road.js)

- Two runtime modes:
  - `straight`: minimal border polylines (just endpoints) for baseline training.
  - `curvy`: sinusoidal horizontal displacement applied to border points (config: amplitude, frequency, span, step) to stress steering generalization.
- Toggle with keyboard `T` (calls `road.toggleMode()`).
- Borders stored as polylines so sensors and collision loop operate on consistent structure in both modes.
- Lane centers still computed from straight width; future enhancement could project dynamic centers along curvature.

### 8. Collision Detection

- Each car keeps `polygon` (array of 4 corner points).
- Road borders stored as polyline paths; collision approximated by testing each consecutive segment vs each car edge (`getIntersection`).
- Traffic vs AI: polygon edge pairwise intersection (wrap with first point for closed polygon where needed).
- Damage is a terminal state (car stops updating physics; remains for visualization / selection).

### 9. Network Visualization (visualizer.js)

- Draw levels top→bottom with spacing controlled by `lerp` so single-level nets are centered.
- Edge color = weight (RGBA encoding via helper `getRGBA(value)` — expects value in [-1,1]).
- Node fill intensity = activation; outer ring stroke encodes bias.
- Output nodes optionally labeled with arrow glyphs ↑ ← → ↓ to map semantics quickly in interviews.

### 10. Evolution Loop (script.js)

- Generate N cars with identical initial brains (or mutated clones).
- On load: if `localStorage.bestBrain` exists, deserialize into each car; mutate all except the first.
- After observing a better performer, call `save()` to persist; `discard()` to reset training baseline.
- Selection heuristic: minimal `y` (furthest ahead). Could extend with survival horizon or penalty for oscillation.
 - Dynamic traffic: `+ Cars` button pushes three new dummy cars ahead of the current best to keep challenge density high without restarting.

### 11. Persistence Strategy

- Uses simple JSON serialization of `bestCar.brain` into `localStorage` key `bestBrain`.
- Mutation occurs post-load (not pre-save) to preserve pristine elite genome.
 - If a saved brain input size mismatches current sensor ray count, a fresh network is generated automatically (prevents feedForward on undefined errors).

### 12. Extensibility Ideas

- Swap step activation → tanh for graded steering & throttle blending.
- Add second hidden layer or widen first (e.g., `[rayCount, 8, 6, 4]`).
- Introduce dynamic obstacles; add them to sensor & collision loops.
- Reward shaping: track distance without damage; early stopping of underperforming genomes.
- Domain randomization: vary road curvature frequency per generation.
- UI controls for mutation rate slider & ray count adjustments.
- Sprite fallback: show outlined silhouette if image fails to load (currently a gray rectangle — planned improvement).
- Optional dummy speed variance & slight lateral drift toggle to promote overtaking behavior.

### 13. Interview Talking Points

Concepts to emphasize:

- Why manual NN implementation? Demonstrates understanding of forward pass & weight/bias roles without abstraction.
- Binary activation rationale: simplicity & deterministic branching (but discuss limitations: coarse control, potential jitter). Path to improvement: smooth activations, PID aggregation.
- Genetic approach vs backprop: no labeled dataset; optimization target emerges from environment (unsupervised performance search).
- Sensor normalization technique (invert distance) to map near obstacles to higher salience.
- Separation of visualization concerns: network rendering isolated; easy to plug alternative engines (WebGL) later.

### 14. Quick Start

1. Open `index.html` in any modern browser.
2. Watch AI cars learn variety from mutations (only first remains elite).
3. Click save (implement button or run `save()` in console) when a car performs well.
4. Refresh: population seeds from saved brain + mutations.
 5. Click `+ Cars` anytime to inject more moving traffic obstacles ahead of the leader.

### 15. File Reference

| File           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| index.html     | Bootstraps canvases & script ordering               |
| style.css      | Fullscreen layout styling                           |
| car.js         | Car physics, AI control integration, damage logic   |
| controls.js    | Human input abstraction                             |
| sensor.js      | Ray casting & readings collection                   |
| road.js        | Procedural borders & lane centers                   |
| network.js     | Neural net core + mutation                          |
| visualizer.js  | Draws neural network live                           |
| script.js      | Simulation loop, population generation, persistence, dynamic traffic spawn |
| utils.js       | Math helpers (lerp, intersections, etc.)            |
| docs/DEVLOG.md | Step-by-step historical changes                     |

### 16. Licensing

No explicit license yet (default all rights reserved). Recommend adding MIT for community contributions.

---

### 17. FAQ

Q: Why not libraries like TensorFlow.js?  
A: Intent is educational transparency; every float & branch visible.

Q: How does mutation avoid destroying progress?  
A: First car keeps untouched elite genome; others lerp toward random weights (controlled `amount`).

Q: Why binary outputs instead of continuous throttle/steer?  
A: Simpler initial search space; easier to explain. Roadmap: replace with continuous outputs and smooth activation.

Q: Scaling to more complexity?  
A: Add dynamic spawning of traffic and scoring; integrate prioritized replay or backprop once objective metrics stable.

---

### 18. Next Steps (Roadmap)

- UI: add buttons for Save / Discard / Mutate Rate slider.
- Telemetry panel: distance, crashes, generation counter.
- Multi-run analytics: heatmap of sensor activation correlations.
- Replace step activation with tanh + softmax for steering probability.
- Add crash animation reintegration (if removed) & highlight sensors that triggered imminent collision.

---

For deeper narrative of incremental steps, see `docs/DEVLOG.md`.
