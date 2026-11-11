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
const PSU_X = [130, 194];
const POWER_Z = -147;
type Point = [number, number, number];

const M = {
  pcb: clay("#202924"),
  slot: clay("#121315"),
  socket: clay("#151619"),
  copper: clay("#4a3f38", { roughness: 0.6 }),
  fins: clay("#3d3f45", { roughness: 0.7 }),
  steel: new THREE.MeshStandardMaterial({ color: "#858b95", metalness: 0.42, roughness: 0.48 }),
  heatPipe: new THREE.MeshStandardMaterial({ color: "#aa805d", metalness: 0.48, roughness: 0.45 }),
  dimm: clay("#2a3a30"),
  dimmChip: clay("#141516"),
  latch: clay("#c9c9c4"),
  fanFrame: clay("#18191c"),
  blade: clay("#26272b"),
  hub: clay(PALETTE.red, { roughness: 0.6 }),
  psu: clay(PALETTE.deep),
  psuCover: clay("#34363d", { roughness: 0.62 }),
  recess: clay("#090a0c"),
  cableCollar: clay("#35373d"),
  cable: clay("#141517", { roughness: 0.55 }),
  plug: clay("#0f1012"),
  status: new THREE.MeshBasicMaterial({ color: "#b4d7ba", toneMapped: false }),
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

function many(parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, at: Point[]) {
  const geometry = Math.min(w, h, d) < 2 ? new THREE.BoxGeometry(w, h, d) : rbox(w, h, d);
  const m = new THREE.InstancedMesh(geometry, mat, at.length);
  const o = new THREE.Object3D();
  at.forEach(([x, y, z], i) => {
    o.position.set(x, y + h / 2, z);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
  });
  parent.add(m);
  return m;
}

function buildMotherboard(mb: THREE.Group, makeFan: () => THREE.Group) {
  const boardTop = FLOOR + 5.6;
  const coolerZ = -250;
  part(mb, 312, 1.6, 300, M.pcb, -62, FLOOR + 4, -245, true);
  const fins: Point[] = [];
  const dimms: Point[] = [];
  const regulators: Point[] = [];
  const pipeEnds: Point[] = [];
  for (const x of [-137, 14]) {
    part(mb, 76, 4, 76, M.socket, x, boardTop, coolerZ);
    part(mb, 64, 6, 64, M.copper, x, boardTop + 4, coolerZ, true);
    for (let i = 0; i < 28; i++) fins.push([x, FLOOR + 22 + i * 3.6, coolerZ]);
    part(mb, 89, 3, 72, M.psuCover, x, FLOOR + 120, coolerZ, true);
    part(mb, 52, 0.65, 9, M.steel, x, FLOOR + 123, coolerZ);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 8; i++) dimms.push([x + side * (46.5 + i * 3.8), boardTop, coolerZ]);
      for (const z of [-20, 20]) {
        const points = [
          new THREE.Vector3(x + side * 20, FLOOR + 14, coolerZ + z),
          new THREE.Vector3(x + side * 33, FLOOR + 20, coolerZ + z),
          new THREE.Vector3(x + side * 41, FLOOR + 33, coolerZ + z),
          new THREE.Vector3(x + side * 41, FLOOR + 124, coolerZ + z),
        ];
        const bend = new THREE.CatmullRomCurve3(points, false, "centripetal");
        mb.add(new THREE.Mesh(new THREE.TubeGeometry(bend, 14, 2.7, 7, false), M.heatPipe));
        pipeEnds.push([x + side * 41, FLOOR + 123, coolerZ + z]);
      }
    }
    const fan = makeFan();
    fan.position.set(x, FLOOR + 78, coolerZ + 41);
    fan.scale.set(0.79, 0.79, 0.31);
    mb.add(fan);
    for (let i = 0; i < 8; i++) regulators.push([x - 36 + 10 * i, boardTop, coolerZ - 66]);
  }
  many(mb, 88, 0.8, 70, M.fins, fins);
  many(mb, 5.8, 2.1, 5.8, M.heatPipe, pipeEnds);
  many(mb, 1.55, 35, 133, M.dimm, dimms);
  many(mb, 2.25, 1.9, 124, M.steel, dimms.map(([x, y, z]) => [x, y + 33.1, z]));
  many(mb, 2.15, 8, 11.8, M.dimmChip, dimms.flatMap(([x, y, z]) =>
    Array.from({ length: 8 }, (_, i): Point => [x, y + 17, z - 50.75 + i * 14.5])
  ));
  many(mb, 2.65, 6, 4, M.latch, dimms.flatMap(([x, y, z]): Point[] => [[x, y, z + 69], [x, y, z - 69]]));
  many(mb, 7.5, 7, 9, M.psuCover, regulators);
  many(mb, 5, 1.8, 5, M.dimmChip, regulators.map(([x, y, z]) => [x, y, z - 9]));
}

