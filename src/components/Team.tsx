"use client";

import Image from "next/image";
import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader, Pins } from "@/components/ui";

const preview = [
  { name: "First Last", role: "Team Lead", image: "/logo-mark-dark.svg" },
  { name: "First Last", role: "Hardware Lead", image: "/logo-mark-dark.svg" },
  { name: "First Last", role: "Software Lead", image: "/logo-mark-dark.svg" },
  { name: "First Last", role: "Systems Lead", image: "/logo-mark-dark.svg" },
];

function MemberCard({
  member,
  index,
}: {
  member: (typeof preview)[number];
  index: number;
}) {
  const ref = useFadeIn<HTMLDivElement>(index * 100);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-3 transition-all duration-500 ease-out group relative border border-line bg-bg-panel p-6 hover:border-line-strong"
    >
      <Pins className="absolute -top-[7px] left-6 transition-colors" />
      <Pins className="absolute -bottom-[7px] right-6" />

      <div className="mb-5 flex h-16 w-16 items-center justify-center border border-line">
        <Image
          src={member.image}
          alt={member.name}
          width={387}
          height={234}
          className="h-7 w-auto opacity-35 transition-opacity group-hover:opacity-60"
          unoptimized
        />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{member.name}</h3>
      <p className="mt-1 font-mono text-xs text-ink-muted">{member.role}</p>
    </div>
  );
}

export default function Team() {
  return (
    <section id="team" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader
          index="03"
          kicker="Our People"
          title="Team"
          blurb="A small group of students pushing the limits of what student hardware and software can do."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((m, i) => (
            <MemberCard key={i} member={m} index={i} />
          ))}
        </div>

        <div className="mt-10">
          <a
            href="/team"
            className="link-trace inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase text-accent transition-colors hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Meet the full team
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </Container>
    </section>
  );
}
