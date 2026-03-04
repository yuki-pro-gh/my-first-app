import Groq from "groq-sdk";
import type { MessageRole } from "@/types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Message {
  role: MessageRole;
  content: string;
}

// Qwen3 32B（Alibaba製、回答者2）
export async function askClaude(
  question: string,
  history: Message[] = []
): Promise<string> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: question },
  ];

  const response = await client.chat.completions.create({
    model: "qwen/qwen3-32b",
    messages,
    max_tokens: 2000,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  // <think>...</think> の思考過程を除去
  return raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
