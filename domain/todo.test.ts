import { describe, expect, it } from "vitest";

import {
  DEFAULT_TODO_PRIORITY,
  TODO_PRIORITIES,
  createTodo,
  parseTodoPriority,
} from "./todo";

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
});

describe("parseTodoPriority", () => {
  it("low / medium / high 以外の値はmediumとして扱う", () => {
    expect(parseTodoPriority("urgent")).toBe(DEFAULT_TODO_PRIORITY);
  });
});
