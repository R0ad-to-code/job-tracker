import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { RoleType, Status } from "@/app/generated/prisma/enums";
import { fieldInputClassName } from "./application-fields";
import {
  ROLE_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  statusBadgeClassName,
} from "./status";

const SORT_OPTIONS = {
  updatedAt_desc: {
    label: "Last updated",
    orderBy: { updatedAt: "desc" },
  },
  company_asc: { label: "Company (A–Z)", orderBy: { company: "asc" } },
  company_desc: { label: "Company (Z–A)", orderBy: { company: "desc" } },
  appliedDate_desc: {
    label: "Applied date (newest)",
    orderBy: { appliedDate: "desc" },
  },
  appliedDate_asc: {
    label: "Applied date (oldest)",
    orderBy: { appliedDate: "asc" },
  },
  status_asc: { label: "Status", orderBy: { status: "asc" } },
} as const satisfies Record<
  string,
  { label: string; orderBy: Prisma.ApplicationOrderByWithRelationInput }
>;

type SortKey = keyof typeof SORT_OPTIONS;

function isSortKey(value: string): value is SortKey {
  return value in SORT_OPTIONS;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ApplicationsPage(props: PageProps<"/applications">) {
  const searchParams = await props.searchParams;

  const q = (firstValue(searchParams.q) ?? "").trim();
  const statusRaw = firstValue(searchParams.status) ?? "";
  const roleTypeRaw = firstValue(searchParams.roleType) ?? "";
  const platformId = firstValue(searchParams.platformId) ?? "";
  const sortRaw = firstValue(searchParams.sort) ?? "";
  const sort: SortKey = isSortKey(sortRaw) ? sortRaw : "updatedAt_desc";

  const statusFilter = (Object.values(Status) as string[]).includes(statusRaw)
    ? (statusRaw as Status)
    : "";
  const roleTypeFilter = (Object.values(RoleType) as string[]).includes(roleTypeRaw)
    ? (roleTypeRaw as RoleType)
    : "";

  const where: Prisma.ApplicationWhereInput = {};
  if (statusFilter) where.status = statusFilter;
  if (roleTypeFilter) where.roleType = roleTypeFilter;
  if (platformId) where.platformId = platformId;
  if (q) {
    where.OR = [{ company: { contains: q } }, { roleTitle: { contains: q } }];
  }

  const [applications, platforms] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: SORT_OPTIONS[sort].orderBy,
      include: { platform: true },
    }),
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasActiveFilters =
    q || statusFilter || roleTypeFilter || platformId || sort !== "updatedAt_desc";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title font-semibold">Applications</h1>
        <Link
          href="/applications/new"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          New application
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm text-muted" htmlFor="q">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Company or role"
            className={fieldInputClassName}
          />
        </div>
        <div>
          <label className="block text-sm text-muted" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={statusFilter}
            className={fieldInputClassName}
          >
            <option value="">All</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted" htmlFor="roleType">
            Role type
          </label>
          <select
            id="roleType"
            name="roleType"
            defaultValue={roleTypeFilter}
            className={fieldInputClassName}
          >
            <option value="">All</option>
            <option value={RoleType.PM}>PM</option>
            <option value={RoleType.DEV}>Dev</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted" htmlFor="platformId">
            Platform
          </label>
          <select
            id="platformId"
            name="platformId"
            defaultValue={platformId}
            className={fieldInputClassName}
          >
            <option value="">All</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className={fieldInputClassName}
          >
            {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-neutral-soft"
        >
          Apply
        </button>
        {hasActiveFilters && (
          <Link
            href="/applications"
            className="text-sm text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto">
        {applications.length === 0 ? (
          <p className="text-muted">No applications match these filters.</p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Platform</th>
                <th className="py-2 pr-4 font-medium">Applied</th>
                <th className="py-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-neutral-soft/60"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/applications/${application.id}`}
                      className="font-medium hover:underline"
                    >
                      {application.company}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{application.roleTitle}</td>
                  <td className="py-2 pr-4">{ROLE_TYPE_LABELS[application.roleType]}</td>
                  <td className="py-2 pr-4">
                    <span className={statusBadgeClassName(application.status)}>
                      {STATUS_LABELS[application.status]}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{application.platform?.name ?? "—"}</td>
                  <td className="py-2 pr-4">
                    {application.appliedDate
                      ? application.appliedDate.toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2">{application.location ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
