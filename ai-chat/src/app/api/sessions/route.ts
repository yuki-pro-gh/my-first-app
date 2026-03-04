import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import User from "@/lib/models/User";

// セッション一覧取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const sessions = await ChatSession.find({ userId: user._id })
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({ sessions });
}

// 新規セッション作成
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const newSession = await ChatSession.create({
    userId: user._id,
    title: "新しいチャット",
  });

  return NextResponse.json({ session: newSession }, { status: 201 });
}
