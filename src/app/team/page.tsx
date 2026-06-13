import Image from "next/image";
import Nav from "@/components/Nav";
import { Container, Pins } from "@/components/ui";

export const metadata = {
  title: "Team - UWHPC",
  description: "Meet the UWHPC team.",
};

const team = [
  {
    name: "First Last",
    role: "Team Lead",
    image: "/logo-mark-dark.svg",
  },
  {
    name: "First Last",
    role: "Hardware Lead",
    image: "/logo-mark-dark.svg",
  },
  {
    name: "First Last",
    role: "Software Lead",
    image: "/logo-mark-dark.svg",
  },
  {
    name: "First Last",
    role: "Systems Lead",
    image: "/logo-mark-dark.svg",
  },
  {
    name: "First Last",
    role: "Member",
    image: "/logo-mark-dark.svg",
  },
  {
    name: "First Last",
    role: "Member",
    image: "/logo-mark-dark.svg",
  },
];

export default function TeamPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Container className="py-24">
          <div className="mb-14">
            <div className="mb-4 flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase">
              <span className="text-accent">01</span>
              <span className="text-ink-faint">/ Our Team</span>
            </div>
            <h1 className="mb-5 text-3xl font-bold tracking-tight uppercase font-stretch-expanded sm:text-4xl">
              Meet the Team
            </h1>
            <p className="max-w-md font-light text-ink-muted">
              The people behind UWHPC.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <div
                key={i}
                className="group relative min-h-72 border border-line bg-bg-panel p-5 transition-colors hover:border-line-strong"
              >
                <Pins className="absolute -top-[7px] left-5" />
                <Pins className="absolute -bottom-[7px] right-5" />

                <div className="mb-5 flex items-center justify-between border-b border-line pb-4 font-mono text-[0.65rem] tracking-[0.2em] text-ink-faint">
                  <span>MEMBER</span>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>

                <div className="mb-8 flex aspect-[4/3] items-center justify-center border border-line bg-bg">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={387}
                    height={234}
                    className="h-12 w-auto opacity-35 transition-opacity group-hover:opacity-60"
                    unoptimized
                  />
                </div>

                <div className="mt-auto">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {member.name}
                  </h3>
                  <p className="mt-2 font-mono text-xs tracking-[0.08em] text-ink-muted">
                    {member.role}
                  </p>
                  <div className="mt-6 h-px w-full bg-line transition-colors group-hover:bg-line-strong" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
