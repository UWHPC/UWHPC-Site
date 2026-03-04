"use client";

import { useFadeIn } from "@/hooks/useFadeIn";

const stats = [
  { value: "HPC", label: "Core Focus" },
  { value: "UW", label: "Waterloo Based" },
  { value: "//", label: "Performance Driven" },
  { value: "++", label: "Student Led" },
];

function StatCard({ stat, index }: { stat: { value: string; label: string }; index: number }) {
  const ref = useFadeIn(200 + index * 100);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-5 transition-all duration-500 ease-out rounded-xl border border-border bg-bg-card p-5"
    >
      <div className="mb-1 text-2xl font-bold text-accent">{stat.value}</div>
      <div className="text-sm text-text-muted">{stat.label}</div>
    </div>
  );
}

export default function About() {
  const descRef = useFadeIn(100);

  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
          About Us
        </span>
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
          Building the future of computation
        </h2>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div ref={descRef} className="opacity-0 translate-y-5 transition-all duration-500 ease-out">
            <p className="text-base/7 font-light text-text-muted">
              We build clusters, crush benchmarks, and compete — UWHPC is
              Waterloo&apos;s team for students who want to push hardware and code
              to their absolute limits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
