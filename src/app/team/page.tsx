import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Team — UWHPC",
  description: "Meet the UWHPC team.",
};

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
          The people behind UWHPC. More coming soon.
        </p>

        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <p className="text-text-muted">Team member profiles coming soon.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
