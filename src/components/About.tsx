"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader } from "@/components/ui";

const stats = [
  { value: "HPC", label: "Core Focus" },
  { value: "UW", label: "Waterloo Based" },
  { value: "//", label: "Performance Driven" },
  { value: "++", label: "Student Led" },
];

function StatCell({
  stat,
  index,
}: {
  stat: { value: string; label: string };
  index: number;
}) {
  const ref = useFadeIn(200 + index * 100);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-3 transition-all duration-500 ease-out border border-line p-5"
    >
      <div className="mb-1 font-mono text-2xl text-accent">{stat.value}</div>
      <div className="font-mono text-xs text-ink-muted">{stat.label}</div>
    </div>
  );
}

export default function About() {
  const descRef = useFadeIn(100);

  return (
    <section id="about" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader index="00" kicker="About Us" title="About" />

        <div className="grid items-center gap-12 md:grid-cols-2">
          <div
            ref={descRef}
            className="opacity-0 translate-y-3 transition-all duration-500 ease-out"
          >
            <p className="text-base/7 font-light text-ink-muted">
              We build clusters, crush benchmarks, and compete - UWHPC is
              Waterloo&apos;s team for students who want to push hardware and
              code to their absolute limits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <StatCell key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
