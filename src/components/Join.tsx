export default function Join() {
  return (
    <section id="join" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
          Get Involved
        </span>
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
          Join UWHPC
        </h2>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

          <h3 className="mb-3 text-xl font-semibold sm:text-2xl">
            We&apos;re always looking for driven people
          </h3>
          <p className="mx-auto mb-8 max-w-md font-light text-text-muted">
            Whether you&apos;re experienced in HPC or just curious about
            high-performance systems, there&apos;s a place for you on our team.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:uwhpc@uwaterloo.ca"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-light"
            >
              Contact Us
            </a>
            <a
              href="https://discord.gg/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-6 py-3 font-medium text-text transition-all hover:-translate-y-0.5 hover:border-text-muted"
            >
              Discord
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-6 py-3 font-medium text-text transition-all hover:-translate-y-0.5 hover:border-text-muted"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
