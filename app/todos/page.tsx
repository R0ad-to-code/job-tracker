import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { toggleTodoDone } from "./actions";
import { PRIORITY_LABELS, priorityBadgeClassName } from "./priority";

const FILTERS = ["all", "overdue", "done"] as const;
type FilterKey = (typeof FILTERS)[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All",
  overdue: "Overdue",
  done: "Done",
};

function isFilterKey(value: string): value is FilterKey {
  return (FILTERS as readonly string[]).includes(value);
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TodosPage(props: PageProps<"/todos">) {
  const searchParams = await props.searchParams;
  const filterRaw = firstValue(searchParams.filter) ?? "all";
  const filter: FilterKey = isFilterKey(filterRaw) ? filterRaw : "all";

  const now = new Date();
  const where: Prisma.TodoWhereInput =
    filter === "overdue"
      ? { done: false, dueDate: { lt: now } }
      : filter === "done"
        ? { done: true }
        : {};

  const todos = await prisma.todo.findMany({
    where,
    include: { application: true },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">ToDos</h1>
        <Link
          href="/todos/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          New ToDo
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((key) => (
          <Link
            key={key}
            href={key === "all" ? "/todos" : `/todos?filter=${key}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted transition-colors hover:bg-border/40"
            }`}
          >
            {FILTER_LABELS[key]}
          </Link>
        ))}
      </div>

      {todos.length === 0 ? (
        <p className="mt-6 text-muted">No ToDos match this filter.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
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
                    {todo.application && (
                      <Link
                        href={`/applications/${todo.application.id}`}
                        className="text-muted transition-colors hover:text-primary"
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
    </div>
  );
}