function buildPowerSupplies(psus: THREE.Group) {
  const base = FLOOR + 2;
  const cover = base + 82;
  const rear = -D / 2;
  const vents: Point[] = [];
  const exhaust: Point[] = [];
  const screws: Point[] = [];
  for (const x of PSU_X) {
    const caseMesh = new THREE.Mesh(rbox(60, 82, 242, 1.8), M.psu);
    caseMesh.position.set(x, base + 41, -275);
    psus.add(caseMesh);
    outline(caseMesh, 0.12);
    part(psus, 56, 1.35, 229, M.psuCover, x, cover, -275, true);
    part(psus, 60.5, 81, 5, M.psuCover, x, base, rear + 2, true);
    part(psus, 57, 76, 2, M.psuCover, x, base + 3, -152.5, true);
    part(psus, 24, 2.2, 16, M.steel, x, cover + 1.35, -183);
    part(psus, 24, 3, 2.8, M.steel, x, cover + 1.35, -365);
    for (const dx of [-24, 24]) {
      for (const z of [-378, -170]) screws.push([x + dx, cover + 1.38, z]);
    }
    for (let i = 0; i < 13; i++) {
      for (const dx of [-12.5, 12.5]) vents.push([x + dx, cover + 1.3, -355 + 9.2 * i]);
    }
    for (let row = 0; row < 7; row++) {
      for (let i = 0; i < 5; i++) exhaust.push([x - 20 + 10 * i, base + 8 + row * 5, rear - 0.75]);
    }
    // Rear AC inlet, strain relief and pull handle.
    part(psus, 25, 16, 2.2, M.recess, x - 7, base + 49, rear - 0.6, true);
    for (const dx of [-6, 0, 6]) part(psus, 1.6, 4.2, 0.8, M.steel, x - 7 + dx, base + 55, rear - 1.9);
    part(psus, 4, 3.2, 1, M.status, x + 14, base + 62, rear - 1);
    for (const dx of [-9, 9]) part(psus, 3.6, 8, 8, M.steel, x + dx, base + 71, rear - 4);
    part(psus, 20, 4, 3.5, M.steel, x, base + 73, rear - 8.5);
  }
  many(psus, 20, 0.18, 2.6, M.recess, vents);
  many(psus, 7.6, 2.4, 0.65, M.recess, exhaust);
  many(psus, 3, 0.65, 3, M.steel, screws);

  // The GPU leads plug into a power distribution board at the front of the supplies.
  part(psus, 126, 2, 26, M.steel, 162, FLOOR + 58, POWER_Z);
  part(psus, 119, 1.8, 22, M.pcb, 162, FLOOR + 60, POWER_Z, true);
  const sockets: Point[] = PSU_X.flatMap((x) =>
    Array.from({ length: 4 }, (_, i): Point => [x - 21 + i * 14, FLOOR + 61.8, POWER_Z])
  );
  many(psus, 11, 8.2, 14, M.plug, sockets);
  many(psus, 8.5, 0.6, 11, M.recess, sockets.map(([x, y, z]) => [x, y + 8.2, z]));
}

