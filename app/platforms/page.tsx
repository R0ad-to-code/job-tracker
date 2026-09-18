import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function PlatformsPage() {
  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Platforms</h1>
        <Link
          href="/platforms/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          New platform
        </Link>
      </div>

      {platforms.length === 0 ? (
        <p className="mt-6 text-muted">No platforms yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {platforms.map((platform) => (
            <li key={platform.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <Link
                  href={`/platforms/${platform.id}`}
                  className="font-medium hover:underline"
                >
                  {platform.name}
                </Link>
                {platform.url && (
                  <p className="text-sm text-muted">{platform.url}</p>
                )}
              </div>
              {platform.username && (
                <span className="text-sm text-muted">{platform.username}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
