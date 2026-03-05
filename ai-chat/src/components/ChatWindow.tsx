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
  const [prefillText, setPrefillText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // メッセージ履歴を取得
  useEffect(() => {
    setFetching(true);
    fetch(`/api/sessions/${sessionId}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setError("Failed to load messages"))
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
    setPrefillText("");

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

    // Use llamaAnswer for assistant messages to provide cleaner context
    const history = messages.map((m) => ({
      role: m.role,
      content: m.role === "assistant" && m.llamaAnswer ? m.llamaAnswer : m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (${res.status})`);
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
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Error toast */}
      {error && (
        <div className="mx-auto mt-2 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600 shadow">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Message area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mx-auto max-w-2xl space-y-4">
          {fetching && (
            <p className="text-center text-sm text-gray-400">Loading...</p>
          )}

          {!fetching && messages.length === 0 && (
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-700">Hallucination Check</p>
              <p className="mt-2 text-sm text-gray-400">
                Llama and Qwen answer, ✅ if they agree,<br />
                ⚠️ shows both answers if they differ
              </p>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m._id}
              message={m}
              onEdit={(text) => setPrefillText(text)}
            />
          ))}

          {/* Loading indicator */}
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
                Two AIs are thinking... (up to 30s)
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="w-full">
        <ChatInput onSend={handleSend} disabled={loading} prefillText={prefillText} />
      </div>
    </div>
  );
}
