"use client";

import { useEffect, useRef } from "react";

const areas = [
  {
    title: "Parallel Computing",
    desc: "Designing and implementing parallel algorithms using MPI, OpenMP, and CUDA for multi-core and GPU architectures.",
  },
  {
    title: "Cluster Architecture",
    desc: "Building and optimizing compute clusters, exploring interconnect topologies, and system benchmarking.",
  },
  {
    title: "Performance Optimization",
    desc: "Profiling, vectorization, cache optimization, and low-level tuning to maximize computational throughput.",
  },
  {
    title: "Scientific Computing",
    desc: "Applying HPC techniques to simulations, numerical methods, and large-scale data processing.",
  },
  {
    title: "Systems Programming",
    desc: "Low-level development in C, C++, and Rust — writing the performant code that powers HPC workloads.",
  },
  {
    title: "Competitions",
    desc: "Competing in HPC challenges like the Student Cluster Competition, benchmarking and tuning real-world applications.",
  },
];

function FadeCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-5");
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-5 transition-all duration-500 ease-out rounded-xl border border-border bg-bg-card p-6 hover:border-accent hover:-translate-y-0.5"
    >
      {children}
    </div>
  );
}

export default function Focus() {
  return (
    <section id="focus" className="bg-bg-elevated px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
          What We Do
        </span>
        <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Focus Areas
        </h2>
        <p className="mb-10 max-w-md font-light text-text-muted">
          We tackle challenging problems across the HPC stack, from hardware to
          algorithms.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <FadeCard key={a.title}>
              <h3 className="mb-2 text-lg font-semibold">{a.title}</h3>
              <p className="text-sm/6 font-light text-text-muted">{a.desc}</p>
            </FadeCard>
          ))}
        </div>
      </div>
    </section>
  );
}
