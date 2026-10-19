import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { changeApplicationStatus, updateApplication } from "../actions";
import ApplicationFields, { fieldInputClassName } from "../application-fields";
import DeleteApplicationButton from "../delete-application-button";
import { STATUS_LABELS, STATUS_ORDER } from "../status";
import { createTodoForApplication, toggleTodoDone } from "@/app/todos/actions";
import { PRIORITY_LABELS, priorityBadgeClassName } from "@/app/todos/priority";

export default async function ApplicationDetailPage(
  props: PageProps<"/applications/[id]">,
) {
  const { id } = await props.params;

  const [application, platforms, cvVersions, todos] = await Promise.all([
    prisma.application.findUnique({
      where: { id },
      include: {
        platform: true,
        statusChanges: { orderBy: { changedAt: "desc" } },
      },
    }),
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.cvVersion.findMany({ orderBy: { label: "asc" } }),
    prisma.todo.findMany({
      where: { applicationId: id },
      orderBy: [{ done: "asc" }, { dueDate: "asc" }],
    }),
  ]);

  if (!application) notFound();

  const now = new Date();

  return (
    <div className="max-w-2xl space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-title font-semibold">{application.roleTitle}</h1>
          <p className="text-muted">{application.company}</p>
        </div>
        <DeleteApplicationButton id={application.id} />
      </div>

      <section>
        <h2 className="text-xl font-semibold">Status</h2>
        <form
          action={changeApplicationStatus.bind(null, application.id)}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-sm text-muted" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={application.status}
              className={fieldInputClassName}
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className="block text-sm text-muted" htmlFor="note">
              Note (optional)
            </label>
            <input
              id="note"
              name="note"
              placeholder="e.g. Recruiter call scheduled"
              className={fieldInputClassName}
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-neutral-soft"
          >
            Update status
          </button>
        </form>

        {application.statusChanges.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {application.statusChanges.map((change) => (
              <li key={change.id} className="flex justify-between gap-4">
                <span className="text-muted">
                  <span className="font-medium text-foreground">
                    {STATUS_LABELS[change.status]}
                  </span>
                  {change.note ? ` — ${change.note}` : ""}
                </span>
                <span className="shrink-0 text-muted">
                  {change.changedAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Details</h2>
        <form
          action={updateApplication.bind(null, application.id)}
          className="mt-3 space-y-4"
        >
          <ApplicationFields
            platforms={platforms}
            cvVersions={cvVersions}
            defaultValues={{
              company: application.company,
              roleTitle: application.roleTitle,
              roleType: application.roleType,
              platformId: application.platformId,
              cvVersionId: application.cvVersionId,
              jobPostingUrl: application.jobPostingUrl,
              appliedDate: application.appliedDate,
              location: application.location,
              salaryRange: application.salaryRange,
              contactName: application.contactName,
              contactEmail: application.contactEmail,
              notes: application.notes,
            }}
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Save changes
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">ToDos</h2>

        {todos.length > 0 && (
          <ul className="mt-3 divide-y divide-border">
            {todos.map((todo) => {
              const overdue = !todo.done && todo.dueDate !== null && todo.dueDate < now;
              return (
                <li key={todo.id} className="flex items-start gap-3 py-3">
                  <form action={toggleTodoDone.bind(null, todo.id)}>
                    <button
                      type="submit"
                      aria-label={todo.done ? "Mark not done" : "Mark done"}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                        todo.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {todo.done ? "✓" : ""}
                    </button>
                  </form>
                  <div className="flex-1">
                    <Link
                      href={`/todos/${todo.id}`}
                      className={`font-medium hover:underline ${
                        todo.done ? "text-muted line-through" : ""
                      }`}
                    >
                      {todo.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className={priorityBadgeClassName(todo.priority)}>
                        {PRIORITY_LABELS[todo.priority]}
                      </span>
                      {todo.dueDate && (
                        <span className={overdue ? "text-danger" : "text-muted"}>
                          Due {todo.dueDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form
          action={createTodoForApplication.bind(null, application.id)}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <div className="min-w-[12rem] flex-1">
            <label className="block text-sm text-muted" htmlFor="todo-title">
              New ToDo
            </label>
            <input
              id="todo-title"
              name="title"
              required
              placeholder="e.g. Follow up with recruiter"
              className={fieldInputClassName}
            />
          </div>
          <div>
            <label className="block text-sm text-muted" htmlFor="todo-dueDate">
              Due date
            </label>
            <input
              id="todo-dueDate"
              type="date"
              name="dueDate"
              className={fieldInputClassName}
            />
          </div>
          <div>
            <label className="block text-sm text-muted" htmlFor="todo-priority">
              Priority
            </label>
            <select id="todo-priority" name="priority" defaultValue="MEDIUM" className={fieldInputClassName}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-neutral-soft"
          >
            Add ToDo
          </button>
        </form>
      </section>
    </div>
  );
}
