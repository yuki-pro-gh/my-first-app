import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ChatLayoutClient } from "@/components/ChatLayoutClient";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return <ChatLayoutClient>{children}</ChatLayoutClient>;
}
