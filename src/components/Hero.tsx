import Image from "next/image";

export default function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-3xl" />

      <Image
        src="/logo-dark.png"
        alt="UWHPC Logo"
        width={240}
        height={240}
        className="mb-8 h-[120px] w-[120px] animate-float"
        priority
        unoptimized
      />

      <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        UW <span className="text-accent">High Performance</span>
        <br />
        Computing
      </h1>

      <p className="mb-10 max-w-lg text-lg font-light text-text-muted">
        A student design team at the University of Waterloo pushing the
        boundaries of parallel and high-performance computing.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="#join"
          className="rounded-lg bg-accent px-7 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-light"
        >
          Join the Team
        </a>
        <a
          href="#about"
          className="rounded-lg border border-border px-7 py-3 font-medium text-text transition-all hover:-translate-y-0.5 hover:border-text-muted"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}
