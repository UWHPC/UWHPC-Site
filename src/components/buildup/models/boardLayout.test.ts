/// <reference types="bun" />
import { expect, test } from "bun:test";
import { BOARD, FIN_CLEARANCE, footprints, nvlink, pcie, phases } from "./boardLayout";

const overlap = (a: { x: number; z: number; w: number; d: number }, b: typeof a, gap = 0.15) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + gap * 2 && Math.abs(a.z - b.z) * 2 < a.d + b.d + gap * 2;

test("no two parts on the board overlap", () => {
  const all = footprints();
  const clashes: string[] = [];
  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++) if (overlap(all[i], all[j])) clashes.push(`${all[i].ref} × ${all[j].ref}`);
  expect(clashes).toEqual([]);
});

test("every part sits on the board", () => {
  const outside = footprints().filter(
    (f) =>
      f.x - f.w / 2 < -BOARD.width / 2 ||
      f.x + f.w / 2 > BOARD.width / 2 ||
      f.z - f.d / 2 < BOARD.minZ ||
      f.z + f.d / 2 > BOARD.maxZ
  );
  expect(outside.map((f) => f.ref)).toEqual([]);
});

test("everything under the fin stack clears it", () => {
  const tooTall = footprints().filter((f) => !f.tall && f.h > FIN_CLEARANCE);
  expect(tooTall.map((f) => f.ref)).toEqual([]);
});

test("refdes are unique", () => {
  const refs = footprints().map((f) => f.ref);
  expect(new Set(refs).size).toBe(refs.length);
});

test("PCIe x16 edge: 11 + 71 contacts at 1 mm pitch either side of the key notch", () => {
  expect(pcie.front.length).toBe(11);
  expect(pcie.back.length).toBe(71);
  const all = [...pcie.front, ...pcie.back].map((f) => f.z);
  for (let i = 1; i < pcie.front.length; i++) expect(all[i] - all[i - 1]).toBeCloseTo(1, 6);
  // the notch sits between the two groups
  expect(pcie.notch[0]).toBeGreaterThan(pcie.front[10].z);
  expect(pcie.notch[1]).toBeLessThan(pcie.back[0].z);
  // presence-detect pins are shorter, so they mate last
  expect([...pcie.front, ...pcie.back].filter((f) => f.short).length).toBeGreaterThanOrEqual(2);
});

test("three NVLink connectors, each keyed", () => {
  expect(nvlink.length).toBe(3);
  for (const c of nvlink) {
    expect(c.fingers.length).toBeGreaterThan(16);
    expect(c.fingers.every((z) => Math.abs(z - c.center) > c.notch / 2)).toBe(true);
  }
});

test("the core supply is a dense block of phases between the package and the power input", () => {
  const core = phases.filter((p) => p.rail === "core");
  expect(core.length).toBeGreaterThanOrEqual(16);
  expect(core.every((p) => p.choke[1] < -29 && p.choke[1] > -126)).toBe(true);
  expect(phases.filter((p) => p.rail === "memory").length).toBe(4);
});
