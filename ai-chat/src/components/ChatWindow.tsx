"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import type { IMessage } from "@/types";

interface ChatWindowProps {
  sessionId: string;
  onTitleChange?: (title: string) => void;
}

export function ChatWindow({ sessionId, onTitleChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // メッセージ履歴を取得
  useEffect(() => {
    setFetching(true);
    fetch(`/api/sessions/${sessionId}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setError("メッセージの読み込みに失敗しました"))
      .finally(() => setFetching(false));
  }, [sessionId]);

  // 末尾に自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // エラーは5秒後に自動で消す
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  async function handleSend(text: string) {
    setError(null);

    // 楽観的更新：ユーザーメッセージを即時表示
    const tempUserMsg: IMessage = {
      _id: `temp-${Date.now()}`,
      sessionId,
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `サーバーエラー (${res.status})`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUserMsg._id),
        data.userMessage,
        data.assistantMessage,
      ]);

      if (data.sessionTitle) {
        onTitleChange?.(data.sessionTitle);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "送信に失敗しました";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* エラートースト */}
      {error && (
        <div className="mx-auto mt-2 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 shadow">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {fetching && (
            <p className="text-center text-sm text-gray-400">読み込み中...</p>
          )}

          {!fetching && messages.length === 0 && (
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-700">AI Chat</p>
              <p className="mt-2 text-sm text-gray-400">
                Llama と Qwen が回答し、一致すれば ✅、<br />
                異なれば ⚠️ で両方の回答を表示します
              </p>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m._id} message={m} />
          ))}

          {/* ローディングインジケーター */}
          {loading && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="animate-bounce text-gray-400 [animation-delay:0ms]">●</span>
                    <span className="animate-bounce text-gray-400 [animation-delay:150ms]">●</span>
                    <span className="animate-bounce text-gray-400 [animation-delay:300ms]">●</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 ml-1">
                2つのAIが回答を検討中...（最大30秒）
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 入力欄 */}
      <div className="mx-auto w-full max-w-2xl">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
