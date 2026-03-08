import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MessageRole } from "@/types";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

interface Message {
  role: MessageRole;
  content: string;
}

// 一致判定（YES/NO のみ）
export async function judgeWithGemini(
  question: string,
  answer1: string,
  answer2: string
): Promise<boolean> {
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `以下の2つのAI回答は、同じ内容を述べていますか？
YESまたはNOだけ答えてください。それ以外のテキストは含めないでください。

【質問】
${question}

【回答1】
${answer1}

【回答2】
${answer2}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().toUpperCase();
  return text.startsWith("YES");
}

export async function askGemini(
  question: string,
  history: Message[] = [],
  location?: string
): Promise<string> {
  const locationNote = location ? ` The user is currently in ${location}.` : "";
  const systemInstruction = `Please answer concisely in approximately 250 characters. Provide key points only, omitting unnecessary explanations.${locationNote}`;

  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
  });

  const chat = model.startChat({
    history: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessage(question);
  return result.response.text();
}
