"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader } from "@/components/ui";
import { PROJECTS, type Project } from "@/lib/site";

function ProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const divRef = useFadeIn<HTMLDivElement>(index * 100);
  const anchorRef = useFadeIn<HTMLAnchorElement>(index * 100);

  const content = (
    <>
      <span className="font-mono text-xs text-accent md:col-span-1">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="md:col-span-6">
        <h3 className="mb-2 text-xl font-semibold tracking-tight">
          {project.title}
        </h3>
        <p className="max-w-prose text-sm/6 font-light text-ink-muted">
          {project.description}
        </p>
        <div className="mt-3 font-mono text-xs text-ink-faint md:hidden">
          {project.tags.join(" / ")}
        </div>
      </div>

      <div className="hidden font-mono text-xs text-ink-faint md:block md:col-span-3">
        {project.tags.join(" / ")}
      </div>

      <div className="flex items-center gap-4 md:col-span-2 md:justify-end">
        <span className="font-mono text-xs text-ink-muted">
          [{project.status}]
        </span>
        {project.href && (
          <span
            aria-hidden="true"
            className="font-mono text-sm text-ink-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          >
            ↗
          </span>
        )}
      </div>
    </>
  );

  const className =
    "opacity-0 translate-y-3 transition-all duration-500 ease-out group grid gap-3 border-t border-line py-7 md:grid-cols-12 md:items-baseline md:gap-4 hover:bg-bg-raised";

  if (project.href) {
    return (
      <a
        ref={anchorRef}
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <div ref={divRef} className={className}>
      {content}
    </div>
  );
}

export default function Projects({ as = "h2" }: { as?: "h1" | "h2" }) {
  return (
    <section id="projects" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader
          index="01"
          as={as}
          kicker="Our Work"
          title="Projects"
          blurb="What we're building and experimenting with."
        />

        <div className="border-b border-line">
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.title} project={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
