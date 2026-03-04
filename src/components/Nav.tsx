"use client";

import Image from "next/image";
import { useState } from "react";

const links = [
  { label: "About", href: "#about" },
  { label: "Focus Areas", href: "#focus" },
  { label: "Team", href: "/team" },
  { label: "Join", href: "#join" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <Image
            src="/banner-dark.png"
            alt="UWHPC"
            width={280}
            height={80}
            className="h-10 w-auto"
            unoptimized
          />
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="text-text-muted md:hidden"
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
          className={`${
            open ? "flex" : "hidden"
          } absolute top-full left-0 right-0 flex-col gap-4 border-b border-border bg-bg-elevated px-6 py-5 md:relative md:top-auto md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={
                l.href === "#join"
                  ? "rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-accent-light"
                  : "text-sm text-text-muted transition-colors hover:text-text"
              }
            >
              {l.href === "#join" ? "Get Involved" : l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
