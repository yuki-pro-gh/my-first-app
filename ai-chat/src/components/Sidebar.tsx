"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { IChatSession } from "@/types";

interface SidebarProps {
  sessions: IChatSession[];
  onSessionsChange: () => void;
}

export function Sidebar({ sessions, onSessionsChange }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const currentSessionId = params?.sessionId as string | undefined;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function createSession() {
    const res = await fetch("/api/sessions", { method: "POST" });
    const data = await res.json();
    router.push(`/chat/${data.session._id}`);
    onSessionsChange();
  }

  async function deleteSession(sessionId: string) {
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (currentSessionId === sessionId) {
      router.push("/chat");
    }
    onSessionsChange();
  }

  async function renameSession(sessionId: string) {
    if (!editingTitle.trim()) return;
    await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    });
    setEditingId(null);
    onSessionsChange();
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={createSession}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 border border-gray-600 transition-colors"
        >
          <span className="text-lg">+</span>
          New Chat
        </button>
      </div>

      {/* Session list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.map((s) => (
          <div
            key={s._id}
            className={`group relative mb-1 rounded-lg ${
              currentSessionId === s._id ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {editingId === s._id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <input
                  className="flex-1 rounded bg-gray-600 px-2 py-1 text-sm text-white outline-none"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameSession(s._id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                />
                <button
                  onClick={() => renameSession(s._id)}
                  className="text-xs text-green-400 hover:text-green-300"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/chat/${s._id}`)}
                className="w-full truncate px-3 py-2 text-left text-sm"
              >
                {s.title}
              </button>
            )}

            {/* Action buttons (visible on hover) */}
            {editingId !== s._id && (
              <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-1 group-hover:flex">
                <button
                  onClick={() => {
                    setEditingId(s._id);
                    setEditingTitle(s.title);
                  }}
                  className="rounded p-1 text-gray-400 hover:text-white"
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteSession(s._id)}
                  className="rounded p-1 text-gray-400 hover:text-red-400"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-700 p-3">
        <div className="mb-2 flex items-center gap-2">
          {session?.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="avatar"
              className="h-7 w-7 rounded-full"
            />
          )}
          <span className="truncate text-xs text-gray-300">
            {session?.user?.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full rounded px-2 py-1 text-left text-xs text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
