import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/cv/versions/[id]/download">,
) {
  const { id } = await ctx.params;

  const version = await prisma.cvVersion.findUnique({ where: { id } });
  if (!version?.filePath) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "data", "uploads", version.filePath);
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return new Response("File missing on disk", { status: 404 });
  }

  const safeName = version.label.replace(/[^a-z0-9-_ ]/gi, "_") || "cv";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
    },
  });
}
