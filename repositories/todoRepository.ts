import { Todo, TodoPriority } from "../domain/todo";
import { prisma } from "../lib/prisma";

type TodoRecord = {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: Date;
};

export type TodoDelegate = {
  findMany(args: { orderBy: { createdAt: "asc" } }): Promise<TodoRecord[]>;
  create(args: {
    data: {
      id: string;
      title: string;
      completed: boolean;
      priority: TodoPriority;
      createdAt: Date;
      updatedAt: Date;
    };
  }): Promise<TodoRecord>;
  findUnique(args: {
    where: { id: string };
    select: { completed: true };
  }): Promise<{ completed: boolean } | null>;
  update(args: {
    where: { id: string };
    data: { completed: boolean };
  }): Promise<TodoRecord>;
  deleteMany(args: { where: { id: string } }): Promise<{ count: number }>;
};

function toTodo(record: TodoRecord): Todo {
  return {
    id: record.id,
    title: record.title,
    completed: record.completed,
    priority: record.priority,
    createdAt: record.createdAt.toISOString(),
  };
}

export function createTodoRepository(todoDelegate: TodoDelegate) {
  return {
    async findAll(): Promise<Todo[]> {
      const records = await todoDelegate.findMany({
        orderBy: { createdAt: "asc" },
      });

      return records.map(toTodo);
    },

    async create(todo: Todo): Promise<Todo> {
      const createdAt = new Date(todo.createdAt);
      const record = await todoDelegate.create({
        data: {
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          priority: todo.priority,
          createdAt,
          updatedAt: createdAt,
        },
      });

      return toTodo(record);
    },

    async toggleCompleted(id: string): Promise<Todo | null> {
      const currentTodo = await todoDelegate.findUnique({
        where: { id },
        select: { completed: true },
      });

      if (!currentTodo) {
        return null;
      }

      const record = await todoDelegate.update({
        where: { id },
        data: { completed: !currentTodo.completed },
      });

      return toTodo(record);
    },

    async delete(id: string): Promise<void> {
      await todoDelegate.deleteMany({
        where: { id },
      });
    },
  };
}

export const todoRepository = createTodoRepository(prisma.todo);
