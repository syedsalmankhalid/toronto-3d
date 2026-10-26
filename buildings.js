import * as THREE from 'three';

export function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One tile covers 4x4 world units: 4 window columns, 8 window rows.
let windowTex;
function windowTexture() {
  if (windowTex) return windowTex;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#e4e8ec';
  x.fillRect(0, 0, 128, 256);
  const r = mulberry32(7);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const l = 0.55 + r() * 0.25;
      x.fillStyle = `rgb(${Math.round(70 * l + 30)},${Math.round(110 * l + 30)},${Math.round(140 * l + 30)})`;
      x.fillRect(col * 32 + 4, row * 32 + 6, 24, 20);
    }
  }
  windowTex = new THREE.CanvasTexture(c);
  windowTex.wrapS = windowTex.wrapT = THREE.RepeatWrapping;
  windowTex.colorSpace = THREE.SRGBColorSpace;
  windowTex.anisotropy = 4;
  return windowTex;
}

export function makeSideMaterial(color) {
  return new THREE.MeshStandardMaterial({ map: windowTexture(), color, roughness: 0.5, metalness: 0.1 });
}

const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8a9096, roughness: 0.9 });

const PALETTE = [0xffffff, 0xf1e6d2, 0xcfd8e0, 0xa9c4d6, 0x8fb3c9, 0xdfd3c0, 0x9aa7b3, 0x6f7f8f];
let palette;
export function getPalette() {
  if (!palette) palette = PALETTE.map(makeSideMaterial);
  return palette;
}

// Box with UVs scaled to world size so window rows stay a constant size.
export function makeBuilding(w, h, d, sideMat, roofMat = roofMaterial) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const face = Math.floor(i / 4);
    let su, sv;
    if (face < 2) { su = d; sv = h; }
    else if (face < 4) { su = w; sv = d; }
    else { su = w; sv = h; }
    uv.setXY(i, (uv.getX(i) * su) / 4, (uv.getY(i) * sv) / 4);
  }
  const mesh = new THREE.Mesh(geo, [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat]);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}
