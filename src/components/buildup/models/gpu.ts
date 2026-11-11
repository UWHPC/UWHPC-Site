import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE, clay, detail, outline } from "../materials";
import { DIE_WIDTH, pcbTexture } from "../textures";

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
const PCB_THICKNESS = 1.6;
const MOUNT_RADIUS = 1.65;
const MOUNTS: [number, number][] = [-46, 46].flatMap((x) =>
  [BOARD_Z - 126, BOARD_Z + 126].map((z): [number, number] => [x, z])
);
const POWER_STAGES: [number, number][] = Array.from({ length: 24 }, (_, i) => BOARD_Z - 118 + i * 9.5)
  .filter((z) => Math.abs(z) >= 34)
  .flatMap((z) => [[-44, z], [44, z]] as [number, number][]);
const CONTROLLERS: [number, number][] = [[-17, -68], [19, -57], [-16, 54], [17, 68]];
const BULK_X = Array.from({ length: 8 }, (_, i) => -28 + i * 8);
const BULK_Z = BOARD_Z - 112;

type Mat = THREE.Material | THREE.Material[];

const geo = new Map<string, THREE.BufferGeometry>();
function rbox(w: number, h: number, d: number, r = Math.min(w, h, d) * 0.18) {
  const k = `${w}|${h}|${d}|${r}|${detail.segments}`;
  let g = geo.get(k);
  if (!g) {
    g = r === 0 ? new THREE.BoxGeometry(w, h, d) : new RoundedBoxGeometry(w, h, d, detail.segments, r);
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
function many(parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, at: [number, number, number][], radius?: number) {
  const m = new THREE.InstancedMesh(rbox(w, h, d, radius), mat, at.length);
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
    const t = new THREE.CanvasTexture(pcbTexture({
      ...CARD, boardZ: BOARD_Z, powerStages: POWER_STAGES, controllers: CONTROLLERS, bulkX: BULK_X, bulkZ: BULK_Z,
    }));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  })(), roughness: 0.85, metalness: 0.02 }),
  pcbEdge: clay("#202924"),
  substrate: clay(PALETTE.deep),
  interposer: clay("#55575e", { roughness: 0.55 }),
  hbm: clay("#727984", { roughness: 0.48 }),
  hbmLayers: clay("#363943", { roughness: 0.54 }),
  hbmMark: clay("#a1a7ae"),
  cap: clay("#7c6f5f"),
  choke: clay(PALETTE.mid),
  fet: clay("#16171a"),
  bulk: clay("#34363c"),
  connector: clay("#121315"),
  fingers: clay("#b49a6a", { roughness: 0.55 }),
  solder: new THREE.MeshStandardMaterial({ color: "#92989d", metalness: 0.55, roughness: 0.46 }),
  ceramic: clay("#927e68"),
  plating: new THREE.MeshStandardMaterial({ color: "#ad905f", metalness: 0.64, roughness: 0.39, side: THREE.DoubleSide }),
};

function createPcbGeometry() {
  const shape = new THREE.Shape();
  const left = -CARD.width / 2;
  const right = CARD.width / 2;
  const far = -(BOARD_Z - CARD.length / 2);
  const near = -(BOARD_Z + CARD.length / 2);
  const corner = 1.4;
  shape.moveTo(left + corner, near);
  shape.lineTo(right - corner, near);
  shape.quadraticCurveTo(right, near, right, near + corner);
  shape.lineTo(right, far - corner);
  shape.quadraticCurveTo(right, far, right - corner, far);
  shape.lineTo(left + corner, far);
  shape.quadraticCurveTo(left, far, left, far - corner);
  shape.lineTo(left, near + corner);
  shape.quadraticCurveTo(left, near, left + corner, near);
  for (const [x, z] of MOUNTS) {
    const hole = new THREE.Path();
    hole.absarc(x, -z, MOUNT_RADIUS, 0, 2 * Math.PI, true);
    shape.holes.push(hole);
  }
  const board = new THREE.ExtrudeGeometry(shape, { depth: PCB_THICKNESS, bevelEnabled: false, curveSegments: 12 });
  board.rotateX(-Math.PI / 2);
  board.translate(0, PCB_TOP - PCB_THICKNESS, 0);

  const positions = board.getAttribute("position");
  const uv = board.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, 0.5 + positions.getX(i) / CARD.width, 0.5 - (positions.getZ(i) - BOARD_Z) / CARD.length);
  }
  return board;
}

const pcbGeometry = createPcbGeometry();
const mountRim = new THREE.RingGeometry(MOUNT_RADIUS - 0.016, 2.45, 24).rotateX(-Math.PI / 2);
const mountWall = new THREE.CylinderGeometry(MOUNT_RADIUS - 0.017, MOUNT_RADIUS - 0.017, PCB_THICKNESS, 24, 1, true);

