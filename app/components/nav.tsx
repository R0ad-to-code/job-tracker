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
    <nav className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
        <span className="mr-4 font-semibold">Job Tracker</span>
        {LINKS.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-black/[.04] dark:hover:bg-white/[.08]"
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
