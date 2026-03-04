"use client";

import { useState } from "react";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Focus Areas", href: "#focus" },
  // { label: "Team", href: "/team" },
  { label: "Join", href: "#join" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.history.pushState(null, "", "/");
          }}
          className="text-3xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="text-text">UW</span><span className="ml-1 text-accent">HPC</span>
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="text-text-muted md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
          className={`absolute top-full left-0 right-0 flex-col gap-4 border-b border-border bg-bg-elevated px-6 py-5 transition-all duration-300 ease-out md:relative md:top-auto md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:opacity-100 md:max-h-none ${open
            ? "flex opacity-100 max-h-96"
            : "hidden opacity-0 max-h-0 md:flex"
            }`}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={
                l.href === "#join"
                  ? "rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  : "text-sm text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
