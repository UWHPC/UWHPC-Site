import type { ReactNode } from "react";

/**
 * Shared structural pieces for the "engineering datasheet" look:
 * every section shares the same railed container so the vertical
 * hairlines run continuously down the page like a drawing sheet.
 */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-6xl border-line px-6 md:border-x md:px-10 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  index,
  kicker,
  title,
  blurb,
  as: Heading = "h2",
}: {
  index: string;
  kicker: string;
  title: string;
  blurb?: string;
  /**
   * `h1` when this section is the page's primary subject, `h2` otherwise.
   * Styling is identical either way — this only sets document semantics.
   */
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
      <div className="md:col-span-7">
        <div className="mb-4 flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase">
          <span className="text-accent">{index}</span>
          <span className="text-ink-faint">/ {kicker}</span>
        </div>
        <Heading className="text-3xl font-bold tracking-tight uppercase font-stretch-expanded sm:text-4xl">
          {title}
        </Heading>
      </div>
      {blurb && (
        <p className="font-light text-ink-muted md:col-span-5 md:justify-self-end md:text-right">
          {blurb}
        </p>
      )}
    </div>
  );
}

/** Chip-package pins, echoing the logo's DIP legs. */
export function Pins({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none flex gap-1.5 ${className}`}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="h-1.5 w-2 bg-line-strong" />
      ))}
    </span>
  );
}

/** PCB fiducial crosshair for frame corners. */
export function Fiducial({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-3 w-3 ${className}`}
    >
      <span className="absolute top-1/2 left-0 h-px w-full bg-line-strong" />
      <span className="absolute left-1/2 top-0 w-px h-full bg-line-strong" />
    </span>
  );
}
