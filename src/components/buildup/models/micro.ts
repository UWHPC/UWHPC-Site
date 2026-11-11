import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE, clay } from "../materials";

/**
 * The opening scale: a 2 x 2 mm patch on the die's top surface (origin),
 * drawn at a representative size rather than true scale. An 8 x 8 array of
 * gate-all-around transistors — three stacked nanosheet channels, a gate
 * wrapped around them, source/drain contacts — framed by rows of standard
 * cells. `setLit(t)` lights the gates in a diagonal wave (t 0 → 1);
 * `setOpacity(o)` fades the whole patch as the camera pulls back.
 */

const N = 8;
const PITCH = 0.24;

export function buildMicro() {
  const group = new THREE.Group();
  const o = new THREE.Object3D();
  const materials: THREE.Material[] = [];
  const mat = (color: string) => {
    const m = clay(color);
    m.transparent = true;
    materials.push(m);
    return m;
  };

  const origin = -((N - 1) * PITCH) / 2;
  const cells: [number, number][] = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push([origin + i * PITCH, origin + j * PITCH]);

  const place = (mesh: THREE.InstancedMesh, at: (k: number) => [number, number, number]) => {
    for (let k = 0; k < mesh.count; k++) {
      o.position.set(...at(k));
      o.updateMatrix();
      mesh.setMatrixAt(k, o.matrix);
    }
    group.add(mesh);
  };

  // nanosheet channels, three per transistor, running along x
  const sheets = new THREE.InstancedMesh(new RoundedBoxGeometry(0.17, 0.012, 0.05, 2, 0.004), mat(PALETTE.light), cells.length * 3);
  place(sheets, (k) => {
    const [x, z] = cells[Math.floor(k / 3)];
    return [x, 0.018 + (k % 3) * 0.022, z];
  });

  // source / drain contacts at both ends of each channel stack
  const contacts = new THREE.InstancedMesh(new RoundedBoxGeometry(0.035, 0.08, 0.07, 2, 0.008), mat(PALETTE.mid), cells.length * 2);
  place(contacts, (k) => {
    const [x, z] = cells[Math.floor(k / 2)];
    return [x + (k % 2 ? 0.095 : -0.095), 0.04, z];
  });

  // the wrap-around gates, coloured per instance so they can light up
  const gateMat = clay("#ffffff");
  gateMat.transparent = true;
  materials.push(gateMat);
  const gates = new THREE.InstancedMesh(new RoundedBoxGeometry(0.05, 0.085, 0.09, 2, 0.01), gateMat, cells.length);
  place(gates, (k) => [cells[k][0], 0.04, cells[k][1]]);
  const dim = new THREE.Color("#5a1d1e");
  const lit = new THREE.Color(PALETTE.red).multiplyScalar(1.6);
  const c = new THREE.Color();
  cells.forEach((_, k) => gates.setColorAt(k, dim));

  // standard-cell rows around the array
  const rows: [number, number, number][] = [];
  for (let r = -6; r <= 6; r++) {
    const z = r * 0.17;
    let x = -1.05;
    let n = 0;
    while (x < 1.05) {
      const w = 0.09 + ((r * 7 + n * 13) % 5) * 0.045;
      const inside = Math.abs(z) < 0.95 && x + w > -0.95 && x < 0.95;
      if (!inside) rows.push([x + w / 2, w, z]);
      x += w + 0.02;
      n++;
    }
  }
  const cellGeo = new RoundedBoxGeometry(1, 0.03, 0.12, 2, 0.008);
  const cellMesh = new THREE.InstancedMesh(cellGeo, mat(PALETTE.body), rows.length);
  rows.forEach(([x, w, z], k) => {
    o.position.set(x, 0.015, z);
    o.scale.set(w, 1, 1);
    o.updateMatrix();
    cellMesh.setMatrixAt(k, o.matrix);
  });
  o.scale.set(1, 1, 1);
  group.add(cellMesh);

  return {
    group,
    /** Light the gates in a diagonal wave, t 0 → 1. */
    setLit(t: number) {
      cells.forEach(([x, z], k) => {
        const delay = ((x - origin + (z - origin)) / (2 * (N - 1) * PITCH)) * 0.7;
        const v = Math.min(1, Math.max(0, (t - delay) / 0.3));
        gates.setColorAt(k, c.copy(dim).lerp(lit, v));
      });
      if (gates.instanceColor) gates.instanceColor.needsUpdate = true;
    },
    setOpacity(opacity: number) {
      materials.forEach((m) => (m.opacity = opacity));
      group.visible = opacity > 0.01;
    },
  };
}
