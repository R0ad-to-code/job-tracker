import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import CvProfileForm from "./cv-profile-form";

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
        <h1 className="text-2xl font-semibold">CV / Info</h1>
        <p className="mt-2 text-foreground/70">
          Structured profile, kept ready to copy into any application form.
        </p>
      </div>

      <CvProfileForm profile={profile} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">CV versions</h2>
          <Link
            href="/cv/versions/new"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            New version
          </Link>
        </div>

        {versions.length === 0 ? (
          <p className="mt-3 text-foreground/70">No CV versions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/[.08] dark:divide-white/[.145]">
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
                      <p className="text-sm text-foreground/70">{version.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {stale && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        Stale
                      </span>
                    )}
                    {version.filePath ? (
                      <a
                        href={`/cv/versions/${version.id}/download`}
                        className="text-foreground/70 hover:underline"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-foreground/50">No PDF</span>
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
