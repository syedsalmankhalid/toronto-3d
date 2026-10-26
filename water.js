import * as THREE from 'three';

export function buildWater(rng) {
  const group = new THREE.Group();

  // Lake Ontario
  const geo = new THREE.PlaneGeometry(1400, 700, 140, 70);
  geo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0x2d7fae, roughness: 0.25, metalness: 0.15, flatShading: true })
  );
  water.position.set(0, -0.5, 349);
  water.receiveShadow = true;
  group.add(water);

  const pos = geo.attributes.position;
  const baseX = new Float32Array(pos.count);
  const baseZ = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) { baseX[i] = pos.getX(i); baseZ[i] = pos.getZ(i); }

  // Quay wall along the waterfront
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1400, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0x6d7279, roughness: 0.9 }));
  wall.position.set(0, -0.4, 0.3);
  group.add(wall);

  const items = [];
  items.push(torontoIslands(group, rng));
  items.push(billyBishop(group));

  return {
    group,
    items,
    update(t) {
      for (let i = 0; i < pos.count; i++) {
        const x = baseX[i], z = baseZ[i];
        pos.setY(i, 0.12 * Math.sin(x * 0.08 + t * 0.9) + 0.1 * Math.sin(z * 0.11 + t * 1.3) + 0.05 * Math.sin((x + z) * 0.2 + t * 2));
      }
      pos.needsUpdate = true;
    },
  };
}

function torontoIslands(parent, rng) {
  const g = new THREE.Group();
  const top = [], bottom = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const x = -20 + 110 * s;
    const zc = 50 + 6 * Math.sin(s * Math.PI);
    const w = 1.2 + 3.4 * Math.pow(Math.sin(Math.PI * s), 0.7) + rng() * 0.8;
    top.push([x, -(zc - w)]);
    bottom.push([x, -(zc + w)]);
  }
  const pts = [...top, ...bottom.reverse()];
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const land = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ color: 0x89b872, roughness: 1, flatShading: true })
  );
  land.rotation.x = -Math.PI / 2;
  land.position.y = -0.4;
  land.receiveShadow = true;
  g.add(land);

  const treeGeo = new THREE.ConeGeometry(0.8, 2.2, 6);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x3f7f4a, roughness: 1, flatShading: true });
  const trees = new THREE.InstancedMesh(treeGeo, treeMat, 160);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 160; i++) {
    const s = rng();
    const zc = 50 + 6 * Math.sin(s * Math.PI);
    const w = (1.2 + 3.4 * Math.pow(Math.sin(Math.PI * s), 0.7)) * 0.7;
    const sc = 0.7 + rng() * 0.7;
    m.makeScale(sc, sc, sc).setPosition(-20 + 110 * s, 0.4 + 1.1 * sc, zc + (rng() * 2 - 1) * w);
    trees.setMatrixAt(i, m);
  }
  trees.castShadow = true;
  g.add(trees);

  parent.add(g);
  return {
    group: g,
    pos: { x: 35, z: 52 },
    radius: 50,
    info: {
      name: 'Toronto Islands',
      meta: 'Car-free island chain',
      text: 'A chain of small islands in Lake Ontario just off the waterfront, home to parks, beaches and a small residential community, reached by ferry.',
      focusY: 0, dist: 90,
    },
  };
}

function billyBishop(parent) {
  const g = new THREE.Group();
  const land = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x8c9a85, roughness: 1 }));
  land.position.y = 0;
  const runway = new THREE.Mesh(new THREE.BoxGeometry(14, 0.05, 1), new THREE.MeshStandardMaterial({ color: 0x3a3e45 }));
  runway.position.y = 0.43;
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.4), new THREE.MeshStandardMaterial({ color: 0xdadde1 }));
  terminal.position.set(4, 0.85, 1.8);
  g.add(land, runway, terminal);
  g.traverse((o) => { if (o.isMesh) { o.receiveShadow = true; o.castShadow = true; } });
  g.position.set(-42, 0, 26);
  parent.add(g);
  return {
    group: g,
    pos: { x: -42, z: 26 },
    radius: 8,
    info: {
      name: 'Billy Bishop Airport',
      meta: 'Toronto City Airport',
      text: 'Small downtown airport on the western tip of the islands, reached by a short ferry or a pedestrian tunnel from the mainland.',
      focusY: 1, dist: 40,
    },
  };
}