function buildPowerSocket(parent: THREE.Object3D) {
  const x = 30;
  const z = BOARD_Z - 126;
  const housing = new THREE.Shape();
  housing.moveTo(-11, 0);
  housing.lineTo(11, 0);
  housing.lineTo(11, 10);
  housing.lineTo(-11, 10);
  housing.closePath();

  const contacts: [number, number, number][] = [];
  const sense: [number, number, number][] = [];
  function opening(cx: number, cy: number, w: number, h: number, chamfer: number) {
    const hole = new THREE.Path();
    const left = cx - w / 2;
    const right = cx + w / 2;
    const bottom = cy - h / 2;
    const top = cy + h / 2;
    hole.moveTo(left, bottom);
    hole.lineTo(left, top - chamfer);
    hole.lineTo(left + chamfer, top);
    hole.lineTo(right - chamfer, top);
    hole.lineTo(right, top - chamfer);
    hole.lineTo(right, bottom);
    hole.closePath();
    housing.holes.push(hole);
  }
  for (const cy of [2, 5.1]) {
    for (let i = 0; i < 6; i++) {
      const cx = (i - 2.5) * 3.15;
      opening(cx, cy, 2.5, 2.35, i % 2 ? 0.45 : 0.08);
      contacts.push([x + cx, PCB_TOP + cy - 0.3, z - 0.65]);
    }
  }
  for (let i = 0; i < 4; i++) {
    const cx = (i - 1.5) * 2.45;
    opening(cx, 8.15, 1.48, 1.42, 0.08);
    sense.push([x + cx, PCB_TOP + 8, z - 0.65]);
  }

  const shell = new THREE.Mesh(new THREE.ExtrudeGeometry(housing, { depth: 8, bevelEnabled: false }), M.connector);
  shell.position.set(x, PCB_TOP, z - 4.5);
  parent.add(shell);
  outline(shell, 0.12);
  part(parent, 22, 10, 1, M.connector, x, PCB_TOP, z + 4);
  part(parent, 8, 0.95, 4, M.choke, x, PCB_TOP + 10, z);
  many(parent, 0.65, 0.6, 5.6, M.fingers, contacts, 0);
  many(parent, 0.38, 0.3, 5.6, M.fingers, sense, 0);
}

/**
 * Package and bare board. `dieFaces` are the die's six face materials (the
 * scene owns the top face's power-on shader).
 */
