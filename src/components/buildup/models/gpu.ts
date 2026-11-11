import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE, clay, outline } from "../materials";
import { pcbTexture } from "../textures";

/**
 * The hero GPU, in card-local millimetres. Lying pose: the PCB is in the
 * x–z plane with components facing +y, the card's long axis runs along z
 * (267 mm), its width along x (111 mm), and the top of the die sits at the
 * origin. The package is 18 mm toward +z from the board's centre.
 */

export const CARD = { length: 267, width: 111, thick: 40 };
export const PKG_Z = 18; // package offset from the board's centre
const PCB_TOP = -2.4; // die 0.7 + interposer 0.5 + substrate 1.2 below the die top
const BOARD_Z = -PKG_Z; // board centre, relative to the die

type Mat = THREE.Material | THREE.Material[];

const geo = new Map<string, THREE.BufferGeometry>();
function rbox(w: number, h: number, d: number, r = Math.min(w, h, d) * 0.18) {
  const k = `${w}|${h}|${d}|${r}`;
  let g = geo.get(k);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 3, r);
    geo.set(k, g);
  }
  return g;
}

/** A rounded box by its bottom-centre. */
function part(parent: THREE.Object3D, w: number, h: number, d: number, mat: Mat, x: number, y: number, z: number, edges = false) {
  const m = new THREE.Mesh(rbox(w, h, d), mat);
  m.position.set(x, y + h / 2, z);
  parent.add(m);
  if (edges) outline(m);
  return m;
}

/** Many identical rounded boxes in one draw call (bottom-centres). */
function many(parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, at: [number, number, number][]) {
  const m = new THREE.InstancedMesh(rbox(w, h, d), mat, at.length);
  const o = new THREE.Object3D();
  at.forEach(([x, y, z], i) => {
    o.position.set(x, y + h / 2, z);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
  });
  parent.add(m);
  return m;
}

const M = {
  pcbTop: new THREE.MeshStandardMaterial({ map: (() => {
    const t = new THREE.CanvasTexture(pcbTexture());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  })(), roughness: 0.85, metalness: 0.02 }),
  pcbEdge: clay("#202924"),
  substrate: clay(PALETTE.deep),
  interposer: clay("#55575e", { roughness: 0.55 }),
  hbm: clay("#9a9ca3", { roughness: 0.5 }),
  cap: clay("#7c6f5f"),
  choke: clay(PALETTE.mid),
  fet: clay("#16171a"),
  bulk: clay("#34363c"),
  connector: clay("#121315"),
  fingers: clay("#b49a6a", { roughness: 0.55 }),
};

/**
 * Package and bare board. `dieFaces` are the die's six face materials (the
 * scene owns the top face's power-on shader).
 */
export function buildBoard(dieFaces: THREE.Material[]) {
  const group = new THREE.Group();

  // the die and the package around it
  const die = new THREE.Mesh(new RoundedBoxGeometry(26, 0.7, 26, 2, 0.15), dieFaces);
  die.position.y = -0.35;
  group.add(die);
  const dieAnchor = new THREE.Object3D();
  group.add(dieAnchor);
  part(group, 50, 0.5, 38, M.interposer, 0, -1.2, 0);
  part(group, 58, 1.2, 58, M.substrate, 0, PCB_TOP, 0, true);
  many(group, 9, 0.75, 11, M.hbm, [-19, 19].flatMap((x) => [-12.5, 0, 12.5].map((z) => [x, -0.7, z] as [number, number, number])));
  const ring: [number, number, number][] = [];
  for (let i = 0; i < 13; i++) {
    const t = -24 + i * 4;
    ring.push([t, -1.2, 27], [t, -1.2, -27], [27, -1.2, t], [-27, -1.2, t]);
  }
  many(group, 1.4, 0.6, 1.4, M.cap, ring);

  // the board itself
  part(group, CARD.width, 1.6, CARD.length, [M.pcbEdge, M.pcbEdge, M.pcbTop, M.pcbEdge, M.pcbEdge, M.pcbEdge], 0, PCB_TOP - 1.6, BOARD_Z, true);

  // power stages down both long edges, FETs beside them
  const chokes: [number, number, number][] = [];
  for (let i = 0; i < 24; i++) {
    const z = BOARD_Z - 118 + i * 9.5;
    if (Math.abs(z) < 34) continue; // keep clear of the package
    chokes.push([-44, PCB_TOP, z], [44, PCB_TOP, z]);
  }
  many(group, 8, 5.5, 8, M.choke, chokes);
  many(group, 4, 1, 5, M.fet, chokes.map(([x, y, z]) => [x * 0.82, y, z] as [number, number, number]));

  // bulk capacitors and the 16-pin power connector at the rear
  const bulk = new THREE.InstancedMesh(new THREE.CylinderGeometry(3, 3, 9, 24), M.bulk, 8);
  const o = new THREE.Object3D();
  for (let i = 0; i < 8; i++) {
    o.position.set(-28 + i * 8, PCB_TOP + 4.5, BOARD_Z - 112);
    o.updateMatrix();
    bulk.setMatrixAt(i, o.matrix);
  }
  group.add(bulk);
  part(group, 22, 10, 9, M.connector, 30, PCB_TOP, BOARD_Z - 126, true);

  // PCIe edge fingers along one long edge, NVLink fingers along the other
  part(group, 2, 0.4, 92, M.fingers, -CARD.width / 2 + 1.5, PCB_TOP - 0.2, BOARD_Z + 6);
  many(group, 2, 0.4, 26, M.fingers, [-40, -6, 28].map((z) => [CARD.width / 2 - 1.5, PCB_TOP - 0.2, BOARD_Z + z] as [number, number, number]));

  return { group, dieAnchor };
}
