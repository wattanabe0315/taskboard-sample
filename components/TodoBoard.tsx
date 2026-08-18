"use client";

import { FormEvent, useState } from "react";
import {
  DEFAULT_TODO_PRIORITY,
  TODO_PRIORITIES,
  Todo,
  TodoPriority,
  createTodo,
  parseTodoPriority,
} from "@/domain/todo";

const priorityLabels: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityStyles: Record<TodoPriority, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-sky-200 bg-sky-50 text-sky-800",
  high: "border-rose-200 bg-rose-50 text-rose-800",
};

export function TodoBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>(DEFAULT_TODO_PRIORITY);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = createTodo({
      id: crypto.randomUUID(),
      title,
      priority,
      createdAt: new Date().toISOString(),
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setTodos((currentTodos) => [...currentTodos, result.todo]);
    setTitle("");
    setPriority(DEFAULT_TODO_PRIORITY);
    setError(null);
  }

  function handleToggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function handleDeleteTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id),
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-sky-700">TaskBoard</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            TODOを優先度つきで管理
          </h1>
          <p className="text-base text-zinc-600">
            low、medium、high の3段階でTODOの優先度を指定できます。
          </p>
        </header>

        <form
          className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="todo-title">
              TODO
            </label>
            <input
              className="min-h-11 rounded-md border border-zinc-300 px-3 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              id="todo-title"
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: 仕様を確認する"
              type="text"
              value={title}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="todo-priority">
              優先度
            </label>
            <select
              className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              id="todo-priority"
              onChange={(event) =>
                setPriority(parseTodoPriority(event.target.value))
              }
              value={priority}
            >
              {TODO_PRIORITIES.map((todoPriority) => (
                <option key={todoPriority} value={todoPriority}>
                  {priorityLabels[todoPriority]}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            className="min-h-11 rounded-md bg-sky-700 px-4 text-base font-medium text-white transition hover:bg-sky-800"
            type="submit"
          >
            追加
          </button>
        </form>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">TODO一覧</h2>

          {todos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-zinc-500">
              TODOはまだありません。
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {todos.map((todo) => (
                <li
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  key={todo.id}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <input
                      aria-label={`${todo.title}の完了状態を切り替える`}
                      checked={todo.completed}
                      className="mt-1 h-5 w-5 accent-sky-700"
                      onChange={() => handleToggleTodo(todo.id)}
                      type="checkbox"
                    />
                    <div className="flex min-w-0 flex-col gap-2">
                      <span
                        className={
                          todo.completed
                            ? "break-words text-zinc-400 line-through"
                            : "break-words text-zinc-950"
                        }
                      >
                        {todo.title}
                      </span>
                      <span
                        className={`w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${priorityStyles[todo.priority]}`}
                      >
                        {priorityLabels[todo.priority]}
                      </span>
                    </div>
                  </div>

                  <button
                    className="min-h-10 rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                    onClick={() => handleDeleteTodo(todo.id)}
                    type="button"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
