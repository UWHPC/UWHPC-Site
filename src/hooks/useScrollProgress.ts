"use client";

import { useEffect, useRef } from "react";

/**
 * Drives the chip-hero choreography. Raw scroll progress through the
 * runway is smoothed with an exponential damper (camera inertia), then
 * applied directly to the few active layers. This avoids cascading a
 * changing custom property through the full SVG on every frame.
 *
 * The sequence is scrubbed by the user's own scrolling, so it runs
 * regardless of prefers-reduced-motion; reduced motion only disables
 * the inertia smoothing (instant tracking) and, globally, the
 * self-running pulse effects.
 */

const SWOOP_START = 0.05;
const SWOOP_END = 0.64;
const TITLE_START = 0.68;
const TITLE_END = 0.84;
const ENDCAP_START = 0.75;
const ENDCAP_END = 0.89;
const PULSE_START = 0.24;

/* Matches the old 0.11-per-frame feel at 60 Hz, but remains consistent
   on 90/120/144 Hz displays and after an interrupted frame. */
const DAMPING = 7;
const SETTLE_EPSILON = 0.0006;

/** smootherstep — zero first and second derivatives at the ends. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const phase = (p: number, start: number, duration: number) =>
  clamp01((p - start) / duration);

type AnimatedTarget = {
  element: SVGElement;
  start: number;
  duration: number;
};

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = document.querySelector<HTMLElement>(".chip-nav");
    const scene = el.querySelector<HTMLElement>(".chip-die3d");
    const titleElement = el.querySelector<HTMLElement>(".chip-title");
    const endcapElement = el.querySelector<HTMLElement>(".chip-endcap");
    const cueElement = el.querySelector<HTMLElement>(".chip-cue");
    const gridElement = el.querySelector<HTMLElement>(".blueprint-grid");
    const svgElement = el.querySelector<SVGElement>(".chip-svg");
    const sideElements = el.querySelectorAll<HTMLElement>(".chip-side");
    const edgeElement = el.querySelector<SVGElement>(".chip-die-edge");
    const edgeGlowElement = el.querySelector<SVGElement>(".chip-die-edge-glow");

    const targets = (selector: string): AnimatedTarget[] =>
      Array.from(el.querySelectorAll<SVGElement>(selector), (element) => ({
        element,
        start: Number(element.dataset.chipStart),
        duration: Number(element.dataset.chipDuration),
      }));

    const blockTargets = targets(".chip-block-lit");
    const traceTargets = targets(".chip-trace");
    const pulseTargets = targets(".chip-trace-pulse");

    const setStyle = (
      element: HTMLElement | SVGElement | null,
      property: string,
      value: string
    ) => {
      if (element && element.style.getPropertyValue(property) !== value) {
        element.style.setProperty(property, value);
      }
    };

    let runwayStart = 0;
    let runwayLength = 1;
    let endVisible = false;
    let pulsesActive = false;
    let scrolling = false;

    const setScrolling = (next: boolean) => {
      if (next === scrolling) return;
      scrolling = next;
      el.dataset.scrolling = String(scrolling);
    };

    const apply = (p: number) => {
      const title = ease(
        phase(p, TITLE_START, TITLE_END - TITLE_START)
      );
      const endcap = ease(
        phase(p, ENDCAP_START, ENDCAP_END - ENDCAP_START)
      );
      const motion = ease(phase(p, SWOOP_START, SWOOP_END - SWOOP_START));
      const fade = phase(p, 0.02, 0.3);
      const edge = phase(p, 0.04, 0.22);
      const cue = phase(p, 0.05, 0.1);

      setStyle(
        scene,
        "transform",
        `translate3d(${(8 * (1 - motion)).toFixed(3)}%, ${(14 - 6 * motion).toFixed(3)}%, 0) rotateX(${(70 * (1 - motion)).toFixed(3)}deg) rotateZ(${(-18 * (1 - motion)).toFixed(3)}deg) scale(${(2.1 - 1.15 * motion).toFixed(4)})`
      );
      setStyle(titleElement, "opacity", title.toFixed(4));
      setStyle(
        titleElement,
        "transform",
        `translate3d(0, ${(18 * (1 - title)).toFixed(3)}px, 0)`
      );
      setStyle(endcapElement, "opacity", endcap.toFixed(4));
      setStyle(
        endcapElement,
        "transform",
        `translate3d(0, ${(20 * (1 - endcap)).toFixed(3)}px, 0)`
      );
      setStyle(cueElement, "opacity", (1 - cue).toFixed(4));
      setStyle(gridElement, "opacity", title.toFixed(4));
      setStyle(nav, "opacity", title.toFixed(4));

      const faceOpacity = (0.22 + 0.78 * fade).toFixed(4);
      setStyle(svgElement, "opacity", faceOpacity);
      sideElements.forEach((side) => setStyle(side, "opacity", faceOpacity));
      setStyle(edgeElement, "stroke-dashoffset", (1 - edge).toFixed(4));
      setStyle(edgeElement, "opacity", (0.08 + 0.92 * edge).toFixed(4));
      setStyle(edgeGlowElement, "stroke-dashoffset", (1 - edge).toFixed(4));
      setStyle(edgeGlowElement, "opacity", (0.02 + 0.18 * edge).toFixed(4));

      blockTargets.forEach(({ element, start, duration }) => {
        setStyle(element, "opacity", phase(p, start, duration).toFixed(4));
      });
      traceTargets.forEach(({ element, start, duration }) => {
        const progress = phase(p, start, duration);
        setStyle(element, "stroke-dashoffset", (1 - progress).toFixed(4));
        setStyle(element, "opacity", (0.75 * progress).toFixed(4));
      });
      pulseTargets.forEach(({ element, start, duration }) => {
        setStyle(element, "opacity", (0.35 * phase(p, start, duration)).toFixed(4));
      });

      const nextEndVisible = endcap > 0.02;
      if (nextEndVisible !== endVisible) {
        endVisible = nextEndVisible;
        el.dataset.end = String(endVisible);
      }

      const nextPulsesActive = p >= PULSE_START;
      if (nextPulsesActive !== pulsesActive) {
        pulsesActive = nextPulsesActive;
        el.dataset.pulses = String(pulsesActive);
      }
    };

    const targetP = () => {
      return clamp01((window.scrollY - runwayStart) / runwayLength);
    };

    const measureRunway = () => {
      const rect = el.getBoundingClientRect();
      runwayStart = rect.top + window.scrollY;
      runwayLength = Math.max(1, rect.height - window.innerHeight);
    };

    measureRunway();

    let target = targetP();
    let current = target;
    let raf = 0;
    let measureRaf = 0;
    let lastTime = performance.now();
    apply(current);

    const tick = (now: number) => {
      raf = 0;
      const deltaSeconds = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      const damping = 1 - Math.exp(-DAMPING * deltaSeconds);
      lastTime = now;

      current += (target - current) * damping;
      if (Math.abs(target - current) < SETTLE_EPSILON) current = target;
      apply(current);
      if (current !== target) {
        raf = requestAnimationFrame(tick);
      } else {
        setScrolling(false);
      }
    };

    const requestTick = () => {
      if (raf) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = targetP();
      if (reduced.matches) {
        current = target;
        apply(current);
        setScrolling(false);
        return;
      }
      setScrolling(true);
      requestTick();
    };

    const onResize = () => {
      if (measureRaf) return;
      measureRaf = requestAnimationFrame(() => {
        measureRaf = 0;
        measureRunway();
        onScroll();
      });
    };

    const onMotionPreferenceChange = () => {
      if (!reduced.matches) return;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      current = target;
      apply(current);
      setScrolling(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", onMotionPreferenceChange);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onMotionPreferenceChange);
      resizeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (measureRaf) cancelAnimationFrame(measureRaf);
      nav?.style.removeProperty("opacity");
    };
  }, []);

  return ref;
}
