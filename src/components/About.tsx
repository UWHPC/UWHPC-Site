import { Container } from "@/components/ui";

/**
 * The statement. Each word is its own span so the CSS view timeline can
 * light them in reading order as lines scroll through the viewport.
 * Accent words carry their own lit color.
 */
const STATEMENT: { text: string; accent?: boolean }[][] = [
  [{ text: "We're a student design team at the University of Waterloo working on" }],
  [{ text: "high‑performance computing.", accent: true }],
  [{ text: "We write software that makes demanding workloads run" }],
  [{ text: "faster and at scale.", accent: true }],
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
      </Container>
    </section>
  );
}
