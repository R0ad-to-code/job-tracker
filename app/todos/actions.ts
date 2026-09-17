"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { Priority } from "@/app/generated/prisma/enums";

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function readPriority(formData: FormData): Priority {
  const raw = formData.get("priority");
  return (Object.values(Priority) as string[]).includes(raw as string)
    ? (raw as Priority)
    : Priority.MEDIUM;
}

function parseTodoInput(formData: FormData) {
  const title = readOptionalString(formData, "title");
  if (!title) {
    throw new Error("Title is required.");
  }

  const dueDateRaw = readOptionalString(formData, "dueDate");

  return {
    title,
    description: readOptionalString(formData, "description"),
    dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    priority: readPriority(formData),
    applicationId: readOptionalString(formData, "applicationId"),
  };
}

export async function createTodo(formData: FormData) {
  const input = parseTodoInput(formData);

  await prisma.todo.create({ data: input });

  revalidatePath("/todos");
  if (input.applicationId) revalidatePath(`/applications/${input.applicationId}`);
  redirect("/todos");
}

export async function createTodoForApplication(applicationId: string, formData: FormData) {
  const title = readOptionalString(formData, "title");
  if (!title) {
    throw new Error("Title is required.");
  }
  const dueDateRaw = readOptionalString(formData, "dueDate");

  await prisma.todo.create({
    data: {
      title,
      priority: readPriority(formData),
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      applicationId,
    },
  });

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/todos");
}

export async function updateTodo(id: string, formData: FormData) {
  const input = parseTodoInput(formData);

  const previous = await prisma.todo.findUnique({ where: { id }, select: { applicationId: true } });

  await prisma.todo.update({ where: { id }, data: input });

  revalidatePath("/todos");
  if (previous?.applicationId) revalidatePath(`/applications/${previous.applicationId}`);
  if (input.applicationId && input.applicationId !== previous?.applicationId) {
    revalidatePath(`/applications/${input.applicationId}`);
  }
  redirect("/todos");
}

export async function toggleTodoDone(id: string) {
  const todo = await prisma.todo.findUnique({ where: { id }, select: { done: true, applicationId: true } });
  if (!todo) return;

  await prisma.todo.update({ where: { id }, data: { done: !todo.done } });

  revalidatePath("/todos");
  if (todo.applicationId) revalidatePath(`/applications/${todo.applicationId}`);
}

export async function deleteTodo(id: string) {
  const todo = await prisma.todo.findUnique({ where: { id }, select: { applicationId: true } });

  await prisma.todo.delete({ where: { id } });

  revalidatePath("/todos");
  if (todo?.applicationId) revalidatePath(`/applications/${todo.applicationId}`);
  redirect("/todos");
}
