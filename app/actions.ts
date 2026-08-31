"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createTodo, parseTodoPriority } from "@/domain/todo";
import { todoRepository } from "@/repositories/todoRepository";

export type AddTodoActionState = {
  error: string | null;
  success: boolean;
  submittedAt: string | null;
};

function getStringValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function addTodoAction(
  _previousState: AddTodoActionState,
  formData: FormData,
): Promise<AddTodoActionState> {
  const result = createTodo({
    id: randomUUID(),
    title: getStringValue(formData, "title"),
    priority: parseTodoPriority(getStringValue(formData, "priority")),
    createdAt: new Date().toISOString(),
  });

  if (!result.success) {
    return {
      error: result.error,
      success: false,
      submittedAt: null,
    };
  }

  await todoRepository.create(result.todo);
  revalidatePath("/");

  return {
    error: null,
    success: true,
    submittedAt: new Date().toISOString(),
  };
}

export async function toggleTodoAction(formData: FormData): Promise<void> {
  const id = getStringValue(formData, "id");
  if (!id) {
    return;
  }

  await todoRepository.toggleCompleted(id);
  revalidatePath("/");
}

export async function deleteTodoAction(formData: FormData): Promise<void> {
  const id = getStringValue(formData, "id");
  if (!id) {
    return;
  }

  await todoRepository.delete(id);
  revalidatePath("/");
}
