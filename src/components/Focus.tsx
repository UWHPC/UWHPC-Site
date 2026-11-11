import { Container, SectionHeader } from "@/components/ui";
import { FOCUS_AREAS } from "@/lib/site";

/**
 * Focus areas as an index of oversized rows. Every description is always
 * visible; hover only adds emphasis (a red rule draws across the top and
 * the index lights).
 */
export default function Focus() {
  return (
    <section id="focus" className="border-t border-line">
      <Container className="py-28">
        <SectionHeader
          index="02"
          kicker="What We Do"
          title="Focus Areas"
          blurb="We work across the stack, from numerical methods down to the code generation and systems that make them fast."
        />

        <ul className="border-b border-line">
          {FOCUS_AREAS.map((area, i) => (
            <li
              key={area.title}
              className="group relative grid gap-4 border-t border-line py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:py-10"
            >
              <span
                aria-hidden="true"
                className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-x-100"
              />

              <span className="font-mono text-sm text-ink-faint transition-colors group-hover:text-accent md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="text-[clamp(1.4rem,2.6vw,2.1rem)] leading-none font-bold tracking-tight uppercase font-stretch-expanded md:col-span-6">
                {area.title}
              </h3>

              <p className="text-sm/6 text-ink-muted transition-colors group-hover:text-ink md:col-span-5">
                {area.desc}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
