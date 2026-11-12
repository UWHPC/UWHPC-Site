"use client";

import { useEffect, useState } from "react";

/**
 * What the Jastrow factor does in the VMC engine, sampled live: N
 * electrons in a periodic 2D cell, moved by Metropolis steps under
 * |Ψ|² with and without a Padé–Jastrow factor e^{Σ u(r_ij)},
 * u(r) = a r / (1 + b r). The pair-correlation g(r) bars are histogrammed
 * from these samples, so the "correlation hole" near r = 0 in B is
 * measured, not drawn. (Jastrow part only: no Slater determinant.)
 */

const N = 32;
const SIZE = 220;
const STEP = 0.06; // Metropolis trial move, in cell lengths
const A = 60;
const B = 25;
const BINS = 16;
const R_MAX = 0.5;
const NEAR = 0.16;

type Mode = "plain" | "jastrow";
const MODES: Record<Mode, { label: string; key: string }> = {
  plain: { label: "No Jastrow · uncorrelated", key: "A" },
  jastrow: { label: "Padé–Jastrow · correlated", key: "B" },
};

/** Small deterministic PRNG so every visit samples the same chain. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const wrap = (v: number) => v - Math.floor(v);
/** Minimum-image distance in the unit periodic cell. */
function dist(ax: number, ay: number, bx: number, by: number) {
  let dx = Math.abs(ax - bx);
  let dy = Math.abs(ay - by);
  if (dx > 0.5) dx = 1 - dx;
  if (dy > 0.5) dy = 1 - dy;
  return Math.hypot(dx, dy);
}
const u = (r: number) => (A * r) / (1 + B * r);

type Chain = {
  x: Float64Array;
  y: Float64Array;
  rand: () => number;
  hist: Float64Array;
  samples: number;
  tried: number;
  accepted: number;
};

function makeChain(seed: number): Chain {
  const rand = mulberry32(seed);
  const x = new Float64Array(N);
  const y = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    x[i] = rand();
    y[i] = rand();
  }
  return { x, y, rand, hist: new Float64Array(BINS), samples: 0, tried: 0, accepted: 0 };
}

/** One sweep: a trial move per electron, accepted with min(1, |Ψ'|²/|Ψ|²). */
function sweep(c: Chain, mode: Mode) {
  for (let i = 0; i < N; i++) {
    const nx = wrap(c.x[i] + (c.rand() - 0.5) * 2 * STEP);
    const ny = wrap(c.y[i] + (c.rand() - 0.5) * 2 * STEP);
    let logRatio = 0;
    if (mode === "jastrow") {
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        logRatio += 2 * (u(dist(nx, ny, c.x[j], c.y[j])) - u(dist(c.x[i], c.y[i], c.x[j], c.y[j])));
      }
    }
    c.tried++;
    if (logRatio >= 0 || c.rand() < Math.exp(logRatio)) {
      c.x[i] = nx;
      c.y[i] = ny;
      c.accepted++;
    }
  }
}

/** Add every pair distance to the g(r) histogram. */
function measure(c: Chain) {
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      const r = dist(c.x[i], c.y[i], c.x[j], c.y[j]);
      if (r < R_MAX) c.hist[Math.floor((r / R_MAX) * BINS)]++;
    }
  c.samples++;
}

/** g(r): pair counts per shell, over what an uncorrelated gas would give. */
function pairCorrelation(c: Chain): number[] {
  const pairs = (N * (N - 1)) / 2;
  return Array.from(c.hist, (count, k) => {
    const r0 = (k / BINS) * R_MAX;
    const r1 = ((k + 1) / BINS) * R_MAX;
    const ideal = pairs * Math.PI * (r1 * r1 - r0 * r0) * c.samples;
    return ideal > 0 ? count / ideal : 0;
  });
}

function warm(c: Chain, mode: Mode) {
  for (let s = 0; s < 400; s++) {
    sweep(c, mode);
    if (s >= 100 && s % 2 === 0) measure(c);
  }
}

