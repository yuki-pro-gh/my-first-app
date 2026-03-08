import { askGPT } from "./openai";       // Llama 3.3 70B
import { askClaude } from "./claude";     // Qwen3 32B
import { askGemini } from "./gemini";     // Gemini 2.0 Flash
import { judgeConsistency } from "./judge";
import type { OrchestratorResult, MessageRole } from "@/types";

const TIMEOUT_MS = 30_000;

interface Message {
  role: MessageRole;
  content: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("タイムアウト")), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function orchestrate(
  question: string,
  history: Message[] = [],
  location?: string
): Promise<OrchestratorResult> {
  // Llama・Qwen・Gemini に並列送信
  const [llamaResult, mixtralResult, geminiResult] = await Promise.allSettled([
    withTimeout(askGPT(question, history, location), TIMEOUT_MS),
    withTimeout(askClaude(question, history, location), TIMEOUT_MS),
    withTimeout(askGemini(question, history, location), TIMEOUT_MS),
  ]);

  const llamaAnswer =
    llamaResult.status === "fulfilled"
      ? llamaResult.value
      : "Llama からの回答取得に失敗しました。";

  const mixtralAnswer =
    mixtralResult.status === "fulfilled"
      ? mixtralResult.value
      : "Qwen からの回答取得に失敗しました。";

  const geminiAnswer =
    geminiResult.status === "fulfilled"
      ? geminiResult.value
      : "Gemini からの回答取得に失敗しました。";

  // 全部失敗した場合
  if (llamaResult.status === "rejected" && mixtralResult.status === "rejected" && geminiResult.status === "rejected") {
    return {
      isConsistent: false,
      content: "AIモデルへの接続に失敗しました。しばらくしてから再度お試しください。",
      llamaAnswer,
      mixtralAnswer,
      geminiAnswer,
    };
  }

  // Gemini で一致判定（YES/NO）
  let isConsistent: boolean | null = null;
  try {
    isConsistent = await withTimeout(
      judgeConsistency(question, llamaAnswer, mixtralAnswer),
      TIMEOUT_MS
    );
  } catch {
    // 判定失敗時は null（判定不能）として扱う
    isConsistent = null;
  }

  if (isConsistent === true) {
    return {
      isConsistent: true,
      content: llamaAnswer,
      llamaAnswer,
      mixtralAnswer,
      geminiAnswer,
    };
  } else if (isConsistent === false) {
    const content = `【Llama の回答】\n${llamaAnswer}\n\n【Qwen の回答】\n${mixtralAnswer}`;
    return {
      isConsistent: false,
      content,
      llamaAnswer,
      mixtralAnswer,
      geminiAnswer,
    };
  } else {
    const content = `【Llama の回答】\n${llamaAnswer}\n\n【Qwen の回答】\n${mixtralAnswer}`;
    return {
      isConsistent: null,
      content,
      llamaAnswer,
      mixtralAnswer,
      geminiAnswer,
    };
  }
}
