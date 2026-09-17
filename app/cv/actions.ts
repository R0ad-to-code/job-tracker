"use server";

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const execFileAsync = promisify(execFile);

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseTagList(formData: FormData, key: string): string[] {
  const raw = formData.get(key);
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseJsonArray(formData: FormData, key: string): Prisma.InputJsonValue[] {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function updateCvProfile(formData: FormData) {
  const data = {
    fullName: readOptionalString(formData, "fullName") ?? "",
    email: readOptionalString(formData, "email") ?? "",
    phone: readOptionalString(formData, "phone") ?? "",
    address: readOptionalString(formData, "address"),
    linkedinUrl: readOptionalString(formData, "linkedinUrl"),
    portfolioUrl: readOptionalString(formData, "portfolioUrl"),
    summary: readOptionalString(formData, "summary"),
    skills: parseTagList(formData, "skills"),
    languages: parseTagList(formData, "languages"),
    experience: parseJsonArray(formData, "experienceJson"),
    education: parseJsonArray(formData, "educationJson"),
  };

  await prisma.cvProfile.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidatePath("/cv");
}

export async function createCvVersion(formData: FormData) {
  const label = readOptionalString(formData, "label");
  if (!label) {
    throw new Error("Label is required.");
  }

  const version = await prisma.cvVersion.create({
    data: { label, notes: readOptionalString(formData, "notes") },
  });

  revalidatePath("/cv");
  redirect(`/cv/versions/${version.id}`);
}

export async function saveCvVersionDetails(id: string, formData: FormData) {
  const label = readOptionalString(formData, "label");
  if (!label) {
    throw new Error("Label is required.");
  }

  await prisma.cvVersion.update({
    where: { id },
    data: {
      label,
      notes: readOptionalString(formData, "notes"),
      latexSource: readOptionalString(formData, "latexSource"),
    },
  });

  revalidatePath("/cv");
  revalidatePath(`/cv/versions/${id}`);
}

export async function uploadCvVersionFile(id: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a PDF file to upload.");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files can be uploaded.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${id}-${Date.now()}.pdf`;
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), buffer);

  await prisma.cvVersion.update({ where: { id }, data: { filePath: fileName } });

  revalidatePath("/cv");
  revalidatePath(`/cv/versions/${id}`);
}

const LATEX_COMPILERS = ["pdflatex", "xelatex"] as const;

async function findLatexCompiler(): Promise<string | null> {
  for (const bin of LATEX_COMPILERS) {
    try {
      await execFileAsync(bin, ["--version"]);
      return bin;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        // Binary exists but --version failed for some other reason — still usable.
        return bin;
      }
    }
  }
  return null;
}

export async function compileCvVersion(id: string, formData: FormData) {
  const label = readOptionalString(formData, "label");
  if (!label) {
    throw new Error("Label is required.");
  }
  const notes = readOptionalString(formData, "notes");
  const latexSource = readOptionalString(formData, "latexSource");

  await prisma.cvVersion.update({
    where: { id },
    data: { label, notes, latexSource },
  });

  if (!latexSource) {
    await prisma.cvVersion.update({
      where: { id },
      data: { compileError: "Add LaTeX source before compiling." },
    });
    revalidatePath(`/cv/versions/${id}`);
    revalidatePath("/cv");
    return;
  }

  const compiler = await findLatexCompiler();
  if (!compiler) {
    await prisma.cvVersion.update({
      where: { id },
      data: {
        compileError:
          "No LaTeX compiler found on PATH. Install a local LaTeX toolchain (e.g. MacTeX or BasicTeX) so pdflatex or xelatex is available, then try again.",
      },
    });
    revalidatePath(`/cv/versions/${id}`);
    revalidatePath("/cv");
    return;
  }

  const workDir = await mkdtemp(path.join(tmpdir(), "cv-compile-"));

  try {
    const texPath = path.join(workDir, "cv.tex");
    await writeFile(texPath, latexSource, "utf8");

    await execFileAsync(
      compiler,
      ["-interaction=nonstopmode", "-halt-on-error", "-output-directory", workDir, texPath],
      { timeout: 30_000, cwd: workDir },
    );

    const pdfBuffer = await readFile(path.join(workDir, "cv.pdf"));
    const fileName = `${id}-${Date.now()}.pdf`;
    const uploadsDir = path.join(process.cwd(), "data", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, fileName), pdfBuffer);

    const now = new Date();
    await prisma.cvVersion.update({
      where: { id },
      data: { filePath: fileName, compiledAt: now, updatedAt: now, compileError: null },
    });
  } catch (error) {
    const stdout =
      error && typeof error === "object" && "stdout" in error
        ? String((error as { stdout?: unknown }).stdout ?? "")
        : "";
    const message = stdout.trim() || (error instanceof Error ? error.message : String(error));
    await prisma.cvVersion.update({
      where: { id },
      data: { compileError: message.slice(0, 4000) },
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }

  revalidatePath(`/cv/versions/${id}`);
  revalidatePath("/cv");
}
