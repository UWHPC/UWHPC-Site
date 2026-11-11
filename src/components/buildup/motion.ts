/**
 * One frame of the hero's scroll smoothing, as a pure function so it is
 * tested (motion.test.ts). Ordinary scrolling eases toward the target
 * (camera inertia); a jump bigger than JUMP — scroll restored after a
 * reload, a hash link, End — lands at once instead of replaying the whole
 * build. Frames off screen never render, and once progress settles the
 * loop draws one last frame and stops until the next scroll.
 */

const DAMPING = 6; // per second
const JUMP = 0.15; // of the runway
const SETTLE = 0.0002;

export function stepProgress(s: { current: number; target: number; dt: number; visible: boolean }): {
  current: number;
  render: boolean;
  idle: boolean;
} {
  let current = s.current;
  if (Math.abs(s.target - current) > JUMP) current = s.target;
  else current += (s.target - current) * (1 - Math.exp(-DAMPING * s.dt));
  if (Math.abs(s.target - current) < SETTLE) current = s.target;
  return { current, render: s.visible, idle: current === s.target };
}

/**
 * Easing for a part flying into place: it leaves at rest, overshoots by
 * about 3%, and settles exactly on 1, so things seat instead of stopping
 * dead. (An ease-out-back over a smoothstep.)
 */
export function seat(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const s = x * x * (3 - 2 * x);
  const back = 0.9; // overshoot strength
  const u = s - 1;
  return 1 + (back + 1) * u * u * u + back * u * u;
}
