"use client";

import { useFadeIn } from "@/hooks/useFadeIn";

const projects = [
  {
    title: "Variational Monte Carlo",
    description:
      "A Monte Carlo engine for simulating the homogeneous electron gas. Implements a Slater\u2013Jastrow trial wavefunction and Metropolis sampling for electron configurations.",
    tags: ["C++", "Monte Carlo", "Quantum"],
    status: "In Progress",
    href: "https://github.com/UWHPC/Variational-Monte-Carlo",
  },
  {
    title: "FDTD Wave Solver",
    description:
      "Finite-difference time-domain solver for Maxwell\u2019s equations. Simulates electric and magnetic fields for various sources, validated with plane wave tests and analytical solutions.",
    tags: ["C++", "FDTD", "Electromagnetics"],
    status: "Completed",
    href: "https://github.com/karl-kes/FDTD-Wave-Solver",
  },
  {
    title: "N-Body Gravity Simulator",
    description:
      "N-body physics engine simulating gravity with symplectic Yoshida integration. Validated solar system dynamics with NASA JPL Horizons data across 249 years.",
    tags: ["C++", "Physics", "Simulation"],
    status: "Completed",
    href: "https://github.com/karl-kes/N-Body-Gravity-Simulator",
  },
];

function ProjectCard({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const ref = useFadeIn(index * 100);

  const content = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-accent">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted">
          {project.status}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{project.title}</h3>
      <p className="mb-4 text-sm/6 font-light text-text-muted">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-bg-elevated px-2 py-0.5 text-xs text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );

  const className =
    "opacity-0 translate-y-5 transition-all duration-500 ease-out group rounded-xl border border-border bg-bg-card p-6 hover:border-accent hover:-translate-y-0.5";

  if (project.href) {
    return (
      <a ref={ref} href={project.href} target="_blank" rel="noopener noreferrer" className={`block ${className}`}>
        {content}
      </a>
    );
  }

  return (
    <div ref={ref} className={className}>
      {content}
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="bg-bg-elevated px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
          Our Work
        </span>
        <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Projects
        </h2>
        <p className="mb-10 max-w-md font-light text-text-muted">
          What we&apos;re building and experimenting with.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={i} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
