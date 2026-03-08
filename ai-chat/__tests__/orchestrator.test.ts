import { describe, it, expect, vi, beforeEach } from "vitest";

// AI関数をモック（実際のGroq APIは呼ばない）
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

describe("orchestrate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("両AIが回答し一致した場合、isConsistent が true になる", async () => {
    vi.mocked(askGPT).mockResolvedValue("東京の人口は約1400万人です。");
    vi.mocked(askClaude).mockResolvedValue("東京の人口は約1400万人です。");
    vi.mocked(judgeConsistency).mockResolvedValue(true);

    const result = await orchestrate("東京の人口は？");
    expect(result.isConsistent).toBe(true);
    expect(result.llamaAnswer).toBe("東京の人口は約1400万人です。");
  });

  it("両AIが回答し不一致の場合、isConsistent が false になる", async () => {
    vi.mocked(askGPT).mockResolvedValue("答えA");
    vi.mocked(askClaude).mockResolvedValue("答えB");
    vi.mocked(judgeConsistency).mockResolvedValue(false);

    const result = await orchestrate("質問");
    expect(result.isConsistent).toBe(false);
  });

  it("判定が失敗した場合、isConsistent が null になる", async () => {
    vi.mocked(askGPT).mockResolvedValue("答えA");
    vi.mocked(askClaude).mockResolvedValue("答えB");
    vi.mocked(judgeConsistency).mockRejectedValue(new Error("判定失敗"));

    const result = await orchestrate("質問");
    expect(result.isConsistent).toBeNull();
  });

  it("両AIが失敗した場合、エラーメッセージを返す", async () => {
    vi.mocked(askGPT).mockRejectedValue(new Error("API error"));
    vi.mocked(askClaude).mockRejectedValue(new Error("API error"));

    const result = await orchestrate("質問");
    expect(result.isConsistent).toBe(false);
    expect(result.content).toContain("失敗");
  });
});
