const stats = [
  { value: "HPC", label: "Core Focus" },
  { value: "UW", label: "Waterloo Based" },
  { value: "//", label: "Performance Driven" },
  { value: "++", label: "Student Led" },
];

export default function About() {
  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-accent">
          About Us
        </span>
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
          Building the future of computation
        </h2>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <p className="text-base/7 font-light text-text-muted">
            We build clusters, crush benchmarks, and compete — UWHPC is
            Waterloo&apos;s team for students who want to push hardware and code
            to their absolute limits.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-bg-card p-5"
              >
                <div className="mb-1 text-2xl font-bold text-accent">
                  {s.value}
                </div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
