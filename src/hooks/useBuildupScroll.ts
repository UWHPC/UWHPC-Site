"use client";

import { useEffect, useRef } from "react";
import type { BuildupScene } from "@/components/buildup/scene";
import { LEVELS, clampP, levelAt, overlaysAt } from "@/components/buildup/timeline";

/**
 * Drives the build-up hero. Scroll progress p through the runway is
 * damped (camera inertia); each frame updates the DOM overlays and hands p
 * to the three.js scene. The scene is imported after first paint, so the
 * headline never waits on it; if WebGL or the import fails the overlays
 * still work and `data-scene-ready` becomes "failed".
 */

const DAMPING = 6; // per second

export function useBuildupScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const q = <E extends Element>(s: string) => el.querySelector<E>(s);
    const sticky = q<HTMLElement>(".chip-sticky");
    const canvas = q<HTMLCanvasElement>(".hero-canvas");
    const intro = q<HTMLElement>(".chip-intro");
    const cue = q<HTMLElement>(".chip-cue");
    const title = q<HTMLElement>(".chip-title");
    const endcap = q<HTMLElement>(".chip-endcap");
    const rail = q<HTMLElement>(".chip-rail-fill");
    const hud = q<HTMLElement>(".chip-hud");
    const hudRows = Array.from(el.querySelectorAll<HTMLElement>(".chip-hud [data-level]"));
    const callout = q<HTMLElement>(".chip-hud-callout");

    const set = (node: HTMLElement | null, prop: string, value: string) => {
      if (node && node.style.getPropertyValue(prop) !== value) node.style.setProperty(prop, value);
    };

    let scene: BuildupScene | null = null;
    let disposed = false;
    let runwayStart = 0;
    let runwayLength = 1;
    let level = -1;
    let endVisible = false;

    const applyOverlays = (p: number) => {
      const o = overlaysAt(p);
      set(intro, "opacity", (o.intro).toFixed(4));
      set(intro, "transform", `translate3d(0, ${(-48 * (1 - o.intro)).toFixed(2)}px, 0)`);
      set(cue, "opacity", o.cue.toFixed(4));
      set(rail, "transform", `scaleY(${p.toFixed(4)})`);
      set(title, "opacity", o.title.toFixed(4));
      set(title, "transform", `translate3d(0, ${(18 * (1 - o.title)).toFixed(2)}px, 0)`);
      set(endcap, "opacity", o.endcap.toFixed(4));
      set(endcap, "transform", `translate3d(0, ${(20 * (1 - o.endcap)).toFixed(2)}px, 0)`);
      set(hud, "opacity", o.hud.toFixed(3));
      set(hud, "visibility", o.hud > 0.01 ? "visible" : "hidden");

      const next = levelAt(p);
      if (next !== level) {
        level = next;
        hudRows.forEach((row) => row.toggleAttribute("data-active", Number(row.dataset.level) === level));
        if (callout) {
          callout.textContent = LEVELS[level].callout;
          callout.style.visibility = LEVELS[level].callout ? "visible" : "hidden";
        }
      }
      const showEnd = o.endcap > 0.02;
      if (showEnd !== endVisible) {
        endVisible = showEnd;
        el.dataset.end = String(showEnd);
      }
    };

    const targetP = () => clampP((window.scrollY - runwayStart) / runwayLength);
    const measure = () => {
      const r = el.getBoundingClientRect();
      runwayStart = r.top + window.scrollY;
      runwayLength = Math.max(1, r.height - window.innerHeight);
    };
    const sizeScene = () => {
      if (scene && sticky) scene.resize(sticky.clientWidth, sticky.clientHeight);
    };

    measure();
    let target = targetP();
    let current = target;
    applyOverlays(current);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      current += (target - current) * (1 - Math.exp(-DAMPING * dt));
      if (Math.abs(target - current) < 0.0002) current = target;
      applyOverlays(current);
      scene?.update(current, (now - t0) / 1000);
      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onScroll = () => {
      target = targetP();
      start();
    };
    const onResize = () => {
      measure();
      sizeScene();
      onScroll();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    start();

    if (canvas) {
      import("@/components/buildup/scene")
        .then(({ createBuildupScene }) => {
          if (disposed) return;
          scene = createBuildupScene(canvas, { mobile: window.matchMedia("(max-width: 767px)").matches });
          sizeScene();
          scene.update(current, 0);
          el.dataset.sceneReady = "true";
          start();
        })
        .catch(() => {
          el.dataset.sceneReady = "failed";
        });
    }

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      scene?.dispose();
    };
  }, []);

  return ref;
}
