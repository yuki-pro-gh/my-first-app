# 実行計画 — AI Chat アプリ

## フェーズ概要

```
Phase 1: プロジェクト基盤 ✅
Phase 2: 認証 ✅
Phase 3: データベース ✅
Phase 4: AIオーケストレーション ✅
Phase 5: API Routes ✅
Phase 6: UI ✅
Phase 7: 結合・仕上げ ✅
Phase 8: デプロイ
```

---

## Phase 1: プロジェクト基盤

- [x] Next.js プロジェクト作成 (App Router / TypeScript / Tailwind)
- [x] `tsconfig.json` で strict モードを有効化
- [x] 依存パッケージのインストール
  - [x] `mongoose` — MongoDB ODM
  - [x] `next-auth` — OAuth 認証
  - [x] `groq-sdk` — Groq API（Llama）
  - [x] `@google/generative-ai` — Gemini API（回答者2・一致判定）
  - [x] `zod` — 型バリデーション
- [x] `.env.local` ファイルを作成し、必要な環境変数のキーを記載
- [x] `.gitignore` に `.env.local` が含まれていることを確認
- [x] `src/types/index.ts` に共通型定義を作成

---

## Phase 2: 認証（NextAuth.js + Google OAuth）

- [x] Google Cloud Console で OAuth クライアント ID を取得
- [x] `src/app/api/auth/[...nextauth]/route.ts` を作成
- [x] NextAuth の設定に Google Provider を追加（`src/lib/auth.ts` に分離）
- [x] `NEXTAUTH_SECRET` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を `.env.local` に設定
- [x] ログインページ (`src/app/page.tsx`) を作成 — Google ログインボタン配置
- [x] `src/app/chat/layout.tsx` でサーバー側認証チェック・未ログインは `/` へリダイレクト

---

## Phase 3: データベース（MongoDB + Mongoose）

- [x] MongoDB Atlas でクラスタを作成し接続文字列を取得
- [x] `src/lib/db.ts` — MongoDB 接続ユーティリティを実装（接続キャッシュ対応）
- [x] `src/lib/models/User.ts` — User モデルを定義
- [x] `src/lib/models/ChatSession.ts` — ChatSession モデルを定義
- [x] `src/lib/models/Message.ts` — Message モデルを定義（isConsistent / llamaAnswer / mixtralAnswer）
- [x] NextAuth の `callbacks.signIn` でユーザーを MongoDB に upsert する処理を追加

---

## Phase 4: AIオーケストレーション

### AIモデル構成（完全無料）

| 役割 | モデル | API |
|---|---|---|
| 回答者1 | Llama 3.3 70B | Groq |
| 回答者2 | Qwen3 32B | Groq |
| 一致判定 | Gemini 2.0 Flash | Google AI Studio |

### 4-1. 各クライアント実装

- [x] `src/lib/ai/openai.ts` — Llama 3.3 70B（Groq経由）
- [x] `src/lib/ai/claude.ts` — Qwen3 32B（Alibaba、回答者2）
- [x] `src/lib/ai/gemini.ts` — Gemini 2.0 Flash（一致判定）

### 4-2. 一致判定の実装

- [x] `src/lib/ai/judge.ts` — Gemini に「YES/NO のみ」を返すシンプルな判定に変更

### 4-3. オーケストレーターの実装

- [x] `src/lib/ai/orchestrator.ts` を修正
  - [x] Llama と Gemini へ並列送信
  - [x] Gemini で一致判定（YES/NO）
  - [x] 一致 → 共通回答を返す
  - [x] 不一致 → 両回答を並べて返す
  - [x] タイムアウト（30秒）を設定

---

## Phase 5: API Routes

- [x] `src/app/api/chat/route.ts` — チャット送受信 API
- [x] `src/app/api/sessions/route.ts` — セッション一覧取得 / 新規作成
- [x] `src/app/api/sessions/[sessionId]/route.ts` — セッション取得 / 削除 / リネーム
- [x] `src/app/api/sessions/[sessionId]/messages/route.ts` — メッセージ一覧取得

---

## Phase 6: UI

- [x] `src/app/chat/layout.tsx` — サイドバー + メインエリアのレイアウト
- [x] `src/components/Sidebar.tsx` — セッション一覧・削除・リネーム
- [x] `src/app/chat/[sessionId]/page.tsx` — チャット画面
- [x] `src/components/ChatWindow.tsx` — メッセージ一覧・送信ロジック
- [x] `src/components/MessageBubble.tsx` — 表示を新仕様に更新
  - [x] 一致時：✅ バッジ + 1つの回答
  - [x] 不一致時：⚠️ バッジ + 【Llamaの回答】【Geminiの回答】を並べて表示
- [x] `src/components/ChatInput.tsx` — テキスト入力 + 送信ボタン
- [x] 送信中のローディング状態を表示
- [x] セッションなしで `/chat` にアクセスした場合に自動で新規セッションを作成

---

## Phase 7: 結合・仕上げ

- [x] エラーハンドリング — API エラー時にユーザーへメッセージを表示
- [x] レスポンシブ対応 — モバイルでサイドバーをハンバーガーメニュー化
- [x] セッションタイトルの自動生成
- [x] 環境変数チェック（`src/lib/env.ts`）
- [x] 型定義・Mongooseモデルを新仕様（isConsistent / llamaAnswer / mixtralAnswer）に更新
- [x] テストを新仕様に合わせて更新

---

## Phase 8: Vercel デプロイ

- [ ] Vercel にプロジェクトを作成し GitHub リポジトリと連携
- [ ] Vercel Dashboard に環境変数をすべて設定
  - `MONGODB_URI` / `NEXTAUTH_SECRET` / `NEXTAUTH_URL`
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `GROQ_API_KEY` / `GEMINI_API_KEY`
- [ ] Google Cloud Console の OAuth リダイレクト URI に本番 URL を追加
- [ ] 本番環境で動作確認（認証・チャット・履歴保持）
- [ ] Vercel の Function タイムアウトを 60 秒に設定（`vercel.json`）

---

## 完了チェック

- [ ] Google ログイン → チャット画面遷移が動作する
- [ ] チャット送信時に Llama + Gemini に並列送信される
- [ ] 一致時は ✅ バッジで1つの回答が返る
- [ ] 不一致時は ⚠️ バッジで両回答が並べて表示される
- [ ] 会話履歴がリロード後も保持される
- [ ] 複数セッションを作成・切り替えできる
- [ ] モバイルで正常に表示される
- [ ] 本番 URL（Vercel）で全機能が動作する
