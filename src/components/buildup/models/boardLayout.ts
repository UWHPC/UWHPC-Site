/**
 * Where everything sits on the GPU board, in card-local millimetres
 * (x across the card, z along it; the die is at x = z = 0). Pure data, so
 * the 3D parts (gpu.ts) and the silkscreen (textures.ts) are drawn from the
 * same numbers and a test checks nothing overlaps (boardLayout.test.ts).
 *
 * Modelled on a datacentre PCIe card: the GPU package in the middle with
 * the cooler's four mounting holes around it; the core supply as a dense
 * block of phases between the package and the power input; a small memory
 * supply on the far side; PCIe x16 fingers on one long edge, three NVLink
 * connectors on the other; the housekeeping parts (BIOS flash, clock,
 * monitors, status LEDs) at the far end.
 */

export const BOARD = { width: 111, length: 267, centerZ: -18, minZ: -151.5, maxZ: 115.5 };
/** Height above the board that parts under the fin stack must stay below. */
export const FIN_CLEARANCE = 6.2;

export type Footprint = {
  ref: string;
  x: number;
  z: number;
  /** size across (x) and along (z) the card, and height above the board */
  w: number;
  d: number;
  h: number;
  /** allowed above the fin clearance (it sits where the fins are cut away) */
  tall?: boolean;
  kind: string;
};

export type Phase = { rail: "core" | "memory"; stage: [number, number]; choke: [number, number] };

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => from + i * step);

/* ---- package ---------------------------------------------------------- */

export const SUBSTRATE = 58;
/** The cooler screws through these four holes into the vapour chamber. */
export const COOLER_MOUNTS: [number, number][] = [-36, 36].flatMap((x) => [-36, 36].map((z): [number, number] => [x, z]));
/** Board-end holes for the backplate standoffs. */
export const BOARD_MOUNTS: [number, number][] = [-46, 46].flatMap((x) => [BOARD.centerZ - 126, BOARD.centerZ + 126].map((z): [number, number] => [x, z]));
export const HOLE_KEEPOUT = 6.4;

/* ---- power ------------------------------------------------------------ */

const PHASE_X = range(-40, 40, 10);
const MEMORY_X = [-40, -30, 30, 40];

/** Two rows of core phases mirrored about a shared row of output capacitors. */
export const phases: Phase[] = [
  ...PHASE_X.map((x): Phase => ({ rail: "core", stage: [x, -45], choke: [x, -54.5] })),
  ...PHASE_X.map((x): Phase => ({ rail: "core", stage: [x, -81], choke: [x, -71.5] })),
  ...MEMORY_X.map((x): Phase => ({ rail: "memory", stage: [x, 43], choke: [x, 52.5] })),
];
export const STAGE = { w: 5, d: 6, h: 0.9 };
export const CHOKE = { w: 8, d: 8, h: 5.5 };

/** Solid polymer capacitors: the shared output row, the input row, the memory row. */
export const polymerCaps: [number, number][] = [
  ...PHASE_X.map((x): [number, number] => [x, -63]),
  ...PHASE_X.map((x): [number, number] => [x, -110]),
  ...MEMORY_X.map((x): [number, number] => [x, 61]),
];
export const POLYMER = { w: 7.3, d: 4.3, h: 1.9 };

/** Input MLCCs beside each lower-row phase. */
export const inputCaps: [number, number][] = PHASE_X.flatMap((x) => [[x - 2, -88.5], [x + 2, -88.5]] as [number, number][]);
export const MLCC = { w: 1.6, d: 3.2, h: 1.6 };

/** Bypass capacitors in rows beside the package. */
export const bypass: [number, number][] = range(-24.7, 24.7, 3.8).flatMap((x) =>
  [-36, 36, 42].map((z): [number, number] => [x, z])
);
export const BYPASS = { w: 2.4, d: 1.25, h: 0.7 };

/** Large input cans by the power connector, and the connector itself. */
export const BULK = { x: range(-28, 28, 8), z: BOARD.centerZ - 112, r: 3, h: 9 };
export const POWER_INPUT = { x: 30, z: BOARD.centerZ - 126, w: 22, d: 9, h: 10 };

/* ---- small parts ------------------------------------------------------ */

