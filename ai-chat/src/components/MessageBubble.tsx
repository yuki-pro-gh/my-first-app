"use client";

import type { IMessage } from "@/types";

interface MessageBubbleProps {
  message: IMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  const { isConsistent, llamaAnswer, mixtralAnswer } = message;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-2">
        {/* バッジ */}
        {isConsistent !== undefined && (
          <div className="flex items-center gap-2">
            {isConsistent === true && (
              <span className="rounded-full border bg-green-100 text-green-700 border-green-200 px-2 py-0.5 text-xs font-medium">
                ✅ 2つのAIが一致
              </span>
            )}
            {isConsistent === false && (
              <span className="rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200 px-2 py-0.5 text-xs font-medium">
                ⚠️ 回答が異なります
              </span>
            )}
            {isConsistent === null && (
              <span className="rounded-full border bg-gray-100 text-gray-500 border-gray-200 px-2 py-0.5 text-xs font-medium">
                ❓ 判定できませんでした
              </span>
            )}
          </div>
        )}

        {/* 常に両方の回答を表示 */}
        {llamaAnswer && mixtralAnswer ? (
          <div className="space-y-2">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800">
              <div className="mb-1 text-xs font-semibold text-gray-500">Llama 3.3 (Meta / Groq)</div>
              <p className="whitespace-pre-wrap">{llamaAnswer}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800">
              <div className="mb-1 text-xs font-semibold text-gray-500">Qwen3 32B (Alibaba / Groq)</div>
              <p className="whitespace-pre-wrap">{mixtralAnswer}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        {/* isConsistent が undefined の場合（旧データや通常メッセージ）*/}
        {isConsistent === undefined && (
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
