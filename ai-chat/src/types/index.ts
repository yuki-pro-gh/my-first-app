// ===== ユーザー =====
export interface IUser {
  _id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
}

// ===== チャットセッション =====
export interface IChatSession {
  _id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== メッセージ =====
export type MessageRole = "user" | "assistant";

export interface IMessage {
  _id: string;
  sessionId: string;
  role: MessageRole;
  content: string;            // 表示用テキスト
  isConsistent?: boolean | null; // assistant のみ：true=一致 / false=不一致 / null=判定失敗
  llamaAnswer?: string;       // assistant のみ：Llama の生回答
  mixtralAnswer?: string;     // assistant のみ：Mixtral の生回答
  createdAt: Date;
}

// ===== オーケストレーター結果 =====
export interface OrchestratorResult {
  isConsistent: boolean | null; // true=一致 / false=不一致 / null=判定失敗
  content: string;        // 一致時は共通回答、不一致時は整形済みテキスト
  llamaAnswer: string;
  mixtralAnswer: string;
}

// ===== API リクエスト / レスポンス =====
export interface ChatRequest {
  sessionId: string;
  message: string;
  history: Array<{ role: MessageRole; content: string }>;
}

export interface ChatResponse {
  message: IMessage;
}
