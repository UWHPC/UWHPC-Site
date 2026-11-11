import { progress, type Vec3 } from "./timeline";

/**
 * Where cards sit in the finished server, and how the hero card gets there.
 * Pure maths (no three.js) so it is unit-tested (poses.test.ts).
 *
 * Card-local frame: lying, components +y, PCIe edge at x = -55.5, long axis
 * z, die top at the origin, board centre 18 mm toward -z. Upright means a
 * +90° turn about z: components face -x and the PCIe edge points down.
 */

export const SERVER_FLOOR_Y = -140;
export const CARD_PITCH = 44;
export const HERO_SLOT = 3;
const PCIE_EDGE = 55.5; // card-local distance from the die axis to the PCIe edge
const CARD_CENTRE_Z = 60; // board centre in the server
const BOARD_OFFSET = 18; // die-to-board-centre along z

export type Pose = { position: Vec3; rotation: Vec3 };

export function slotPose(i: number): Pose {
  return {
    position: [-154 + i * CARD_PITCH, SERVER_FLOOR_Y + 20 + PCIE_EDGE, CARD_CENTRE_Z + BOARD_OFFSET],
    rotation: [0, 0, Math.PI / 2],
  };
}

/** The hero card turns upright and moves into its slot in the first 60% of "join". */
export function cardPose(p: number): Pose {
  const raw = Math.min(1, progress(p, "join") / 0.6);
  const t = raw * raw * (3 - 2 * raw);
  const end = slotPose(HERO_SLOT);
  return {
    position: end.position.map((v) => v * t + 0) as Vec3, // + 0 turns -0 into 0
    rotation: [0, 0, end.rotation[2] * t + 0],
  };
}
