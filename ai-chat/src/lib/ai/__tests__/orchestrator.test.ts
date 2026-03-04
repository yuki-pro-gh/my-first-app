import { describe, it, expect, vi, beforeEach } from "vitest";

// 各AIクライアントをモック
vi.mock("@/lib/ai/openai", () => ({
  askGPT: vi.fn(),
}));
vi.mock("@/lib/ai/claude", () => ({
  askClaude: vi.fn(),
}));
vi.mock("@/lib/ai/judge", () => ({
  judgeConsistency: vi.fn(),
}));

import { orchestrate } from "@/lib/ai/orchestrator";
import { askGPT } from "@/lib/ai/openai";
import { askClaude } from "@/lib/ai/claude";
import { judgeConsistency } from "@/lib/ai/judge";

const mockAskGPT = vi.mocked(askGPT);
const mockAskClaude = vi.mocked(askClaude);
const mockJudgeConsistency = vi.mocked(judgeConsistency);

beforeEach(() => vi.clearAllMocks());

describe("orchestrate()", () => {
  it("LlamaとMixtralが一致する場合、isConsistent=true でLlamaの回答を返す", async () => {
    mockAskGPT.mockResolvedValue("東京は日本の首都です。");
    mockAskClaude.mockResolvedValue("東京が日本の首都です。");
    mockJudgeConsistency.mockResolvedValue(true);

    const result = await orchestrate("日本の首都はどこですか？");

    expect(result.isConsistent).toBe(true);
    expect(result.content).toBe("東京は日本の首都です。");
    expect(result.llamaAnswer).toBe("東京は日本の首都です。");
    expect(result.mixtralAnswer).toBe("東京が日本の首都です。");
  });

  it("LlamaとMixtralが不一致の場合、isConsistent=false で両回答を返す", async () => {
    mockAskGPT.mockResolvedValue("回答A");
    mockAskClaude.mockResolvedValue("回答B");
    mockJudgeConsistency.mockResolvedValue(false);

    const result = await orchestrate("難しい質問");

    expect(result.isConsistent).toBe(false);
    expect(result.llamaAnswer).toBe("回答A");
    expect(result.mixtralAnswer).toBe("回答B");
    expect(result.content).toContain("回答A");
    expect(result.content).toContain("回答B");
  });

  it("LlamaとMixtralが両方失敗した場合、エラーメッセージを返す", async () => {
    mockAskGPT.mockRejectedValue(new Error("Llama API error"));
    mockAskClaude.mockRejectedValue(new Error("Mixtral API error"));

    const result = await orchestrate("何かの質問");

    expect(result.isConsistent).toBe(false);
    expect(result.content).toContain("失敗");
    expect(mockJudgeConsistency).not.toHaveBeenCalled();
  });
});
