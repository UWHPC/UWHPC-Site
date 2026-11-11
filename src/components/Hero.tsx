"use client";

import Link from "next/link";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import ChipDie from "@/components/ChipDie";

/**
 * Scroll-driven hero: a processor die that wakes up as you scroll —
 * edges trace in, blocks light, signal lines run between them — while
 * the camera flattens to a bird's-eye view.
 *
 * The first screen is never empty: an opening statement sits over the
 * dimmed die and clears away as scrolling begins. A tall runway section
 * pins a full-screen stage; the native view timeline (or
 * useScrollProgress as a fallback) drives every layer from progress
 * through that runway.
 */
export default function Hero() {
  const ref = useScrollProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      className="chip-stage relative h-[300vh]"
      data-end="false"
      data-pulses="false"
      data-low-power="false"
      data-native-scroll="false"
      data-canvas-ready="false"
    >
      <div className="chip-sticky sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden pt-16">
        <div className="blueprint-grid pointer-events-none absolute inset-0 mx-auto max-w-6xl border-line md:border-x" />

        {/* scroll progress rail, riding the frame's left edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-full max-w-6xl -translate-x-1/2 md:block"
        >
          <span className="chip-rail-fill absolute top-0 -left-px h-full w-px bg-accent" />
        </div>

        {/* opening statement — visible on load, clears as the die powers on */}
        <div className="chip-intro pointer-events-none absolute inset-0 z-10">
          {/* darken behind the type so it reads over the die */}
          <div className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-bg via-bg/85 to-transparent" />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col px-6 pt-[18vh] md:px-10">
            <p className="animate-rise mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.18em] uppercase text-ink-muted">
              <span className="h-2 w-2 bg-accent" />
              Student design team · University of Waterloo
            </p>
            <h1 className="text-[clamp(1.9rem,9.4vw,6.5rem)] leading-[0.86] font-extrabold tracking-[-0.025em] uppercase font-stretch-expanded">
              <span className="animate-rise block [animation-delay:80ms]">
                High
              </span>
              <span className="animate-rise block text-accent [animation-delay:160ms]">
                Performance
              </span>
              <span className="animate-rise block [animation-delay:240ms]">
                Computing
              </span>
            </h1>
          </div>
        </div>

        {/* headline — resolves at the bird's-eye finale */}
        <div className="chip-title pointer-events-none absolute inset-x-0 top-[16vh] z-10 px-6 text-center">
          <p className="mx-auto mb-6 text-5xl font-bold tracking-tight font-stretch-expanded leading-[0.98] sm:text-6xl lg:text-7xl">
            UW<span className="text-accent">HPC</span>
          </p>
          <p className="mx-auto max-w-lg text-base text-ink-muted sm:text-lg">
            A student design team at the University of Waterloo pushing the
            boundaries of parallel and high-performance computing.
          </p>
        </div>

        {/* the die, in 3D, over a pool of ember light; rises in on load */}
        <div className="chip-boot">
          <div className="chip-scene mt-[2vh]">
            <div
              aria-hidden="true"
              className="chip-glow chip-face pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2"
            />
            <div className="chip-die3d relative aspect-square w-[min(78vw,56vh,540px)]">
              <ChipDie />
              <div className="chip-side chip-side-front" />
              <div className="chip-side chip-side-right" />
            </div>
          </div>
        </div>

        {/* CTAs resolve at bird's-eye */}
        <div className="chip-endcap absolute inset-x-0 bottom-[8vh] z-10 flex flex-col items-center gap-3 px-6 sm:flex-row sm:justify-center">
          <Link
            href="/join"
            className="w-full bg-accent px-7 py-3.5 text-center font-mono text-xs tracking-[0.14em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            Get Involved
          </Link>
          <Link
            href="#about"
            className="w-full border border-line-strong bg-bg/70 px-7 py-3.5 text-center font-mono text-xs tracking-[0.14em] uppercase text-ink backdrop-blur-sm transition-colors hover:border-ink-muted hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            Learn More
          </Link>
        </div>

        {/* scroll cue: a hairline with a signal travelling down it */}
        <div className="chip-cue pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.18em] whitespace-nowrap uppercase text-ink-muted">
            Scroll to power on
          </span>
          <span className="relative h-10 w-px overflow-hidden bg-line-strong">
            <span className="animate-signal absolute inset-x-0 top-0 h-3 bg-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}
