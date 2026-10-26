import * as THREE from 'three';
import { makeBuilding, makeSideMaterial } from './buildings.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...o });

function shadowed(group) {
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

function cnTower() {
  const g = new THREE.Group();
  const concrete = std(0xd3d0c9, { roughness: 0.85 });
  const glass = std(0x8fbfdc, { roughness: 0.2, metalness: 0.3, emissive: 0x1c3a52 });

  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 18, 6.4), concrete);
    fin.position.y = 9;
    fin.rotation.y = (i * Math.PI) / 3;
    g.add(fin);
  }
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 2.6, 45, 6), concrete);
  shaft.position.y = 22.5;
  g.add(shaft);

  const lowerCone = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 2.4, 1.6, 16), concrete);
  lowerCone.position.y = 33.2;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 1.8, 16), glass);
  drum.position.y = 34.9;
  const upperCone = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 6.2, 1.2, 16), concrete);
  upperCone.position.y = 36.4;
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.8, 16), glass);
  deck.position.y = 37.4;
  g.add(lowerCone, drum, upperCone, deck);

  const skyPod = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.9, 12), glass);
  skyPod.position.y = 44.5;
  const antenna = new THREE.Mesh(new THREE.ConeGeometry(0.55, 10, 8), std(0xe9e9ea));
  antenna.position.y = 50;
  g.add(skyPod, antenna);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff2a2a, emissiveIntensity: 1 });
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lightMat);
  light.position.y = 55.2;
  g.add(light);

  g.position.set(-8, 0, -16);
  return {
    group: shadowed(g),
    pos: { x: -8, z: -16 },
    radius: 8,
    update: (t) => { lightMat.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3); },
    info: {
      name: 'CN Tower',
      meta: '553 m · opened 1976',
      text: 'Communications and observation tower that was the world\'s tallest free-standing structure for over 30 years. The glass floor and SkyPod sit well above the main deck.',
      focusY: 28, dist: 70,
    },
  };
}

function rogersCentre() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.5, 3.4, 32), std(0xb9b6ae));
  base.position.y = 1.7;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(10.6, 10.6, 0.5, 32), std(0x1f5da8));
  band.position.y = 3.2;
  g.add(base, band);

  const colors = [0xeeeeef, 0xc9ced4, 0xeeeeef, 0xc9ced4];
  for (let i = 0; i < 4; i++) {
    const panel = new THREE.Mesh(
      new THREE.SphereGeometry(10, 16, 10, (i * Math.PI) / 2, Math.PI / 2, 0, Math.PI / 2),
      std(colors[i], { roughness: 0.5 })
    );
    panel.scale.y = 0.62;
    panel.position.y = 3.4;
    g.add(panel);
  }
  g.position.set(14, 0, -16);
  return {
    group: shadowed(g),
    pos: { x: 14, z: -16 },
    radius: 11,
    info: {
      name: 'Rogers Centre',
      meta: 'Opened 1989 as SkyDome',
      text: 'Home of the Toronto Blue Jays. It was the first stadium with a fully retractable motorized roof, which opens in about 20 minutes.',
      focusY: 5, dist: 45,
    },
  };
}

function firstCanadianPlace() {
  const g = new THREE.Group();
  const tower = makeBuilding(6.5, 29.8, 5.2, makeSideMaterial(0xf4f1ea));
  tower.position.y = 14.9;
  g.add(tower);
  g.position.set(48, 0, -48);
  return {
    group: g,
    pos: { x: 48, z: -48 },
    radius: 4.5,
    info: {
      name: 'First Canadian Place',
      meta: '298 m · completed 1975',
      text: 'White marble-clad office tower in the financial district, home to the Bank of Montreal. For decades it was the tallest office tower in Canada.',
      focusY: 15, dist: 55,
    },
  };
}

function tdCentre() {
  const g = new THREE.Group();
  const dark = makeSideMaterial(0x2c2f34);
  const a = makeBuilding(5.2, 24, 5.2, dark);
  a.position.y = 12;
  const b = makeBuilding(4.4, 17, 5, dark);
  b.position.set(5.2, 8.5, -2);
  g.add(a, b);
  g.position.set(60, 0, -48);
  return {
    group: g,
    pos: { x: 60, z: -48 },
    radius: 7,
    info: {
      name: 'Toronto-Dominion Centre',
      meta: 'Designed by Mies van der Rohe',
      text: 'Cluster of black steel-and-glass towers built from 1967, a landmark of the International Style and the heart of Bay Street banking.',
      focusY: 12, dist: 50,
    },
  };
}

function scotiabankArena() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(15, 4.2, 9), std(0x9aa3ad));
  body.position.y = 2.1;
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 14.6, 20), std(0xdfe4ea, { roughness: 0.5 }));
  roof.rotation.z = Math.PI / 2;
  roof.scale.x = 0.55;
  roof.position.y = 4.2;
  g.add(body, roof);
  g.position.set(60, 0, -18);
  return {
    group: shadowed(g),
    pos: { x: 60, z: -18 },
    radius: 8,
    info: {
      name: 'Scotiabank Arena',
      meta: 'Opened 1999',
      text: 'Indoor arena beside Union Station where the Maple Leafs (NHL) and Raptors (NBA) play, also a major concert venue.',
      focusY: 4, dist: 40,
    },
  };
}

function unionStation() {
  const g = new THREE.Group();
  const stone = std(0xd2c6a9, { roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 2.8, 5), stone);
  body.position.y = 1.4;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.35, 5.6), std(0x7d8a86));
  roof.position.y = 3;
  g.add(body, roof);
  for (let i = 0; i < 11; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 8), stone);
    col.position.set(-6 + i * 1.2, 1.2, 2.9);
    g.add(col);
  }
  g.position.set(45, 0, -24);
  return {
    group: shadowed(g),
    pos: { x: 45, z: -24 },
    radius: 8,
    info: {
      name: 'Union Station',
      meta: 'Opened 1927',
      text: 'Beaux-Arts rail hub fronted by a long colonnade. It is the busiest passenger transportation hub in Canada.',
      focusY: 2, dist: 35,
    },
  };
}

function royalYork() {
  const g = new THREE.Group();
  const body = makeBuilding(9, 12.4, 7, makeSideMaterial(0xd3c0a2));
  body.position.y = 6.2;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 2.6, 4), std(0x5e8c7c));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 13.7;
  roof.castShadow = true;
  g.add(body, roof);
  g.position.set(45, 0, -37);
  return {
    group: g,
    pos: { x: 45, z: -37 },
    radius: 6,
    info: {
      name: 'Fairmont Royal York',
      meta: 'Opened 1929',
      text: 'Châteauesque hotel across from Union Station, once the tallest building in the British Empire, with its distinctive copper-green roof.',
      focusY: 8, dist: 40,
    },
  };
}

export function buildLandmarks() {
  return [cnTower(), rogersCentre(), firstCanadianPlace(), tdCentre(), scotiabankArena(), unionStation(), royalYork()];
}
