import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Container, Pins } from "@/components/ui";
import { TEAM, TEAM_GROUPS, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Team",
  description:
    "Meet the students behind UWHPC, the UW High Performance Computing design team at the University of Waterloo's Sedra Student Design Centre.",
  path: "/team",
});

/** A profile link, or its label dimmed until the link is filled in. */
function ProfileLink({ href, label, name }: { href?: string; label: string; name: string }) {
  if (!href) return <span className="text-ink-faint/60">{label}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on ${label}`}
      className="group/link inline-flex items-center gap-1.5 text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="link-trace">{label}</span>
      <span aria-hidden="true" className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
        ↗
      </span>
    </a>
  );
}

/** Everyone in the order they appear on the page, so cards number 01, 02… down it. */
const PAGE_ORDER = TEAM_GROUPS.flatMap((g) => TEAM.filter((m) => m.group === g));

export default function TeamPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Container className="py-24">
          <div className="mb-14">
            <div className="mb-4 flex items-baseline gap-3 font-mono text-xs tracking-[0.18em] uppercase">
              <span className="text-accent">01</span>
              <span className="text-ink-faint">/ Our Team</span>
            </div>
            <h1 className="mb-5 text-3xl font-bold tracking-tight uppercase font-stretch-expanded sm:text-4xl">
              Meet the Team
            </h1>
            <p className="max-w-md text-ink-muted">
              The people behind UWHPC.
            </p>
          </div>

          <div className="space-y-14">
            {TEAM_GROUPS.map((group) => {
              const members = TEAM.filter((m) => m.group === group);
              if (members.length === 0) return null;
              return (
                <section key={group} aria-labelledby={`team-${group}`}>
                  <h2
                    id={`team-${group}`}
                    className="mb-6 flex items-center gap-4 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint after:h-px after:flex-1 after:bg-line"
                  >
                    {group}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-5">
                    {members.map((member) => {
                      const n = PAGE_ORDER.indexOf(member) + 1;
                      return (
                        <div
                          key={member.name}
                          className="group relative flex w-full flex-col border border-line bg-bg-panel p-5 transition-colors hover:border-line-strong sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
                        >
                          <Pins className="absolute -top-[7px] left-5" />

                          <span className="mb-4 font-mono text-[11px] tracking-[0.18em] text-ink-faint">
                            {String(n).padStart(2, "0")}
                          </span>
                          <h3 className="text-base font-semibold tracking-tight">{member.name}</h3>
                          <p className="mt-1 mb-5 font-mono text-[11px] tracking-[0.06em] text-ink-muted">{member.role}</p>

                          <div className="mt-auto flex items-center gap-5 border-t border-line pt-3 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors group-hover:border-line-strong">
                            <ProfileLink href={member.linkedin} label="LinkedIn" name={member.name} />
                            <ProfileLink href={member.portfolio} label="Portfolio" name={member.name} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
