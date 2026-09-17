import type { ReactNode } from "react";

export const fieldInputClassName =
  "mt-1 w-full rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40 dark:border-white/[.145]";

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

export default function PlatformFields({
  defaultValues,
}: {
  defaultValues?: {
    name: string;
    url: string | null;
    username: string | null;
    notes: string | null;
  };
}) {
  return (
    <div className="space-y-4">
      <Field label="Name" required>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          className={fieldInputClassName}
        />
      </Field>
      <Field label="URL">
        <input
          type="url"
          name="url"
          defaultValue={defaultValues?.url ?? ""}
          className={fieldInputClassName}
        />
      </Field>
      <Field label="Username">
        <input
          name="username"
          defaultValue={defaultValues?.username ?? ""}
          className={fieldInputClassName}
        />
      </Field>
      <Field label="Notes">
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className={fieldInputClassName}
        />
      </Field>
    </div>
  );
}
