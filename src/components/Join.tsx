"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader, Pins, Fiducial } from "@/components/ui";

export default function Join() {
  const bannerRef = useFadeIn(100);

  return (
    <section id="join" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader index="06" kicker="Get Involved" title="Join UWHPC" />

        <div
          ref={bannerRef}
          className="opacity-0 translate-y-3 transition-all duration-700 ease-out relative border border-line-strong bg-bg-panel p-10 text-center sm:p-16"
        >
          <Fiducial className="top-3 left-3" />
          <Fiducial className="top-3 right-3" />
          <Fiducial className="bottom-3 left-3" />
          <Fiducial className="bottom-3 right-3" />
          <Pins className="absolute -top-[7px] left-1/2 -translate-x-1/2" />
          <Pins className="absolute -bottom-[7px] left-1/2 -translate-x-1/2" />

          <h3 className="mb-3 text-xl font-semibold tracking-tight sm:text-2xl">
            We&apos;re always looking for driven people
          </h3>
          <p className="mx-auto mb-9 max-w-md font-light text-ink-muted">
            Whether you&apos;re experienced in HPC or just curious about
            high-performance systems, there&apos;s a place for you on our team.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:info@uwhpc.com"
              className="bg-accent px-7 py-3.5 font-mono text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Contact Us
            </a>
            <a
              href="https://discord.gg/jUYuzNqV"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-line-strong px-7 py-3.5 font-mono text-xs tracking-[0.15em] uppercase text-ink transition-colors hover:border-ink-muted hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Discord
            </a>
            {/*
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-line-strong px-7 py-3.5 font-mono text-xs tracking-[0.15em] uppercase text-ink transition-colors hover:border-ink-muted hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Instagram
            </a>*/}
          </div>
        </div>
      </Container>
    </section>
  );
}
