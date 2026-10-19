"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { analyzeCvPdf, type AnalyzeCvPdfState } from "./actions";

const initialState: AnalyzeCvPdfState = { status: "idle" };

function SubmitButton({ confirming }: { confirming: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60 disabled:hover:bg-primary"
    >
      {pending ? "Analyzing…" : confirming ? "Confirm — overwrite profile" : "Analyze PDF"}
    </button>
  );
}

export default function ImportCvPdfForm() {
  const [state, formAction] = useActionState(analyzeCvPdf, initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <h2 className="text-sm font-medium text-muted">Import from PDF</h2>
      <p className="mt-1 text-sm text-muted">
        Upload a CV PDF matching your résumé template and it fills in the profile fields below,
        parsed locally — no data leaves this machine. This overwrites your current profile.
      </p>
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirming) {
            event.preventDefault();
            setConfirming(true);
          }
        }}
        className="mt-3 flex flex-wrap items-center gap-3"
      >
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          onChange={() => setConfirming(false)}
          className="text-sm"
        />
        <SubmitButton confirming={confirming} />
        {confirming && (
          <span className="text-sm text-warning-soft-foreground">
            This will overwrite your saved profile — click again to confirm.
          </span>
        )}
      </form>
      {state.status === "error" && (
        <p className="mt-2 text-sm text-danger">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="mt-2 text-sm text-success-soft-foreground">{state.message}</p>
      )}
    </div>
  );
}
