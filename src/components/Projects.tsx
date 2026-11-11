import type { ReactNode } from "react";
import { Container, SectionHeader, Fiducial } from "@/components/ui";
import { PROJECTS, type Project } from "@/lib/site";
import BeamPattern from "@/components/BeamPattern";
import DegreeSkew from "@/components/DegreeSkew";
import XpuLayout from "@/components/XpuLayout";
import CorrelationHole from "@/components/CorrelationHole";

/** Each visual is drawn from the project's own spec or source. */
const VISUALS: Record<string, ReactNode> = {
  BATS: <BeamPattern />,
  Maverick: <DegreeSkew />,
  XPU: <XpuLayout />,
  "Variational Monte Carlo": <CorrelationHole />,
};

function SourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] uppercase text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="link-trace">Source</span>
      <span
        aria-hidden="true"
        className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
      >
        ↗
      </span>
    </a>
  );
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  const visual = VISUALS[project.title];
  const flip = index % 2 === 1;

  return (
    <article className="grid border border-line bg-bg-raised transition-colors hover:border-line-strong md:grid-cols-2">
      <div
        className={`flex min-w-0 flex-col p-7 sm:p-10 ${flip ? "md:order-2 md:border-l md:border-line" : ""}`}
      >
        <div className="mb-10 flex items-center justify-between font-mono text-xs tracking-[0.18em] uppercase">
          <span className="text-accent">P{String(index + 1).padStart(2, "0")}</span>
          <span className="flex items-center gap-2 text-ink-muted">
            <span className="h-1.5 w-1.5 bg-accent" />
            {project.status}
          </span>
        </div>

        <h3 className="text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[0.92] font-extrabold tracking-[-0.02em] uppercase font-stretch-expanded">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="mt-3 max-w-sm text-lg/snug font-medium text-ink-muted">
            {project.subtitle}
          </p>
        )}
        <p className="mt-6 mb-8 max-w-prose text-[15px]/7 text-ink-muted">
          {project.description}
        </p>

        {project.leads && (
          <p className="mb-6 font-mono text-[11px] tracking-[0.14em] uppercase text-ink-faint">
            Leads{" "}
            <span className="ml-2 tracking-normal normal-case text-ink-muted">
              {project.leads.join(" · ")}
            </span>
          </p>
        )}

        {project.href && (
          <div className="mt-auto flex justify-end">
            <SourceLink href={project.href} />
          </div>
        )}
      </div>

      <div
        className={`relative min-w-0 border-t border-line bg-bg md:border-t-0 ${flip ? "md:order-1" : "md:border-l"}`}
      >
        {visual ?? (
          <div className="blueprint-grid h-full min-h-72">
            <Fiducial className="top-3 left-3" />
            <Fiducial className="top-3 right-3" />
            <Fiducial className="bottom-3 left-3" />
            <Fiducial className="right-3 bottom-3" />
          </div>
        )}
      </div>
    </article>
  );
}

/** Compact ledger row for earlier and supporting work. */
function LedgerRow({ project, index }: { project: Project; index: number }) {
  return (
    <li className="grid gap-3 border-t border-line py-6 md:grid-cols-12 md:items-baseline md:gap-6">
      <span className="font-mono text-xs text-ink-faint md:col-span-1">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h4 className="text-xl font-bold tracking-tight uppercase font-stretch-expanded md:col-span-3">
        {project.title}
      </h4>
      <p className="text-sm/6 text-ink-muted md:col-span-6">{project.description}</p>
      <div className="flex items-center gap-4 md:col-span-2 md:justify-end">
        {project.href && <SourceLink href={project.href} />}
      </div>
    </li>
  );
}

/**
 * Featured projects as large panels with live visuals. On the home page,
 * other work is listed compactly beneath; `all` shows every project as a
 * full panel (used by /projects).
 */
export default function Projects({
  as = "h2",
  all = false,
}: {
  as?: "h1" | "h2";
  all?: boolean;
}) {
  const featured = PROJECTS.filter((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);
  const panels = all ? [...featured, ...rest] : featured;

  return (
    <section id="projects" className="border-t border-line">
      <Container className="py-28">
        <SectionHeader
          index="01"
          as={as}
          kicker="Our Work"
          title="Projects"
          blurb="What we're building now, and the tools we've built along the way."
        />

        <div className="space-y-8">
          {panels.map((p, i) => (
            <ProjectPanel key={p.title} project={p} index={i} />
          ))}
        </div>

        {!all && rest.length > 0 && (
          <div className="mt-20">
            <p className="mb-6 font-mono text-xs tracking-[0.18em] uppercase text-ink-faint">
              Earlier work &amp; tools
            </p>
            <ul className="border-b border-line">
              {rest.map((p, i) => (
                <LedgerRow key={p.title} project={p} index={featured.length + i} />
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}
