import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { SPONSORS } from "@/lib/site";

/** "Backed by" band: current sponsor logos plus an open slot. */
export default function SponsorStrip() {
  return (
    <section className="border-t border-line">
      <Container className="py-16">
        <div className="grid items-stretch gap-px border border-line bg-line md:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center bg-bg px-7 py-6 font-mono text-xs tracking-[0.18em] uppercase text-ink-faint">
            <span className="text-accent">03</span>&nbsp;/ Backed by
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 bg-bg px-7 py-8">
            {SPONSORS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={s.logoWidth}
                  height={s.logoHeight}
                  className="h-10 w-auto"
                />
              </a>
            ))}
          </div>

          <Link
            href="/sponsors"
            className="group flex items-center justify-between gap-6 bg-bg px-7 py-6 font-mono text-xs tracking-[0.14em] uppercase text-ink-muted transition-colors hover:bg-bg-raised hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            Your logo here
            <span
              aria-hidden="true"
              className="text-accent transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