export type Chip = { ref: string; kind: "qfn" | "soic" | "crystal" | "led"; x: number; z: number; w: number; d: number; h: number; label?: string };
export const chips: Chip[] = [
  { ref: "U2", kind: "qfn", x: -20, z: -97, w: 6, d: 6, h: 0.9, label: "PWM" },
  { ref: "U3", kind: "qfn", x: 20, z: -97, w: 6, d: 6, h: 0.9, label: "PWM" },
  { ref: "U4", kind: "soic", x: -30, z: 78, w: 4, d: 5, h: 1.5, label: "BIOS" },
  { ref: "U5", kind: "qfn", x: -16, z: 77, w: 3, d: 3, h: 0.8 },
  { ref: "U6", kind: "qfn", x: -4, z: 77, w: 4, d: 4, h: 0.8 },
  { ref: "Y1", kind: "crystal", x: 8, z: 77, w: 3.2, d: 2.5, h: 0.8 },
  { ref: "U7", kind: "qfn", x: 18, z: 77, w: 2, d: 2, h: 0.75 },
  { ref: "D1", kind: "led", x: 46, z: 91, w: 1.6, d: 0.8, h: 0.6 },
  { ref: "D2", kind: "led", x: 46, z: 94, w: 1.6, d: 0.8, h: 0.6 },
  { ref: "D3", kind: "led", x: 46, z: 97, w: 1.6, d: 0.8, h: 0.6 },
];
/** Small 0402 passives around the controllers and housekeeping chips. */
export const smallPassives: [number, number][] = [
  ...range(-12, -6, 2).map((x): [number, number] => [x, -97]),
  ...range(6, 12, 2).map((x): [number, number] => [x, -97]),
  ...range(-26, 22, 4).map((x): [number, number] => [x, 84]),
];
export const PASSIVE = { w: 1, d: 0.5, h: 0.35 };

/** Serial label (printed artwork; flat). */
export const LABEL = { x: -24, z: 98, w: 26, d: 10 };

/* ---- edge connectors -------------------------------------------------- */

export type Finger = { z: number; short: boolean };
const FRONT_START = BOARD.centerZ - 39; // first PCIe contact
/** PCIe x16 on the -x edge: pins 1-11, the key notch, then pins 12-82. */
export const pcie = {
  edge: -BOARD.width / 2,
  length: 4,
  front: range(0, 10, 1).map((i): Finger => ({ z: FRONT_START + i, short: false })),
  back: range(0, 70, 1).map((i): Finger => ({ z: FRONT_START + 12.4 + i, short: [5, 20, 37, 70].includes(i) })),
  notch: [FRONT_START + 10.55, FRONT_START + 11.85] as [number, number],
  notchDepth: 4.6,
};

/** Three NVLink connectors on the +x edge, each split by a key notch. */
export const nvlink = [-40, -6, 28].map((center) => ({
  center,
  notch: 1.2,
  fingers: range(0, 8, 1).flatMap((i) => [center - 1.1 - i, center + 1.1 + i]).sort((a, b) => a - b),
}));
export const NVLINK = { edge: BOARD.width / 2, length: 3.4, notchDepth: 3 };

/* ---- every footprint, for the overlap test and the silkscreen --------- */

export function footprints(): Footprint[] {
  const f: Footprint[] = [];
  f.push({ ref: "U1", kind: "package", x: 0, z: 0, w: SUBSTRATE, d: SUBSTRATE, h: 2.4 });
  COOLER_MOUNTS.forEach(([x, z], i) => f.push({ ref: `H${i + 1}`, kind: "hole", x, z, w: HOLE_KEEPOUT, d: HOLE_KEEPOUT, h: 0 }));
  BOARD_MOUNTS.forEach(([x, z], i) => f.push({ ref: `H${i + 5}`, kind: "hole", x, z, w: HOLE_KEEPOUT, d: HOLE_KEEPOUT, h: 0 }));
  phases.forEach((p, i) => {
    f.push({ ref: `Q${101 + i}`, kind: "stage", x: p.stage[0], z: p.stage[1], ...STAGE });
    f.push({ ref: `L${101 + i}`, kind: "choke", x: p.choke[0], z: p.choke[1], ...CHOKE });
  });
  polymerCaps.forEach(([x, z], i) => f.push({ ref: `C${201 + i}`, kind: "polymer", x, z, ...POLYMER }));
  inputCaps.forEach(([x, z], i) => f.push({ ref: `C${301 + i}`, kind: "mlcc", x, z, ...MLCC }));
  bypass.forEach(([x, z], i) => f.push({ ref: `C${401 + i}`, kind: "bypass", x, z, ...BYPASS }));
  smallPassives.forEach(([x, z], i) => f.push({ ref: `R${101 + i}`, kind: "passive", x, z, ...PASSIVE }));
  BULK.x.forEach((x, i) =>
    f.push({ ref: `C${101 + i}`, kind: "bulk", x, z: BULK.z, w: BULK.r * 2, d: BULK.r * 2, h: BULK.h, tall: true })
  );
  f.push({ ref: "J1", kind: "power", ...POWER_INPUT, tall: true });
  chips.forEach((c) => f.push({ ref: c.ref, kind: c.kind, x: c.x, z: c.z, w: c.w, d: c.d, h: c.h }));
  f.push({ ref: "LBL1", kind: "label", ...LABEL, h: 0.05 });
  const pz = [...pcie.front, ...pcie.back].map((p) => p.z);
  f.push({
    ref: "P1", kind: "edge", x: pcie.edge + pcie.length / 2, z: (pz[0] + pz[pz.length - 1]) / 2,
    w: pcie.length, d: pz[pz.length - 1] - pz[0] + 1, h: 0,
  });
  nvlink.forEach((c, i) =>
    f.push({ ref: `P${i + 2}`, kind: "edge", x: NVLINK.edge - NVLINK.length / 2, z: c.center, w: NVLINK.length, d: 20, h: 0 })
  );
  return f;
}
