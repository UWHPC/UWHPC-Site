import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Container, Pins } from "@/components/ui";
import {
  CONTACT_EMAIL,
  SPONSORS,
  SPONSOR_TIERS,
  type SponsorTier,
  pageMetadata,
} from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Sponsors",
  description:
    "The organizations supporting UWHPC, the UW High Performance Computing design team at the University of Waterloo, and how to partner with us.",
  path: "/sponsors",
});

/** Higher tiers get a larger logo, matching the sponsorship package. */
const tierStyle: Record<SponsorTier, { label: string; logo: string }> = {
  Diamond: { label: "text-sky-200", logo: "h-20 sm:h-24" },
  Gold: { label: "text-[#d9b54a]", logo: "h-16 sm:h-20" },
  Silver: { label: "text-ink", logo: "h-12 sm:h-14" },
  Bronze: { label: "text-[#c08457]", logo: "h-9 sm:h-10" },
};

export default function SponsorsPage() {
  const tiers = SPONSOR_TIERS.map((tier) => ({
    tier,
    sponsors: SPONSORS.filter((s) => s.tier === tier),
  })).filter((t) => t.sponsors.length > 0);

  return (
    <>
      <Nav />
      <main className="pt-16">
        <Container className="py-24">
          <div className="mb-14">
            <div className="mb-4 flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase">
              <span className="text-accent">01</span>
              <span className="text-ink-faint">/ Our Partners</span>
            </div>
            <h1 className="mb-5 text-3xl font-bold tracking-tight uppercase font-stretch-expanded sm:text-4xl">
              Sponsors
            </h1>
            <p className="max-w-md font-light text-ink-muted">
              The organizations funding the hardware, compute, and
              infrastructure behind our work.
            </p>
          </div>

          <div className="space-y-12">
            {tiers.map(({ tier, sponsors }) => (
              <section key={tier}>
                <h2 className="mb-5 flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase">
                  <span className={tierStyle[tier].label}>{tier}</span>
                  <span className="text-ink-faint">/ Sponsor</span>
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {sponsors.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex min-h-56 items-center justify-center border border-line bg-bg-panel px-10 py-14 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Pins className="absolute -top-[7px] left-6" />
                      <Pins className="absolute -bottom-[7px] right-6" />
                      <Image
                        src={s.logo}
                        alt={s.name}
                        width={s.logoWidth}
                        height={s.logoHeight}
                        className={`${tierStyle[tier].logo} w-auto max-w-full opacity-90 transition-opacity group-hover:opacity-100`}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-4 right-5 font-mono text-sm text-ink-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      >
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>

        <section className="border-t border-line">
          <Container className="py-24">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <div className="mb-4 flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase">
                  <span className="text-accent">02</span>
                  <span className="text-ink-faint">/ Partner With Us</span>
                </div>
                <h2 className="mb-5 text-3xl font-bold tracking-tight uppercase font-stretch-expanded sm:text-4xl">
                  Become a Sponsor
                </h2>
                <p className="max-w-prose font-light text-ink-muted">
                  Sponsorship funds GPUs, compute access, and project
                  infrastructure for hands-on engineering work, and gives your
                  team a focused point of contact with students interested in
                  systems and performance engineering. Email us with your goals
                  and we&apos;ll send our sponsorship package.
                </p>
              </div>
              <div className="md:col-span-5 md:justify-self-end">
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Sponsoring%20UWHPC`}
                  className="inline-block bg-accent px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
