/// <reference types="bun" />
import { expect, test } from "bun:test";
import { CAMERA_KEYS, LEVELS, cameraAt, levelAt, overlaysAt, progress, xrayAt } from "./timeline";

const dist = (a: number[], b: number[]) => Math.hypot(...a.map((v, i) => v - b[i]));

test("progress clamps and is stateless", () => {
  expect(progress(-0.2, "transistors")).toBe(0);
  expect(progress(1.3, "title")).toBe(1);
  const a = progress(0.42, "casing");
  progress(0.9, "casing");
  expect(progress(0.42, "casing")).toBe(a);
});

test("camera hits every key exactly", () => {
  for (const k of CAMERA_KEYS) {
    const { position, target } = cameraAt(k.t);
    k.target.forEach((v, i) => expect(target[i]).toBeCloseTo(v, 4));
    k.offset.forEach((v, i) => expect(position[i] - target[i]).toBeCloseTo(v, 3));
  }
});

test("camera clamps outside [0,1]", () => {
  expect(cameraAt(-0.5)).toEqual(cameraAt(0));
  expect(cameraAt(1.5)).toEqual(cameraAt(1));
});

test("camera never flies after the bare board", () => {
  const ds: number[] = [];
  let travel = 0;
  let prev = cameraAt(0.36).target;
  for (let p = 0.36; p <= 1; p += 0.005) {
    const { position, target } = cameraAt(p);
    ds.push(dist(position, target));
    travel += dist(target, prev);
    prev = target;
  }
  expect(Math.max(...ds) / Math.min(...ds)).toBeLessThan(4);
  expect(travel).toBeLessThan(250);
});

test("camera is continuous (no jumps)", () => {
  for (let p = 0; p < 1; p += 0.001) {
    const a = cameraAt(p).position;
    const b = cameraAt(p + 0.001).position;
    expect(dist(a, b)).toBeLessThan(Math.hypot(...a) * 0.08 + 1);
  }
});

test("levels and copy", () => {
  expect(LEVELS.map((l) => l.name)).toEqual(["Transistor", "Die", "GPU", "Server"]);
  expect(LEVELS[0].note).toBe("TSMC 4N · 80 billion per die");
  expect(LEVELS[1].note).toBe("GH100 · 144 SMs, full die");
  expect(LEVELS[2].note).toBe("H200 · 141 GB HBM3e");
  expect(LEVELS[3].note).toBe("8 GPUs over NVLink");
  expect(LEVELS[2].callout).toBe("Maverick works here: irregular graph workloads on one GPU.");
  expect(LEVELS[3].callout).toBe("BATS starts here: beamforming split across GPUs.");
  expect(levelAt(0)).toBe(0);
  expect(levelAt(0.2)).toBe(1);
  expect(levelAt(0.35)).toBe(2);
  expect(levelAt(0.95)).toBe(3);
  expect(levelAt(-1)).toBe(0);
});

test("overlays: content is visible at both ends", () => {
  expect(overlaysAt(0).intro).toBe(1);
  expect(overlaysAt(1).title).toBe(1);
  expect(overlaysAt(1).endcap).toBe(1);
  expect(overlaysAt(1).hud).toBe(0);
});

test("x-ray: the shell stays solid until the lid is on, then turns see-through", () => {
  expect(xrayAt(0.84)).toEqual({ shell: 1, edges: 0.2 });
  const end = xrayAt(1);
  expect(end.shell).toBeCloseTo(0.2, 6);
  expect(end.edges).toBeCloseTo(0.75, 6);
  expect(xrayAt(-1)).toEqual(xrayAt(0));
});
