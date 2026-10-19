import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { RoleType, Status } from "@/app/generated/prisma/enums";
import {
  ROLE_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  statusBadgeClassName,
} from "@/app/applications/status";
import { toggleTodoDone } from "@/app/todos/actions";
import { PRIORITY_LABELS, priorityBadgeClassName } from "@/app/todos/priority";

// Every widget here is relative to "now" (overdue, 7+ days idle), so never prerender.
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const FOLLOW_UP_AFTER_DAYS = 7;
const UPCOMING_TODO_DAYS = 7;

// Statuses that mean the employer answered (positively or not).
const RESPONSE_STATUSES = new Set<Status>([
  Status.PHONE_SCREEN,
  Status.INTERVIEW,
  Status.TECHNICAL_TEST,
  Status.OFFER,
  Status.REJECTED,
]);

const IN_PROCESS_STATUSES = new Set<Status>([
  Status.PHONE_SCREEN,
  Status.INTERVIEW,
  Status.TECHNICAL_TEST,
]);

const ROLE_SERIES = [
  { roleType: RoleType.PM, barClassName: "bg-chart-pm" },
  { roleType: RoleType.DEV, barClassName: "bg-chart-dev" },
] as const;

const cardClassName = "min-w-0 rounded-md border border-border bg-surface p-4 sm:p-6";
const linkClassName =
  "text-sm font-medium text-primary underline-offset-2 hover:text-primary-hover hover:underline";

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

function formatRelative(date: Date, now: Date) {
  const minutes = Math.round((date.getTime() - now.getTime()) / 60000);
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour");
  return relativeTime.format(Math.round(hours / 24), "day");
}

