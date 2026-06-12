import Image from "next/image";
import { Container, Fiducial } from "@/components/ui";

export default function Hero() {
  return (
    <section className="relative pt-16">
      <Container className="blueprint-grid relative flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20">
        <Fiducial className="bottom-4 left-4 hidden md:block" />
        <Fiducial className="bottom-4 right-4 hidden md:block" />

        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div
              className="animate-rise mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase text-ink-muted"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="h-1.5 w-1.5 bg-accent animate-blink" />
              University of Waterloo
            </div>

            <h1
              className="animate-rise mb-7 text-5xl font-bold tracking-tight font-stretch-expanded leading-[0.98] sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "0.15s" }}
            >
              UW <span className="text-accent">High Performance</span>{" "}
              Computing
            </h1>

            <p
              className="animate-rise mb-10 max-w-lg text-lg font-light text-ink-muted"
              style={{ animationDelay: "0.25s" }}
            >
              A student design team at the University of Waterloo pushing the
              boundaries of parallel and high-performance computing.
            </p>

            <div
              className="animate-rise flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.35s" }}
            >
              <a
                href="#join"
                className="bg-accent px-7 py-3.5 text-center font-mono text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Join the Team
              </a>
              <a
                href="#projects"
                className="border border-line-strong px-7 py-3.5 text-center font-mono text-xs tracking-[0.15em] uppercase text-ink transition-colors hover:border-ink-muted hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Learn More
              </a>
            </div>
          </div>

          <div
            className="animate-rise order-first md:order-none md:col-span-5"
            style={{ animationDelay: "0.2s" }}
          >
            <Image
              src="/logo-mark-dark.svg"
              alt="UWHPC logo — a microchip with speed trails"
              width={387}
              height={234}
              className="w-44 md:w-full md:max-w-[420px] md:justify-self-end"
              priority
              unoptimized
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
