"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function createPlatform(formData: FormData) {
  const name = readOptionalString(formData, "name");
  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.platform.create({
    data: {
      name,
      url: readOptionalString(formData, "url"),
      username: readOptionalString(formData, "username"),
      notes: readOptionalString(formData, "notes"),
    },
  });

  revalidatePath("/platforms");
  revalidatePath("/applications/new");
  redirect("/platforms");
}

export async function updatePlatform(id: string, formData: FormData) {
  const name = readOptionalString(formData, "name");
  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.platform.update({
    where: { id },
    data: {
      name,
      url: readOptionalString(formData, "url"),
      username: readOptionalString(formData, "username"),
      notes: readOptionalString(formData, "notes"),
    },
  });

  revalidatePath("/platforms");
  revalidatePath(`/platforms/${id}`);
  redirect("/platforms");
}

export async function deletePlatform(id: string) {
  await prisma.platform.delete({ where: { id } });

  revalidatePath("/platforms");
  redirect("/platforms");
}