export default async function DashboardPage() {
  const now = new Date();
  const upcomingCutoff = new Date(now.getTime() + UPCOMING_TODO_DAYS * DAY_MS);

  const [applications, todos] = await Promise.all([
    prisma.application.findMany({
      select: {
        id: true,
        company: true,
        roleTitle: true,
        roleType: true,
        status: true,
        appliedDate: true,
        createdAt: true,
        statusChanges: {
          select: { id: true, status: true, changedAt: true, note: true },
          orderBy: { changedAt: "desc" },
        },
      },
    }),
    prisma.todo.findMany({
      where: { done: false, dueDate: { lte: upcomingCutoff } },
      include: { application: { select: { id: true, company: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      take: 6,
    }),
  ]);

  if (applications.length === 0) {
    return (
      <div>
        <h1 className="text-title font-semibold">Dashboard</h1>
        <div className={`${cardClassName} mt-8 text-center`}>
          <h2 className="text-xl font-semibold">No applications yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Add your first application and this page will show your funnel, response
            rate, follow-ups and upcoming ToDos.
          </p>
          <Link
            href="/applications/new"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            New application
          </Link>
        </div>
      </div>
    );
  }

  // --- Funnel: current status × role type --------------------------------
  const counts = new Map<Status, Record<RoleType, number>>(
    STATUS_ORDER.map((status) => [status, { PM: 0, DEV: 0 }]),
  );
  for (const application of applications) {
    counts.get(application.status)![application.roleType] += 1;
  }
  const maxCount = Math.max(
    1,
    ...[...counts.values()].flatMap((byRole) => [byRole.PM, byRole.DEV]),
  );
  const totalsByRole = {
    PM: applications.filter((a) => a.roleType === RoleType.PM).length,
    DEV: applications.filter((a) => a.roleType === RoleType.DEV).length,
  };

  // --- KPIs ----------------------------------------------------------------
  const sent = applications.filter(
    (a) => a.status !== Status.WISHLIST || a.appliedDate !== null,
  );
  const responded = sent.filter(
    (a) =>
      RESPONSE_STATUSES.has(a.status) ||
      a.statusChanges.some((change) => RESPONSE_STATUSES.has(change.status)),
  );
  const responseRate = sent.length > 0 ? Math.round((responded.length / sent.length) * 100) : null;
  const inProcess = applications.filter((a) => IN_PROCESS_STATUSES.has(a.status)).length;
  const offers = applications.filter((a) => a.status === Status.OFFER).length;

  // --- Needs follow-up: still "Applied" with no status change for 7+ days ---
  const followUps = applications
    .filter((a) => a.status === Status.APPLIED)
    .map((a) => {
      const lastActivity = a.statusChanges[0]?.changedAt ?? a.appliedDate ?? a.createdAt;
      return { ...a, idleDays: daysBetween(lastActivity, now) };
    })
    .filter((a) => a.idleDays >= FOLLOW_UP_AFTER_DAYS)
    .sort((a, b) => b.idleDays - a.idleDays);

  // --- Recent activity: built from loaded applications so history rows left
  // behind by deleted applications never show up. ---------------------------
  const recentChanges = applications
    .flatMap(({ statusChanges, ...application }) =>
      statusChanges.map((change) => ({ ...change, application })),
    )
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())
    .slice(0, 8);

  const stats = [
    {
      label: "Applications sent",
      value: String(sent.length),
      detail: `${applications.length - sent.length} on wishlist`,
    },
    {
      label: "Response rate",
      value: responseRate === null ? "—" : `${responseRate}%`,
      detail: `${responded.length} of ${sent.length} heard back`,
    },
    {
      label: "In interviews",
      value: String(inProcess),
      detail: "Screen, interview or test",
    },
    {
      label: "Offers",
      value: String(offers),
      detail: offers === 1 ? "1 open offer" : `${offers} open offers`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted">
            {applications.length} applications tracked · {totalsByRole.PM} PM ·{" "}
            {totalsByRole.DEV} Dev
          </p>
        </div>
        <Link
          href="/applications/new"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          New application
        </Link>
      </div>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-border bg-surface p-4 sm:p-6">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-title font-semibold tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted">{stat.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-5">
        <section className={`${cardClassName} lg:col-span-3`}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Pipeline by status</h2>
              <p className="mt-1 text-sm text-muted">Current status of every application</p>
            </div>
            <ul className="flex gap-4 text-sm" aria-label="Legend">
              {ROLE_SERIES.map(({ roleType, barClassName }) => (
                <li key={roleType} className="flex items-center gap-2">
                  <span aria-hidden className={`h-3 w-3 rounded-sm ${barClassName}`} />
                  {ROLE_TYPE_LABELS[roleType]}
                </li>
              ))}
            </ul>
          </div>

          <table className="mt-6 w-full border-collapse text-sm">
            <caption className="sr-only">
              Number of applications in each status, split by PM and Dev roles
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Status</th>
                <th scope="col">PM and Dev counts</th>
              </tr>
            </thead>
            <tbody>
              {STATUS_ORDER.map((status) => {
                const byRole = counts.get(status)!;
                return (
                  <tr key={status} className="align-middle">
                    <th
                      scope="row"
                      className="w-32 py-2 pr-4 text-left font-normal text-foreground"
                    >
                      <Link
                        href={`/applications?status=${status}`}
                        className="hover:text-primary hover:underline"
                      >
                        {STATUS_LABELS[status]}
                      </Link>
                    </th>
                    <td className="py-2">
                      <div className="space-y-0.5">
                        {ROLE_SERIES.map(({ roleType, barClassName }) => {
                          const count = byRole[roleType];
                          const label = `${ROLE_TYPE_LABELS[roleType]}: ${count}`;
                          return (
                            <div
                              key={roleType}
                              className="flex items-center gap-2"
                              title={`${STATUS_LABELS[status]} · ${label}`}
                            >
                              <div className="h-2.5 flex-1 rounded-r-sm bg-chart-track">
                                {count > 0 && (
                                  <div
                                    className={`h-full rounded-r-sm ${barClassName}`}
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                  />
                                )}
                              </div>
                              <span className="w-12 text-right text-xs tabular-nums text-muted">
                                <span className="sr-only">{ROLE_TYPE_LABELS[roleType]} </span>
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className={`${cardClassName} lg:col-span-2`}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold">ToDos this week</h2>
            <Link href="/todos" className={linkClassName}>
              All ToDos
            </Link>
          </div>
          {todos.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Nothing due in the next {UPCOMING_TODO_DAYS} days.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {todos.map((todo) => {
                const overdue = todo.dueDate !== null && todo.dueDate < now;
                return (
                  <li key={todo.id} className="flex items-start gap-3 py-3">
                    <form action={toggleTodoDone.bind(null, todo.id)}>
                      <button
                        type="submit"
                        aria-label={`Mark "${todo.title}" done`}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface transition-colors hover:border-primary"
                      />
                    </form>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/todos/${todo.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {todo.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className={priorityBadgeClassName(todo.priority)}>
                          {PRIORITY_LABELS[todo.priority]}
                        </span>
                        {todo.dueDate && (
                          <span
                            className={
                              overdue ? "font-medium text-danger-soft-foreground" : "text-muted"
                            }
                          >
                            {overdue ? "Overdue · " : "Due "}
                            {todo.dueDate.toLocaleDateString()}
                          </span>
                        )}
                        {todo.application && (
                          <Link
                            href={`/applications/${todo.application.id}`}
                            className="text-muted hover:text-primary"
                          >
                            {todo.application.company}
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <section className={cardClassName}>
          <h2 className="text-xl font-semibold">Needs follow-up</h2>
          <p className="mt-1 text-sm text-muted">
            Applied, with no update for {FOLLOW_UP_AFTER_DAYS}+ days
          </p>
          {followUps.length === 0 ? (
            <p className="mt-4 text-sm text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {followUps.map((application) => (
                <li key={application.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/applications/${application.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {application.company}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {application.roleTitle} · {ROLE_TYPE_LABELS[application.roleType]}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium tabular-nums text-warning-soft-foreground">
                    {application.idleDays} days idle
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cardClassName}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <Link href="/applications" className={linkClassName}>
              All applications
            </Link>
          </div>
          {recentChanges.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No status changes yet.</p>
          ) : (
            <ol className="mt-4 divide-y divide-border">
              {recentChanges.map((change) => (
                <li key={change.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/applications/${change.application.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {change.application.company}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {change.application.roleTitle}
                      {change.note ? ` · ${change.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={statusBadgeClassName(change.status)}>
                      {STATUS_LABELS[change.status]}
                    </span>
                    <time
                      dateTime={change.changedAt.toISOString()}
                      title={change.changedAt.toLocaleString()}
                      className="text-xs text-muted"
                    >
                      {formatRelative(change.changedAt, now)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
