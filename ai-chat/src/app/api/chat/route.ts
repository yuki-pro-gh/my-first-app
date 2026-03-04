import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";
import { orchestrate } from "@/lib/ai/orchestrator";
import { checkEnv } from "@/lib/env";

const RequestSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    checkEnv();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "環境変数エラー";
    console.error(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  // バリデーション
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const { sessionId, message, history } = parsed.data;

  await connectDB();

  // セッションの所有者確認
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const chatSession = await ChatSession.findOne({ _id: sessionId, userId: user._id });
  if (!chatSession) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  // ユーザーのメッセージを保存
  const userMessage = await Message.create({
    sessionId,
    role: "user",
    content: message,
  });

  // オーケストレーターで回答取得
  const result = await orchestrate(message, history);

  // アシスタントの回答を保存
  const assistantMessage = await Message.create({
    sessionId,
    role: "assistant",
    content: result.content,
    isConsistent: result.isConsistent,
    llamaAnswer: result.llamaAnswer,
    mixtralAnswer: result.mixtralAnswer,
  });

  // セッションのタイトルが未設定なら最初のメッセージから生成
  if (chatSession.title === "新しいチャット") {
    chatSession.title = message.slice(0, 40) + (message.length > 40 ? "…" : "");
    await chatSession.save();
  }

  return NextResponse.json({
    userMessage,
    assistantMessage,
    sessionTitle: chatSession.title,
  });
}
