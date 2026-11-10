import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Container, Pins } from "@/components/ui";
import { TEAM, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Team",
  description:
    "Meet the students behind UWHPC, the UW High Performance Computing design team at the University of Waterloo's Sedra Student Design Centre.",
  path: "/team",
});

type Member = {
  name: string;
  email: string;
  linkedin?: string;
  portfolio?: string;
};

const MEMBERS: Member[] = [
  { name: "Aayush Sood", email: "aayush.sood@uwaterloo.ca" },
  { name: "Abdul Hakeem Farooqi", email: "abdulfarooqi2008@gmail.com" },
  { name: "Alexander Pershukevich", email: "apershuk@uwaterloo.ca" },
  { name: "Ben Gavieres", email: "bgaviere@uwaterloo.ca" },
  { name: "Calo Zheng", email: "calozheng80@gmail.com" },
  { name: "Colin Cai", email: "c49cai@uwaterloo.ca" },
  { name: "Dan Li", email: "d22li@uwaterloo.ca" },
  { name: "Daniel Xu", email: "danxu876@gmail.com" },
  { name: "Eason Huang", email: "easonh887@gmail.com" },
  { name: "Erfan Saffari", email: "esaffari@uwaterloo.ca" },
  { name: "Ethan Lem", email: "e2lem@uwaterloo.ca" },
  { name: "Kevin Xu", email: "k258xu@uwaterloo.ca" },
  { name: "Megan Lee", email: "m89lee@uwaterloo.ca" },
  { name: "Qinkai Li", email: "q95li@uwaterloo.ca" },
  { name: "Robert Lu", email: "robertcxlee@gmail.com" },
  { name: "Sharon Basovich", email: "sharon@basovich.com" },
  { name: "Steven Cao", email: "s3cao@uwaterloo.ca" },
];

const iconLinkClass =
  "inline-flex h-8 w-8 items-center justify-center border border-line text-ink-muted transition-colors hover:border-accent hover:text-accent";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

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
            {TEAM.map((member, i) => {
              const isPlaceholder = member.image.endsWith(".svg");

              return (
                <div
                  key={member.name}
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
                    <h2 className="text-xl font-semibold tracking-tight">
                      {member.name}
                    </h2>
                    <p className="mt-2 font-mono text-xs tracking-[0.08em] text-ink-muted">
                      {member.role}
                    </p>
                    <div className="mt-6 h-px w-full bg-line transition-colors group-hover:bg-line-strong" />
                  </div>
                </div>
              );
            })}
          </div>

          <section className="mt-24">
            <div className="mb-10">
              <div className="mb-4 flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase">
                <span className="text-accent">02</span>
                <span className="text-ink-faint">/ Members</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight uppercase font-stretch-expanded sm:text-3xl">
                Members
              </h2>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {MEMBERS.map((m, i) => (
                <li
                  key={m.name}
                  className="flex flex-col gap-4 border border-line bg-bg-panel px-5 py-4 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[0.65rem] tracking-[0.2em] text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium tracking-tight">
                      {m.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${m.email}`}
                      aria-label={`Email ${m.name}`}
                      title={m.email}
                      className={iconLinkClass}
                    >
                      <MailIcon />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
