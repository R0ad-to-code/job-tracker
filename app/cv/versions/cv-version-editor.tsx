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
          <span className="text-foreground/70">Label</span>
          <input
            name="label"
            required
            defaultValue={version.label}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground/70">Notes</span>
          <input
            name="notes"
            defaultValue={version.notes ?? ""}
            className={fieldInputClassName}
          />
        </label>
      </div>

      <div>
        <span className="block text-sm text-foreground/70">LaTeX source</span>
        <div className="mt-1">
          <LatexEditor value={latexSource} onChange={setLatexSource} />
        </div>
        <input type="hidden" name="latexSource" value={latexSource} readOnly />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-md border border-black/[.08] px-4 py-2 text-sm font-medium dark:border-white/[.145]"
        >
          Save
        </button>
        <button
          type="submit"
          formAction={compileWithId}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Save &amp; compile to PDF
        </button>
      </div>
    </form>
  );
}
