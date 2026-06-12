"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader } from "@/components/ui";

type Channel = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const channels: Channel[] = [
  {
    label: "Email",
    value: "info@uwhpc.com",
    href: "mailto:info@uwhpc.com",
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    label: "Discord",
    value: "discord.gg/jUYuzNqV",
    href: "https://discord.gg/jUYuzNqV",
    external: true,
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <path d="M8 6c-2 .5-3.5 1.5-4.5 3.5C2 13 2.5 16 4 17.5c1 .5 2 .5 3 0l1-1.5" />
        <path d="M16 6c2 .5 3.5 1.5 4.5 3.5C22 13 21.5 16 20 17.5c-1 .5-2 .5-3 0l-1-1.5" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    value: "github.com/UWHPC",
    href: "https://github.com/UWHPC",
    external: true,
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6.2 0C6.6 2.7 5.6 3 5.6 3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.4c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/company/uw-hpc",
    href: "https://www.linkedin.com/company/uw-hpc/",
    external: true,
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 10v7" />
        <path d="M8 7v.01" />
        <path d="M12 17v-4a2 2 0 0 1 4 0v4" />
        <path d="M12 13v4" />
      </svg>
    ),
  },
];

function Row({ channel, index }: { channel: Channel; index: number }) {
  const ref = useFadeIn<HTMLAnchorElement>(index * 80);

  return (
    <a
      ref={ref}
      href={channel.href}
      target={channel.external ? "_blank" : undefined}
      rel={channel.external ? "noopener noreferrer" : undefined}
      className="opacity-0 translate-y-3 transition-all duration-500 ease-out group flex items-center gap-5 border-t border-line py-5 hover:bg-bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink-muted transition-colors group-hover:border-accent group-hover:text-accent">
        {channel.icon}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="block font-mono text-xs tracking-[0.15em] uppercase text-ink-faint">
            {channel.label}
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-ink transition-colors group-hover:text-accent sm:text-base">
            {channel.value}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="font-mono text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-accent"
        >
          →
        </span>
      </div>
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader
          index="05"
          kicker="Get in Touch"
          title="Contact"
          blurb="Reach out through whichever channel works best for you."
        />

        <div className="max-w-2xl border-b border-line">
          {channels.map((c, i) => (
            <Row key={c.label} channel={c} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
