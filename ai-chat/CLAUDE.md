# Hallucination Check — Project Spec

## Overview
Multi-model AI chat. Sends user questions to Llama + Qwen in parallel; Llama judges consistency to reduce hallucinations. Fully free to operate.

## Stack
Next.js 16 (App Router) / TypeScript / Tailwind — MongoDB (Mongoose) — NextAuth.js + Google OAuth — Groq API — Vercel

## AI Flow
```
User question → [parallel] Llama 3.3 70B + Qwen3 32B → Llama judges YES/NO
  ✅ agree  /  ⚠️ differ  /  ❓ could not judge  → always show both answers
```
- Models: Llama 3.3 70B (answerer + judge), Qwen3 32B (answerer)
- `Promise.allSettled()` — 30s timeout — `isConsistent: boolean | null`
- System prompt: `"Please answer concisely in approximately 150 characters."`
- History: pass `llamaAnswer` (not formatted string) for clean context

## Data Models
```ts
User:        { email, name, image, createdAt }
ChatSession: { userId, title, createdAt, updatedAt }
Message:     { sessionId, role, content, isConsistent, llamaAnswer, mixtralAnswer, createdAt }
```
Note: `mixtralAnswer` field stores Qwen's answer (legacy name).

## Directory
```
src/
├── app/api/          auth / chat / sessions
├── app/chat/         layout.tsx  page.tsx  [sessionId]/
├── components/       ChatLayoutClient  ChatWindow  MessageBubble  ChatInput  Sidebar
└── lib/ai/           openai.ts(Llama)  claude.ts(Qwen)  judge.ts  orchestrator.ts
```

## Env Vars
```
MONGODB_URI  NEXTAUTH_SECRET  NEXTAUTH_URL
GOOGLE_CLIENT_ID  GOOGLE_CLIENT_SECRET  GROQ_API_KEY
```

## iOS Layout
Fixed header/footer on iOS Safari via:
- `ChatLayoutClient`: `position: fixed; inset: 0`
- `ChatWindow`: `position: absolute; inset: 0` + flex column + `-webkit-overflow-scrolling: touch`

## Deploy
Vercel auto-deploys from GitHub push. Function timeout: 60s (`vercel.json`). Add prod URL to Google OAuth redirect URIs.
