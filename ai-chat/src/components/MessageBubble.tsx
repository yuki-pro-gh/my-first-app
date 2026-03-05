"use client";

import { useState } from "react";
import type { IMessage } from "@/types";

interface MessageBubbleProps {
  message: IMessage;
  onEdit?: (text: string) => void;
}

export function MessageBubble({ message, onEdit }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isUser) {
    return (
      <div className="flex justify-end group">
        <div className="flex items-end gap-2">
          {/* Copy / Edit buttons */}
          <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleCopy(message.content)}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
              title="Copy"
            >
              {copied ? "✓" : "Copy"}
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(message.content)}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
                title="Edit"
              >
                Edit
              </button>
            )}
          </div>
          <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2 text-sm text-white">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const { isConsistent, llamaAnswer, mixtralAnswer } = message;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-2">
        {/* Badge */}
        {isConsistent !== undefined && (
          <div className="flex items-center gap-2">
            {isConsistent === true && (
              <span className="rounded-full border bg-green-100 text-green-700 border-green-200 px-2 py-0.5 text-xs font-medium">
                ✅ Both AIs agree
              </span>
            )}
            {isConsistent === false && (
              <span className="rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200 px-2 py-0.5 text-xs font-medium">
                ⚠️ Answers differ
              </span>
            )}
            {isConsistent === null && (
              <span className="rounded-full border bg-gray-100 text-gray-500 border-gray-200 px-2 py-0.5 text-xs font-medium">
                ❓ Could not judge
              </span>
            )}
          </div>
        )}

        {/* Always show both answers */}
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

        {/* Fallback for messages without consistency data */}
        {isConsistent === undefined && (
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
