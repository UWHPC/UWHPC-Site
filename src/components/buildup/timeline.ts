/**
 * Everything the build-up hero does is a pure function of scroll progress
 * p ∈ [0, 1]: when each step runs, where the camera is, which scale the
 * readout names, and how visible each overlay is. No three.js here, so
 * it is unit-tested on its own (timeline.test.ts).
 *
 * Units are millimetres. The world origin is the top of the hero card's
 * die in its solo pose.
 */

export type Step =
  | "transistors"
  | "toDie"
  | "toBoard"
  | "casing"
  | "join"
  | "bridges"
  | "switchboard"
  | "motherboard"
  | "fans"
  | "psus"
  | "chassis"
  | "lid"
  | "xray"
  | "title";

export const STEPS: Record<Step, [number, number]> = {
  transistors: [0, 0.1],
  toDie: [0.1, 0.26],
  toBoard: [0.26, 0.36],
  casing: [0.36, 0.48],
  join: [0.48, 0.58],
  bridges: [0.57, 0.62],
  switchboard: [0.6, 0.65],
  motherboard: [0.64, 0.71],
  fans: [0.7, 0.74],
  psus: [0.72, 0.76],
  chassis: [0.75, 0.81],
  lid: [0.8, 0.85],
  xray: [0.85, 0.9],
  title: [0.9, 0.97],
};

/** Height of the hero's scroll runway, in viewport heights. */
export const SCROLL_VH = 300;

export const clampP = (p: number) => Math.min(1, Math.max(0, p));
const phase = (p: number, start: number, duration: number) => clampP((p - start) / duration);
/** smootherstep: zero velocity and acceleration at both ends. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Eased 0 → 1 across a step's range; 0 before it, 1 after it. */
export function progress(p: number, step: Step): number {
  const [a, b] = STEPS[step];
  return ease(phase(p, a, b - a));
}

/* ---- camera ---------------------------------------------------------- */

export type Vec3 = [number, number, number];
export type CameraKey = { t: number; target: Vec3; offset: Vec3 };

export const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, target: [0, 0, 0], offset: [1.6, 2.4, 2.0] },
  { t: 0.1, target: [0, 0, 0], offset: [2.4, 3.6, 2.6] },
  { t: 0.26, target: [0, 0, 0], offset: [28, 40, 34] },
  { t: 0.36, target: [0, -4, 10], offset: [170, 210, 200] },
  { t: 0.48, target: [0, 10, 0], offset: [250, 230, 300] },
  { t: 0.6, target: [0, -40, 40], offset: [420, 360, 520] },
  { t: 0.85, target: [0, -60, 40], offset: [620, 500, 760] },
  { t: 1.0, target: [0, -60, 40], offset: [580, 440, 820] },
];

const len = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Camera between neighbouring keys: distance changes geometrically (so a
 * 10× pull-back feels even), the target moves in step with the zoom (a
 * small subject never slides out of frame while the camera is close), and
 * the viewing direction blends smoothly.
 */
export function cameraAt(pRaw: number): { position: Vec3; target: Vec3 } {
  const p = clampP(pRaw);
  let i = 0;
  while (i < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[i + 1].t) i++;
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[i + 1];
  const s = easeInOutSine(phase(p, a.t, b.t - a.t));

  const da = len(a.offset);
  const db = len(b.offset);
  const d = da * Math.pow(db / da, s);
  const w = Math.abs(db - da) < da * 0.05 ? s : clampP((d - da) / (db - da));
  const target: Vec3 = [0, 1, 2].map((k) => lerp(a.target[k], b.target[k], w)) as Vec3;

  const dir = [0, 1, 2].map((k) => lerp(a.offset[k] / da, b.offset[k] / db, s));
  const dl = Math.hypot(dir[0], dir[1], dir[2]);
  const position: Vec3 = [0, 1, 2].map((k) => target[k] + (dir[k] / dl) * d) as Vec3;
  return { position, target };
}

/* ---- scale readout ----------------------------------------------------- */

export type Level = { name: string; note: string; from: number; callout: string };

export const LEVELS: Level[] = [
  { name: "Transistor", note: "TSMC 4N · 80 billion per die", from: 0, callout: "" },
  { name: "Die", note: "GH100 · 144 SMs, full die", from: 0.12, callout: "" },
  {
    name: "GPU",
    note: "H200 · 141 GB HBM3e",
    from: 0.3,
    callout: "Maverick works here: irregular graph workloads on one GPU.",
  },
  {
    name: "Server",
    note: "8 GPUs over NVLink",
    from: 0.5,
    callout: "BATS starts here: beamforming split across GPUs.",
  },
];

export function levelAt(pRaw: number): number {
  const p = clampP(pRaw);
  let level = 0;
  LEVELS.forEach((l, i) => {
    if (p >= l.from) level = i;
  });
  return level;
}

/* ---- overlays ---------------------------------------------------------- */

export function overlaysAt(pRaw: number) {
  const p = clampP(pRaw);
  return {
    intro: 1 - ease(phase(p, 0.01, 0.05)),
    cue: 1 - phase(p, 0.02, 0.03),
    hud: phase(p, 0.04, 0.04) * (1 - phase(p, 0.86, 0.03)),
    title: progress(p, "title"),
    endcap: ease(phase(p, 0.92, 0.06)),
  };
}
