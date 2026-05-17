"use client";

import dynamic from "next/dynamic";

const ChatBot = dynamic(
  () => import("./ChatBot").then((m) => m.ChatBot),
  {
    ssr: false,
    loading: () => null,
  }
);

export function ChatBotWrapper() {
  if (typeof window === "undefined") return null;
  return <ChatBot />;
}
