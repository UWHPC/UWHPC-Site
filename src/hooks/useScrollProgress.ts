"use client";

import { useEffect, useRef } from "react";

/**
 * Drives the chip-hero choreography. Raw scroll progress through the
 * runway is smoothed with an exponential damper (camera inertia) and
 * written to the section as `--p`. The camera path is segmented into
 * four MOVE windows separated by HOLDs; each move's eased local
 * progress is written as `--m1..--m4` so the CSS camera transform can
 * interpolate between fixed poses while everything else (blocks,
 * pathways) keys off `--p` directly.
 *
 * The sequence is scrubbed by the user's own scrolling, so it runs
 * regardless of prefers-reduced-motion; reduced motion only disables
 * the inertia smoothing (instant tracking) and, globally, the
 * self-running pulse effects.
 */

/** [start, end] of each camera MOVE in progress space; gaps are HOLDs.
    The camera is done by 0.68 — the entire last third of the runway
    is the frozen bird's-eye while the network finishes connecting. */
const MOVES: [number, number][] = [
  [0.06, 0.16], // A: glide in over the CPU cluster
  [0.28, 0.36], // B: pan across to the GPU side
  [0.46, 0.54], // C: pull back, half-flatten
  [0.6, 0.68], // D: settle into bird's-eye
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = (p: number) => {
      el.style.setProperty("--p", p.toFixed(4));
      MOVES.forEach(([a, b], i) => {
        el.style.setProperty(
          `--m${i + 1}`,
          smoothstep(clamp01((p - a) / (b - a))).toFixed(4)
        );
      });
      el.dataset.end = p > 0.92 ? "true" : "false";
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
      current += (target - current) * 0.16;
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
