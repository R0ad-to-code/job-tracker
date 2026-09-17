"use client";

import { useState } from "react";
import { deleteTodo } from "./actions";

export default function DeleteTodoButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={deleteTodo.bind(null, id)} className="flex items-center gap-2">
      <span className="text-sm text-foreground/70">Delete this ToDo?</span>
      <button
        type="submit"
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-black/[.08] px-3 py-1.5 text-sm font-medium dark:border-white/[.145]"
      >
        Cancel
      </button>
    </form>
  );
}
