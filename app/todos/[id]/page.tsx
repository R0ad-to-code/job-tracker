import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { updateTodo } from "../actions";
import DeleteTodoButton from "../delete-todo-button";
import TodoFields from "../todo-fields";

export default async function TodoDetailPage(props: PageProps<"/todos/[id]">) {
  const { id } = await props.params;

  const [todo, applications] = await Promise.all([
    prisma.todo.findUnique({ where: { id } }),
    prisma.application.findMany({ orderBy: { company: "asc" } }),
  ]);

  if (!todo) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{todo.title}</h1>
        <DeleteTodoButton id={todo.id} />
      </div>

      <form action={updateTodo.bind(null, todo.id)} className="space-y-4">
        <TodoFields
          applications={applications}
          defaultValues={{
            title: todo.title,
            description: todo.description,
            dueDate: todo.dueDate,
            priority: todo.priority,
            applicationId: todo.applicationId,
          }}
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
