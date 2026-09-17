"use client";

import { useState } from "react";

export default function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard API unavailable (e.g. insecure context) — nothing to fall back to.
        }
      }}
      className="shrink-0 rounded-md border border-black/[.08] px-2 py-1 text-xs font-medium text-foreground/70 hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.08]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
