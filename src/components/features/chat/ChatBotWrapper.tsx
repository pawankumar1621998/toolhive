"use client";

import dynamic from "next/dynamic";

const ChatBot = dynamic(
  () => import("./ChatBot").then((m) => m.ChatBot),
  { ssr: false }
);

export function ChatBotWrapper() {
  return <ChatBot />;
}
