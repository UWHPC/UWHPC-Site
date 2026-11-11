"use client";

import { useEffect, useRef } from "react";

/**
 * BATS, drawn from its spec (§2.1–2.3): a uniform linear array of S
 * sensors at half-wavelength spacing forms B beams from the same data.
 * Each lobe is the delay-and-sum array factor
 *
 *   AF(φ) = | Σᵢ e^{jπ·i·(sin φ − sin θ_b)} | / S
 *
 * plotted on a dB scale (floor −30 dB) while the steering angles θ_b
 * drift. Per frequency channel this is the complex GEMM Y = W·X.
 *
 * Paths are rewritten in place each frame; it runs only while visible
 * (Paths update in place each frame.)
 */

const S = 16;
const BEAMS = [
  { base: -42, amp: 10, rate: 0.23, phase: 0 },
  { base: 2, amp: 14, rate: 0.17, phase: 2.1 },
  { base: 38, amp: 9, rate: 0.29, phase: 4.2 },
];
const W = 420;
const H = 250;
const CX = W / 2;
const CY = 218;
const R = 182;
const FLOOR_DB = -30;
const STEPS = 180;

const rad = (d: number) => (d * Math.PI) / 180;

function arrayFactor(phi: number, theta: number) {
  const k = Math.PI * (Math.sin(phi) - Math.sin(theta));
  let re = 0;
  let im = 0;
  for (let i = 0; i < S; i++) {
    re += Math.cos(k * i);
    im += Math.sin(k * i);
  }
  return Math.hypot(re, im) / S;
}

function lobePath(thetaDeg: number) {
  const theta = rad(thetaDeg);
  let d = "";
  for (let s = 0; s <= STEPS; s++) {
    const phi = rad(-90 + (180 * s) / STEPS);
    const af = arrayFactor(phi, theta);
    const db = 20 * Math.log10(Math.max(af, 1e-6));
    const r = R * Math.max(0, 1 - db / FLOOR_DB);
    const x = CX + r * Math.sin(phi);
    const y = CY - r * Math.cos(phi);
    d += `${s ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + "Z";
}

const steer = (b: (typeof BEAMS)[number], t: number) =>
  b.base + b.amp * Math.sin(t * b.rate + b.phase);

export default function BeamPattern() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const rayRefs = useRef<(SVGLineElement | null)[]>([]);
  const readRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = (t: number) => {
      const angles = BEAMS.map((b) => steer(b, t));
      angles.forEach((a, i) => {
        pathRefs.current[i]?.setAttribute("d", lobePath(a));
        const ray = rayRefs.current[i];
        if (ray) {
          ray.setAttribute("x2", (CX + R * Math.sin(rad(a))).toFixed(1));
          ray.setAttribute("y2", (CY - R * Math.cos(rad(a))).toFixed(1));
        }
      });
      if (readRef.current) {
        readRef.current.textContent = angles
          .map((a) => `${a >= 0 ? "+" : "−"}${Math.abs(Math.round(a)).toString().padStart(2, "0")}°`)
          .join("  ");
      }
    };

    let raf = 0;
    let running = false;
    let t = 0;
    let last = 0;
    const tick = (now: number) => {
      t += Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      render(t);
      raf = requestAnimationFrame(tick);
    };
    render(0);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    if (rootRef.current) io.observe(rootRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const sensors = Array.from({ length: S }, (_, i) => CX - 120 + (240 * i) / (S - 1));

  return (
    <div ref={rootRef} className="flex h-full flex-col font-mono text-[11px]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 whitespace-nowrap text-ink-faint sm:px-6">
        <span>
          S = {S} · B = {BEAMS.length}
        </span>
        <span ref={readRef} className="tabular-nums text-ink-muted" />
      </div>

      <div className="flex flex-1 items-center px-3 pt-4 sm:px-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Three beams formed simultaneously by a sixteen-sensor linear array, each steering independently."
        >
          {/* polar guides: −30, −20, −10, 0 dB */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <path
              key={f}
              d={`M${CX - R * f} ${CY} A${R * f} ${R * f} 0 0 1 ${CX + R * f} ${CY}`}
              fill="none"
              stroke={f === 1 ? "#3d3d3d" : "#232323"}
              strokeDasharray={f === 1 ? undefined : "2 4"}
            />
          ))}
          {[-60, -30, 0, 30, 60].map((a) => (
            <g key={a}>
              <line
                x1={CX}
                y1={CY}
                x2={CX + R * Math.sin(rad(a))}
                y2={CY - R * Math.cos(rad(a))}
                stroke="#1f1f1f"
              />
              <text
                x={CX + (R + 12) * Math.sin(rad(a))}
                y={CY - (R + 12) * Math.cos(rad(a)) + 3}
                textAnchor="middle"
                fontSize="9"
                fill="#5c5c5c"
                className="font-mono"
              >
                {a}°
              </text>
            </g>
          ))}

          {/* beams */}
          {BEAMS.map((_, i) => (
            <g key={i}>
              <path
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                fill="rgb(205 57 60 / 0.10)"
                stroke="#e0494d"
                strokeOpacity={0.9}
                strokeWidth={1.25}
                strokeLinejoin="round"
              />
              <line
                ref={(el) => {
                  rayRefs.current[i] = el;
                }}
                x1={CX}
                y1={CY}
                stroke="#e8e8e8"
                strokeOpacity={0.35}
                strokeDasharray="1 3"
              />
            </g>
          ))}

          {/* the array */}
          <line x1={CX - 132} y1={CY} x2={CX + 132} y2={CY} stroke="#3d3d3d" />
          {sensors.map((x, i) => (
            <rect key={i} x={x - 2.5} y={CY - 2.5} width={5} height={5} fill="#e8e8e8" />
          ))}
          <text x={CX - 132} y={CY + 22} fontSize="9" fill="#858585" className="font-mono">
            sensors · d = λ/2
          </text>
          <text x={CX + 132} y={CY + 22} fontSize="9" fill="#858585" textAnchor="end" className="font-mono">
            dB, floor −30
          </text>
        </svg>
      </div>

      <div className="mt-auto flex items-baseline justify-between gap-4 border-t border-line px-5 py-3 sm:px-6">
        <span className="text-ink-faint">per channel f</span>
        <span className="text-sm text-ink">
          Y<sub className="text-[9px]">f</sub> = W<sub className="text-[9px]">f</sub> · X
          <sub className="text-[9px]">f</sub>
          <span className="ml-3 text-[11px] text-ink-faint">(B×S)(S×T)</span>
        </span>
      </div>
    </div>
  );
}
