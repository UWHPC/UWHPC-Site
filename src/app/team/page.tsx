import Image from "next/image";
import Nav from "@/components/Nav";
import { Container, Pins } from "@/components/ui";

export const metadata = {
  title: "Team - UWHPC",
  description: "Meet the UWHPC team.",
};

const team = [
  {
    name: "James Redekopp",
    role: "Founder",
    image: "/team/james1.jpg",
    imageClassName: "object-cover object-[50%_28%]",
  },
  {
    name: "Karl Keshavarzi",
    role: "Founder",
    image: "/team/karl.jpg",
    imageClassName: "object-cover object-[50%_28%]",
  },
  {
    name: "Shpat Sahiti",
    role: "Software Developer",
    image: "/team/shpat.png",
    imageClassName: "object-cover object-center",
  },
  {
    name: "Alyan Salamat",
    role: "Software Developer",
    image: "/logo-mark-dark.svg",
  },
  {
    name: "Julian Salvador",
    role: "Software Developer",
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

          <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => {
              const isPlaceholder = member.image.endsWith(".svg");

              return (
                <div
                  key={i}
                  className="group relative flex w-full max-w-[21rem] flex-col border border-line bg-bg-panel p-6 transition-colors hover:border-line-strong"
                >
                  <Pins className="absolute -top-[7px] left-6" />
                  <Pins className="absolute -bottom-[7px] right-6" />

                  <div className="mb-6 flex items-center justify-between border-b border-line pb-4 font-mono text-[0.65rem] tracking-[0.2em] text-ink-faint">
                    <span>MEMBER</span>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="relative mb-7 flex aspect-[4/5] items-center justify-center overflow-hidden border border-line bg-bg">
                    {isPlaceholder ? (
                      <Image
                        src={member.image}
                        alt=""
                        width={387}
                        height={234}
                        className="h-12 w-auto opacity-35 transition-opacity group-hover:opacity-60"
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className={member.imageClassName ?? "object-contain object-center"}
                      />
                    )}
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
              );
            })}
          </div>
        </Container>
      </main>
    </>
  );
}
