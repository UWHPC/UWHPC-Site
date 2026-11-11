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

/* ---- casing ------------------------------------------------------------ */

const C = {
  vapour: clay("#4a3f38", { roughness: 0.6 }),
  fins: clay("#3d3f45", { roughness: 0.7 }),
  shroud: clay(PALETTE.body, { roughness: 0.78 }),
  skirt: clay(PALETTE.deep),
  backplate: clay("#18191c"),
  bracket: clay("#141517"),
  vent: clay("#0b0b0c"),
  accent: clay(PALETTE.red, { roughness: 0.6 }),
  // unlit near-black: the inside of the fin stack seen down the open end
  cavity: new THREE.MeshBasicMaterial({ color: "#060607", side: THREE.DoubleSide }),
};
C.accent.emissive = new THREE.Color(PALETTE.red);
C.accent.emissiveIntensity = 0.35;

const SHROUD_TOP = 34;
const HALF_W = CARD.width / 2;
const BOARD_MIN_Z = BOARD_Z - CARD.length / 2;

/**
 * The shroud's cross-section (x, y), extruded along the card: a shell with
 * chamfered top edges and a recessed channel down the middle of the top.
 * Its sides stop at y = 20; below that the fin stack shows, except where
 * the end skirts close it off.
 */
function shroudGeometry() {
  const t = 2.4; // wall
  const outer: [number, number][] = [
    [-HALF_W, 20], [-HALF_W, 27], [-HALF_W + 9, SHROUD_TOP], [-13, SHROUD_TOP], [-10, SHROUD_TOP - 3],
    [10, SHROUD_TOP - 3], [13, SHROUD_TOP], [HALF_W - 9, SHROUD_TOP], [HALF_W, 27], [HALF_W, 20],
  ];
  const inner: [number, number][] = [
    [HALF_W - t, 20], [HALF_W - t, 26.2], [HALF_W - 9.8, SHROUD_TOP - t], [13.8, SHROUD_TOP - t], [10.8, SHROUD_TOP - 3 - t],
    [-10.8, SHROUD_TOP - 3 - t], [-13.8, SHROUD_TOP - t], [-HALF_W + 9.8, SHROUD_TOP - t], [-HALF_W + t, 26.2], [-HALF_W + t, 20],
  ];
  const shape = new THREE.Shape();
  [...outer, ...inner].forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: CARD.length,
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.6,
    bevelSegments: 2,
    curveSegments: 4,
  });
  g.translate(0, 0, BOARD_MIN_Z);
  return g;
}

export type CasingPart = { obj: THREE.Object3D; from: [number, number, number]; order: number };

/** The enclosure, in card-local coordinates, as parts that fly in. */
export function buildCasing(): CasingPart[] {
  const parts: CasingPart[] = [];
  const add = (obj: THREE.Object3D, from: [number, number, number], order: number) => {
    parts.push({ obj, from, order });
    return obj;
  };

  // backplate under the board
  const back = new THREE.Group();
  part(back, CARD.width - 6, 1.6, CARD.length - 16, C.backplate, 0, PCB_TOP - 1.6 - 1.8, BOARD_Z, true);
  add(back, [0, -90, 0], 0);

  // vapour chamber over the package
  const vapour = new THREE.Group();
  part(vapour, 64, 4, 66, C.vapour, 0, 0.1, 0, true);
  add(vapour, [0, 80, 0], 1);

  // fin stack: plates along the card, so air runs front to back
  const fins = new THREE.Group();
  many(fins, 0.7, 26, CARD.length - 10, C.fins, Array.from({ length: 41 }, (_, i) => [-48 + i * 2.4, 4.4, BOARD_Z] as [number, number, number]));
  // dark plates a little way into each end, so the gaps between fins read
  // as a deep channel rather than a solid block
  [BOARD_MIN_Z + 30, BOARD_MIN_Z + CARD.length - 30].forEach((z) => {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(98, 25), C.cavity);
    plate.position.set(0, 4.4 + 12.5, z);
    fins.add(plate);
  });
  add(fins, [0, 130, 0], 2);

  // the shroud shell, end skirts, and the red accent along one chamfer
  const shroud = new THREE.Group();
  const shell = new THREE.Mesh(shroudGeometry(), C.shroud);
  shroud.add(shell);
  outline(shell, 0.22);
  [-1, 1].forEach((side) =>
    [BOARD_MIN_Z + 22, BOARD_MIN_Z + CARD.length - 22].forEach((z) =>
      part(shroud, 2.4, 22, 44, C.skirt, side * (HALF_W - 1.2), 0, z, true)
    )
  );
  const accent = new THREE.Mesh(rbox(0.9, 1.2, CARD.length - 30, 0.3), C.accent);
  accent.position.set(HALF_W - 4.6, SHROUD_TOP - 3.4, BOARD_Z);
  accent.rotation.z = -Math.PI / 4;
  shroud.add(accent);
  add(shroud, [0, 190, 0], 3);

  // PCIe bracket at the rear end, with vent slots and the mounting tab
  const bracket = new THREE.Group();
  // card-local +x is the card's top once it stands upright: the bracket runs
  // a little past it and the screw tab bends back from there
  part(bracket, 124, 42, 1.4, C.bracket, 4, PCB_TOP - 6, BOARD_MIN_Z - 1.2, true);
  many(bracket, 6, 26, 1.6, C.vent, Array.from({ length: 9 }, (_, i) => [-48 + i * 11, PCB_TOP + 2, BOARD_MIN_Z - 1.2] as [number, number, number]));
  part(bracket, 1.4, 42, 12, C.bracket, HALF_W + 9, PCB_TOP - 6, BOARD_MIN_Z - 7.2);
  // folded flanges along the bracket's two long edges, bent outward like the
  // screw tab (inward, the top one would cut through the shroud's chamfer)
  [PCB_TOP - 6, PCB_TOP - 6 + 42 - 1.2].forEach((y) => part(bracket, 118, 1.2, 6, C.bracket, 1, y, BOARD_MIN_Z - 4.6, true));
  add(bracket, [0, 0, -170], 4);

  return parts;
}

/** A finished card (for the seven that join the hero card). */
export function buildCard(dieFaces: THREE.Material[]) {
  const group = new THREE.Group();
  group.add(buildBoard(dieFaces).group);
  buildCasing().forEach(({ obj }) => group.add(obj));
  return group;
}
