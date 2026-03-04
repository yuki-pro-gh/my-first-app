import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";

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

  // セッションの所有者確認
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const chatSession = await ChatSession.findOne({ _id: sessionId, userId: user._id });
  if (!chatSession) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  const messages = await Message.find({ sessionId }).sort({ createdAt: 1 }).lean();

  return NextResponse.json({ messages });
}
