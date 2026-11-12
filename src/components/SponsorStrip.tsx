import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { SPONSORS } from "@/lib/site";

/**
 * "Backed by" band: sponsor logos scroll past in an endless loop (the row
 * is drawn twice and slides by half its width, so the seam never shows),
 * plus an open slot. It only moves once there are two or more sponsors;
 * with one, the logo simply sits centred.
 */
const REPEAT = 4; // logos per half of the track, so a short list still fills it
export default function SponsorStrip() {
  const scrolls = SPONSORS.length > 1;
  const logos = scrolls
    ? [0, 1].flatMap((half) =>
        Array.from({ length: REPEAT }, (_, r) =>
          SPONSORS.map((s, i) => ({ s, key: `${half}-${r}-${i}`, hidden: half === 1 || r > 0 }))
        ).flat()
      )
    : SPONSORS.map((s) => ({ s, key: s.name, hidden: false }));
  return (
    <section className="border-t border-line">
      <Container className="py-16">
        <div className="grid items-stretch gap-px border border-line bg-line md:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center bg-bg px-7 py-6 font-mono text-xs tracking-[0.18em] uppercase text-ink-faint">
            Backed by
          </div>

          <div className={`min-w-0 overflow-hidden bg-bg py-8 ${scrolls ? "sponsor-carousel" : ""}`}>
            <div className={scrolls ? "sponsor-track flex w-max items-center" : "flex items-center justify-center"}>
            {logos.map(({ s, key, hidden }) => (
              <a
                key={key}
                aria-hidden={hidden || undefined}
                tabIndex={hidden ? -1 : undefined}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-10 shrink-0 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
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
