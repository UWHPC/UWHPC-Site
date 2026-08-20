"use client";

import Link from "next/link";
import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader, Pins, Fiducial } from "@/components/ui";

export default function Join({ as = "h2" }: { as?: "h1" | "h2" }) {
  const bannerRef = useFadeIn(100);

  return (
    <section id="join" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader
          index="06"
          as={as}
          kicker="Get Involved"
          title="Join UWHPC"
        />

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

          <div className="grid gap-10 sm:grid-cols-2 sm:gap-0">
            {/* Students → onboarding */}
            <div className="flex flex-col items-center text-center sm:px-10">
              <span className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-ink-faint">
                For Students
              </span>
              <h3 className="mb-3 text-xl font-semibold tracking-tight sm:text-2xl">
                Ready to join?
              </h3>
              <p className="mb-8 max-w-xs font-light text-ink-muted">
                New members start here. Our onboarding guide walks you through
                everything you need to get up and running with the team.
              </p>
              <a
                href="https://docs.uwhpc.com/onboarding/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto bg-accent px-7 py-3.5 font-mono text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Start Onboarding
              </a>
            </div>

            {/* Sponsors & partners → contact */}
            <div className="flex flex-col items-center border-t border-line-strong pt-10 text-center sm:border-t-0 sm:border-l sm:px-10 sm:pt-0">
              <span className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-ink-faint">
                Sponsors &amp; Partners
              </span>
              <h3 className="mb-3 text-xl font-semibold tracking-tight sm:text-2xl">
                Work with us
              </h3>
              <p className="mb-8 max-w-xs font-light text-ink-muted">
                Interested in sponsoring, partnering, or have a general inquiry?
                We&apos;d love to hear from you.
              </p>
              <Link
                href="/contact"
                className="mt-auto border border-line-strong px-7 py-3.5 font-mono text-xs tracking-[0.15em] uppercase text-ink transition-colors hover:border-ink-muted hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-6 text-center">
            <a
              href="https://discord.gg/Q54uuaWvhA"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-[0.15em] uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Or join our Discord &rarr;
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
