import { askGPT } from "./openai";       // Llama 3.3 70B
import { askClaude } from "./claude";     // Gemini 1.5 Flash
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
  history: Message[] = []
): Promise<OrchestratorResult> {
  // Llama と Gemini に並列送信
  const [llamaResult, mixtralResult] = await Promise.allSettled([
    withTimeout(askGPT(question, history), TIMEOUT_MS),
    withTimeout(askClaude(question, history), TIMEOUT_MS),
  ]);

  const llamaAnswer =
    llamaResult.status === "fulfilled"
      ? llamaResult.value
      : "Llama からの回答取得に失敗しました。";

  const mixtralAnswer =
    mixtralResult.status === "fulfilled"
      ? mixtralResult.value
      : "Qwen からの回答取得に失敗しました。";

  // 両方失敗した場合
  if (llamaResult.status === "rejected" && mixtralResult.status === "rejected") {
    return {
      isConsistent: false,
      content: "AIモデルへの接続に失敗しました。しばらくしてから再度お試しください。",
      llamaAnswer,
      mixtralAnswer,
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
    // 一致 → Llama の回答を代表として返す
    return {
      isConsistent: true,
      content: llamaAnswer,
      llamaAnswer,
      mixtralAnswer,
    };
  } else if (isConsistent === false) {
    // 不一致 → 両回答を並べたテキストを返す
    const content = `【Llama の回答】\n${llamaAnswer}\n\n【Qwen の回答】\n${mixtralAnswer}`;
    return {
      isConsistent: false,
      content,
      llamaAnswer,
      mixtralAnswer,
    };
  } else {
    // 判定失敗 → 両回答を表示し判定不能を伝える
    const content = `【Llama の回答】\n${llamaAnswer}\n\n【Qwen の回答】\n${mixtralAnswer}`;
    return {
      isConsistent: null,
      content,
      llamaAnswer,
      mixtralAnswer,
    };
  }
}
