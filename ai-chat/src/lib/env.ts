const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
] as const;

export function checkEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `以下の環境変数が設定されていません: ${missing.join(", ")}\n` +
        ".env.local を確認してください。"
    );
  }
}
