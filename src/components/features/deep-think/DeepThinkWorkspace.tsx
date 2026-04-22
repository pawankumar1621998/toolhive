"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import {
  Send, Plus, Trash2, Brain, Sparkles, ChevronDown,
  Menu, X, RotateCcw, Copy, Check, Lightbulb
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  thinking: string;
  content: string;
  done: boolean;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

// ── Quick prompts ──────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: "🧮", label: "Math Problem", prompt: "Solve: If a train travels at 80 km/h and another at 60 km/h in opposite directions, when do they meet if they start 280 km apart?" },
  { icon: "🔍", label: "Logic Puzzle", prompt: "There are 3 boxes: one has apples, one has oranges, one has both. All labels are wrong. You can pick one fruit from one box. How do you correctly label all boxes?" },
  { icon: "💡", label: "Business Idea", prompt: "Analyze the pros and cons of starting an online tutoring business in India in 2025" },
  { icon: "🧬", label: "Science", prompt: "Explain why the sky is blue using physics, step by step" },
  { icon: "⚖️", label: "Decision Help", prompt: "Help me decide: should I learn Python or JavaScript first as a beginner programmer?" },
  { icon: "📝", label: "Essay Analysis", prompt: "What are the main causes of climate change? Give a detailed analytical answer" },
];

// ── Text renderer ──────────────────────────────────────────────────────────────

function renderText(text: string, isThinking?: boolean) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    const color = isThinking ? "text-amber-200/80" : "text-slate-200";

    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 my-0.5">
          <span className={isThinking ? "text-amber-400" : "text-violet-400"}>•</span>
          <span className={clsx("text-sm leading-relaxed", color)}>{renderInline(line.slice(2), isThinking)}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const [num, ...rest] = line.split(/\.\s/);
      return (
        <div key={i} className="flex gap-2 my-0.5">
          <span className={clsx("font-bold text-sm shrink-0", isThinking ? "text-amber-400" : "text-violet-400")}>{num}.</span>
          <span className={clsx("text-sm leading-relaxed", color)}>{renderInline(rest.join(". "), isThinking)}</span>
        </div>
      );
    }
    if (line.startsWith("## ")) return <p key={i} className={clsx("font-bold text-base mt-3 mb-1", isThinking ? "text-amber-300" : "text-white")}>{line.slice(3)}</p>;
    if (line.startsWith("# ")) return <p key={i} className={clsx("font-bold text-lg mt-3 mb-1", isThinking ? "text-amber-300" : "text-white")}>{line.slice(2)}</p>;
    return <p key={i} className={clsx("text-sm leading-relaxed my-0.5", color)}>{renderInline(line, isThinking)}</p>;
  });
}

function renderInline(text: string, isThinking?: boolean) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className={isThinking ? "text-amber-200" : "text-white"}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-slate-700/60 text-emerald-300 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ── Thinking block ─────────────────────────────────────────────────────────────