function buildFanModels(rotors: THREE.Object3D[]) {
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
  const hubGeo = new THREE.CylinderGeometry(11, 11, 22, 28);
  const bolts: Point[] = [-33, 33].flatMap((x) => [-33, 33].map((y): Point => [x, y, 20]));
  return function makeFan() {
    const fan = new THREE.Group();
    const frame = new THREE.Mesh(frameGeo, M.fanFrame);
    fan.add(frame);
    outline(frame);
    many(fan, 4.2, 4.2, 1.2, M.steel, bolts);
    const rotor = new THREE.Group();
    const hub = new THREE.Mesh(hubGeo, M.hub);
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
    return fan;
  };
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

  const rotors: THREE.Object3D[] = [];
  const makeFan = buildFanModels(rotors);

  /* motherboard: two CPUs with tower coolers, 32 DIMMs */
  buildMotherboard(group("motherboard", [0, -200, -140]), makeFan);

  /* fan wall in front of the cards */
  const fans = group("fans", [0, 0, 260]);
  for (let i = 0; i < 5; i++) {
    const fan = makeFan();
    fan.position.set(-176 + i * 88, FLOOR + 56, 255);
    fans.add(fan);
  }

  buildPowerSupplies(group("psus", [0, 0, -320]));

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
    const tx = PSU_X[i < 4 ? 0 : 1] - 21 + k * 14;
    const socketTop = FLOOR + 70;
    part(power, 8, 4, 10, M.cableCollar, tx, socketTop, POWER_Z);
    part(power, 5, 3, 5, M.plug, tx, socketTop + 4, POWER_Z);
    part(power, 7, 2, 8, M.cableCollar, px, py + 7.5, pz);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, py + 7, pz),
      new THREE.Vector3(px, py + 20, pz - 12),
      new THREE.Vector3((px + tx) / 2, py + 23 - k * 2, (pz + POWER_Z) / 2 - 5),
      new THREE.Vector3(tx, socketTop + 19, POWER_Z + 2),
      new THREE.Vector3(tx, socketTop + 7, POWER_Z),
    ]);
    power.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 2.25, 7, false), M.cable));
  }

  /* chassis: floor, walls, front and rear panels (each from its own side) */
  const shellMat = (color = "#232428") => {
    const m = clay(color);
    m.transparent = true;
    return m;
  };
  const shellEdges = new THREE.LineBasicMaterial({ color: "#c8c8c8", transparent: true, opacity: 0.2, depthWrite: false });
  const shell: THREE.Mesh[] = [];
  const panelPiece = (parent: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number) => {
    const mesh = part(parent, w, h, d, shellMat(), x, y, z);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), shellEdges);
    edges.renderOrder = 1;
    mesh.add(edges);
    shell.push(mesh);
  };
  const panel = (key: ServerGroup, from: Point, w: number, h: number, d: number, x: number, y: number, z: number) => {
    const g = group(key, from);
    panelPiece(g, w, h, d, x, y, z);
    return g;
  };
  const floorG = group("chassis", [0, -160, 0]);
  shell.push(part(floorG, W, 2, D, shellMat("#19191c"), 0, FLOOR - 2, 0, true));
  const trim = shellMat("#45484f");
  const relief = shellMat("#141518");
  for (const side of [-1, 1]) {
    const wall = panel("chassis", [side * 170, 0, 0], 2, H, D, side * W / 2, FLOOR, 0);
    shell.push(part(wall, 4, 5, D - 36, trim, side * (W / 2 - 3), TOP - 6, 0));
    shell.push(many(wall, 1.6, 4.2, 7, trim, [-350, -220, -90, 90, 220, 350].map((z) => [side * (W / 2 + 1), FLOOR + 19, z])));
  }
  const front = panel("chassis", [0, 0, 220], W, H, 10, 0, FLOOR, D / 2 - 5);
  // front panel relief: intake vents and drive bays
  const frontZ = D / 2;
  const intake: Point[] = [];
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 6; col++) intake.push([40 + col * 31, FLOOR + 27 + row * 10, frontZ + 0.7]);
  }
  shell.push(many(front, 25, 3.1, 1.5, relief, intake));
  const drives: Point[] = Array.from({ length: 4 }, (_, i) => [-190 + i * 46, FLOOR + 50, frontZ + 0.9]);
  shell.push(many(front, 40, 70, 2, relief, drives));
  shell.push(many(front, 28, 5, 3.4, trim, drives.map(([x, y, z]) => [x, y + 9, z + 1.2])));
  shell.push(many(front, 22, 1.6, 1.1, relief, drives.map(([x, y, z]) => [x, y + 11, z + 3])));

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
  // The right-hand PSU bay is open so the two hot-swap modules can sit flush.
  const rear = group("chassis", [0, 0, -220]);
  const rearZ = -D / 2;
  panelPiece(rear, 323, H, 2, -62.5, FLOOR, rearZ + 1);
  panelPiece(rear, 125, H - 87, 2, 161.5, FLOOR + 87, rearZ + 1);
  const rearVent: Point[] = [];
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 13; col++) rearVent.push([-205 + col * 23, FLOOR + 62 + row * 8.1, rearZ - 0.35]);
  }
  shell.push(many(rear, 17.5, 2.9, 0.85, relief, rearVent));
  shell.push(part(rear, 182, 33, 1.2, trim, -119, FLOOR + 14, rearZ - 0.55));
  const network: Point[] = [-191, -166, -141].map((x) => [x, FLOOR + 22, rearZ - 1.35]);
  shell.push(many(rear, 19, 15, 1.7, relief, network));
  shell.push(many(rear, 8, 1.6, 0.9, trim, network.map(([x, y, z]) => [x, y + 11, z - 0.85])));
  shell.push(many(rear, 17, 6, 1.7, relief, [[-109, FLOOR + 22, rearZ - 1.35], [-109, FLOOR + 32, rearZ - 1.35]]));
  shell.push(part(rear, 26, 11, 1.6, relief, -68, FLOOR + 24, rearZ - 1.35));

  /* lid, last */
  const lid = panel("lid", [0, 320, 0], W + 4, 2.4, D + 4, 0, TOP, 0);
  shell.push(many(lid, 3.2, 1, D - 70, trim, [[-208, TOP + 2.4, 0], [208, TOP + 2.4, 0]]));
  shell.push(part(lid, 52, 2.2, 14, relief, 0, TOP + 2.4, 278));
  shell.push(part(lid, 37, 1.2, 5, trim, 0, TOP + 4.6, 278));

  return { parts, shell, shellEdges, rotors, leds };
}
