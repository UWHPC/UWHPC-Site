"use client";

import { useEffect } from "react";

const LERP = 0.12;       // position smoothing per frame
const FRICTION = 0.82;   // velocity decay per frame after release
const MIN_VEL = 0.4;     // stop momentum below this px/frame
const COAST_DELAY = 60;  // ms after last wheel event before momentum kicks in

/**
 * Intercepts wheel events and applies momentum scrolling:
 * - while scrolling: exponential lerp to target (smooth)
 * - after release: velocity coasts with friction decay (trackpad feel)
 * Respects prefers-reduced-motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target = window.scrollY;
    let current = window.scrollY;
    let velocity = 0;
    let lastWheelTime = 0;
    let raf = 0;

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const clampScroll = (v: number) => Math.max(0, Math.min(maxScroll(), v));

    const tick = () => {
      raf = 0;
      const now = performance.now();

      // Coast: advance target by decaying velocity after user releases
      if (now - lastWheelTime > COAST_DELAY && Math.abs(velocity) > MIN_VEL) {
        velocity *= FRICTION;
        target = clampScroll(target + velocity);
      } else if (now - lastWheelTime > COAST_DELAY) {
        velocity = 0;
      }

      // Lerp current toward target
      current += (target - current) * LERP;
      if (Math.abs(target - current) < 0.5 && Math.abs(velocity) < MIN_VEL) {
        current = target;
      }

      window.scrollTo(0, current);

      if (current !== target || Math.abs(velocity) > MIN_VEL) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (reduced.matches) return;
      e.preventDefault();

      // Rolling average so fast flicks build velocity, slow ones don't over-shoot
      velocity = velocity * 0.4 + e.deltaY * 0.6;
      lastWheelTime = performance.now();

      target = clampScroll(target + e.deltaY);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