function ThinkingBlock({ text, streaming }: { text: string; streaming: boolean }) {
  const [open, setOpen] = useState(true);
  const wordCount = text.trim().split(/\s+/).length;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 overflow-hidden mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-amber-950/30 transition-colors"
      >
        <div className={clsx("h-2 w-2 rounded-full shrink-0", streaming ? "bg-amber-400 animate-pulse" : "bg-amber-500/60")} />
        <Brain size={13} className="text-amber-400 shrink-0" />
        <span className="text-xs font-semibold text-amber-300 flex-1">
          {streaming ? "Thinking…" : `Thought for ${wordCount} words`}
        </span>
        <ChevronDown size={13} className={clsx("text-amber-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-3 max-h-64 overflow-y-auto border-t border-amber-500/10">
          <div className="pt-3 space-y-1 font-mono text-xs text-amber-200/70 leading-relaxed">
            {text || <span className="animate-pulse">…</span>}
            {streaming && <span className="inline-block w-1.5 h-3 bg-amber-400 animate-pulse ml-0.5 align-middle" />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ chats, activeId, onSelect, onNew, onDelete, open, onClose }: {
  chats: Chat[]; activeId: string;
  onSelect: (id: string) => void; onNew: () => void;
  onDelete: (id: string) => void; open: boolean; onClose: () => void;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={clsx(
        "fixed lg:relative inset-y-0 left-0 z-40 w-64 flex flex-col",
        "bg-slate-900 border-r border-slate-700/60 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">Deep Think</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1"><X size={16} /></button>
        </div>
        <div className="p-3">
          <button onClick={onNew} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
            <Plus size={15} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {chats.length === 0 && <p className="text-xs text-slate-500 text-center mt-6 px-4">No chats yet.</p>}
          {chats.map((chat) => (
            <div key={chat.id}
              className={clsx("group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                chat.id === activeId ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
              onClick={() => { onSelect(chat.id); onClose(); }}
            >
              <Brain size={13} className="shrink-0 text-violet-400" />
              <span className="flex-1 text-xs truncate">{chat.title}</span>
              <button onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700/60">
          <p className="text-[10px] text-slate-500 text-center">Powered by GLM-5.1 Thinking</p>
        </div>
      </aside>
    </>
  );
}

// ── Main Workspace ─────────────────────────────────────────────────────────────

export function DeepThinkWorkspace() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeChat = chats.find((c) => c.id === activeId);
  const messages = activeChat?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const createChat = useCallback(() => {
    const id = crypto.randomUUID();
    setChats((prev) => [{ id, title: "New Chat", messages: [] }, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => prev === id ? "" : prev);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    let chatId = activeId || createChat();

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", thinking: "", content: trimmed, done: true };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: "assistant", thinking: "", content: "", done: false };

    setChats((prev) => prev.map((c) => c.id === chatId ? {
      ...c,
      title: c.messages.length === 0 ? trimmed.slice(0, 45) : c.title,
      messages: [...c.messages, userMsg, assistantMsg],
    } : c));
    setInput("");
    setStreaming(true);

    const history = [...(chats.find((c) => c.id === chatId)?.messages ?? []), userMsg]
      .filter((m) => m.done)
      .map((m) => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/deep-think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const updateMsg = (thinkChunk: string, contentChunk: string) => {
        setChats((prev) => prev.map((c) => c.id === chatId ? {
          ...c,
          messages: c.messages.map((m) => m.id === assistantId ? {
            ...m,
            thinking: m.thinking + thinkChunk,
            content: m.content + contentChunk,
          } : m),
        } : c));
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { reasoning_content?: string; content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta;
            const think = delta?.reasoning_content ?? "";
            const content = delta?.content ?? "";
            if (think || content) updateMsg(think, content);
          } catch {}
        }
      }

      // Mark as done
      setChats((prev) => prev.map((c) => c.id === chatId ? {
        ...c,
        messages: c.messages.map((m) => m.id === assistantId ? { ...m, done: true } : m),
      } : c));
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setChats((prev) => prev.map((c) => c.id === chatId ? {
        ...c,
        messages: c.messages.map((m) => m.id === assistantId ? {
          ...m, content: `❌ ${(e as Error).message}`, done: true,
        } : m),
      } : c));
    } finally {
      setStreaming(false);
    }
  }, [activeId, chats, createChat, streaming]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-950 overflow-hidden">
      <Sidebar chats={chats} activeId={activeId} onSelect={setActiveId}
        onNew={createChat} onDelete={deleteChat} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60 bg-slate-900 shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">ToolHive Deep Think</p>
              <p className="text-[10px] text-violet-400 leading-tight flex items-center gap-1">
                <Lightbulb size={9} /> GLM-5.1 · Shows reasoning · Like ChatGPT o1
              </p>
            </div>
          </div>
          {activeId && (
            <button onClick={() => { abortRef.current?.abort(); setChats((prev) => prev.map((c) => c.id === activeId ? { ...c, messages: [] } : c)); setStreaming(false); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <RotateCcw size={15} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 gap-8">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-2xl">
                  <Brain size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Deep Think AI</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  Powered by GLM-5.1 — shows its reasoning process like ChatGPT o1. Ask anything complex.
                </p>
              </div>
              <div className="w-full max-w-2xl">
                <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Try These</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button key={qp.label} onClick={() => sendMessage(qp.prompt)}
                      className="flex flex-col gap-1 px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-violet-500/50 hover:bg-slate-700 text-left transition-all group">
                      <span className="text-lg">{qp.icon}</span>
                      <span className="text-xs font-semibold text-white group-hover:text-violet-400 transition-colors">{qp.label}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-2">{qp.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={msg.id} className={clsx("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                  <div className={clsx(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md",
                    msg.role === "user" ? "bg-gradient-to-br from-slate-600 to-slate-800 text-white text-xs font-bold"
                      : "bg-gradient-to-br from-violet-500 to-purple-700"
                  )}>
                    {msg.role === "user" ? "U" : <Sparkles size={14} className="text-white" />}
                  </div>

                  <div className={clsx("flex-1 max-w-[88%]", msg.role === "user" ? "items-end" : "items-start")}>
                    {msg.role === "user" ? (
                      <div className="rounded-2xl px-4 py-3 bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div>
                        {/* Thinking block */}
                        {(msg.thinking || (!msg.done && streaming && i === messages.length - 1)) && (
                          <ThinkingBlock
                            text={msg.thinking}
                            streaming={!msg.done && streaming && i === messages.length - 1}
                          />
                        )}

                        {/* Answer block */}
                        {(msg.content || msg.done) && (
                          <div className="rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700/60">
                            <div className="space-y-1">
                              {renderText(msg.content)}
                              {!msg.done && streaming && i === messages.length - 1 && (
                                <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle rounded-sm" />
                              )}
                            </div>
                            {msg.done && msg.content && (
                              <div className="mt-3 flex justify-end">
                                <CopyBtn text={msg.content} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-slate-700/60 bg-slate-900 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className={clsx(
              "flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all",
              "bg-slate-800 border-slate-700",
              "focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20"
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything complex — math, logic, decisions, analysis… (Enter to send)"
                disabled={streaming}
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none resize-none leading-relaxed py-0.5"
              />
              {streaming ? (
                <button onClick={() => abortRef.current?.abort()}
                  className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shrink-0 transition-colors">
                  <X size={16} />
                </button>
              ) : (
                <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                  className={clsx(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    input.trim() ? "bg-violet-600 hover:bg-violet-500 text-white active:scale-95" : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  )}>
                  <Send size={15} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-2">
              GLM-5.1 thinks step-by-step before answering · Like ChatGPT o1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
