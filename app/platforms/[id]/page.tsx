import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { updatePlatform } from "../actions";
import DeletePlatformButton from "../delete-platform-button";
import PlatformFields from "../platform-fields";

export default async function PlatformDetailPage(props: PageProps<"/platforms/[id]">) {
  const { id } = await props.params;

  const platform = await prisma.platform.findUnique({ where: { id } });
  if (!platform) notFound();

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-title font-semibold">{platform.name}</h1>
        <DeletePlatformButton id={platform.id} />
      </div>

      <form action={updatePlatform.bind(null, platform.id)} className="space-y-4">
        <PlatformFields defaultValues={platform} />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
