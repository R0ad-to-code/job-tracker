import { prisma } from "@/app/lib/prisma";
import { createApplication } from "../actions";
import ApplicationFields from "../application-fields";

export default async function NewApplicationPage() {
  const [platforms, cvVersions] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.cvVersion.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">New application</h1>
      <form action={createApplication} className="mt-6 space-y-4">
        <ApplicationFields platforms={platforms} cvVersions={cvVersions} />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Create application
        </button>
      </form>
    </div>
  );
}
