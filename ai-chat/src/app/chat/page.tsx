"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sessions", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.session?._id) {
          router.replace(`/chat/${data.session._id}`);
        }
      });
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
      Creating new chat...
    </div>
  );
}
