# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Stylized low-poly 3D downtown Toronto, rendered in the browser with Three.js. No build step, no package.json, no tests or linter. Three.js (0.160.0) is loaded from jsdelivr via the import map in `index.html`, so it needs network access.

## Run

ES modules don't load over `file://`, so serve the folder:

```bash
python -m http.server 8765
```

Then open http://localhost:8765. `.claude/launch.json` defines the same server as the `toronto` preview config. Ports 5173/5174 were occupied on this machine, so 8765 is used.

## Architecture

`main.js` is the entry point: it builds the scene, wires up picking/camera/UI, and runs the render loop. The other modules each return Three.js objects that `main.js` adds to the scene.

- **Coordinate system:** 1 unit ≈ 10 m. Land is the half-plane z < 0 (city extends north to about z = -160). Lake Ontario is z > 0. The waterfront is at z = 0. The Toronto Islands sit around z ≈ 50.
- **Landmarks (`landmarks.js`):** each `buildLandmarks()` entry is `{ group, pos: {x, z}, radius, info: {name, meta, text, focusY, dist}, update?(t) }`. `info.focusY` and `info.dist` control where the camera flies to when the landmark is clicked.
- **Water (`water.js`):** `buildWater()` returns `{ group, items, update(t) }`. The wave animation moves vertices on the CPU every frame. `items` (Toronto Islands, Billy Bishop Airport) use the same item shape as landmarks.
- **Picking (`main.js`):** `main.js` merges landmarks and water items into one `items` list and sets `group.userData.item` on each. Hover and click walk up from the hit mesh to find that item. A new clickable object only needs this item shape.
- **City (`city.js`):** `buildCity(rng, exclusions)` fills a grid of blocks with seeded-random buildings. Heights fall off with distance from `CORE` (the financial district). `exclusions` are circles taken from the landmarks' `pos` and `radius`; blocks near them are skipped, so changing a landmark's position or radius changes the surrounding city.
- **Buildings (`buildings.js`):** `makeBuilding(w, h, d, sideMat)` scales box UVs by world size so the shared window texture keeps a constant window size. Landmarks and city buildings both use it. It also holds the seeded RNG `mulberry32`, so the layout is deterministic (seed 2024 in `main.js`).
- **Camera:** OrbitControls, plus a click-to-focus tween (`focusOn`) and a scripted fly-through along two CatmullRom curves (`camCurve` for position, `lookCurve` for look-at). The two curves must keep the same number of points so they stay in step. `controls` is disabled while flying.
