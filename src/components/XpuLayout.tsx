"use client";

import { useEffect, useState } from "react";

/**
 * XPU's structure-of-arrays example, taken from the project README, with
 * the memory it produces drawn underneath. Switching backend redraws the
 * layout the way the library does it:
 *
 *  - CPU: aligned `operator new`; each array's stride is padded up to a
 *    multiple of the SIMD width (64 B with AVX-512 → 16 floats).
 *  - CUDA: `cudaMalloc`; tight layout, no row padding.
 *
 * Auto-advances until the viewer picks a backend themselves.
 */

const COUNT = 10;
const CPU_STRIDE = 16; // 64-byte lanes / 4-byte float
const AXES = ["X", "Y", "Z"] as const;

type Backend = "cpu" | "cuda";

const BACKENDS: Record<
  Backend,
  { label: string; alloc: string; stride: number; note: string }
> = {
  cpu: {
    label: "CPU",
    alloc: "aligned operator new",
    stride: CPU_STRIDE,
    note: "rows padded to 64-byte SIMD lanes",
  },
  cuda: {
    label: "CUDA",
    alloc: "cudaMalloc",
    stride: COUNT,
    note: "tight layout, no row padding",
  },
};

/* Minimal hand-tokenised listing so colours stay on-palette. */
const K = ({ children }: { children: string }) => (
  <span className="text-ink-faint">{children}</span>
);
const T = ({ children }: { children: string }) => (
  <span className="text-[#c8c8c8]">{children}</span>
);
const A = ({ children }: { children: string }) => (
  <span className="text-accent-bright">{children}</span>
);

export default function XpuLayout() {
  const [backend, setBackend] = useState<Backend>("cpu");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (pinned) return;
    const id = window.setInterval(
      () => setBackend((b) => (b === "cpu" ? "cuda" : "cpu")),
      3600
    );
    return () => window.clearInterval(id);
  }, [pinned]);

  const b = BACKENDS[backend];

  return (
    <div className="flex h-full flex-col font-mono text-[12px] leading-relaxed">
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3 sm:px-6">
        <span className="tracking-[0.14em] text-ink-faint">soa.cu</span>
        <div
          role="group"
          aria-label="Backend"
          className="flex border border-line-strong"
        >
          {(Object.keys(BACKENDS) as Backend[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={backend === key}
              onClick={() => {
                setPinned(true);
                setBackend(key);
              }}
              className={`px-3 py-1 text-[11px] tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                backend === key
                  ? "bg-ink text-bg"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {BACKENDS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* listing */}
      <pre className="overflow-x-auto px-5 py-5 text-ink-muted sm:px-6">
        <code>
          <K>enum</K> <T>Axis</T> : <T>std::size_t</T> {"{ "}X, Y, Z, NUM_AXES{" };"}
          {"\n\n"}
          <T>xpu::soa</T>&lt;<K>float</K>, Axis::NUM_AXES&gt; position{"{"}
          <A>N</A>
          {"};"}
          {"\n\n"}
          <K>float</K>* x{"{"}position[Axis::X]{"};"}
        </code>
      </pre>

      {/* memory */}
      <div className="mt-auto border-t border-line px-5 pt-4 pb-5 sm:px-6">
        <div className="mb-3 flex items-baseline justify-between gap-4 text-[11px] tracking-[0.14em] text-ink-faint">
          <span>
            one allocation · <span className="text-ink">{b.alloc}</span>
          </span>
          <span className="hidden sm:inline">N = {COUNT}</span>
        </div>

        <div className="space-y-1.5" aria-hidden="true">
          {AXES.map((axis) => (
            <div key={axis} className="flex items-center gap-2">
              <span className="w-3 text-ink-faint">{axis}</span>
              <div className="flex flex-1 gap-[2px]">
                {Array.from({ length: CPU_STRIDE }, (_, i) => {
                  const pad = i >= COUNT;
                  const hidden = pad && backend === "cuda";
                  return (
                    <span
                      key={i}
                      className={`h-4 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                        pad
                          ? "bg-[repeating-linear-gradient(135deg,#2a2a2a_0_2px,transparent_2px_5px)] outline outline-1 -outline-offset-1 outline-line-strong"
                          : "bg-accent/80"
                      }`}
                      style={{
                        flexGrow: hidden ? 0 : 1,
                        flexBasis: 0,
                        opacity: hidden ? 0 : 1,
                        marginLeft: hidden ? -2 : 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3 text-[11px]">
          {[
            ["count()", COUNT],
            ["stride()", b.stride],
            ["storage_size()", b.stride * AXES.length],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-faint">{k}</dt>
              <dd className="text-sm text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-ink-faint" aria-live="polite">
          {b.label}: {b.note}
        </p>
      </div>
    </div>
  );
}
