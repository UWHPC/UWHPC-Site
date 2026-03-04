"use client";

import Image from "next/image";
import { useFadeIn } from "@/hooks/useFadeIn";

export default function Hero() {
  const headingRef = useFadeIn(200);
  const subtextRef = useFadeIn(400);
  const buttonsRef = useFadeIn(600);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-3xl animate-pulse-glow" />

      <Image
        src="/transparent-logo-dark.png"
        alt="UWHPC Logo"
        width={351}
        height={222}
        className="mb-8 h-auto w-[190px] animate-float"
        priority
        unoptimized
      />

      <div ref={headingRef} className="opacity-0 translate-y-5 transition-all duration-700 ease-out">
        <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          UW <span className="text-accent">High Performance</span>
          <br />
          Computing
        </h1>
      </div>

      <div ref={subtextRef} className="opacity-0 translate-y-5 transition-all duration-700 ease-out">
        <p className="mb-10 max-w-lg text-lg font-light text-text-muted">
          A student design team at the University of Waterloo pushing the
          boundaries of parallel and high-performance computing.
        </p>
      </div>

      <div ref={buttonsRef} className="opacity-0 translate-y-5 transition-all duration-700 ease-out">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#join"
            className="rounded-lg bg-accent px-7 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Join the Team
          </a>
          <a
            href="#about"
            className="rounded-lg border border-border px-7 py-3 font-medium text-text transition-all hover:-translate-y-0.5 hover:border-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
