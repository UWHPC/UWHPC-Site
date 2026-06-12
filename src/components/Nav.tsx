"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Team", href: "#team" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
  { label: "Join", href: "#join" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="chip-nav fixed top-0 left-0 right-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between border-line px-6 md:border-x md:px-10">
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Image
            src="/logo-mark-dark.svg"
            alt=""
            width={387}
            height={234}
            className="h-7 w-auto"
            priority
            unoptimized
          />
          <span className="text-lg font-bold tracking-tight font-stretch-expanded">
            UW<span className="text-accent">HPC</span>
          </span>
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="text-ink-muted md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <div
          className={`absolute top-full left-0 right-0 flex-col gap-5 border-b border-line bg-bg px-6 py-6 md:relative md:top-auto md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 ${
            open ? "flex" : "hidden md:flex"
          }`}
        >
          {links.map((l) =>
            l.href === "#join" ? (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="bg-accent px-4 py-2 text-center font-mono text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Get Involved
              </a>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="link-trace font-mono text-xs tracking-[0.15em] uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {l.label}
              </a>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
