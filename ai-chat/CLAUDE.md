# AI Chat — プロジェクト仕様

## 概要

小規模チーム向けの汎用会話AIチャットボット。
ユーザーの質問を **Llama・Qwen の2モデルに並列送信** し、Gemini が一致判定することでハルシネーションを抑制した透明性の高い回答を返す。完全無料で運用可能。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) / TypeScript |
| バックエンド | Next.js API Routes |
| データベース | MongoDB (Mongoose) |
| 認証 | NextAuth.js + Google OAuth |
| AIモデル | Groq API（Llama・Qwen）/ Google Gemini API（判定） |
| デプロイ | Vercel |

---

## 主要機能

### 1. マルチモデル合議システム（ハルシネーション抑制）

ユーザーの質問を2つのAIモデルへ並列送信し、Gemini が一致しているかを判定して結果を返す。

#### 処理フロー

```
ユーザー質問
    ↓
[並列送信]
Llama 3.3 70B  ──┐
                  ├──→ 2つの回答を取得
Qwen3 32B      ──┘
                      ├──→ 2つの回答を取得
Qwen3 32B  ──┘
    ↓
[一致判定]
Qwen3 32B が「同じ内容か？YES/NO」だけ判定
    ↙                    ↘
一致（YES）           不一致（NO）
    ↓                       ↓
1つの回答を表示       両方の回答を並べて表示
✅ 2つのAIが一致      ⚠️ 回答が異なります
```

#### AIモデル構成（完全無料）

| 役割 | モデル | 作った会社 | 動かす会社 |
|---|---|---|---|
| 回答者1 | Llama 3.3 70B | Meta | Groq |
| 回答者2 | Qwen3 32B | Alibaba | Groq |
| 一致判定 | Llama 3.3 70B | Meta | Groq |

#### 実装上の留意点

- 並列送信は `Promise.allSettled()` で失敗を握りつぶさず処理する
- 各モデルの応答時間が異なるため、タイムアウト（30秒）を設ける
- Gemini の判定は「YES/NO のみ」を返すシンプルなプロンプト

### 2. 会話履歴の保持
- MongoDB にチャットセッション・メッセージを永続化
- ユーザーごとに複数チャットセッションを管理
- サイドバーでセッション一覧を表示・切り替え
- セッションの削除・リネームが可能

### 3. Google OAuth 認証
- NextAuth.js で Google ログインを実装
- ログイン済みユーザーのみチャット機能へアクセス可能
- セッション情報はサーバー側で管理

---

## データモデル（MongoDB）

### User
```ts
{
  _id: ObjectId,
  email: string,
  name: string,
  image: string,
  createdAt: Date,
}
```

### ChatSession
```ts
{
  _id: ObjectId,
  userId: ObjectId,      // User への参照
  title: string,         // 最初のメッセージから自動生成
  createdAt: Date,
  updatedAt: Date,
}
```

### Message
```ts
{
  _id: ObjectId,
  sessionId: ObjectId,        // ChatSession への参照
  role: "user" | "assistant",
  content: string,            // 一致時は共通回答、不一致時は両回答を整形したテキスト
  isConsistent: boolean,      // 一致したか
  llamaAnswer: string,        // Llama の生回答
  mixtralAnswer: string,      // Qwen の生回答
  createdAt: Date,
}
```

---

## ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth ハンドラ
│   │   ├── chat/                # チャット送受信 API
│   │   └── sessions/            # セッション CRUD API
│   ├── chat/
│   │   ├── layout.tsx           # 認証チェック + レイアウト
│   │   ├── page.tsx             # 新規セッション自動作成
│   │   └── [sessionId]/         # チャット画面
│   └── page.tsx                 # ランディング / ログイン画面
├── components/
│   ├── ChatLayoutClient.tsx     # サイドバー + メインレイアウト
│   ├── ChatWindow.tsx           # メッセージ一覧・送信ロジック
│   ├── MessageBubble.tsx        # メッセージ表示（一致/不一致で表示変更）
│   ├── ChatInput.tsx            # テキスト入力
│   ├── Sidebar.tsx              # セッション一覧・削除・リネーム
│   └── SessionProvider.tsx      # NextAuth SessionProvider
├── lib/
│   ├── db.ts                    # MongoDB 接続
│   ├── auth.ts                  # NextAuth 設定
│   ├── env.ts                   # 環境変数チェック
│   ├── models/                  # Mongoose モデル定義
│   └── ai/
│       ├── openai.ts            # Llama 3.3 70B（Groq経由）
│       ├── gemini.ts            # Gemini（一致判定・回答者）
│       ├── claude.ts            # Qwen3 32B（回答者2）
│       ├── judge.ts             # 一致判定ロジック（Geminiを呼び出す）
│       └── orchestrator.ts      # 並列送信・フロー制御
└── types/
    └── index.ts
```

---

## 環境変数

```env
# MongoDB
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI API Keys
GROQ_API_KEY=
GEMINI_API_KEY=
```

---

## AIオーケストレーションの実装方針

### orchestrator.ts の責務
1. Llama と Qwen へ `Promise.allSettled()` で並列送信
2. Gemini で一致判定（YES/NO）
3. 一致 → 共通回答を返す / 不一致 → 両回答を並べて返す

### judge.ts（gemini.ts）の責務
- プロンプト：「2つの回答は同じ内容か？YESまたはNOだけ答えよ」
- シンプルな YES/NO 判定のみ

### UI の表示方針
- **一致時**：✅ バッジ + 1つの回答を表示
- **不一致時**：⚠️ バッジ + 【Llamaの回答】【Qwenの回答】を並べて表示
- ユーザーが自分で判断できる透明な設計

---

## 開発ガイドライン

- コンポーネントは `src/components/` にまとめ、ページは薄く保つ
- API Routes は `src/app/api/` に配置し、ビジネスロジックは `src/lib/` に分離
- TypeScript の strict モードを有効にする
- Mongoose モデルは `src/lib/models/` に定義し、型定義と合わせて管理
- 認証チェックは API Routes ですべてサーバー側で行う
- AI API キーはサーバー側の環境変数のみで管理し、クライアントには公開しない

---

## Vercel デプロイ設定

- `MONGODB_URI` 等の環境変数を Vercel Dashboard で設定
- MongoDB Atlas の無料クラスタを使用
- Google OAuth のリダイレクト URI に Vercel の本番 URL を追加すること
- Vercel の Function タイムアウトを 60 秒に設定（`vercel.json`）
