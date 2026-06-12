import Image from "next/image";

const links = [
  { label: "Email", href: "mailto:info@uwhpc.com" },
  { label: "GitHub", href: "https://github.com/UWHPC" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/uw-hpc/",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl border-line md:grid-cols-[1fr_auto] md:border-x">
        <div className="flex items-center gap-4 px-6 py-6 md:px-10">
          <Image
            src="/logo-mark-dark.svg"
            alt="UWHPC"
            width={387}
            height={234}
            className="h-6 w-auto"
            unoptimized
          />
          <span className="font-mono text-xs text-ink-muted">
            {`© ${new Date().getFullYear()} UWHPC · University of Waterloo`}
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-t border-line md:border-t-0 md:border-l">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-6 text-center font-mono text-xs tracking-[0.15em] uppercase text-ink-muted transition-colors hover:bg-bg-raised hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:px-8"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
