import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkEnv } from "@/lib/env";

const REQUIRED = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
];

describe("checkEnv", () => {
  let original: Record<string, string | undefined> = {};

  beforeEach(() => {
    // 元の値を退避してから全部セット
    REQUIRED.forEach((key) => {
      original[key] = process.env[key];
      process.env[key] = "dummy";
    });
  });

  afterEach(() => {
    // 元の値に戻す
    REQUIRED.forEach((key) => {
      process.env[key] = original[key];
    });
  });

  it("全環境変数がセットされていれば例外をスローしない", () => {
    expect(() => checkEnv()).not.toThrow();
  });

  it("環境変数が欠けていれば例外をスローする", () => {
    delete process.env["GROQ_API_KEY"];
    expect(() => checkEnv()).toThrow("GROQ_API_KEY");
  });
});
