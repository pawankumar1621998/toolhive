"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import {
  Send, Plus, Trash2, Copy, Check, Code2, ChevronDown,
  Sparkles, Terminal, RotateCcw, Menu, X
} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  thinking: string;
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

// ── Languages ─────────────────────────────────────────────────────────────────

const LANGUAGES = [
  "Auto Detect", "Python", "JavaScript", "TypeScript", "Java", "C", "C++",
  "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "SQL",
  "HTML", "CSS", "Bash", "PowerShell", "R", "MATLAB", "Scala", "Lua",
];

// ── Quick prompts ──────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: "REST API", prompt: "Create a REST API with CRUD operations" },
  { label: "Login Form", prompt: "Build a login form with validation" },
  { label: "Sorting Algorithm", prompt: "Implement quicksort and explain it" },
  { label: "Database Schema", prompt: "Design a database schema for an e-commerce app" },
  { label: "Web Scraper", prompt: "Write a web scraper for product prices" },
  { label: "Regex Parser", prompt: "Write regex to validate email and phone numbers" },
];

// ── Code block detector & renderer ────────────────────────────────────────────

function detectLang(fence: string): string {
  const map: Record<string, string> = {
    js: "javascript", ts: "typescript", py: "python", rb: "ruby",
    sh: "bash", shell: "bash", cs: "csharp", cpp: "cpp",
    kt: "kotlin", rs: "rust", go: "golang",
  };
  const l = fence.toLowerCase().trim();
  return map[l] ?? l ?? "text";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function MessageContent({ content, streaming }: { content: string; streaming?: boolean }) {
  const parts = content.split(/(```[\w]*\n[\s\S]*?```|```[\w]*[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        const codeMatch = part.match(/^```([\w]*)\n?([\s\S]*)```$/);
        if (codeMatch) {
          const lang = detectLang(codeMatch[1]);
          const code = codeMatch[2].trimEnd();
          return (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Terminal size={13} className="text-teal-400" />
                  <span className="text-xs font-mono text-slate-400 uppercase">{lang || "code"}</span>
                </div>
                <CopyButton text={code} />
              </div>
              <SyntaxHighlighter
                language={lang || "text"}
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  background: "#0d1117",
                  maxHeight: "520px",
                  overflowY: "auto",
                }}
                showLineNumbers
                lineNumberStyle={{ color: "#4a5568", minWidth: "2.5em" }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          );
        }

        if (!part.trim()) return null;

        const lines = part.split("\n");
        return (
          <div key={i} className="space-y-1.5 text-[14px] leading-relaxed text-slate-200">
            {lines.map((line, j) => {
              if (!line.trim()) return <br key={j} />;
              // Bold **text**
              const rendered = line.split(/(\*\*[^*]+\*\*)/g).map((seg, k) =>
                seg.startsWith("**") && seg.endsWith("**")
                  ? <strong key={k} className="text-white font-semibold">{seg.slice(2, -2)}</strong>
                  : <span key={k}>{seg}</span>
              );
              // Bullet
              if (line.startsWith("- ") || line.startsWith("• ")) {
                return <div key={j} className="flex gap-2"><span className="text-teal-400 mt-1">•</span><span>{rendered}</span></div>;
              }
              // Heading
              if (line.startsWith("# ")) return <p key={j} className="text-lg font-bold text-white mt-2">{line.slice(2)}</p>;
              if (line.startsWith("## ")) return <p key={j} className="text-base font-semibold text-white mt-1">{line.slice(3)}</p>;
              // Inline code
              const inlineCode = line.split(/(`[^`]+`)/g).map((seg, k) =>
                seg.startsWith("`") && seg.endsWith("`")
                  ? <code key={k} className="bg-slate-700 text-teal-300 px-1.5 py-0.5 rounded text-[13px] font-mono">{seg.slice(1, -1)}</code>
                  : <span key={k}>{seg}</span>
              );
              return <p key={j}>{inlineCode}</p>;
            })}
          </div>
        );
      })}
      {streaming && (
        <span className="inline-block w-2 h-4 bg-teal-400 animate-pulse rounded-sm ml-0.5" />
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({
  chats, activeId, onSelect, onNew, onDelete, open, onClose,
}: {
  chats: Chat[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(
        "fixed lg:relative inset-y-0 left-0 z-40",
        "w-64 flex flex-col bg-slate-900 border-r border-slate-700/60",
        "transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">Code AI</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {/* New Chat button */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {chats.length === 0 && (
            <p className="text-xs text-slate-500 text-center mt-6 px-4">No chats yet. Start a new one!</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={clsx(
                "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                chat.id === activeId
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
              onClick={() => { onSelect(chat.id); onClose(); }}
            >
              <Code2 size={13} className="shrink-0 text-teal-400" />
              <span className="flex-1 text-xs truncate">{chat.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/60">
          <p className="text-[10px] text-slate-500 text-center">Powered by NVIDIA Magistral</p>
        </div>
      </aside>
    </>
  );
}

// ── Main Workspace ─────────────────────────────────────────────────────────────

export function CodeAIWorkspace() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("Auto Detect");
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeChat = chats.find((c) => c.id === activeId);
  const messages = activeChat?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const createChat = useCallback(() => {
    const id = crypto.randomUUID();
    const chat: Chat = { id, title: "New Chat", messages: [], createdAt: Date.now() };
    setChats((prev) => [chat, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? "" : prev));
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    let chatId = activeId;
    if (!chatId) chatId = createChat();

    const langHint = language !== "Auto Detect" ? ` [Language: ${language}]` : "";
    const userContent = trimmed + langHint;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", thinking: "", content: trimmed };
    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", thinking: "", content: "" };

    setChats((prev) => prev.map((c) =>
      c.id === chatId
        ? {
            ...c,
            title: c.messages.length === 0 ? trimmed.slice(0, 40) : c.title,
            messages: [...c.messages, userMsg, assistantMsg],
          }
        : c
    ));
    setInput("");
    setStreaming(true);

    const history = [...(chats.find((c) => c.id === chatId)?.messages ?? []), userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.id === userMsg.id ? userContent : m.content }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/code-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
              choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta;
            const thinking = delta?.reasoning_content ?? "";
            const chunk = delta?.content ?? "";
            if (thinking || chunk) {
              setChats((prev) => prev.map((c) =>
                c.id === chatId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsg.id
                          ? { ...m, thinking: m.thinking + thinking, content: m.content + chunk }
                          : m
                      ),
                    }
                  : c
              ));
            }
          } catch {}
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setChats((prev) => prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: `❌ Error: ${(e as Error).message || "Could not get response. Please try again."}` }
                  : m
              ),
            }
          : c
      ));
    } finally {
      setStreaming(false);
    }
  }, [activeId, chats, createChat, language, streaming]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createChat}
        onDelete={deleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60 bg-slate-900 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">ToolHive Code AI</p>
              <p className="text-[10px] text-teal-400 leading-tight">Magistral · Any language · Streaming</p>
            </div>
          </div>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-all"
            >
              <Terminal size={12} className="text-teal-400" />
              {language}
              <ChevronDown size={12} className={clsx("transition-transform", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto p-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLanguage(l); setLangOpen(false); }}
                      className={clsx(
                        "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors",
                        l === language
                          ? "bg-teal-600 text-white"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeId && (
            <button
              onClick={() => { abortRef.current?.abort(); setChats((prev) => prev.map((c) => c.id === activeId ? { ...c, messages: [] } : c)); setStreaming(false); }}
              title="Clear chat"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 gap-8">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl">
                  <Code2 size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">ToolHive Code AI</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  Generate code in any programming language. Powered by NVIDIA Magistral.
                </p>
              </div>

              {/* Quick prompts */}
              <div className="w-full max-w-2xl">
                <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Quick Start</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.prompt)}
                      className="flex flex-col gap-1 px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-700 text-left transition-all group"
                    >
                      <span className="text-xs font-semibold text-white group-hover:text-teal-400 transition-colors">{qp.label}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{qp.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={msg.id} className={clsx("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                  {/* Avatar */}
                  <div className={clsx(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-md",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-500 to-purple-700 text-white"
                      : "bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
                  )}>
                    {msg.role === "user" ? "U" : <Sparkles size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className="flex-1 max-w-[85%]">
                    {msg.role === "user" ? (
                      <div className="rounded-2xl px-4 py-3 shadow-sm bg-violet-600/20 border border-violet-500/30 text-slate-200 text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div>
                        {/* Thinking block */}
                        {msg.thinking && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 mb-2 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2">
                              <span className={clsx("h-1.5 w-1.5 rounded-full shrink-0", streaming && i === messages.length - 1 && !msg.content ? "bg-amber-400 animate-pulse" : "bg-amber-600")} />
                              <span className="text-[11px] text-amber-400 font-medium">
                                {streaming && i === messages.length - 1 && !msg.content ? "Planning…" : "Planned"}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Content */}
                        <div className="rounded-2xl px-4 py-3 shadow-sm bg-slate-800/80 border border-slate-700/60">
                          <MessageContent
                            content={msg.content}
                            streaming={streaming && i === messages.length - 1 && !msg.content}
                          />
                          {streaming && i === messages.length - 1 && msg.content && (
                            <span className="inline-block w-2 h-4 bg-teal-400 animate-pulse rounded-sm ml-1 -mb-0.5" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 py-4 border-t border-slate-700/60 bg-slate-900 shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className={clsx(
              "flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all",
              "bg-slate-800 border-slate-700",
              "focus-within:border-teal-500/60 focus-within:ring-2 focus-within:ring-teal-500/20"
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={`Ask me to write code in ${language === "Auto Detect" ? "any language" : language}… (Enter to send, Shift+Enter for new line)`}
                disabled={streaming}
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none resize-none leading-relaxed py-0.5 min-h-[24px]"
              />

              {streaming ? (
                <button
                  onClick={stopGeneration}
                  className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shrink-0 transition-colors shadow-lg"
                  title="Stop generating"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className={clsx(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg",
                    input.trim()
                      ? "bg-teal-600 hover:bg-teal-500 text-white active:scale-95"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  )}
                >
                  <Send size={15} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-2">
              Shift+Enter for new line · Supports 20+ languages · Powered by NVIDIA Magistral
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
