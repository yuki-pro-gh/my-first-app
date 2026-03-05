"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import type { IChatSession } from "@/types";

export function ChatLayoutClient({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<IChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    setSessions(data.sessions ?? []);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', overflow: 'hidden', background: 'white' }}>
      {/* モバイル：オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          sessions={sessions}
          onSessionsChange={() => {
            fetchSessions();
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* メインエリア */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* ヘッダー（常に上部固定） */}
        <div style={{ flexShrink: 0 }} className="flex items-center border-b border-gray-200 bg-white px-4 py-3 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 text-sm font-semibold text-gray-800 md:ml-0">Hallucination Check</span>
        </div>

        {/* コンテンツエリア（残りのスペースを占有） */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
