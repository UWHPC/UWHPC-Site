import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Team — UWHPC",
  description: "Meet the UWHPC team.",
};

const team = [
  {
    name: "First Last",
    role: "Team Lead",
    image: "/transparent-logo-dark.png",
  },
  {
    name: "First Last",
    role: "Hardware Lead",
    image: "/transparent-logo-dark.png",
  },
  {
    name: "First Last",
    role: "Software Lead",
    image: "/transparent-logo-dark.png",
  },
  {
    name: "First Last",
    role: "Systems Lead",
    image: "/transparent-logo-dark.png",
  },
  {
    name: "First Last",
    role: "Member",
    image: "/transparent-logo-dark.png",
  },
  {
    name: "First Last",
    role: "Member",
    image: "/transparent-logo-dark.png",
  },
];

export default function TeamPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
          Our Team
        </span>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Meet the Team
        </h1>
        <p className="mb-16 max-w-md font-light text-text-muted">
          The people behind UWHPC.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border bg-bg-card p-6 transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-bg-elevated">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="h-12 w-auto opacity-40"
                  unoptimized
                />
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
