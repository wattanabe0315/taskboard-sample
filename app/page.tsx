import { TodoBoard } from "@/components/TodoBoard";
import { todoRepository } from "@/repositories/todoRepository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todos = await todoRepository.findAll();

  return <TodoBoard todos={todos} />;
}
