import { describe, expect, it } from "vitest";

import {
  DEFAULT_TODO_PRIORITY,
  TODO_TITLE_MAX_LENGTH,
  TODO_PRIORITIES,
  Todo,
  createTodo,
  deleteTodo,
  parseTodoPriority,
  toggleTodoCompleted,
} from "./todo";

const baseTodos: Todo[] = [
  {
    id: "todo-1",
    title: "仕様を確認する",
    completed: false,
    priority: "medium",
    createdAt: "2026-08-18T00:00:00.000Z",
  },
  {
    id: "todo-2",
    title: "レビューする",
    completed: true,
    priority: "high",
    createdAt: "2026-08-18T01:00:00.000Z",
  },
];

describe("createTodo", () => {
  it("新規TODOの優先度はデフォルトでmediumになる", () => {
    const result = createTodo({
      id: "todo-1",
      title: "仕様を確認する",
      createdAt: "2026-08-18T00:00:00.000Z",
    });

    expect(result).toEqual({
      success: true,
      todo: {
        id: "todo-1",
        title: "仕様を確認する",
        completed: false,
        priority: DEFAULT_TODO_PRIORITY,
        createdAt: "2026-08-18T00:00:00.000Z",
      },
    });
  });

  it("low / medium / high の優先度を指定できる", () => {
    for (const priority of TODO_PRIORITIES) {
      const result = createTodo({
        id: `todo-${priority}`,
        title: `${priority} priority`,
        priority,
        createdAt: "2026-08-18T00:00:00.000Z",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.todo.priority).toBe(priority);
      }
    }
  });

  it("前後の空白を削除してTODOを作成する", () => {
    const result = createTodo({
      id: "todo-1",
      title: "  仕様を確認する  ",
      createdAt: "2026-08-18T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.todo.title).toBe("仕様を確認する");
    }
  });

  it("空文字のTODOは作成できない", () => {
    const result = createTodo({
      id: "todo-1",
      title: "   ",
      createdAt: "2026-08-18T00:00:00.000Z",
    });

    expect(result).toEqual({
      success: false,
      error: "TODOを入力してください。",
    });
  });

  it("100文字を超えるTODOは作成できない", () => {
    const result = createTodo({
      id: "todo-1",
      title: "a".repeat(101),
      createdAt: "2026-08-18T00:00:00.000Z",
    });

    expect(result).toEqual({
      success: false,
      error: "TODOは100文字以内で入力してください。",
    });
  });

  it("100文字ちょうどのTODOは作成できる", () => {
    const title = "a".repeat(TODO_TITLE_MAX_LENGTH);

    const result = createTodo({
      id: "todo-1",
      title,
      createdAt: "2026-08-18T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.todo.title).toBe(title);
      expect(result.todo.completed).toBe(false);
    }
  });
});

describe("parseTodoPriority", () => {
  it("low / medium / high はそのまま扱う", () => {
    for (const priority of TODO_PRIORITIES) {
      expect(parseTodoPriority(priority)).toBe(priority);
    }
  });

  it("low / medium / high 以外の値はmediumとして扱う", () => {
    expect(parseTodoPriority("urgent")).toBe(DEFAULT_TODO_PRIORITY);
  });
});

describe("toggleTodoCompleted", () => {
  it("指定したTODOの完了状態を切り替える", () => {
    const result = toggleTodoCompleted(baseTodos, "todo-1");

    expect(result).toEqual([
      { ...baseTodos[0], completed: true },
      baseTodos[1],
    ]);
  });

  it("完了済みTODOを未完了に戻せる", () => {
    const result = toggleTodoCompleted(baseTodos, "todo-2");

    expect(result).toEqual([
      baseTodos[0],
      { ...baseTodos[1], completed: false },
    ]);
  });

  it("該当するTODOがない場合は一覧を変更しない", () => {
    const result = toggleTodoCompleted(baseTodos, "todo-unknown");

    expect(result).toEqual(baseTodos);
  });
});

describe("deleteTodo", () => {
  it("指定したTODOを一覧から削除する", () => {
    const result = deleteTodo(baseTodos, "todo-1");

    expect(result).toEqual([baseTodos[1]]);
  });

  it("該当するTODOがない場合は一覧を変更しない", () => {
    const result = deleteTodo(baseTodos, "todo-unknown");

    expect(result).toEqual(baseTodos);
  });
});