export function buildBoard(dieFaces: THREE.Material[], closeup = true) {
  const group = new THREE.Group();

  // the die and the package around it
  const die = new THREE.Mesh(new RoundedBoxGeometry(DIE_WIDTH, 0.7, DIE_WIDTH, 2, 0.15), dieFaces);
  die.position.y = -0.35;
  group.add(die);
  const dieAnchor = new THREE.Object3D();
  group.add(dieAnchor);
  part(group, 50, 0.5, 38, M.interposer, 0, -1.2, 0);
  part(group, 58, 1.2, 58, M.substrate, 0, PCB_TOP, 0, true);
  const memory: [number, number, number][] = [-19, 19].flatMap((x) => [-12.5, 0, 12.5].map((z) => [x, -0.7, z] as [number, number, number]));
  if (closeup) {
    many(group, 8.7, 0.56, 10.7, M.hbmLayers, memory);
    many(group, 9, 0.08, 11, M.hbm, memory.flatMap(([x, y, z]) => [0.1, 0.28, 0.46].map((h) => [x, y + h, z] as [number, number, number])), 0);
    many(group, 9, 0.19, 11, M.hbm, memory.map(([x, y, z]) => [x, y + 0.56, z]));
    many(group, 2.6, 0.015, 0.22, M.hbmMark, memory.flatMap(([x, y, z]) => [0, 0.55].map((d) => [x - 1.9, y + 0.75, z - 3.4 + d] as [number, number, number])), 0);
  } else {
    many(group, 9, 0.75, 11, M.hbm, memory);
  }
  const ring: [number, number, number][] = [];
  for (let i = 0; i < 13; i++) {
    const t = -24 + i * 4;
    ring.push([t, -1.2, 27], [t, -1.2, -27], [27, -1.2, t], [-27, -1.2, t]);
  }
  many(group, 1.4, 0.6, 1.4, M.cap, ring);

  const pcb = new THREE.Mesh(pcbGeometry, [M.pcbTop, M.pcbEdge]);
  group.add(pcb);
  outline(pcb);
  const rims = new THREE.InstancedMesh(mountRim, M.plating, MOUNTS.length);
  const walls = new THREE.InstancedMesh(mountWall, M.plating, MOUNTS.length);
  const o = new THREE.Object3D();
  MOUNTS.forEach(([x, z], i) => {
    o.position.set(x, PCB_TOP + 0.016, z);
    o.updateMatrix();
    rims.setMatrixAt(i, o.matrix);
    o.position.y = PCB_TOP - PCB_THICKNESS / 2;
    o.updateMatrix();
    walls.setMatrixAt(i, o.matrix);
  });
  group.add(rims, walls);

  // power stages down both long edges, FETs beside them
  many(group, 8, 5.5, 8, M.choke, POWER_STAGES.map(([x, z]) => [x, PCB_TOP, z]));
  many(group, 4, 1, 5, M.fet, POWER_STAGES.map(([x, z]) => [x * 0.82, PCB_TOP, z]));

  // bulk capacitors and the 16-pin power connector at the rear
  const bulk = new THREE.InstancedMesh(new THREE.CylinderGeometry(3, 3, 9, 24), M.bulk, BULK_X.length);
  BULK_X.forEach((x, i) => {
    o.position.set(x, PCB_TOP + 4.5, BULK_Z);
    o.updateMatrix();
    bulk.setMatrixAt(i, o.matrix);
  });
  group.add(bulk);
  if (closeup) buildPowerSocket(group);
  else part(group, 22, 10, 9, M.connector, 30, PCB_TOP, BOARD_Z - 126, true);

  // PCIe edge fingers along one long edge, NVLink fingers along the other
  const fingers: [number, number, number][] = [];
  const addFingers = (x: number, start: number, count: number) => {
    for (let i = 0; i < count; i++) fingers.push([x, PCB_TOP - 0.025, BOARD_Z + start + i * 1.5]);
  };
  addFingers(-53.7, -39, 10);
  addFingers(-53.7, -20, 47);
  [-40, -6, 28].forEach((z) => addFingers(53.7, z - 12, 17));
  many(group, 3.2, 0.07, 0.96, M.fingers, fingers, 0);

  if (closeup) {
    // Surface-mount controllers with visible leads, and banks of bypass capacitors.
    many(group, 7, 1.15, 8, M.fet, CONTROLLERS.map(([x, z]) => [x, PCB_TOP, z]));
    const pins: [number, number, number][] = [];
    const fillets: [number, number, number][] = [];
    CONTROLLERS.forEach(([x, z]) => {
      for (let i = 0; i < 7; i++) {
        pins.push([x - 4.1, PCB_TOP, z - 3 + i], [x + 4.1, PCB_TOP, z - 3 + i]);
        fillets.push([x - 4.92, PCB_TOP, z - 3 + i], [x + 4.92, PCB_TOP, z - 3 + i]);
      }
    });
    many(group, 2.1, 0.23, 0.38, M.solder, pins, 0);
    many(group, 0.68, 0.29, 0.58, M.solder, fillets, 0.13);
    many(group, 0.65, 0.025, 0.65, M.hbmMark, CONTROLLERS.map(([x, z]) => [x - 2.3, PCB_TOP + 1.15, z - 2.7]), 0);

    const passives: [number, number, number][] = POWER_STAGES.map(([x, z]) => [x * 0.7, PCB_TOP, z]);
    for (let i = 0; i < 14; i++) {
      const x = -24.7 + i * 3.8;
      passives.push([x, PCB_TOP, -36], [x, PCB_TOP, 36], [x, PCB_TOP, 42]);
    }
    many(group, 2.4, 0.45, 1.25, M.solder, passives, 0);
    many(group, 1.42, 0.34, 1.28, M.ceramic, passives.map(([x, y, z]) => [x, y + 0.26, z]), 0);

    const capLids = new THREE.InstancedMesh(new THREE.CylinderGeometry(2.55, 2.55, 0.15, 20), M.solder, BULK_X.length);
    BULK_X.forEach((x, i) => {
      o.position.set(x, PCB_TOP + 9, BULK_Z);
      o.updateMatrix();
      capLids.setMatrixAt(i, o.matrix);
    });
    group.add(capLids);
    many(group, 2.9, 0.025, 0.25, M.bulk, BULK_X.map((x) => [x, PCB_TOP + 9.075, BULK_Z]), 0);
  }

  return { group, dieAnchor };
}

/* ---- casing ------------------------------------------------------------ */

const C = {
  vapour: clay("#4a3f38", { roughness: 0.6 }),
  fins: clay("#3d3f45", { roughness: 0.7 }),
  shroud: clay(PALETTE.body, { roughness: 0.78 }),
  skirt: clay(PALETTE.deep),
  rail: new THREE.MeshStandardMaterial({ color: "#626670", metalness: 0.42, roughness: 0.55 }),
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

  // A segmented service rail stays visible on the upper edge in the rack.
  many(shroud, 0.65, 4.8, 70, C.rail, [[HALF_W + 0.55, 21.4, -106], [HALF_W + 0.55, 21.4, 68]]);
  const slots: [number, number, number][] = [-106, 68].flatMap((center) =>
    Array.from({ length: 7 }, (_, i): [number, number, number] => [HALF_W + 0.92, 22.55, center - 24 + i * 8])
  );
  many(shroud, 0.22, 2.4, 4.2, C.vent, slots, 0);
  many(shroud, 3.4, 0.65, 183, C.rail, [[-39, SHROUD_TOP, BOARD_Z], [39, SHROUD_TOP, BOARD_Z]]);
  // The end of the fin stack has two retaining bars across the intake.
  many(shroud, 110, 1.25, 2.6, C.rail, [9, 25].map((y) => [0, y, BOARD_MIN_Z + CARD.length - 2]));
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
  group.add(buildBoard(dieFaces, false).group);
  buildCasing().forEach(({ obj }) => group.add(obj));
  return group;
}
