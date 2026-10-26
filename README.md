# Downtown Toronto 3D

Stylized low-poly Toronto skyline in the browser, built with Three.js (no build step).
## Run

ES modules need a web server, so don't open `index.html` directly:

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

## Controls

- Drag to orbit, scroll or pinch to zoom, right-drag to pan
- Click a landmark (CN Tower, Rogers Centre, First Canadian Place, TD Centre, Scotiabank Arena, Union Station, Fairmont Royal York, Toronto Islands, Billy Bishop Airport) for details
- **Fly-through** runs an automatic camera tour; click anywhere or press Stop to take over
