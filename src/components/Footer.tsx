"use client";

import Image from "next/image";
import { useFadeIn } from "@/hooks/useFadeIn";

export default function Footer() {
  const ref = useFadeIn(0);

  return (
    <footer ref={ref} className="opacity-0 translate-y-5 transition-all duration-700 ease-out border-t border-border px-6 py-8">
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
              className="text-sm text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
