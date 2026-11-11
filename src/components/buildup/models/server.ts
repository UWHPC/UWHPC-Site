import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE, clay, detail, outline } from "../materials";
import { SERVER_FLOOR_Y, slotPose } from "../poses";

/**
 * The 4U server that assembles around the eight cards, in world
 * millimetres: 448 x 176 x 800, floor at SERVER_FLOOR_Y, cards toward the
 * front (+z). Each group knows where it flies in from. `shell` lists the
 * outer panels that go see-through at the end; `shellEdges` is the line
 * material their outlines share, so the x-ray can brighten them.
 */

export type ServerGroup = "switchboard" | "motherboard" | "fans" | "psus" | "chassis" | "lid";
export type ServerPart = { obj: THREE.Object3D; from: [number, number, number] };

const W = 448;
const H = 176;
const D = 800;
const FLOOR = SERVER_FLOOR_Y;
const TOP = FLOOR + H;

const M = {
  pcb: clay("#202924"),
  slot: clay("#121315"),
  socket: clay("#151619"),
  copper: clay("#4a3f38", { roughness: 0.6 }),
  fins: clay("#3d3f45", { roughness: 0.7 }),
  dimm: clay("#2a3a30"),
  dimmChip: clay("#141516"),
  latch: clay("#c9c9c4"),
  fanFrame: clay("#18191c"),
  blade: clay("#26272b"),
  hub: clay(PALETTE.red, { roughness: 0.6 }),
  psu: clay(PALETTE.deep),
  cable: clay("#141517", { roughness: 0.55 }),
  plug: clay("#0f1012"),
  floor: clay("#19191c"),
};

function rbox(w: number, h: number, d: number, r = Math.min(w, h, d) * 0.18) {
  return new RoundedBoxGeometry(w, h, d, detail.segments, r);
}

/** A rounded box by its bottom-centre. */
function part(parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, edges = false) {
  const m = new THREE.Mesh(rbox(w, h, d), mat);
  m.position.set(x, y + h / 2, z);
  parent.add(m);
  if (edges) outline(m);
  return m;
}

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

