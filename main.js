import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mulberry32 } from './buildings.js';
import { buildCity } from './city.js';
import { buildLandmarks } from './landmarks.js';
import { buildWater } from './water.js';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = skyTexture();
scene.fog = new THREE.Fog(0xcfe3f1, 160, 620);

const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 2000);
const HOME_POS = new THREE.Vector3(-70, 55, 95);
const HOME_TARGET = new THREE.Vector3(25, 12, -30);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(HOME_TARGET);
controls.enableDamping = true;
controls.minDistance = 12;
controls.maxDistance = 400;
controls.maxPolarAngle = Math.PI * 0.48;
controls.update();

// Lights
scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x6b7a63, 0.8));
const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
sun.position.set(-140, 170, 100);
sun.target.position.set(20, 0, -60);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -180, right: 180, top: 180, bottom: -180, near: 10, far: 520 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);

// World
const rng = mulberry32(2024);

const land = new THREE.Mesh(
  new THREE.PlaneGeometry(1400, 700),
  new THREE.MeshStandardMaterial({ color: 0x93a58b, roughness: 1 })
);
land.rotation.x = -Math.PI / 2;
land.position.set(0, 0, -350);
land.receiveShadow = true;
scene.add(land);

addWaterfrontInfrastructure();

const landmarks = buildLandmarks();
landmarks.forEach((l) => scene.add(l.group));

const water = buildWater(rng);
scene.add(water.group);

const items = [...landmarks, ...water.items];
items.forEach((it) => { it.group.userData.item = it; });

scene.add(buildCity(rng, landmarks.map((l) => ({ x: l.pos.x, z: l.pos.z, r: l.radius }))));

function addWaterfrontInfrastructure() {
  const gray = new THREE.MeshStandardMaterial({ color: 0x7c8087, roughness: 0.9 });
  // Rail corridor and Gardiner Expressway
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1400, 0.06, 6), new THREE.MeshStandardMaterial({ color: 0x5a5148, roughness: 1 }));
  rail.position.set(0, 0.04, -27);
  rail.receiveShadow = true;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(400, 0.4, 3), gray);
  deck.position.set(0, 1.4, -6);
  deck.castShadow = deck.receiveShadow = true;
  scene.add(rail, deck);
  const pillarGeo = new THREE.BoxGeometry(0.6, 1.4, 0.6);
  for (let x = -200; x <= 200; x += 8) {
    const p = new THREE.Mesh(pillarGeo, gray);
    p.position.set(x, 0.7, -6);
    p.castShadow = true;
    scene.add(p);
  }
}

function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#5a9bd6');
  g.addColorStop(0.6, '#a9d0ec');
  g.addColorStop(1, '#cfe3f1');
  x.fillStyle = g;
  x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Picking and focus
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoverDirty = false;
let focus = null;
const tooltip = $('tooltip');
const panel = $('panel');

function pick(clientX, clientY) {
  pointer.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(items.map((i) => i.group), true)[0];
  if (!hit) return null;
  for (let o = hit.object; o; o = o.parent) if (o.userData.item) return o.userData.item;
  return null;
}

let lastMove = { x: 0, y: 0 };
canvas.addEventListener('pointermove', (e) => { lastMove = { x: e.clientX, y: e.clientY }; hoverDirty = true; });
canvas.addEventListener('pointerleave', () => { tooltip.hidden = true; });

let down = null;
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY };
  stopFlight();
});
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
  const item = pick(e.clientX, e.clientY);
  if (item) { showPanel(item); focusOn(item); }
});
$('panel-close').onclick = () => { panel.hidden = true; };

function showPanel(item) {
  $('panel-name').textContent = item.info.name;
  $('panel-meta').textContent = item.info.meta;
  $('panel-text').textContent = item.info.text;
  panel.hidden = false;
}

function focusOn(item) {
  const target = new THREE.Vector3(item.pos.x, item.info.focusY, item.pos.z);
  const dir = camera.position.clone().sub(controls.target).normalize();
  dir.y = THREE.MathUtils.clamp(dir.y, 0.15, 0.6);
  dir.normalize();
  const toPos = target.clone().addScaledVector(dir, item.info.dist);
  toPos.y = Math.max(toPos.y, 6);
  focus = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: toPos, toT: target };
}
controls.addEventListener('start', () => { focus = null; });

// Fly-through
const camCurve = new THREE.CatmullRomCurve3([
  [-130, 38, 110], [-60, 22, 70], [-25, 10, 20], [25, 14, 22], [75, 22, 35],
  [130, 45, 5], [120, 70, -90], [40, 85, -150], [-50, 75, -100], [-110, 50, -20],
].map((p) => new THREE.Vector3(...p)), true);
const lookCurve = new THREE.CatmullRomCurve3([
  [-8, 22, -16], [-8, 28, -16], [-8, 35, -16], [14, 6, -16], [50, 10, -30],
  [45, 14, -40], [45, 12, -60], [40, 10, -60], [10, 15, -40], [-8, 25, -16],
].map((p) => new THREE.Vector3(...p)), true);

let flying = false;
let flightT = 0;
const lookNow = new THREE.Vector3();
const flyBtn = $('fly');

function startFlight() {
  flying = true;
  focus = null;
  controls.enabled = false;
  flyBtn.textContent = '■ Stop';
}
function stopFlight() {
  if (!flying) return;
  flying = false;
  controls.target.copy(lookNow);
  controls.enabled = true;
  controls.update();
  flyBtn.textContent = '▶ Fly-through';
}
flyBtn.onclick = () => (flying ? stopFlight() : startFlight());
$('reset').onclick = () => {
  stopFlight();
  focus = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: HOME_POS.clone(), toT: HOME_TARGET.clone() };
};

// Loop
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
let first = true;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;

  water.update(t);
  landmarks.forEach((l) => l.update?.(t));

  if (flying) {
    flightT = (flightT + dt / 70) % 1;
    camera.position.copy(camCurve.getPointAt(flightT));
    lookCurve.getPointAt(flightT, lookNow);
    camera.lookAt(lookNow);
  } else {
    if (focus) {
      focus.t = Math.min(1, focus.t + dt / 1.4);
      const e = focus.t < 0.5 ? 2 * focus.t * focus.t : 1 - Math.pow(-2 * focus.t + 2, 2) / 2;
      camera.position.lerpVectors(focus.fromP, focus.toP, e);
      controls.target.lerpVectors(focus.fromT, focus.toT, e);
      if (focus.t >= 1) focus = null;
    }
    controls.update();
  }

  if (hoverDirty && !flying) {
    hoverDirty = false;
    const item = pick(lastMove.x, lastMove.y);
    tooltip.hidden = !item;
    canvas.style.cursor = item ? 'pointer' : '';
    if (item) {
      tooltip.textContent = item.info.name;
      tooltip.style.left = lastMove.x + 'px';
      tooltip.style.top = lastMove.y + 'px';
    }
  }

  renderer.render(scene, camera);
  if (first) { first = false; $('loading').classList.add('done'); }
});
