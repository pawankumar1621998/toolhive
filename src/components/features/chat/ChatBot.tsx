"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { X, Send, RotateCcw, Bot, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

// ─── Quick suggestion chips ───────────────────────────────────────────────────

const SUGGESTIONS = [
  "What tools do you have?",
  "How to compress a PDF?",
  "Remove image background",
  "Write a cover letter",
  "Is it free to use?",
  "What is ToolHive?",
];

// ─── Welcome message ──────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the **ToolHive Assistant** 👋\n\nI can help you with:\n- Finding the right tool for your task\n- How to use any tool\n- Pricing & features\n- Any other question about ToolHive\n\nWhat can I help you with today?",
  ts: Date.now(),
};

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderContent(text: string) {
  // Convert bold **text**, bullet lists, and newlines to JSX
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bullet
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = line.slice(2);
      return (
        <li key={i} className="ml-3 list-disc">
          {renderInline(content)}
        </li>
      );
    }
    // Numbered
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, "");
      return (
        <li key={i} className="ml-3 list-decimal">
          {renderInline(content)}
        </li>
      );
    }
    // Empty line
    if (!line.trim()) return <br key={i} />;
    return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-foreground-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Main ChatBot ─────────────────────────────────────────────────────────────

export function ChatBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const abortRef    = useRef<AbortController | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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

      // Build history for API (skip welcome message, take last 20)
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

        const botMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? data.error ?? "Sorry, I couldn't get a response. Please try again.",
          ts: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);
        if (!open) setUnread((n) => n + 1);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const botMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Connection error. Please check your internet and try again.",
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, open]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setInput("");
    setLoading(false);
  };

  return (
    <>
      {/* ── Chat Panel ── */}
      <div
        className={clsx(
          "fixed bottom-20 right-4 sm:right-6 z-50",
          "w-[calc(100vw-2rem)] max-w-sm",
          "flex flex-col",
          "bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        )}
        style={{ height: "min(520px, calc(100vh - 120px))" }}
        role="dialog"
        aria-label="ToolHive Chat Assistant"
        aria-modal="false"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white shrink-0">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="h-4.5 w-4.5 text-white" style={{ height: 18, width: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">ToolHive Assistant</p>
            <p className="text-[10px] text-teal-100 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              Online · Powered by AI
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={resetChat}
              title="Clear chat"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Close chat"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex gap-2 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={clsx(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-teal-600 text-white rounded-tr-sm"
                    : "bg-background border border-border text-foreground rounded-tl-sm"
                )}
              >
                <div className="space-y-0.5 text-[13px]">
                  {renderContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 max-w-[90%] mr-auto">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-background border border-border rounded-2xl rounded-tl-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — only on first message */}
        {messages.length === 1 && !loading && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background-subtle text-foreground-muted hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="px-3 pb-3 pt-1 shrink-0 border-t border-border bg-background">
          <div className="flex items-center gap-2 bg-background-subtle rounded-xl border border-border px-3 py-2 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400/30 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything…"
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle outline-none min-w-0"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className={clsx(
                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                input.trim() && !loading
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-border text-foreground-subtle cursor-not-allowed"
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-foreground-subtle text-center mt-1.5">
            AI may make mistakes · For support: toolhive.app/contact
          </p>
        </div>
      </div>

      {/* ── Floating trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        aria-expanded={open}
        className={clsx(
          "fixed bottom-4 right-4 sm:right-6 z-50",
          "h-14 w-14 rounded-full shadow-xl",
          "flex items-center justify-center",
          "bg-gradient-to-br from-teal-500 to-teal-700",
          "text-white transition-all duration-300",
          "hover:scale-105 hover:shadow-2xl active:scale-95",
          open && "rotate-0"
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
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
