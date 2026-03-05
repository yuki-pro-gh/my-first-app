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
    <div className="flex h-full overflow-hidden bg-white">
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
      <main
        className="flex-1 overflow-hidden"
        style={{ display: 'grid', gridTemplateRows: 'auto 1fr' }}
      >
        {/* ヘッダー（固定） */}
        <div className="flex items-center border-b border-gray-200 bg-white px-4 py-3">
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

        <div className="overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
