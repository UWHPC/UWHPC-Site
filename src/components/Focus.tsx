"use client";

import { useFadeIn } from "@/hooks/useFadeIn";

const areas = [
    {
        title: "Parallel Computing",
        desc: "Designing parallel algorithms with MPI, OpenMP, and CUDA for multi-core and GPU systems, and applying them to computational physics simulations and large-scale numerical workloads.",
    },
    {
        title: "Benchmarking & Profiling",
        desc: "Running system benchmarks, profiling real workloads, and building performance tooling to identify bottlenecks and guide optimization decisions.",
    },
    {
        title: "Performance Optimization",
        desc: "Maximizing throughput with vectorization, cache-aware tuning, and low-level systems programming in C, C++, and Rust, including modern C++ techniques for zero-cost abstractions.",
    },
];

function FadeCard({ children, index }: { children: React.ReactNode; index: number }) {
    const ref = useFadeIn(index * 100);

    return (
        <div
            ref={ref}
            className="opacity-0 translate-y-5 transition-all duration-500 ease-out rounded-xl border-l-2 border border-border border-l-accent/40 bg-bg-card p-6 hover:border-accent hover:border-l-accent hover:-translate-y-0.5"
        >
            {children}
        </div>
    );
}

export default function Focus() {
    return (
        <section id="focus" className="px-6 py-24">
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
                    {areas.map((a, i) => (
                        <FadeCard key={a.title} index={i}>
                            <span className="mb-3 block font-mono text-xs font-semibold text-accent">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mb-2 text-lg font-semibold">{a.title}</h3>
                            <p className="text-sm/6 font-light text-text-muted">{a.desc}</p>
                        </FadeCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
