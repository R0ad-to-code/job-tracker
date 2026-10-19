"use client";

import { useState } from "react";
import { deletePlatform } from "./actions";

export default function DeletePlatformButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-danger/30 px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={deletePlatform.bind(null, id)} className="flex items-center gap-2">
      <span className="text-sm text-muted">Delete this platform?</span>
      <button
        type="submit"
        className="rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-danger-hover"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-soft"
      >
        Cancel
      </button>
    </form>
  );
}
