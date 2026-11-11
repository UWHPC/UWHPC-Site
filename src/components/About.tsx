import { Container } from "@/components/ui";

/**
 * The statement. Each word is its own span so the CSS view timeline can
 * light them in reading order as lines scroll through the viewport.
 * Accent words carry their own lit color.
 */
const STATEMENT: { text: string; accent?: boolean }[][] = [
  [{ text: "We're a student design team at the University of Waterloo building" }],
  [{ text: "high\u2011performance software", accent: true }],
  [{ text: "for computationally intensive workloads — from numerical methods down to the" }],
  [{ text: "compilers and systems", accent: true }],
  [{ text: "that make them fast." }],
];

const FACTS = [
  { label: "Based at", value: "Sedra Student Design Centre" },
  { label: "Built with", value: "C++23 · CUDA · OpenMP" },
  { label: "Run by", value: "Students, for students" },
];

export default function About() {
  return (
    <section id="about" className="relative">
      {/* A highlight enters the About section as the hero leaves the viewport. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden h-56 overflow-hidden md:block">
        <div className="relative mx-auto max-w-6xl">
          <span className="absolute top-0 left-0 h-56 w-px bg-gradient-to-b from-accent to-transparent xl:-left-px" />
          <span className="chip-rail-signal absolute top-0 left-0 xl:-left-px" />
        </div>
      </div>
      <Container className="py-28 sm:py-40">
        <div className="mb-10 flex items-baseline gap-3 font-mono text-xs tracking-[0.18em] uppercase">
          <span className="text-accent">00</span>
          <span className="text-ink-faint">/ Who we are</span>
        </div>

        <p className="max-w-5xl text-[clamp(1.75rem,4.2vw,3.4rem)] leading-[1.12] font-semibold tracking-[-0.015em]">
          {STATEMENT.flat().map((chunk, i) =>
            chunk.text.split(" ").map((word, j) => (
              <span
                key={`${i}-${j}`}
                className="reveal-word"
                style={
                  chunk.accent
                    ? ({ "--word-color": "var(--color-accent-bright)" } as React.CSSProperties)
                    : undefined
                }
              >
                {word}{" "}
              </span>
            ))
          )}
        </p>

        <dl className="mt-20 grid border-t border-line sm:grid-cols-3">
          {FACTS.map((f, i) => (
            <div
              key={f.label}
              className={`border-b border-line py-6 sm:border-b-0 ${
                i > 0 ? "sm:border-l sm:pl-8" : ""
              }`}
            >
              <dt className="mb-2 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint">
                {f.label}
              </dt>
              <dd className="text-lg font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
