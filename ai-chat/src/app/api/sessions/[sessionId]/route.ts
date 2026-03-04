import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";

async function getOwnerSession(email: string, sessionId: string) {
  const user = await User.findOne({ email });
  if (!user) return null;
  return ChatSession.findOne({ _id: sessionId, userId: user._id });
}

// セッション取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  await connectDB();

  const chatSession = await getOwnerSession(session.user.email, sessionId);
  if (!chatSession) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ session: chatSession });
}

// セッションのタイトル変更
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = z.object({ title: z.string().min(1).max(100) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "タイトルが不正です" }, { status: 400 });
  }

  await connectDB();

  const chatSession = await getOwnerSession(session.user.email, sessionId);
  if (!chatSession) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  chatSession.title = parsed.data.title;
  await chatSession.save();

  return NextResponse.json({ session: chatSession });
}

// セッション削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  await connectDB();

  const chatSession = await getOwnerSession(session.user.email, sessionId);
  if (!chatSession) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  await Message.deleteMany({ sessionId });
  await chatSession.deleteOne();

  return NextResponse.json({ success: true });
}
