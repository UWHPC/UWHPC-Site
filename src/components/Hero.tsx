"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";
import ChipDie from "@/components/ChipDie";
import { Fiducial } from "@/components/ui";

/**
 * Scroll-driven hero: a dim, slightly isometric processor die that
 * wakes up as you scroll — edges trace in, blocks glow, signal lines
 * run between them — while the camera flattens to a bird's-eye view.
 * A tall runway section pins a full-screen stage; progress through
 * the runway is written to `--p` (see useScrollProgress) and all
 * animation derives from it in CSS.
 */
export default function Hero() {
  const ref = useScrollProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      className="chip-stage relative h-[420vh]"
      data-end="false"
    >
      <div className="chip-sticky sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden pt-16">
        <div className="blueprint-grid pointer-events-none absolute inset-0 mx-auto max-w-6xl border-line md:border-x" />
        <Fiducial className="bottom-4 left-1/2 ml-[-36rem] hidden xl:block" />
        <Fiducial className="bottom-4 left-1/2 ml-[35.25rem] hidden xl:block" />

        {/* growing red ambience behind the die */}
        <div className="chip-ambience pointer-events-none absolute top-1/2 left-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />

        {/* headline — fades up and out as the chip wakes */}
        <div className="chip-title pointer-events-none absolute inset-x-0 top-[16vh] z-10 px-6 text-center">
          <div className="mx-auto mb-5 flex items-center justify-center gap-3 font-mono text-xs tracking-[0.2em] uppercase text-ink-muted">
            <span className="h-1.5 w-1.5 bg-accent animate-blink" />
            University of Waterloo
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight font-stretch-expanded leading-[0.98] sm:text-6xl lg:text-7xl">
            UW <span className="text-accent">High Performance</span> Computing
          </h1>
          <p className="mx-auto max-w-lg text-base font-light text-ink-muted sm:text-lg">
            A student design team at the University of Waterloo pushing the
            boundaries of parallel and high-performance computing.
          </p>
        </div>

        {/* the die, in 3D */}
        <div className="chip-scene mt-[10vh]">
          <div className="chip-die3d relative aspect-square w-[min(78vw,56vh,540px)]">
            <ChipDie />
            <div className="chip-side chip-side-front" />
            <div className="chip-side chip-side-right" />
          </div>
          <div className="chip-shadow" />
        </div>

        {/* CTAs resolve at bird's-eye */}
        <div className="chip-endcap absolute inset-x-0 bottom-[8vh] z-10 flex flex-col items-center gap-3 px-6 sm:flex-row sm:justify-center">
          <a
            href="#join"
            className="w-full bg-accent px-7 py-3.5 text-center font-mono text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            Join the Team
          </a>
          <a
            href="#projects"
            className="w-full border border-line-strong bg-bg/70 px-7 py-3.5 text-center font-mono text-xs tracking-[0.15em] uppercase text-ink backdrop-blur-sm transition-colors hover:border-ink-muted hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            Learn More
          </a>
        </div>

        {/* scroll cue */}
        <div className="chip-cue pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.3em] uppercase text-ink-faint">
          [ Scroll ]
        </div>
      </div>
    </section>
  );
}
