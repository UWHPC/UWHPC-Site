"use client";

import { useFadeIn } from "@/hooks/useFadeIn";

const areas = [
    {
        title: "Parallel Computing",
        desc: "Designing and implementing parallel algorithms using MPI, OpenMP, and CUDA for multi-core and GPU architectures.",
    },
    {
        title: "Computational Physics",
        desc: "Building compute clusters and applying HPC techniques to physics simulations, numerical methods, and large-scale data processing.",
    },
    {
        title: "Performance Optimization",
        desc: "Vectorization, cache optimization, and low-level tuning to maximize computational throughput.",
    },
    {
        title: "Systems Programming",
        desc: "Low-level development in C, C++, and Rust. Writing the performant code that powers HPC workloads.",
    },
    {
        title: "Benchmarking & Profiling",
        desc: "System benchmarking, performance analysis, and building tooling to measure and optimize real-world workloads.",
    },
    {
        title: "Modern C++",
        desc: "Exploring advanced C++ features, template metaprogramming, constexpr, and zero-cost abstractions for high-performance code.",
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
