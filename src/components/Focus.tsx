"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader } from "@/components/ui";
import { FOCUS_AREAS } from "@/lib/site";

function FocusColumn({
    area,
    index,
}: {
    area: (typeof FOCUS_AREAS)[number];
    index: number;
}) {
    const ref = useFadeIn(index * 100);

    return (
        <div
            ref={ref}
            className="opacity-0 translate-y-3 transition-all duration-500 ease-out group border border-line p-7 transition-colors hover:border-line-strong"
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
                    blurb="We work across the stack, from numerical methods down to the code generation and systems that make them fast."
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FOCUS_AREAS.map((a, i) => (
                        <FocusColumn key={a.title} area={a} index={i} />
                    ))}
                </div>
            </Container>
        </section>
    );
}
