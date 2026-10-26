import * as THREE from 'three';
import { makeBuilding, getPalette } from './buildings.js';

const X0 = -84, COLS = 18, COL_STEP = 12;
const Z0 = -34, ROWS = 10, ROW_STEP = 14;
const BLOCK_W = 9, BLOCK_D = 11;
const CORE = { x: 52, z: -52 };

export function buildCity(rng, exclusions) {
  const group = new THREE.Group();
  const palette = getPalette();

  const asphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(235, 140),
    new THREE.MeshStandardMaterial({ color: 0x4d535b, roughness: 0.95 })
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.set(17.5, 0.02, -100);
  asphalt.receiveShadow = true;
  group.add(asphalt);

  const sidewalk = new THREE.MeshStandardMaterial({ color: 0xb4b8bd, roughness: 0.9 });
  const parkMat = new THREE.MeshStandardMaterial({ color: 0x7fae6a, roughness: 1 });
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x3f7f4a, roughness: 1, flatShading: true });
  const plateGeo = new THREE.BoxGeometry(BLOCK_W, 0.1, BLOCK_D);
  const treeGeo = new THREE.ConeGeometry(0.9, 2.4, 6);

  const excluded = (x, z) => exclusions.some((e) => Math.hypot(x - e.x, z - e.z) < e.r + 3.5);

  for (let ix = 0; ix < COLS; ix++) {
    for (let iz = 0; iz < ROWS; iz++) {
      const cx = X0 + ix * COL_STEP;
      const cz = Z0 - iz * ROW_STEP;
      if (excluded(cx, cz)) continue;

      const isPark = rng() < 0.07;
      const plate = new THREE.Mesh(plateGeo, isPark ? parkMat : sidewalk);
      plate.position.set(cx, 0.07, cz);
      plate.receiveShadow = true;
      group.add(plate);

      if (isPark) {
        for (let i = 0; i < 6; i++) {
          const t = new THREE.Mesh(treeGeo, treeMat);
          t.position.set(cx + (rng() - 0.5) * 7, 1.4, cz + (rng() - 0.5) * 9);
          t.castShadow = true;
          group.add(t);
        }
        continue;
      }

      const nx = rng() < 0.5 ? 1 : 2;
      const nz = rng() < 0.5 ? 1 : 2;
      const lotW = BLOCK_W / nx, lotD = BLOCK_D / nz;
      for (let a = 0; a < nx; a++) {
        for (let b = 0; b < nz; b++) {
          const lx = cx - BLOCK_W / 2 + lotW * (a + 0.5);
          const lz = cz - BLOCK_D / 2 + lotD * (b + 0.5);
          addBuilding(group, rng, palette, lx, lz, lotW * (0.82 + rng() * 0.16), lotD * (0.82 + rng() * 0.16));
        }
      }
    }
  }
  return group;
}

function addBuilding(group, rng, palette, x, z, w, d) {
  const dist = Math.hypot(x - CORE.x, z - CORE.z);
  let h = (3 + 24 * Math.exp(-((dist / 55) ** 2))) * (0.35 + rng() * 0.75) + rng() * 3;
  if (dist < 40 && rng() < 0.15) h = Math.max(h, 20 + rng() * 6);
  h = Math.min(h, 27);

  const mat = palette[Math.floor(rng() * palette.length)];
  const tiered = h > 12 && rng() < 0.5;
  const mainH = tiered ? h * 0.7 : h;

  const main = makeBuilding(w, mainH, d, mat);
  main.position.set(x, 0.12 + mainH / 2, z);
  group.add(main);

  if (tiered) {
    const topH = h * 0.3;
    const top = makeBuilding(w * 0.65, topH, d * 0.65, mat);
    top.position.set(x, 0.12 + mainH + topH / 2, z);
    group.add(top);
  }
}
