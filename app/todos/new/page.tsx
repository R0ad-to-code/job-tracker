import { prisma } from "@/app/lib/prisma";
import { createTodo } from "../actions";
import TodoFields from "../todo-fields";

export default async function NewTodoPage() {
  const applications = await prisma.application.findMany({ orderBy: { company: "asc" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">New ToDo</h1>
      <form action={createTodo} className="mt-6 space-y-4">
        <TodoFields applications={applications} />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Create ToDo
        </button>
      </form>
    </div>
  );
}
