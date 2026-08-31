import { describe, expect, it, vi } from "vitest";

import { Todo, TodoPriority } from "../domain/todo";

import { TodoDelegate, createTodoRepository } from "./todoRepository";

const createdAt = new Date("2026-08-18T00:00:00.000Z");

function createTodoRecord({
  completed = false,
  id = "todo-1",
  priority = "medium",
  title = "仕様を確認する",
}: {
  completed?: boolean;
  id?: string;
  priority?: TodoPriority;
  title?: string;
} = {}) {
  return {
    id,
    title,
    completed,
    priority,
    createdAt,
  };
}

function createDelegate(overrides: Partial<TodoDelegate> = {}): TodoDelegate {
  return {
    findMany: vi.fn(async () => []),
    create: vi.fn(async ({ data }) =>
      createTodoRecord({
        completed: data.completed,
        id: data.id,
        priority: data.priority,
        title: data.title,
      }),
    ),
    findUnique: vi.fn(async () => null),
    update: vi.fn(async ({ data, where }) =>
      createTodoRecord({
        completed: data.completed,
        id: where.id,
      }),
    ),
    deleteMany: vi.fn(async () => ({ count: 1 })),
    ...overrides,
  };
}

describe("createTodoRepository", () => {
  it("作成日時の昇順でTODO一覧を取得する", async () => {
    const delegate = createDelegate({
      findMany: vi.fn(async () => [createTodoRecord()]),
    });
    const repository = createTodoRepository(delegate);

    const result = await repository.findAll();

    expect(delegate.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    });
    expect(result).toEqual<Todo[]>([
      {
        id: "todo-1",
        title: "仕様を確認する",
        completed: false,
        priority: "medium",
        createdAt: "2026-08-18T00:00:00.000Z",
      },
    ]);
  });

  it("TODOをPrisma経由で作成する", async () => {
    const delegate = createDelegate();
    const repository = createTodoRepository(delegate);

    await repository.create({
      id: "todo-1",
      title: "仕様を確認する",
      completed: false,
      priority: "high",
      createdAt: "2026-08-18T00:00:00.000Z",
    });

    expect(delegate.create).toHaveBeenCalledWith({
      data: {
        id: "todo-1",
        title: "仕様を確認する",
        completed: false,
        priority: "high",
        createdAt,
        updatedAt: createdAt,
      },
    });
  });

  it("指定したTODOの完了状態を反転して更新する", async () => {
    const delegate = createDelegate({
      findUnique: vi.fn(async () => ({ completed: false })),
      update: vi.fn(async () =>
        createTodoRecord({
          completed: true,
          id: "todo-1",
        }),
      ),
    });
    const repository = createTodoRepository(delegate);

    const result = await repository.toggleCompleted("todo-1");

    expect(delegate.findUnique).toHaveBeenCalledWith({
      where: { id: "todo-1" },
      select: { completed: true },
    });
    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: "todo-1" },
      data: { completed: true },
    });
    expect(result?.completed).toBe(true);
  });

  it("存在しないTODOの完了状態は更新しない", async () => {
    const delegate = createDelegate({
      findUnique: vi.fn(async () => null),
    });
    const repository = createTodoRepository(delegate);

    const result = await repository.toggleCompleted("todo-unknown");

    expect(result).toBeNull();
    expect(delegate.update).not.toHaveBeenCalled();
  });

  it("指定したTODOをPrisma経由で削除する", async () => {
    const delegate = createDelegate();
    const repository = createTodoRepository(delegate);

    await repository.delete("todo-1");

    expect(delegate.deleteMany).toHaveBeenCalledWith({
      where: { id: "todo-1" },
    });
  });
});
