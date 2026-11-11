/// <reference types="bun" />
import { expect, test } from "bun:test";
import { stepProgress } from "./motion";

test("off-screen frames never render (final review: Important 1)", () => {
  expect(stepProgress({ current: 0.2, target: 0.21, dt: 0.016, visible: false }).render).toBe(false);
  expect(stepProgress({ current: 0.2, target: 0.21, dt: 0.016, visible: true }).render).toBe(true);
});

test("a big jump lands on the right frame at once (final review: Important 2)", () => {
  // e.g. scroll restored to p = 0.7 after the hook measured p = 0
  expect(stepProgress({ current: 0, target: 0.7, dt: 0.016, visible: true }).current).toBe(0.7);
});

test("ordinary scrolling still eases", () => {
  const next = stepProgress({ current: 0.3, target: 0.32, dt: 0.016, visible: true }).current;
  expect(next).toBeGreaterThan(0.3);
  expect(next).toBeLessThan(0.32);
});

test("settles exactly on the target", () => {
  expect(stepProgress({ current: 0.4999, target: 0.5, dt: 0.016, visible: true }).current).toBe(0.5);
});
