"use client";

import Link from "next/link";
import { useBuildupScroll } from "@/hooks/useBuildupScroll";
import { LEVELS } from "@/components/buildup/timeline";

/**
 * Scroll-driven 3D hero, built up rather than zoomed out: transistors →
 * die → bare GPU board, then the casing closes around that GPU, seven
 * more join it, and the server assembles around them, ending closed in
 * an x-ray view with all eight GPUs visible.
 *
 * The headline renders with the page; the scene (buildup/scene, three.js)
 * loads after first paint and fades in. useBuildupScroll drives the
 * overlays and the scene from progress through the 300vh runway.
 */
export default function Hero() {
  const ref = useBuildupScroll<HTMLElement>();

  return (
    <section
      ref={ref}
      className="chip-stage relative h-[300vh]" /* SCROLL_VH in timeline.ts */
      data-end="false"
      data-scene-ready="false"
    >
      <div className="chip-sticky sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden pt-16">
        <div className="blueprint-grid pointer-events-none absolute inset-0 mx-auto max-w-6xl border-line md:border-x" />

        {/* the 3D scene: transistors → die → GPU → eight GPUs → server */}
        <canvas
          aria-label="Transistors powering on, pulling back to a GPU die and its board; the casing closes around the GPU, seven more GPUs join it, and a server assembles around all eight"
          role="img"
          className="hero-canvas absolute inset-0 h-full w-full"
        />

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
        <div className="chip-title pointer-events-none absolute inset-x-0 top-[12vh] z-10 bg-[radial-gradient(ellipse_42%_60%_at_50%_50%,rgb(17_17_17/0.88),transparent)] px-6 py-[4vh] text-center landscape:md:top-[10vh] landscape:md:py-2">
          <p className="mx-auto mb-6 text-5xl font-bold tracking-tight font-stretch-expanded leading-[0.98] sm:text-6xl lg:text-7xl landscape:md:mb-3">
            UW<span className="text-accent">HPC</span>
          </p>
          <p className="mx-auto max-w-lg text-base text-ink-muted sm:text-lg">
            A student design team at the University of Waterloo pushing the
            boundaries of parallel and high-performance computing.
          </p>
        </div>

        {/* CTAs resolve at bird's-eye */}
        <div className="chip-endcap absolute inset-x-0 bottom-[8vh] z-10 flex flex-col items-center gap-3 px-6 sm:flex-row sm:justify-center landscape:md:bottom-[4vh]">
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

        {/* scale readout: where the camera is, and which project lives there */}
        <div className="chip-hud pointer-events-none invisible absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg via-bg/80 to-transparent pt-24 opacity-0">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 pb-6 md:px-10 md:pb-8">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase">
              <p className="mb-3 text-ink-faint">Scale</p>
              <ol className="flex gap-4 md:block md:space-y-1.5">
                {LEVELS.map((l, i) => (
                  <li
                    key={l.name}
                    data-level={i}
                    className="group flex items-center gap-2.5 text-ink-faint transition-colors duration-300 data-active:text-ink"
                  >
                    <span className="h-1.5 w-1.5 bg-line-strong transition-colors duration-300 group-data-active:bg-accent" />
                    <span className="shrink-0 md:w-24">{l.name}</span>
                    <span className="hidden tracking-normal normal-case text-ink-faint md:inline">
                      {l.note}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* skip link: there from the first frame on every screen, gone at the end;
            under the nav on phones, beside the readout from sm up */}
        <div className="chip-skip pointer-events-none absolute inset-x-0 top-20 z-20 sm:top-auto sm:bottom-0">
          <div className="mx-auto flex max-w-6xl justify-end px-6 sm:pb-6 md:px-10 md:pb-8">
            <a
              href="#about"
              className="pointer-events-auto font-mono text-[11px] tracking-[0.14em] whitespace-nowrap uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Skip intro ↓
            </a>
          </div>
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