export default function CorrelationHole() {
  const [mode, setMode] = useState<Mode>("plain");
  const [pinned, setPinned] = useState(false);
  const [, setTick] = useState(0);
  // both chains are burnt in once, so g(r) has shape from the first frame
  const [chains] = useState<Record<Mode, Chain>>(() => {
    const plain = makeChain(7);
    const jastrow = makeChain(11);
    warm(plain, "plain");
    warm(jastrow, "jastrow");
    return { plain, jastrow };
  });

  useEffect(() => {
    if (pinned) return;
    const id = window.setInterval(() => setMode((m) => (m === "plain" ? "jastrow" : "plain")), 4200);
    return () => window.clearInterval(id);
  }, [pinned]);

  // keep sampling the visible chain; redraw about 12 times a second
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      const c = chains[mode];
      sweep(c, mode);
      measure(c);
      if (now - last > 80) {
        last = now;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, chains]);

  const c = chains[mode];
  const g = pairCorrelation(c);
  const gMax = 1.6;
  const acceptance = Math.round((c.accepted / Math.max(1, c.tried)) * 100);
  const g0 = g[0];

  return (
    <div className="flex h-full flex-col font-mono text-[11px]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 whitespace-nowrap text-ink-faint sm:px-6">
        <span>N = {N} · periodic cell</span>
        <div role="group" aria-label="Wave function" className="flex border border-line-strong">
          {(Object.keys(MODES) as Mode[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={mode === k}
              onClick={() => {
                setPinned(true);
                setMode(k);
              }}
              className={`px-3 py-1 tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                mode === k ? "bg-ink text-bg" : "text-ink-muted hover:text-ink"
              }`}
            >
              {MODES[k].key}
            </button>
          ))}
        </div>
      </div>

      <div className="grid flex-1 items-center gap-6 p-5 sm:grid-cols-[1fr_1fr] sm:p-6">
        <figure>
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="mx-auto h-auto w-full max-w-64"
            role="img"
            aria-label={`${MODES[mode].label}: ${N} electrons sampled by Metropolis moves in a periodic cell.`}
          >
            <rect x={0.5} y={0.5} width={SIZE - 1} height={SIZE - 1} fill="none" stroke="#3a3a3a" strokeDasharray="3 3" />
            {/* the tagged electron's near neighbours */}
            {Array.from({ length: N - 1 }, (_, k) => k + 1)
              .filter((j) => dist(c.x[0], c.y[0], c.x[j], c.y[j]) < NEAR)
              .map((j) => {
                let dx = c.x[j] - c.x[0];
                let dy = c.y[j] - c.y[0];
                dx -= Math.round(dx);
                dy -= Math.round(dy);
                return (
                  <line
                    key={j}
                    x1={c.x[0] * SIZE}
                    y1={c.y[0] * SIZE}
                    x2={(c.x[0] + dx) * SIZE}
                    y2={(c.y[0] + dy) * SIZE}
                    stroke="#a8383b"
                    strokeOpacity={0.6}
                  />
                );
              })}
            {Array.from({ length: N }, (_, i) => (
              <rect
                key={i}
                x={c.x[i] * SIZE - 3}
                y={c.y[i] * SIZE - 3}
                width={i === 0 ? 7 : 6}
                height={i === 0 ? 7 : 6}
                fill={i === 0 ? "#e0494d" : "#e8e8e8"}
              />
            ))}
          </svg>
          <figcaption className="mt-2 text-center text-ink-faint">{MODES[mode].label}</figcaption>
        </figure>

        <figure className="flex flex-col">
          <div className="mb-2 text-ink-faint">
            <span className="text-ink">g(r)</span> · pair correlation, sampled
          </div>
          <div className="relative flex h-32 items-end gap-[2px] border-b border-line-strong">
            {/* an uncorrelated gas sits on g = 1 */}
            <span className="absolute inset-x-0 border-t border-dashed border-ink-faint/60" style={{ bottom: `${(1 / gMax) * 100}%` }} />
            {g.map((v, k) => (
              <span
                key={k}
                className="flex-1 origin-bottom transition-transform duration-300 ease-out"
                style={{
                  height: "100%",
                  transform: `scaleY(${Math.min(v, gMax) / gMax})`,
                  background: mode === "jastrow" && v < 0.7 ? "#e0494d" : "#c8c8c8",
                }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-ink-faint">
            <span>r = 0</span>
            <span>half cell</span>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["accept", `${acceptance}%`],
              ["g(0⁺)", g0.toFixed(2)],
              ["samples", c.samples.toLocaleString("en-US")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-ink-faint">{k}</dt>
                <dd className={`text-sm tabular-nums ${k === "g(0⁺)" && g0 < 0.5 ? "text-accent-bright" : "text-ink"}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </figure>
      </div>
    </div>
  );
}
