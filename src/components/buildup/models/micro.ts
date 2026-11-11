import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE, clay } from "../materials";

/**
 * The opening scale: a 2 x 2 mm patch on the die's top surface (origin),
 * drawn at a representative size rather than true scale. An 8 x 8 array of
 * gate-all-around transistors — three stacked nanosheet channels, a gate
 * wrapped around them, source/drain contacts — framed by rows of standard
 * cells. `setLit(t, front)` lights the gates in a diagonal wave (t 0 → 1)
 * while a pulse of current keeps sweeping across them;
 * `setOpacity(o)` fades the whole patch as the camera pulls back.
 */

const N = 8;
const PITCH = 0.24;
const ORIGIN = -((N - 1) * PITCH) / 2;
const MICRO_RAIL_Z = Array.from({ length: N + 1 }, (_, i) => ORIGIN + (i - 0.5) * PITCH);
export const MICRO_PULSE_SPAN = -4 * ORIGIN;

export function dieRailGeometry() {
  const rails = MICRO_RAIL_Z.map((z) => {
    const bankZ = z * 0.42;
    const path = [
      [-3.315, bankZ, 0.027], [-2.08, bankZ, 0.015], [-1.1375, z, 0.015],
      [1.1375, z, 0.015], [2.08, bankZ, 0.015], [3.315, bankZ, 0.027],
    ];
    const rail = new THREE.Shape();
    rail.moveTo(path[0][0], -path[0][1] + path[0][2]);
    path.slice(1).forEach(([x, center, halfWidth]) => rail.lineTo(x, -center + halfWidth));
    path.reverse().forEach(([x, center, halfWidth]) => rail.lineTo(x, -center - halfWidth));
    rail.closePath();
    return rail;
  });
  // Just above the die so the etched traces retain clean edges at grazing angles.
  return new THREE.ShapeGeometry(rails).rotateX(-Math.PI / 2).translate(0, 0.006, 0);
}

export function buildMicro() {
  const group = new THREE.Group();
  const o = new THREE.Object3D();
  const materials: THREE.Material[] = [];
  const mat = (color: string, roughness = 0.82) => {
    const m = clay(color, { roughness });
    m.transparent = true;
    materials.push(m);
    return m;
  };

  const cells: [number, number][] = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push([ORIGIN + i * PITCH, ORIGIN + j * PITCH]);

  const place = (mesh: THREE.InstancedMesh, at: (k: number) => [number, number, number]) => {
    for (let k = 0; k < mesh.count; k++) {
      o.position.set(...at(k));
      o.updateMatrix();
      mesh.setMatrixAt(k, o.matrix);
    }
    group.add(mesh);
  };

  // Each device sits on a dielectric island over the die's interconnect.
  const islands = new THREE.InstancedMesh(new THREE.BoxGeometry(0.217, 0.014, 0.133), mat("#3b3d4b"), cells.length);
  place(islands, (k) => [cells[k][0], 0.03, cells[k][1]]);

  const copper = mat("#a68562", 0.46);
  const taps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.013, 0.006, 0.125), copper, cells.length * 2);
  place(taps, (k) => {
    const [x, z] = cells[Math.floor(k / 2)];
    const side = k % 2 ? 1 : -1;
    return [x + side * 0.089, 0.039, z + side * 0.059];
  });
  const vias = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.009, 8), mat("#c4ae8e", 0.38), cells.length * 2);
  place(vias, (k) => {
    const [x, z] = cells[Math.floor(k / 2)];
    const side = k % 2 ? 1 : -1;
    return [x + side * 0.089, 0.038, z + side * 0.119];
  });

  // nanosheet channels, three per transistor, running along x
  const sheets = new THREE.InstancedMesh(new RoundedBoxGeometry(0.17, 0.012, 0.05, 2, 0.004), mat(PALETTE.light), cells.length * 3);
  place(sheets, (k) => {
    const [x, z] = cells[Math.floor(k / 3)];
    return [x, 0.054 + (k % 3) * 0.022, z];
  });

  // source / drain contacts at both ends of each channel stack
  const contacts = new THREE.InstancedMesh(new RoundedBoxGeometry(0.035, 0.08, 0.07, 2, 0.008), mat(PALETTE.mid), cells.length * 2);
  place(contacts, (k) => {
    const [x, z] = cells[Math.floor(k / 2)];
    return [x + (k % 2 ? 0.095 : -0.095), 0.077, z];
  });

  // the wrap-around gates, coloured per instance so they can light up
  const gateMat = clay("#ffffff");
  gateMat.transparent = true;
  materials.push(gateMat);
  const gates = new THREE.InstancedMesh(new RoundedBoxGeometry(0.05, 0.085, 0.09, 2, 0.01), gateMat, cells.length);
  place(gates, (k) => [cells[k][0], 0.077, cells[k][1]]);
  const gateCaps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.032, 0.004, 0.052), mat("#ac7776", 0.48), cells.length);
  place(gateCaps, (k) => [cells[k][0], 0.121, cells[k][1]]);
  const dim = new THREE.Color("#5a1d1e");
  const lit = new THREE.Color(PALETTE.red).multiplyScalar(1.6);
  const hot = new THREE.Color("#ffd2c8").multiplyScalar(1.5);
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
      const fitted = Math.min(w, 1.08 - x);
      if (!inside) rows.push([x + fitted / 2, fitted, z]);
      x += w + 0.02;
      n++;
    }
  }
  const cellGeo = new RoundedBoxGeometry(1, 0.03, 0.12, 2, 0.008);
  const cellMesh = new THREE.InstancedMesh(cellGeo, mat(PALETTE.body), rows.length);
  rows.forEach(([x, w, z], k) => {
    o.position.set(x, 0.041, z);
    o.scale.set(w, 1, 1);
    o.updateMatrix();
    cellMesh.setMatrixAt(k, o.matrix);
  });
  o.scale.set(1, 1, 1);
  group.add(cellMesh);

  return {
    group,
    /** Light the gates in a diagonal wave (t 0 → 1), with a pulse of current sweeping across. */
    setLit(t: number, front: number) {
      cells.forEach(([x, z], k) => {
        const diag = 0.5 + (x + z) / MICRO_PULSE_SPAN;
        const v = Math.min(1, Math.max(0, (t - diag * 0.7) / 0.3));
        const pulse = Math.exp(-((diag - front) ** 2) / 0.008);
        // the pulse wakes dark gates toward red and runs white-hot over lit ones
        c.copy(dim).lerp(lit, Math.max(v, pulse * 0.55));
        gates.setColorAt(k, c.lerp(hot, pulse * 0.45 * v));
      });
      if (gates.instanceColor) gates.instanceColor.needsUpdate = true;
    },
    setOpacity(opacity: number) {
      materials.forEach((m) => { m.opacity = opacity; });
      // Keep the front faces solid over the short fade instead of showing rear layers.
      group.scale.y = 0.32 + 0.68 * opacity;
      group.visible = opacity > 0.01;
    },
  };
}
