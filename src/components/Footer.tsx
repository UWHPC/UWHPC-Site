import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";

const social = [
  { label: "GitHub", href: SOCIAL_LINKS.github },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
  { label: "Discord", href: SOCIAL_LINKS.discord },
  { label: "Instagram", href: SOCIAL_LINKS.instagram },
  { label: "X", href: SOCIAL_LINKS.x },
];

const pages = [
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" },
  { label: "Join", href: "/join" },
];

const label =
  "mb-3 block font-mono text-[11px] tracking-[0.18em] uppercase text-ink-faint";
const link =
  "link-trace text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Footer as an engineering drawing's title block: a ruled grid of
 * labelled fields, closing the "datasheet" the page has been all along.
 */
export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl border-line md:border-x">
        <div className="grid border-b border-line md:grid-cols-12">
          {/* identity */}
          <div className="flex flex-col justify-between gap-10 border-b border-line p-6 md:col-span-5 md:border-r md:border-b-0 md:p-8">
            <Image
              src="/logo-mark-dark.svg"
              alt="UWHPC"
              width={387}
              height={234}
              className="h-9 w-auto self-start"
              unoptimized
            />
            <p className="max-w-xs text-sm/6 text-ink-muted">
              UW High Performance Computing. A student design team at the
              University of Waterloo&apos;s Sedra Student Design Centre.
            </p>
          </div>

          {/* sheet */}
          <nav aria-label="Pages" className="border-b border-line p-6 md:col-span-3 md:border-r md:border-b-0 md:p-8">
            <span className={label}>Sheet</span>
            <ul className="space-y-2.5">
              {pages.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact */}
          <div className="p-6 md:col-span-4 md:p-8">
            <span className={label}>Contact</span>
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${link} text-ink`}>
              {CONTACT_EMAIL}
            </a>
            <span className={`${label} mt-8`}>Elsewhere</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
              {social.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* title-block strip */}
        <dl className="grid grid-cols-2 font-mono text-[11px] tracking-[0.14em] uppercase sm:grid-cols-4">
          {[
            ["Title", "UWHPC"],
            ["Location", "Waterloo, ON"],
            ["Rev", String(new Date().getFullYear())],
            ["Scale", "1 : 1"],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 md:px-8 ${
                i % 2 === 1 ? "border-l border-line" : ""
              } ${i === 2 ? "sm:border-l sm:border-line" : ""} ${
                i < 2 ? "border-b border-line sm:border-b-0" : ""
              }`}
            >
              <dt className="text-ink-faint">{k}</dt>
              <dd className="text-ink-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
