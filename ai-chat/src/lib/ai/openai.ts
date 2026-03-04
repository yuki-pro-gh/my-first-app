import Groq from "groq-sdk";
import type { MessageRole } from "@/types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Message {
  role: MessageRole;
  content: string;
}

// Llama 3.3 70B（高性能モデル）
export async function askGPT(
  question: string,
  history: Message[] = []
): Promise<string> {
  const messages = [
    { role: "system" as const, content: "回答は簡潔にまとめてください。不要な説明は省き、要点のみ答えてください。" },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: question },
  ];

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content ?? "";
}
