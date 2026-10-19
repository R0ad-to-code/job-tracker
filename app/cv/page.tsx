import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import CvProfileForm from "./cv-profile-form";
import ImportCvPdfForm from "./import-cv-pdf-form";

export default async function CvPage() {
  const [profile, versions] = await Promise.all([
    prisma.cvProfile.upsert({
      where: { id: "singleton" },
      update: {},
      create: {},
    }),
    prisma.cvVersion.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-title font-semibold">CV / Info</h1>
        <p className="mt-2 text-muted">
          Structured profile, kept ready to copy into any application form.
        </p>
      </div>

      <ImportCvPdfForm />

      <CvProfileForm profile={profile} key={profile.updatedAt.toISOString()} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">CV versions</h2>
          <Link
            href="/cv/versions/new"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            New version
          </Link>
        </div>

        {versions.length === 0 ? (
          <p className="mt-3 text-muted">No CV versions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {versions.map((version) => {
              const stale = Boolean(
                version.filePath &&
                  version.compiledAt &&
                  version.updatedAt > version.compiledAt,
              );
              return (
                <li key={version.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <Link
                      href={`/cv/versions/${version.id}`}
                      className="font-medium hover:underline"
                    >
                      {version.label}
                    </Link>
                    {version.notes && (
                      <p className="text-sm text-muted">{version.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {stale && (
                      <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning-soft-foreground">
                        Stale
                      </span>
                    )}
                    {version.filePath ? (
                      <a
                        href={`/cv/versions/${version.id}/download`}
                        className="text-muted transition-colors hover:text-primary"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-muted">No PDF</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
