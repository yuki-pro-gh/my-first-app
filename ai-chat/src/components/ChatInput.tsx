"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  prefillText?: string;
}

export function ChatInput({ onSend, disabled, prefillText }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Populate input when edit is requested
  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      textareaRef.current?.focus();
    }
  }, [prefillText]);

  // テキストに応じて高さを自動調整
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [text]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message (Shift+Enter for new line)"
          className="flex-1 resize-none bg-transparent py-1 leading-5 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          aria-label="Send"
        >
          ↑
        </button>
      </div>
      <p className="mt-1 text-center text-xs text-gray-400">
        Llama and Qwen answer, Llama judges consistency
      </p>
    </div>
  );
}
