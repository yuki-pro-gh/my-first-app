# Hallucination Check — プロジェクト仕様

## 概要
質問を Llama + Qwen に並列送信し、Llama が一致を判定することでハルシネーションを抑制する。完全無料。

## アーキテクチャ

```
┌──────────────────────────────────────────┐
│  ブラウザ（iPhone / PC）                  │
│  フレームワーク: Next.js                  │
│  言語: TypeScript                        │
│  スタイル: Tailwind CSS                  │
└────┬─────────────────────────┬───────────┘
     │ HTTP                    │ ログイン時
     │                  ┌──────▼──────────┐
     │                  │  Google OAuth    │
     │                  │  （Google社）    │
     │                  └──────┬──────────┘
     │                         │ 認証OK
┌────▼─────────────────────────▼───────────┐
│  Vercel（サーバー）                       │
│  フレームワーク: Next.js                  │
│  言語: TypeScript                        │
│  実行環境: Node.js                       │
│  ├── /api/auth   ◄── NextAuth.js         │
│  ├── /api/chat                           │
│  └── /api/sessions                       │
└───────┬──────────────┬────────────────────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────┐
│ MongoDB Atlas │ │   Groq API     │
│ ODM: Mongoose │ │                │
│ 会話履歴      │ │ Llama 3.3 70B  │──┐並列
│ ユーザー情報  │ │ Qwen3 32B      │──┘実行
└───────────────┘ │ Llama（判定）  │
                  └────────────────┘
```

### 認証フロー
```
1. 「Sign in with Google」クリック
2. Google 認証画面へリダイレクト
3. Google が認証OK → Vercel に通知
4. NextAuth.js がユーザー情報を MongoDB に保存
5. チャット画面へ遷移
```

### チャットフロー
```
1. ユーザーが質問を入力・送信
2. /api/chat が Llama・Qwen に並列送信
3. 両回答を Llama が一致判定（YES/NO）
4. 結果を MongoDB に保存
5. ブラウザに返して ✅⚠️❓ バッジ付きで表示
```

## スタック
Next.js 16 (App Router) / TypeScript / Tailwind — MongoDB (Mongoose) — NextAuth.js + Google OAuth — Groq API — Vercel

## AI フロー
```
ユーザー質問 → [並列] Llama 3.3 70B + Qwen3 32B → Llama が YES/NO 判定
  ✅ agree  /  ⚠️ differ  /  ❓ could not judge  → 常に両回答を表示
```
- `Promise.allSettled()` — タイムアウト 30 秒 — `isConsistent: boolean | null`
- システムプロンプト: `"Please answer concisely in approximately 150 characters."`
- 会話履歴: `llamaAnswer` をそのまま渡す（整形済み文字列は使わない）

## データモデル
```ts
User:        { email, name, image, createdAt }
ChatSession: { userId, title, createdAt, updatedAt }
Message:     { sessionId, role, content, isConsistent, llamaAnswer, mixtralAnswer, createdAt }
// mixtralAnswer は Qwen の回答（フィールド名は変更しない）
```

## ディレクトリ
```
src/
├── app/api/      auth / chat / sessions
├── app/chat/     layout.tsx  page.tsx  [sessionId]/
├── components/   ChatLayoutClient  ChatWindow  MessageBubble  ChatInput  Sidebar
└── lib/ai/       openai.ts(Llama)  claude.ts(Qwen)  judge.ts  orchestrator.ts
```

## 環境変数
```
MONGODB_URI  NEXTAUTH_SECRET  NEXTAUTH_URL
GOOGLE_CLIENT_ID  GOOGLE_CLIENT_SECRET  GROQ_API_KEY
```

## iOS レイアウト
ヘッダー・フッター固定の実装方法:
- `ChatLayoutClient`: `position: fixed; inset: 0`
- `ChatWindow`: `position: absolute; inset: 0` + flex column + `-webkit-overflow-scrolling: touch`

## デプロイ
GitHub push → Vercel 自動デプロイ。Function タイムアウト: 60 秒 (`vercel.json`)。
Google OAuth リダイレクト URI に本番 URL を追加すること。
