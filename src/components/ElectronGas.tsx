"use client";

import { useEffect, useRef } from "react";

/**
 * A small, honest sketch of what the VMC engine samples: N = 57 electrons
 * (a closed-shell count from the project's config) in a periodic cube,
 * moved one at a time by Metropolis steps. Acceptance uses a Padé–Jastrow
 * factor, log ψ = Σ a·r / (1 + b·r) over minimum-image pairs, so electrons
 * avoid each other. The plane-wave Slater part is omitted here.
 *
 * Left: the cell, projected on x–y, depth shown as brightness.
 * Right: the pair-correlation function g(r), accumulated live; the dip
 * below r ≈ 1 is the correlation hole the Jastrow factor carves out.
 *
 * Runs only while visible.
 */

const N = 57;
const L = 6; // box length (illustrative units)
const A = 1.6;
const B = 1.2;
const STEP = 0.45;
const BINS = 30;
const R_MAX = L / 2;

const u = (r: number) => (A * r) / (1 + B * r);

function minImage(d: number) {
  return d - L * Math.round(d / L);
}

function gauss() {
  const s = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(s)) * Math.cos(2 * Math.PI * Math.random());
}

export default function ElectronGas() {
  const boxRef = useRef<HTMLCanvasElement>(null);
  const gRef = useRef<HTMLCanvasElement>(null);
  const statRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const boxCanvas = boxRef.current;
    const gCanvas = gRef.current;
    if (!boxCanvas || !gCanvas) return;
    const bx = boxCanvas.getContext("2d");
    const gx = gCanvas.getContext("2d");
    if (!bx || !gx) return;

    const monoFamily =
      getComputedStyle(document.body).getPropertyValue("--font-fragment-mono").trim() ||
      "monospace";
    const pos = new Float64Array(N * 3).map(() => Math.random() * L);
    const hist = new Float64Array(BINS);
    let samples = 0;
    let accepted = 0;
    let proposed = 0;
    let sweeps = 0;
    let moveCursor = 0;

    const dist = (i: number, x: number, y: number, z: number) => {
      const dx = minImage(pos[i * 3] - x);
      const dy = minImage(pos[i * 3 + 1] - y);
      const dz = minImage(pos[i * 3 + 2] - z);
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    /** One single-electron Metropolis move. Returns [old, new] or null. */
    const move = (k: number): [number[], number[]] | null => {
      const ox = pos[k * 3];
      const oy = pos[k * 3 + 1];
      const oz = pos[k * 3 + 2];
      const nx = (((ox + gauss() * STEP) % L) + L) % L;
      const ny = (((oy + gauss() * STEP) % L) + L) % L;
      const nz = (((oz + gauss() * STEP) % L) + L) % L;
      let dLog = 0;
      for (let j = 0; j < N; j++) {
        if (j === k) continue;
        dLog += u(dist(j, nx, ny, nz)) - u(dist(j, ox, oy, oz));
      }
      proposed++;
      if (Math.random() < Math.exp(2 * dLog)) {
        pos[k * 3] = nx;
        pos[k * 3 + 1] = ny;
        pos[k * 3 + 2] = nz;
        accepted++;
        return [[ox, oy, oz], [nx, ny, nz]];
      }
      return null;
    };

    const sampleG = () => {
      const dr = R_MAX / BINS;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const r = dist(j, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          if (r < R_MAX) hist[Math.floor(r / dr)] += 2;
        }
      }
      samples++;
    };

    let bw = 0;
    let bh = 0;
    let gw = 0;
    let gh = 0;
    const fit = (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [r.width, r.height];
    };
    const resize = () => {
      [bw, bh] = fit(boxCanvas, bx);
      [gw, gh] = fit(gCanvas, gx);
      bx.fillStyle = "#111111";
      bx.fillRect(0, 0, bw, bh);
    };

    const toPx = (x: number, y: number): [number, number] => [
      (x / L) * bw,
      (y / L) * bh,
    ];

    const drawBox = (moves: [number[], number[]][]) => {
      bx.fillStyle = "rgba(17,17,17,0.22)";
      bx.fillRect(0, 0, bw, bh);
      // accepted steps, skipping ones that wrapped across the boundary
      bx.strokeStyle = "rgba(224,73,77,0.7)";
      bx.lineWidth = 1;
      for (const [o, n] of moves) {
        if (Math.abs(o[0] - n[0]) > L / 2 || Math.abs(o[1] - n[1]) > L / 2) continue;
        const [x0, y0] = toPx(o[0], o[1]);
        const [x1, y1] = toPx(n[0], n[1]);
        bx.beginPath();
        bx.moveTo(x0, y0);
        bx.lineTo(x1, y1);
        bx.stroke();
      }
      for (let i = 0; i < N; i++) {
        const [x, y] = toPx(pos[i * 3], pos[i * 3 + 1]);
        const depth = pos[i * 3 + 2] / L;
        const s = 1.6 + depth * 1.6;
        bx.fillStyle = `rgba(232,232,232,${(0.35 + depth * 0.65).toFixed(3)})`;
        bx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    };

    const drawG = () => {
      gx.clearRect(0, 0, gw, gh);
      const padL = 4;
      const padB = 16;
      const plotW = gw - padL;
      const plotH = gh - padB - 6;
      const yMax = 1.5;
      const y = (v: number) => 6 + plotH * (1 - Math.min(v, yMax) / yMax);

      // g = 1 reference
      gx.strokeStyle = "#3d3d3d";
      gx.setLineDash([3, 4]);
      gx.beginPath();
      gx.moveTo(padL, y(1));
      gx.lineTo(gw, y(1));
      gx.stroke();
      gx.setLineDash([]);

      // axis
      gx.strokeStyle = "#272727";
      gx.beginPath();
      gx.moveTo(padL, 6 + plotH);
      gx.lineTo(gw, 6 + plotH);
      gx.stroke();

      if (samples > 0) {
        const dr = R_MAX / BINS;
        const rho = N / (L * L * L);
        gx.strokeStyle = "#e0494d";
        gx.lineWidth = 1.5;
        gx.beginPath();
        for (let k = 0; k < BINS; k++) {
          const r0 = k * dr;
          const shell = (4 / 3) * Math.PI * ((r0 + dr) ** 3 - r0 ** 3);
          const g = hist[k] / (samples * N * rho * shell);
          const px = padL + ((k + 0.5) / BINS) * plotW;
          if (k === 0) gx.moveTo(px, y(g));
          else gx.lineTo(px, y(g));
        }
        gx.stroke();
        gx.lineWidth = 1;
      }

      gx.fillStyle = "#858585";
      gx.font = `10px ${monoFamily}, monospace`;
      gx.fillText("0", padL, gh - 2);
      gx.fillText("r", gw / 2, gh - 2);
      gx.fillText("L/2", gw - 20, gh - 2);
      gx.fillText("1", padL + 2, y(1) - 4);
    };

    const updateStat = () => {
      if (statRef.current) {
        statRef.current.textContent = `sweep ${sweeps} · accept ${
          proposed ? Math.round((accepted / proposed) * 100) : 0
        }%`;
      }
    };

    resize();

    const advance = (movesPerFrame: number) => {
      const moves: [number[], number[]][] = [];
      for (let m = 0; m < movesPerFrame; m++) {
        const res = move(moveCursor);
        if (res) moves.push(res);
        moveCursor = (moveCursor + 1) % N;
        if (moveCursor === 0) {
          sweeps++;
          if (sweeps > 20) sampleG();
        }
      }
      return moves;
    };

    // equilibrate quietly so the first visible frame is already a gas
    advance(N * 20);

    let raf = 0;
    let running = false;
    let frame = 0;
    const tick = () => {
      drawBox(advance(19));
      if (++frame % 6 === 0) {
        drawG();
        updateStat();
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(boxCanvas);
    window.addEventListener("resize", resize);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="flex h-full flex-col font-mono text-[11px]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 tracking-[0.14em] whitespace-nowrap text-ink-faint sm:px-6">
        <span>
          N = {N}
          <span className="hidden sm:inline"> · periodic cell</span>
        </span>
        <span ref={statRef} className="tabular-nums">
          sweep 0
        </span>
      </div>

      <div className="grid flex-1 gap-5 p-5 sm:grid-cols-[1fr_0.9fr] sm:p-6">
        <figure className="flex flex-col">
          <div className="relative aspect-square w-full border border-line-strong">
            <canvas ref={boxRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
          </div>
          <figcaption className="mt-2 text-ink-faint">
            Metropolis moves · Padé–Jastrow
          </figcaption>
        </figure>

        <figure className="flex flex-col">
          <div className="mb-2 flex items-baseline justify-between text-ink-faint">
            <span>
              <span className="text-ink">g(r)</span> pair correlation
            </span>
          </div>
          <div className="relative min-h-36 flex-1">
            <canvas ref={gRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
          </div>
          <figcaption className="mt-2 leading-snug text-ink-faint">
            The dip at small r is the correlation hole: electrons keep their
            distance.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
