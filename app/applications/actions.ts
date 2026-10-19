"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { RoleType, Status } from "@/app/generated/prisma/enums";
import type { Prisma } from "@/app/generated/prisma/client";

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

async function resolvePlatformId(formData: FormData): Promise<string | null> {
  const platformId = readOptionalString(formData, "platformId");
  if (platformId === "__new__") {
    const newPlatformName = readOptionalString(formData, "newPlatformName");
    if (!newPlatformName) return null;
    const platform = await prisma.platform.create({ data: { name: newPlatformName } });
    return platform.id;
  }
  return platformId;
}

async function parseApplicationInput(
  formData: FormData,
): Promise<Omit<Prisma.ApplicationUncheckedCreateInput, "status">> {
  const company = readOptionalString(formData, "company");
  const roleTitle = readOptionalString(formData, "roleTitle");
  const roleType = formData.get("roleType");

  if (!company || !roleTitle) {
    throw new Error("Company and role title are required.");
  }
  if (roleType !== RoleType.PM && roleType !== RoleType.DEV) {
    throw new Error("Role type must be PM or DEV.");
  }

  const appliedDateRaw = readOptionalString(formData, "appliedDate");
  const platformId = await resolvePlatformId(formData);

  return {
    company,
    roleTitle,
    roleType,
    platformId,
    cvVersionId: readOptionalString(formData, "cvVersionId"),
    jobPostingUrl: readOptionalString(formData, "jobPostingUrl"),
    appliedDate: appliedDateRaw ? new Date(appliedDateRaw) : null,
    location: readOptionalString(formData, "location"),
    salaryRange: readOptionalString(formData, "salaryRange"),
    contactName: readOptionalString(formData, "contactName"),
    contactEmail: readOptionalString(formData, "contactEmail"),
    notes: readOptionalString(formData, "notes"),
  };
}

export async function createApplication(formData: FormData) {
  const input = await parseApplicationInput(formData);

  const application = await prisma.application.create({
    data: {
      ...input,
      status: Status.WISHLIST,
      statusChanges: { create: { status: Status.WISHLIST } },
    },
  });

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/platforms");
  redirect(`/applications/${application.id}`);
}

export async function updateApplication(id: string, formData: FormData) {
  const input = await parseApplicationInput(formData);

  await prisma.application.update({ where: { id }, data: input });

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/platforms");
  redirect(`/applications/${id}`);
}

export async function changeApplicationStatus(id: string, formData: FormData) {
  const statusRaw = formData.get("status");
  if (typeof statusRaw !== "string" || !(Object.values(Status) as string[]).includes(statusRaw)) {
    throw new Error("Invalid status.");
  }
  const status = statusRaw as Status;
  const note = readOptionalString(formData, "note");

  await prisma.application.update({
    where: { id },
    data: {
      status,
      statusChanges: { create: { status, note: note ?? undefined } },
    },
  });

  revalidatePath(`/applications/${id}`);
  revalidatePath("/");
  revalidatePath("/applications");
}

export async function deleteApplication(id: string) {
  await prisma.application.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/applications");
  redirect("/applications");
}
