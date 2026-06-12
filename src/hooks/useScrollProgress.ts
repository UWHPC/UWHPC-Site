"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drives a scroll-linked animation over a tall "runway" section.
 * Writes progress (0..1 through the section) to the element as a
 * `--p` custom property once per animation frame, so all visual
 * work stays in CSS. Also mirrors a coarse end-of-runway flag to
 * `data-end` so CSS can toggle visibility/interactivity.
 *
 * Respects prefers-reduced-motion by pinning progress to 1
 * (final, fully-lit state) and reporting `reduced` to the caller.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);

    let raf = 0;
    const update = () => {
      raf = 0;
      let p = 1;
      if (!mq.matches) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      }
      el.style.setProperty("--p", p.toFixed(4));
      el.dataset.end = p > 0.86 ? "true" : "false";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, reduced };
}
