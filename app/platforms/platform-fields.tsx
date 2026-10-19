import type { ReactNode } from "react";

export const fieldInputClassName =
  "mt-1 w-full rounded-md border border-border bg-surface min-h-11 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

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
      <span className="text-muted">
        {label}
        {required && <span className="text-danger"> *</span>}
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
