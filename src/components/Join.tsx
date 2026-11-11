import Link from "next/link";
import { Container } from "@/components/ui";
import { SOCIAL_LINKS } from "@/lib/site";

const PATHS = [
  {
    kicker: "For Students",
    title: "Ready to join?",
    body: "New members start here. Join our Discord to meet the team, hear about upcoming meetings, and find a project to get involved in.",
    cta: "Join our Discord",
    href: SOCIAL_LINKS.discord,
    external: true,
    primary: true,
  },
  {
    kicker: "Sponsors & Partners",
    title: "Work with us",
    body: "Interested in sponsoring, partnering, or have a general inquiry? We'd love to hear from you.",
    cta: "Get in Touch",
    href: "/contact",
    external: false,
    primary: false,
  },
];

export default function Join({ as = "h2" }: { as?: "h1" | "h2" }) {
  const Heading = as;

  return (
    <section id="join" className="relative overflow-hidden border-t border-line">
      {/* ember glow rising from below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_105%,rgb(205_57_60/0.2),transparent)]"
      />

      <Container className="relative py-28 sm:py-36">
        <div className="mb-8 flex items-baseline gap-3 font-mono text-xs tracking-[0.18em] uppercase">
          <span className="text-accent">04</span>
          <span className="text-ink-faint">/ Get Involved</span>
        </div>

        <Heading className="mb-16 text-[clamp(3rem,11vw,9rem)] leading-[0.85] font-extrabold tracking-[-0.02em] uppercase font-stretch-expanded">
          <span className="block text-ink-muted">Join</span>
          <span className="block">
            UW<span className="text-accent">HPC</span>
          </span>
        </Heading>

        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          {PATHS.map((p) => {
            const inner = (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-y-100 ${
                    p.primary ? "bg-accent" : "bg-bg-panel"
                  }`}
                />
                <span className="relative mb-10 block font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint transition-colors group-hover:text-ink">
                  {p.kicker}
                </span>
                <span className="relative mb-3 block text-2xl font-semibold tracking-tight sm:text-3xl">
                  {p.title}
                </span>
                <span
                  className={`relative mb-10 block max-w-sm text-ink-muted transition-colors ${
                    p.primary ? "group-hover:text-white/85" : ""
                  }`}
                >
                  {p.body}
                </span>
                <span className="relative mt-auto flex items-center justify-between font-mono text-xs tracking-[0.14em] uppercase">
                  {p.cta}
                  <span
                    aria-hidden="true"
                    className="text-2xl leading-none text-accent transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink"
                  >
                    →
                  </span>
                </span>
              </>
            );
            const cls =
              "group relative flex min-h-80 flex-col overflow-hidden bg-bg p-8 sm:p-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";

            return p.external ? (
              <a key={p.kicker} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <Link key={p.kicker} href={p.href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
