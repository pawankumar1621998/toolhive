"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { X, Send, RotateCcw, Bot, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  "What tools do you have?",
  "How to compress a PDF?",
  "Remove image background",
  "Write a cover letter",
  "Is it free?",
  "What is ToolHive?",
];

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm **ToolHive Assistant** 👋\n\nI can help you:\n- Find the right tool for your task\n- How to use any tool\n- Pricing & features\n- Any other question\n\nWhat can I help you with?",
  ts: Date.now(),
};

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\.\s/, ""))}</li>;
    }
    if (!line.trim()) return <br key={i} />;
    return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-teal-400 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

export function ChatBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const [userName, setUserName] = useState("");
  const [nameSet, setNameSet]   = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const nameRef   = useRef<HTMLInputElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("th_chat_name");
    if (saved) { setUserName(saved); setNameSet(true); }
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        if (nameSet) inputRef.current?.focus();
        else nameRef.current?.focus();
      }, 150);
    }
  }, [open, nameSet]);

  const saveName = () => {
    const n = userName.trim();
    if (!n) return;
    localStorage.setItem("th_chat_name", n);
    setNameSet(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortRef.current.signal,
        });

        const data = await res.json() as { reply?: string; error?: string };
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply ?? data.error ?? "Sorry, I couldn't get a response. Please try again.",
            ts: Date.now(),
          },
        ]);
        if (!open) setUnread((n) => n + 1);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Connection error. Please check your internet and try again.",
            ts: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, open]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setInput("");
    setLoading(false);
  };

  const displayName = userName.trim() || "You";

  return (
    <>
      {/* ── Chat Panel ── */}
      <div
        className={clsx(
          "fixed z-50 flex flex-col overflow-hidden",
          "transition-all duration-300",
          // Mobile: full-width bottom sheet
          "bottom-0 right-0 left-0 sm:bottom-20 sm:right-4 sm:left-auto",
          "w-full sm:w-[380px]",
          "rounded-t-3xl sm:rounded-2xl",
          "bg-card border border-card-border shadow-2xl",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-full sm:translate-y-4 sm:scale-95 pointer-events-none"
        )}
        style={{ height: "min(580px, calc(100dvh - 0px))", maxHeight: "100dvh" }}
        role="dialog"
        aria-label="ToolHive Chat Assistant"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white shrink-0">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 ring-2 ring-white/30">
            <Bot className="text-white" style={{ height: 18, width: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight tracking-wide">ToolHive Assistant</p>
            <p className="text-[11px] text-teal-100 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Online · Powered by NVIDIA AI
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={resetChat} title="Clear chat"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors">
              <RotateCcw style={{ height: 15, width: 15 }} />
            </button>
            <button type="button" onClick={() => setOpen(false)} title="Close"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors">
              <X style={{ height: 18, width: 18 }} />
            </button>
          </div>
        </div>

        {/* Name input screen */}
        {!nameSet && (
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 gap-5 bg-background">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" style={{ height: 28, width: 28 }} />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">Welcome to ToolHive Chat!</p>
              <p className="text-sm text-foreground-muted mt-1">Enter your name to get started</p>
            </div>
            <div className="w-full max-w-xs flex flex-col gap-3">
              <input
                ref={nameRef}
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background-subtle text-foreground placeholder:text-foreground-subtle text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
              />
              <button
                type="button"
                onClick={saveName}
                disabled={!userName.trim()}
                className={clsx(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                  userName.trim()
                    ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg active:scale-95"
                    : "bg-border text-foreground-subtle cursor-not-allowed"
                )}
              >
                Start Chatting
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {nameSet && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex flex-col gap-1",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {/* Name label */}
                  <span className="text-[11px] text-foreground-muted font-medium px-1">
                    {msg.role === "user" ? displayName : "ToolHive AI"}
                  </span>

                  <div className={clsx("flex gap-2 max-w-[88%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    {/* Avatar */}
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="text-white" style={{ height: 14, width: 14 }} />
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-white text-[11px] font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={clsx(
                        "rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-tr-sm"
                          : "bg-background border border-border text-foreground rounded-tl-sm"
                      )}
                    >
                      <div className="space-y-0.5">{renderContent(msg.content)}</div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[11px] text-foreground-muted font-medium px-1">ToolHive AI</span>
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="text-white" style={{ height: 14, width: 14 }} />
                    </div>
                    <div className="bg-background border border-border rounded-2xl rounded-tl-sm shadow-sm">
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="text-[12px] px-3 py-1.5 rounded-full border border-border bg-background-subtle text-foreground-muted hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 sm:pb-3 pt-2 shrink-0 border-t border-border bg-background">
              <div className="flex items-center gap-2 bg-background-subtle rounded-2xl border border-border px-4 py-2.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask me anything…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle outline-none min-w-0 py-0.5"
                />
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className={clsx(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90",
                    input.trim() && !loading
                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                      : "bg-border text-foreground-subtle cursor-not-allowed"
                  )}
                >
                  <Send style={{ height: 14, width: 14 }} />
                </button>
              </div>
              <p className="text-[10px] text-foreground-subtle text-center mt-2">
                AI may make mistakes · <a href="/contact" className="underline hover:text-teal-500">Contact support</a>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Floating button ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className={clsx(
          "fixed bottom-5 right-4 sm:right-6 z-50",
          "h-14 w-14 rounded-full shadow-xl",
          "flex items-center justify-center",
          "bg-gradient-to-br from-teal-500 to-teal-700 text-white",
          "transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95",
          open && "sm:hidden"
        )}
      >
        {open ? (
          <X style={{ height: 22, width: 22 }} />
        ) : (
          <div className="relative">
            <Bot style={{ height: 24, width: 24 }} />
            {unread > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
        )}
      </button>
    </>
  );
}

export default ChatBot;
