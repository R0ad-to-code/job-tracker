"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/cv", label: "CV" },
  { href: "/platforms", label: "Platforms" },
  { href: "/todos", label: "ToDos" },
] as const;

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="mr-4 shrink-0 font-display text-base font-semibold text-foreground"
        >
          Job Tracker
        </Link>
        {LINKS.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-soft text-primary-soft-foreground"
                  : "text-muted hover:bg-neutral-soft hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
