"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader } from "@/components/ui";

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

function FocusColumn({
    area,
    index,
}: {
    area: (typeof areas)[number];
    index: number;
}) {
    const ref = useFadeIn(index * 100);

    return (
        <div
            ref={ref}
            className="opacity-0 translate-y-3 transition-all duration-500 ease-out group py-8 md:py-2 md:px-8 md:first:pl-0 md:last:pr-0"
        >
            <span className="mb-5 block font-mono text-2xl text-line-strong transition-colors group-hover:text-accent">
                {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">
                {area.title}
            </h3>
            <p className="text-sm/6 font-light text-ink-muted">{area.desc}</p>
        </div>
    );
}

export default function Focus() {
    return (
        <section id="focus" className="border-t border-line">
            <Container className="py-24">
                <SectionHeader
                    index="02"
                    kicker="What We Do"
                    title="Focus Areas"
                    blurb="We tackle challenging problems across the HPC stack, from hardware to algorithms."
                />

                <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
                    {areas.map((a, i) => (
                        <FocusColumn key={a.title} area={a} index={i} />
                    ))}
                </div>
            </Container>
        </section>
    );
}
