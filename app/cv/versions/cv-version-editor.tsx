"use client";

import { useState } from "react";
import { compileCvVersion, saveCvVersionDetails } from "../actions";
import { fieldInputClassName } from "../field-input";
import LatexEditor from "./latex-editor";
import type { CvVersion } from "@/app/generated/prisma/client";

export default function CvVersionEditor({ version }: { version: CvVersion }) {
  const [latexSource, setLatexSource] = useState(version.latexSource ?? "");

  const saveWithId = saveCvVersionDetails.bind(null, version.id);
  const compileWithId = compileCvVersion.bind(null, version.id);

  return (
    <form action={saveWithId} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Label</span>
          <input
            name="label"
            required
            defaultValue={version.label}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Notes</span>
          <input
            name="notes"
            defaultValue={version.notes ?? ""}
            className={fieldInputClassName}
          />
        </label>
      </div>

      <div>
        <span className="block text-sm text-muted">LaTeX source</span>
        <div className="mt-1">
          <LatexEditor value={latexSource} onChange={setLatexSource} />
        </div>
        <input type="hidden" name="latexSource" value={latexSource} readOnly />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-neutral-soft"
        >
          Save
        </button>
        <button
          type="submit"
          formAction={compileWithId}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Save &amp; compile to PDF
        </button>
      </div>
    </form>
  );
}
