"use client";

import { useEffect, useRef } from "react";

/**
 * Drives the chip-hero choreography. Raw scroll progress through the
 * runway is smoothed with an exponential damper (camera inertia) and
 * written to the section as `--p`. The camera is ONE continuous swoop:
 * its eased progress over [SWOOP_START, SWOOP_END] is written as `--m`,
 * after which the view is frozen at bird's-eye while the remaining
 * scroll floods the channel network.
 *
 * The sequence is scrubbed by the user's own scrolling, so it runs
 * regardless of prefers-reduced-motion; reduced motion only disables
 * the inertia smoothing (instant tracking) and, globally, the
 * self-running pulse effects.
 */

const SWOOP_START = 0.05;
const SWOOP_END = 0.7;

/** smootherstep — zero first and second derivatives at the ends. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = (p: number) => {
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty(
        "--m",
        ease(clamp01((p - SWOOP_START) / (SWOOP_END - SWOOP_START))).toFixed(4)
      );
      el.dataset.end = p > 0.82 ? "true" : "false";
    };

    const targetP = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return total > 0 ? clamp01(-rect.top / total) : 1;
    };

    let target = targetP();
    let current = target;
    let raf = 0;
    apply(current);

    const tick = () => {
      raf = 0;
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.0006) current = target;
      apply(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = targetP();
      if (reduced.matches) {
        current = target;
        apply(current);
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
