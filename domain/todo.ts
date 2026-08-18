export const TODO_PRIORITIES = ["low", "medium", "high"] as const;

export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export const DEFAULT_TODO_PRIORITY: TodoPriority = "medium";

export const TODO_TITLE_MAX_LENGTH = 100;

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string;
};

type CreateTodoInput = {
  id: string;
  title: string;
  priority?: TodoPriority;
  createdAt: string;
};

type CreateTodoResult =
  | {
      success: true;
      todo: Todo;
    }
  | {
      success: false;
      error: string;
    };

export function createTodo({
  id,
  title,
  priority = DEFAULT_TODO_PRIORITY,
  createdAt,
}: CreateTodoInput): CreateTodoResult {
  const normalizedTitle = title.trim();

  if (normalizedTitle.length === 0) {
    return {
      success: false,
      error: "TODOを入力してください。",
    };
  }

  if (normalizedTitle.length > TODO_TITLE_MAX_LENGTH) {
    return {
      success: false,
      error: "TODOは100文字以内で入力してください。",
    };
  }

  return {
    success: true,
    todo: {
      id,
      title: normalizedTitle,
      completed: false,
      priority,
      createdAt,
    },
  };
}

export function parseTodoPriority(value: string): TodoPriority {
  if (TODO_PRIORITIES.includes(value as TodoPriority)) {
    return value as TodoPriority;
  }

  return DEFAULT_TODO_PRIORITY;
}
