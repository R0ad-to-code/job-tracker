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
      className="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-border/40 hover:text-foreground"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
