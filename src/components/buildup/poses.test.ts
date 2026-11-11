/// <reference types="bun" />
import { expect, test } from "bun:test";
import { CARD_PITCH, SERVER_FLOOR_Y, cardPose, slotPose } from "./poses";

test("hero card starts in its solo pose", () => {
  expect(cardPose(0)).toEqual({ position: [0, 0, 0], rotation: [0, 0, 0] });
  expect(cardPose(0.47)).toEqual({ position: [0, 0, 0], rotation: [0, 0, 0] });
});

test("hero card ends upright in slot 3", () => {
  const end = cardPose(1);
  const slot = slotPose(3);
  end.position.forEach((v, i) => expect(v).toBeCloseTo(slot.position[i], 6));
  expect(end.rotation[2]).toBeCloseTo(Math.PI / 2, 6);
});

test("slots: upright, PCIe edge 20 mm above the floor, 44 mm apart", () => {
  const a = slotPose(0);
  const b = slotPose(1);
  expect(b.position[0] - a.position[0]).toBe(CARD_PITCH);
  expect(a.rotation).toEqual([0, 0, Math.PI / 2]);
  // the PCIe edge is card-local x = -55.5, which upright maps to world y
  expect(a.position[1] - 55.5).toBeCloseTo(SERVER_FLOOR_Y + 20, 6);
});

test("hero card moves continuously while it turns upright", () => {
  for (let p = 0.48; p < 0.58; p += 0.001) {
    const a = cardPose(p).position;
    const b = cardPose(p + 0.001).position;
    expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeLessThan(6);
  }
});
