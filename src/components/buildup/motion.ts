/**
 * One frame of the hero's scroll smoothing, as a pure function so it is
 * tested (motion.test.ts). Ordinary scrolling eases toward the target
 * (camera inertia); a jump bigger than JUMP — scroll restored after a
 * reload, a hash link, End — lands at once instead of replaying the whole
 * build. Frames off screen never render.
 */

const DAMPING = 6; // per second
const JUMP = 0.15; // of the runway
const SETTLE = 0.0002;

export function stepProgress(s: { current: number; target: number; dt: number; visible: boolean }): {
  current: number;
  render: boolean;
} {
  let current = s.current;
  if (Math.abs(s.target - current) > JUMP) current = s.target;
  else current += (s.target - current) * (1 - Math.exp(-DAMPING * s.dt));
  if (Math.abs(s.target - current) < SETTLE) current = s.target;
  return { current, render: s.visible };
}
