import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { uploadCvVersionFile } from "../../actions";
import CvVersionEditor from "../cv-version-editor";
import DeleteCvVersionButton from "../delete-cv-version-button";

export default async function CvVersionDetailPage(
  props: PageProps<"/cv/versions/[id]">,
) {
  const { id } = await props.params;

  const version = await prisma.cvVersion.findUnique({ where: { id } });
  if (!version) notFound();

  const stale = Boolean(
    version.filePath && version.compiledAt && version.updatedAt > version.compiledAt,
  );

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/cv" className="text-sm text-muted transition-colors hover:text-primary">
            ← Back to CV / Info
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{version.label}</h1>
        </div>
        <DeleteCvVersionButton id={version.id} />
      </div>

      <section>
        <h2 className="text-lg font-medium">PDF</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {version.filePath ? (
            <>
              <a
                href={`/cv/versions/${version.id}/download`}
                className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-border/40"
              >
                Download PDF
              </a>
              {stale && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Stale — source changed since last compile
                </span>
              )}
              {version.compiledAt && (
                <span className="text-muted">
                  Compiled {version.compiledAt.toLocaleString()}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted">No PDF yet.</span>
          )}
        </div>

        {version.compileError && (
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-800">
            {version.compileError}
          </pre>
        )}

        <form
          action={uploadCvVersionFile.bind(null, version.id)}
          className="mt-4 flex flex-wrap items-center gap-3"
        >
          <input
            type="file"
            name="file"
            accept="application/pdf"
            required
            className="text-sm"
          />
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-border/40"
          >
            Upload PDF
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium">Details &amp; LaTeX source</h2>
        <div className="mt-3">
          <CvVersionEditor version={version} />
        </div>
      </section>
    </div>
  );
}
