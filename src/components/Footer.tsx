import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/transparent-logo-dark.png"
            alt="UWHPC"
            width={351}
            height={222}
            className="h-auto w-10"
            unoptimized
          />
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} UWHPC &middot; University of
            Waterloo
          </span>
        </div>
        <div className="flex gap-5">
          {[
            { label: "Email", href: "mailto:uwhpc@uwaterloo.ca" },
            { label: "GitHub", href: "https://github.com/" },
            { label: "LinkedIn", href: "https://linkedin.com/" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
