import type { ReactNode } from "react";
import { RoleType } from "@/app/generated/prisma/enums";
import type { CvVersion, Platform } from "@/app/generated/prisma/client";
import PlatformSelect from "./platform-select";

export const fieldInputClassName =
  "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

type ApplicationDefaultValues = {
  company: string;
  roleTitle: string;
  roleType: string;
  platformId: string | null;
  cvVersionId: string | null;
  jobPostingUrl: string | null;
  appliedDate: Date | null;
  location: string | null;
  salaryRange: string | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
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
      <span className="text-muted">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default function ApplicationFields({
  platforms,
  cvVersions,
  defaultValues,
}: {
  platforms: Platform[];
  cvVersions: CvVersion[];
  defaultValues?: ApplicationDefaultValues;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" required>
          <input
            name="company"
            required
            defaultValue={defaultValues?.company}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Role title" required>
          <input
            name="roleTitle"
            required
            defaultValue={defaultValues?.roleTitle}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Role type" required>
          <select
            name="roleType"
            required
            defaultValue={defaultValues?.roleType ?? RoleType.PM}
            className={fieldInputClassName}
          >
            <option value={RoleType.PM}>PM</option>
            <option value={RoleType.DEV}>Dev</option>
          </select>
        </Field>
        <Field label="Platform">
          <PlatformSelect platforms={platforms} defaultValue={defaultValues?.platformId ?? ""} />
        </Field>
        <Field label="CV version">
          <select
            name="cvVersionId"
            defaultValue={defaultValues?.cvVersionId ?? ""}
            className={fieldInputClassName}
          >
            <option value="">—</option>
            {cvVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Job posting URL">
          <input
            type="url"
            name="jobPostingUrl"
            defaultValue={defaultValues?.jobPostingUrl ?? ""}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Applied date">
          <input
            type="date"
            name="appliedDate"
            defaultValue={toDateInputValue(defaultValues?.appliedDate ?? null)}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Location">
          <input
            name="location"
            defaultValue={defaultValues?.location ?? ""}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Salary range">
          <input
            name="salaryRange"
            defaultValue={defaultValues?.salaryRange ?? ""}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Contact name">
          <input
            name="contactName"
            defaultValue={defaultValues?.contactName ?? ""}
            className={fieldInputClassName}
          />
        </Field>
        <Field label="Contact email">
          <input
            type="email"
            name="contactEmail"
            defaultValue={defaultValues?.contactEmail ?? ""}
            className={fieldInputClassName}
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          className={fieldInputClassName}
        />
      </Field>
    </>
  );
}
