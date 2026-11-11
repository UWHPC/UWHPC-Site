"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Maverick's problem statement, drawn (spec §1.2, §2.4.2): two graphs
 * with the same |V| and |E| but different degree distributions. With
 * destination-based aggregation (one thread group per node), each
 * group's work is the node's degree, so the layer runs as long as its
 * busiest group. The bars and the idle figure are computed from the
 * graphs below, not illustrative numbers.
 */

const V = 24;
const SIZE = 220;
const C = SIZE / 2;
const RING = 92;

type Edge = [number, number];
type GraphKey = "balanced" | "skewed";

/** Ring lattice: each node joined to its next two neighbours → degree 4. */
const BALANCED: Edge[] = Array.from({ length: V }, (_, i) => [
  [i, (i + 1) % V] as Edge,
  [i, (i + 2) % V] as Edge,
]).flat();

/** Two hubs reach every leaf; a few leaf pairs make up the count. */
const HUBS = [0, 12];
const SKEWED: Edge[] = [
  ...HUBS.flatMap((h) =>
    Array.from({ length: V }, (_, j) => j)
      .filter((j) => !HUBS.includes(j))
      .map((j) => [h, j] as Edge)
  ),
  [0, 12],
  [3, 4],
  [8, 9],
  [17, 18],
];

const GRAPHS: Record<GraphKey, { label: string; edges: Edge[] }> = {
  balanced: { label: "Graph A · balanced", edges: BALANCED },
  skewed: { label: "Graph B · skewed", edges: SKEWED },
};

function ringPos(i: number): [number, number] {
  const a = (i / V) * Math.PI * 2 - Math.PI / 2;
  return [C + RING * Math.cos(a), C + RING * Math.sin(a)];
}

function position(i: number, g: GraphKey): [number, number] {
  if (g === "skewed" && HUBS.includes(i)) {
    return [C + (i === 0 ? -26 : 26), C];
  }
  return ringPos(i);
}

function degrees(edges: Edge[]) {
  const d = new Array<number>(V).fill(0);
  for (const [a, b] of edges) {
    d[a]++;
    d[b]++;
  }
  return d;
}

export default function DegreeSkew() {
  const [graph, setGraph] = useState<GraphKey>("balanced");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (pinned) return;
    const id = window.setInterval(
      () => setGraph((g) => (g === "balanced" ? "skewed" : "balanced")),
      4200
    );
    return () => window.clearInterval(id);
  }, [pinned]);

  const stats = useMemo(() => {
    const out = {} as Record<GraphKey, { deg: number[]; max: number; mean: number }>;
    (Object.keys(GRAPHS) as GraphKey[]).forEach((k) => {
      const deg = degrees(GRAPHS[k].edges);
      out[k] = {
        deg,
        max: Math.max(...deg),
        mean: deg.reduce((a, b) => a + b, 0) / V,
      };
    });
    return out;
  }, []);

  const { deg, max, mean } = stats[graph];
  const scaleMax = Math.max(stats.balanced.max, stats.skewed.max);
  const idle = Math.round((1 - mean / max) * 100);

  return (
    <div className="flex h-full flex-col font-mono text-[11px]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 whitespace-nowrap text-ink-faint sm:px-6">
        <span>
          |V| = {V} · |E| = {GRAPHS[graph].edges.length}
        </span>
        <div role="group" aria-label="Graph" className="flex border border-line-strong">
          {(Object.keys(GRAPHS) as GraphKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={graph === k}
              onClick={() => {
                setPinned(true);
                setGraph(k);
              }}
              className={`px-3 py-1 tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                graph === k ? "bg-ink text-bg" : "text-ink-muted hover:text-ink"
              }`}
            >
              {k === "balanced" ? "A" : "B"}
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
            aria-label={`${GRAPHS[graph].label}: ${V} nodes and ${GRAPHS[graph].edges.length} edges.`}
          >
            {(Object.keys(GRAPHS) as GraphKey[]).map((k) => (
              <g
                key={k}
                className="transition-opacity duration-700"
                style={{ opacity: graph === k ? 1 : 0 }}
              >
                {GRAPHS[k].edges.map(([a, b], i) => {
                  const [x1, y1] = position(a, k);
                  const [x2, y2] = position(b, k);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={k === "skewed" && (HUBS.includes(a) || HUBS.includes(b)) ? "#a8383b" : "#6b6b6b"}
                      strokeOpacity={k === "skewed" ? 0.55 : 0.9}
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            ))}
            {Array.from({ length: V }, (_, i) => {
              const [x, y] = position(i, graph);
              const hub = graph === "skewed" && HUBS.includes(i);
              return (
                <rect
                  key={i}
                  x={-3}
                  y={-3}
                  width={6}
                  height={6}
                  className="transition-[transform,fill] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                  style={{ transform: `translate(${x}px, ${y}px) scale(${hub ? 1.6 : 1})` }}
                  fill={hub ? "#e0494d" : "#e8e8e8"}
                />
              );
            })}
          </svg>
          <figcaption className="mt-2 text-center text-ink-faint">{GRAPHS[graph].label}</figcaption>
        </figure>

        <figure className="flex flex-col">
          <div className="mb-2 text-ink-faint">
            <span className="text-ink">work per node</span> · one group each
          </div>
          <div className="relative flex h-32 items-end gap-[2px] border-b border-line-strong">
            {/* the layer ends when the busiest group ends */}
            <span
              className="absolute inset-x-0 border-t border-dashed border-accent/60 transition-[bottom] duration-700"
              style={{ bottom: `${(max / scaleMax) * 100}%` }}
            />
            {deg.map((d, i) => (
              <span
                key={i}
                className="flex-1 origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{
                  height: "100%",
                  transform: `scaleY(${d / scaleMax})`,
                  background: d === max && graph === "skewed" ? "#e0494d" : "#c8c8c8",
                }}
              />
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["mean", mean.toFixed(0)],
              ["max", String(max)],
              ["idle", `${idle}%`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-ink-faint">{k}</dt>
                <dd className={`text-sm tabular-nums ${k === "idle" && idle > 0 ? "text-accent-bright" : "text-ink"}`}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </figure>
      </div>
    </div>
  );
}
