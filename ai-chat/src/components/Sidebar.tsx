"use client";

import { useState, useRef } from "react";
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
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const touchStartX = useRef<number>(0);

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

  async function deleteSelected() {
    await Promise.all([...selectedIds].map((id) =>
      fetch(`/api/sessions/${id}`, { method: "DELETE" })
    ));
    if (currentSessionId && selectedIds.has(currentSessionId)) {
      router.push("/chat");
    }
    setSelectedIds(new Set());
    setSelectMode(false);
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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent, sessionId: string) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -50) {
      setSwipedId(sessionId);
    } else if (deltaX > 20) {
      setSwipedId(null);
    }
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* New chat / select buttons */}
      <div className="p-3 flex gap-2">
        {!selectMode ? (
          <>
            <button
              onClick={createSession}
              className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 border border-gray-600 transition-colors"
            >
              <span className="text-lg">+</span>
              New Chat
            </button>
            <button
              onClick={() => setSelectMode(true)}
              className="rounded-lg px-3 py-2 text-sm hover:bg-gray-700 border border-gray-600 transition-colors text-gray-400"
            >
              Select
            </button>
          </>
        ) : (
          <div className="flex w-full items-center gap-2">
            <button
              onClick={deleteSelected}
              disabled={selectedIds.size === 0}
              className="flex-1 rounded-lg px-3 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
            </button>
            <button
              onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
              className="rounded-lg px-3 py-2 text-sm hover:bg-gray-700 border border-gray-600 transition-colors text-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Session list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.map((s) => (
          <div
            key={s._id}
            className="relative mb-1 overflow-hidden rounded-lg"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, s._id)}
            onClick={() => swipedId === s._id && setSwipedId(null)}
          >
            {/* Swipe delete button */}
            <div
              className={`absolute right-0 top-0 h-full flex items-center transition-all duration-200 ${
                swipedId === s._id ? "w-16 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <button
                onClick={() => deleteSession(s._id)}
                className="h-full w-full bg-red-600 flex items-center justify-center text-white text-lg"
              >
                🗑️
              </button>
            </div>

            {/* Session row */}
            <div
              className={`transition-transform duration-200 ${
                swipedId === s._id ? "-translate-x-16" : "translate-x-0"
              } group relative rounded-lg ${
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
                <div className="flex items-center">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s._id)}
                      onChange={() => toggleSelect(s._id)}
                      className="ml-2 h-4 w-4 accent-blue-500"
                    />
                  )}
                  <button
                    onClick={() => {
                      if (selectMode) { toggleSelect(s._id); return; }
                      router.push(`/chat/${s._id}`);
                    }}
                    className="flex-1 truncate px-3 py-2 text-left text-sm"
                  >
                    {s.title}
                  </button>
                </div>
              )}

              {/* Action buttons (PC hover) */}
              {editingId !== s._id && !selectMode && (
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