export function buildServer() {
  const parts: Record<ServerGroup, ServerPart[]> = {
    switchboard: [],
    motherboard: [],
    fans: [],
    psus: [],
    chassis: [],
    lid: [],
  };
  const group = (key: ServerGroup, from: [number, number, number]) => {
    const g = new THREE.Group();
    parts[key].push({ obj: g, from });
    return g;
  };

  /* PCIe switch board with eight x16 slots under the cards */
  const sw = group("switchboard", [0, -220, 0]);
  part(sw, 420, 2.4, 300, M.pcb, -10, FLOOR + 4, 60, true);
  many(sw, 7, 12, 100, M.slot, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [slotPose(i).position[0] + 3.2, FLOOR + 6.4, 64] as [number, number, number]));

  /* motherboard: two CPUs with tower coolers, 32 DIMMs */
  const mb = group("motherboard", [0, -200, -140]);
  part(mb, 420, 1.6, 300, M.pcb, -10, FLOOR + 4, -245, true);
  const towerFins: [number, number, number][] = [];
  const dimms: [number, number, number][] = [];
  [-110, 90].forEach((x) => {
    part(mb, 76, 4, 76, M.socket, x, FLOOR + 5.6, -245);
    part(mb, 64, 6, 64, M.copper, x, FLOOR + 9.6, -245, true);
    for (let i = 0; i < 30; i++) towerFins.push([x, FLOOR + 22 + i * 3.6, -245]);
    for (let i = 0; i < 8; i++) [-1, 1].forEach((s) => dimms.push([x + s * (50 + i * 6.6), FLOOR + 5.6, -245]));
  });
  many(mb, 88, 0.8, 70, M.fins, towerFins);
  many(mb, 1.6, 32, 133, M.dimm, dimms);
  many(mb, 2.6, 9, 104, M.dimmChip, dimms.map(([x, y, z]) => [x, y + 14, z] as [number, number, number]));
  many(mb, 5.4, 6, 4, M.latch, dimms.flatMap(([x, y, z]) => [[x, y, z + 69], [x, y, z - 69]] as [number, number, number][]));

  /* fan wall in front of the cards */
  const fans = group("fans", [0, 0, 260]);
  const rotors: THREE.Object3D[] = [];
  const frameShape = new THREE.Shape();
  frameShape.moveTo(-40, -40);
  [[40, -40], [40, 40], [-40, 40]].forEach(([x, y]) => frameShape.lineTo(x, y));
  const hole = new THREE.Path();
  hole.absarc(0, 0, 37, 0, Math.PI * 2, true);
  frameShape.holes.push(hole);
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: 38, bevelEnabled: true, bevelSize: 1.5, bevelThickness: 1.5, bevelSegments: 2, curveSegments: 28 });
  frameGeo.translate(0, 0, -19);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(9, -3);
  bladeShape.quadraticCurveTo(24, -9, 34, -2);
  bladeShape.quadraticCurveTo(30, 7, 9, 5);
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 1.4, bevelEnabled: false, curveSegments: 8 });
  for (let i = 0; i < 5; i++) {
    const fan = new THREE.Group();
    fan.position.set(-176 + i * 88, FLOOR + 56, 255);
    const frame = new THREE.Mesh(frameGeo, M.fanFrame);
    fan.add(frame);
    outline(frame);
    const rotor = new THREE.Group();
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 22, 28), M.hub);
    hub.rotation.x = Math.PI / 2;
    rotor.add(hub);
    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(bladeGeo, M.blade);
      blade.rotation.z = (b / 7) * Math.PI * 2;
      blade.rotation.y = 0.35;
      rotor.add(blade);
    }
    fan.add(rotor);
    rotors.push(rotor);
    fans.add(fan);
  }

  /* power supplies at the rear */
  const psus = group("psus", [0, 0, -320]);
  const psuX = [130, 194];
  psuX.forEach((x) => part(psus, 60, 82, 230, M.psu, x, FLOOR + 2, -275, true));

  /* 16-pin plugs on each card's top edge, cables arcing back to the PSUs
     (cards 0-3 on one, 4-7 on the other); they drop in after the PSUs */
  const power = group("psus", [0, 140, 0]);
  for (let i = 0; i < 8; i++) {
    const [sx, sy, sz] = slotPose(i).position;
    // card-local (59, 7, -125) on the end skirt; upright maps local (x, y) to world (-y, x)
    const px = sx - 7;
    const py = sy + 55.5; // the card's top edge
    const pz = sz - 125;
    part(power, 10, 7.5, 20, M.plug, px, py, pz, true);
    const k = i % 4;
    const tx = psuX[i < 4 ? 0 : 1] - 21 + k * 14;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, py + 7, pz),
      new THREE.Vector3(px, py + 20, pz - 12),
      new THREE.Vector3((px + tx) / 2, py + 26 - k * 2.5, (pz - 158) / 2 - 10),
      new THREE.Vector3(tx, FLOOR + 74, -150),
      new THREE.Vector3(tx, FLOOR + 70, -160),
    ]);
    power.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 2, 8, false), M.cable));
  }

  /* chassis: floor, walls, front and rear panels (each from its own side) */
  const shellMat = () => {
    const m = clay("#232428");
    m.transparent = true;
    return m;
  };
  const shellEdges = new THREE.LineBasicMaterial({ color: "#c8c8c8", transparent: true, opacity: 0.2, depthWrite: false });
  const shell: THREE.Mesh[] = [];
  const panel = (key: ServerGroup, from: [number, number, number], w: number, h: number, d: number, x: number, y: number, z: number) => {
    const g = group(key, from);
    const mesh = new THREE.Mesh(rbox(w, h, d, 1.5), shellMat());
    mesh.position.set(x, y + h / 2, z);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), shellEdges);
    edges.renderOrder = 1;
    mesh.add(edges);
    g.add(mesh);
    shell.push(mesh);
    return g;
  };
  const floorG = group("chassis", [0, -160, 0]);
  part(floorG, W, 2, D, M.floor, 0, FLOOR - 2, 0, true);
  panel("chassis", [-170, 0, 0], 2, H, D, -W / 2, FLOOR, 0);
  panel("chassis", [170, 0, 0], 2, H, D, W / 2, FLOOR, 0);
  const front = panel("chassis", [0, 0, 220], W, H, 10, 0, FLOOR, D / 2 - 5);
  // front panel relief: intake vents and drive bays
  const relief = clay("#141518");
  relief.transparent = true;
  for (let i = 0; i < 12; i++) part(front, 14, 120, 2, relief, 40 + i * 15, FLOOR + 28, D / 2 + 0.6);
  for (let i = 0; i < 4; i++) part(front, 40, 70, 2, relief, -190 + i * 46, FLOOR + 50, D / 2 + 0.6);
  shell.push(...(front.children.filter((c) => c instanceof THREE.Mesh && c !== front.children[0]) as THREE.Mesh[]));

  // status LEDs above the drive bays: one per GPU, then power (red). They
  // stay solid through the x-ray; the scene blinks them once the lid is on.
  const leds: THREE.MeshBasicMaterial[] = [];
  const ledGeo = rbox(7, 3, 1.6, 0.6);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.MeshBasicMaterial({ color: i < 8 ? "#e8ecf2" : PALETTE.red, toneMapped: false });
    const led = new THREE.Mesh(ledGeo, m);
    led.position.set(-205 + i * 13 + (i === 8 ? 10 : 0), FLOOR + 140, D / 2 + 1.2);
    front.add(led);
    leds.push(m);
  }
  panel("chassis", [0, 0, -220], W, H, 2, 0, FLOOR, -D / 2 + 1);

  /* lid, last */
  panel("lid", [0, 320, 0], W + 4, 2.4, D + 4, 0, TOP, 0);

  return { parts, shell, shellEdges, rotors, leds };
}
