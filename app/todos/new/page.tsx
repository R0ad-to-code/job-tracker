import { prisma } from "@/app/lib/prisma";
import { createTodo } from "../actions";
import TodoFields from "../todo-fields";

export default async function NewTodoPage() {
  const applications = await prisma.application.findMany({ orderBy: { company: "asc" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-title font-semibold">New ToDo</h1>
      <form action={createTodo} className="mt-6 space-y-4">
        <TodoFields applications={applications} />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Create ToDo
        </button>
      </form>
    </div>
  );
}
