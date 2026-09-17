import type { ReactNode } from "react";
import { Priority } from "@/app/generated/prisma/enums";
import type { Application } from "@/app/generated/prisma/client";

export const fieldInputClassName =
  "mt-1 w-full rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40 dark:border-white/[.145]";

type TodoDefaultValues = {
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: string;
  applicationId: string | null;
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-foreground/70">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default function TodoFields({
  applications,
  defaultValues,
}: {
  applications: Application[];
  defaultValues?: TodoDefaultValues;
}) {
  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={fieldInputClassName}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Due date">
          <input
            type="date"
            name="dueDate"
            defaultValue={toDateInputValue(defaultValues?.dueDate ?? null)}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Priority">
          <select
            name="priority"
            defaultValue={defaultValues?.priority ?? Priority.MEDIUM}
            className={fieldInputClassName}
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </Field>
      </div>
      <Field label="Linked application">
        <select
          name="applicationId"
          defaultValue={defaultValues?.applicationId ?? ""}
          className={fieldInputClassName}
        >
          <option value="">—</option>
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.company} — {application.roleTitle}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          className={fieldInputClassName}
        />
      </Field>
    </div>
  );
}
