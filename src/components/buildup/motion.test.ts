/// <reference types="bun" />
import { expect, test } from "bun:test";
import { renderQuality, seat, stepProgress } from "./motion";

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

test("seat: starts at rest, lands exactly, overshoots a little on the way in", () => {
  expect(seat(0)).toBe(0);
  expect(seat(1)).toBe(1);
  expect(seat(-1)).toBe(0);
  expect(seat(2)).toBe(1);
  // eases out of rest
  expect(seat(0.01)).toBeLessThan(0.01);
  // a small overshoot (a part settling into place), never a bounce
  let peak = 0;
  for (let x = 0; x <= 1; x += 0.001) peak = Math.max(peak, seat(x));
  expect(peak).toBeGreaterThan(1.015);
  expect(peak).toBeLessThan(1.04);
});

test("idle: once settled the loop stops, while moving it keeps going", () => {
  const settled = stepProgress({ current: 0.5, target: 0.5, dt: 0.016, visible: true });
  expect(settled.render).toBe(true); // draws the final frame
  expect(settled.idle).toBe(true);
  expect(stepProgress({ current: 0.3, target: 0.32, dt: 0.016, visible: true }).idle).toBe(false);
});

test("constrained seating never travels past the backplate's mounted position", () => {
  let previous = 0;
  for (let i = 0; i <= 100; i++) {
    const position = seat(i / 100, false);
    expect(position).toBeGreaterThanOrEqual(previous);
    expect(position).toBeLessThanOrEqual(1);
    previous = position;
  }
  expect(previous).toBe(1);
});

test("render quality follows the current width, not the width at load", () => {
  // phone portrait: wide lens, capped resolution
  expect(renderQuality(375, 3, false)).toEqual({ fov: 48, pixelRatio: 1.5, mobile: true });
  // the same phone turned to landscape (812 wide) frames like a desktop
  expect(renderQuality(812, 3, false)).toEqual({ fov: 34, pixelRatio: 2, mobile: false });
  // a low-density screen is never upscaled
  expect(renderQuality(1440, 1, false).pixelRatio).toBe(1);
});

test("phones drop resolution while moving and restore it at rest", () => {
  expect(renderQuality(375, 3, true).pixelRatio).toBe(1);
  expect(renderQuality(375, 3, false).pixelRatio).toBe(1.5);
  // desktops keep full resolution throughout
  expect(renderQuality(1440, 2, true).pixelRatio).toBe(2);
});
