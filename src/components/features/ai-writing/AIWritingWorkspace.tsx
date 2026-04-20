"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

// Provider color mapping
const PROVIDER_STYLES: Record<string, { label: string; color: string }> = {
  "ToolHive AI":      { label: "ToolHive AI",   color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  "Gemini":           { label: "Gemini AI",     color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "Groq":             { label: "Groq",           color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  "DeepSeek":         { label: "DeepSeek",       color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  "Claude (Anthropic)":{ label: "Claude AI",    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  "demo":             { label: "Demo mode",      color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers & sub-components
// ─────────────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none";

const cardClass = "border border-card-border bg-card rounded-2xl p-6";

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-emerald-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

interface OutputCardProps {
  text: string;
  onClear: () => void;
  label?: string;
}

function OutputCard({ text, onClear, label }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
      className={cardClass}
    >
      {label && (
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          {label}
        </p>
      )}
      <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
        {text}
      </pre>
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <Badge variant="default">{wordCount(text)} words</Badge>
        <button
          onClick={handleCopy}
          className={clsx(
            "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
            copied
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
              : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
          )}
        >
          {copied ? "Copied ✓" : "Copy to Clipboard"}
        </button>
        <button
          onClick={onClear}
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error banner
// ─────────────────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      {message}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI Summarizer
// ─────────────────────────────────────────────────────────────────────────────

function AISummarizer() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("Bullet Points");
  const [length, setLength] = useState("Medium (1 paragraph)");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("summarize");

  const formats = ["Bullet Points", "Short Paragraph", "Key Points"];
  const lengths = [
    "Brief (3-5 sentences)",
    "Medium (1 paragraph)",
    "Detailed (2-3 paragraphs)",
  ];

  async function handleSummarize() {
    if (!text.trim()) return;
    await generate({ text, options: { format, length } });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium text-foreground">
            Your Text
          </label>
          <span className="text-xs text-foreground-muted">
            {text.length} / 5000
          </span>
        </div>
        <textarea
          className={inputClass}
          rows={8}
          maxLength={5000}
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Output Format
          </p>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  format === f
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Summary Length
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={length}
            onChange={(e) => setLength(e.target.value)}
          >
            {lengths.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSummarize}
        disabled={!text.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Summarizing…
          </>
        ) : (
          "Summarize"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      <AnimatePresence>
        {output && (
          <OutputCard
            text={output}
            onClear={clear}
            label="Summary"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AI Translator
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_LANGUAGES = [
  "Auto Detect",
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Turkish",
  "Dutch",
  "Polish",
];

const TARGET_LANGUAGES = [
  "Hindi",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Turkish",
  "Dutch",
  "Polish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
];

function AITranslator() {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("Auto Detect");
  const [targetLang, setTargetLang] = useState("French");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("translate");

  async function handleTranslate() {
    if (!text.trim()) return;
    await generate({ text, targetLanguage: targetLang });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Input */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Source Language
            </label>
            <select
              className={clsx(inputClass, "cursor-pointer")}
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {SOURCE_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className={inputClass}
            rows={8}
            placeholder="Type or paste text to translate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={handleTranslate}
            disabled={!text.trim() || isLoading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Spinner /> Translating…
              </>
            ) : (
              "Translate"
            )}
          </button>
          {error && <ErrorBanner message={error} />}
        </div>

        {/* Right: Output */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Target Language
            </label>
            <select
              className={clsx(inputClass, "cursor-pointer")}
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {TARGET_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-card-border bg-card rounded-2xl p-6 min-h-[200px] flex items-center justify-center"
              >
                <Spinner />
              </motion.div>
            ) : output ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cardClass}
              >
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
                  Translation — {targetLang}
                </p>
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {output}
                </pre>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Badge variant="default">{wordCount(output)} words</Badge>
                  <CopyButton text={output} />
                  <button
                    onClick={clear}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-2xl p-6 min-h-[200px] flex items-center justify-center text-foreground-muted text-sm">
                Translation will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI Rewriter
// ─────────────────────────────────────────────────────────────────────────────

const TONES = ["Professional", "Casual", "Formal", "Creative", "Concise"] as const;
type Tone = (typeof TONES)[number];

function AIRewriter() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("rewrite");

  async function handleRewrite() {
    if (!text.trim()) return;
    await generate({ text, tone });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Original Text
            </label>
            <textarea
              className={inputClass}
              rows={8}
              placeholder="Paste text to rewrite..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    tone === t
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleRewrite}
            disabled={!text.trim() || isLoading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Spinner /> Rewriting…
              </>
            ) : (
              "Rewrite"
            )}
          </button>
          {error && <ErrorBanner message={error} />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1.5">
            Rewritten Version
          </p>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-card-border bg-card rounded-2xl p-6 min-h-[200px] flex items-center justify-center"
              >
                <Spinner />
              </motion.div>
            ) : output ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cardClass}
              >
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {output}
                </pre>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Badge variant="default">{wordCount(output)} words</Badge>
                  <CopyButton text={output} />
                  <button
                    onClick={clear}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-2xl p-6 min-h-[200px] flex items-center justify-center text-foreground-muted text-sm">
                Rewritten text will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Grammar Checker
// ─────────────────────────────────────────────────────────────────────────────

interface GrammarIssue {
  original: string;
  corrected: string;
  type: "Grammar" | "Spelling" | "Punctuation" | "Style";
}

const ISSUE_TYPE_COLORS: Record<GrammarIssue["type"], string> = {
  Grammar: "bg-red-500/10 text-red-500 border-red-500/20",
  Spelling: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Punctuation: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Style: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

function GrammarChecker() {
  const [text, setText] = useState("");
  const { output: corrected, loading: isLoading, error, generate, clear: clearOutput } = useAIGenerate("grammar-check");

  function handleClear() {
    clearOutput();
  }

  async function handleCheck() {
    if (!text.trim()) return;
    await generate({ text });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Your Text
        </label>
        <textarea
          className={inputClass}
          rows={10}
          placeholder="Paste your text to check..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleClear();
          }}
        />
      </div>
      <button
        onClick={handleCheck}
        disabled={!text.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Checking Grammar…
          </>
        ) : (
          "Check Grammar"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      <AnimatePresence>
        {corrected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Corrected text */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Corrected Text
                </span>
                <Badge variant="success">Fixed</Badge>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                {corrected}
              </pre>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <Badge variant="default">{wordCount(corrected)} words</Badge>
                <CopyButton text={corrected} />
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AI Blog Writer
// ─────────────────────────────────────────────────────────────────────────────

function AIBlogWriter() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Informative");
  const [wordCountVal, setWordCountVal] = useState("~800");
  const [audience, setAudience] = useState("");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("blog-writer");

  const tones = [
    "Informative",
    "Conversational",
    "Professional",
    "Persuasive",
    "Storytelling",
  ];
  const wordCounts = ["~500", "~800", "~1200", "~2000"];

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({
      topic,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      tone,
      audience,
      wordCount: wordCountVal,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Blog Topic / Title
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. The Future of Remote Work"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Target Keywords{" "}
            <span className="text-foreground-muted font-normal">
              (comma separated)
            </span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. remote work, productivity, teams"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Tone
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            {tones.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Word Count
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={wordCountVal}
            onChange={(e) => setWordCountVal(e.target.value)}
          >
            {wordCounts.map((w) => (
              <option key={w} value={w}>
                {w} words
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Target Audience
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. beginners, developers, marketers"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Generating Blog Post…
          </>
        ) : (
          "Generate Blog Post"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      <AnimatePresence>
        {output && (
          <OutputCard
            text={output}
            onClear={clear}
            label="Generated Blog Post"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. AI Email Writer
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_TYPES = [
  "Cold Outreach",
  "Follow-up",
  "Thank You",
  "Apology",
  "Introduction",
  "Request",
  "Newsletter",
  "Promotion",
];
const EMAIL_TONES = ["Professional", "Friendly", "Formal", "Concise"] as const;
type EmailTone = (typeof EMAIL_TONES)[number];

function AIEmailWriter() {
  const [emailType, setEmailType] = useState("Cold Outreach");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<EmailTone>("Professional");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("email-writer");

  async function handleWrite() {
    await generate({
      subject: `${emailType}${recipientName ? ` to ${recipientName}` : ""}${senderName ? ` from ${senderName}` : ""}`,
      context: context || `${emailType} email`,
      tone,
      emailType,
      recipientName,
      senderName,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Email Type
            </label>
            <select
              className={clsx(inputClass, "cursor-pointer")}
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
            >
              {EMAIL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Recipient Name{" "}
                <span className="text-foreground-muted font-normal text-xs">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Sarah"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Your Name / Company
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Alex / Acme Inc."
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Context / Purpose
            </label>
            <textarea
              className={inputClass}
              rows={4}
              placeholder="What is this email about?"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Tone</p>
            <div className="flex flex-wrap gap-2">
              {EMAIL_TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    tone === t
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleWrite}
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Spinner /> Writing Email…
              </>
            ) : (
              "Write Email"
            )}
          </button>
          {error && <ErrorBanner message={error} />}
        </div>

        {/* Output */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1.5">
            Generated Email
          </p>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-card-border bg-card rounded-2xl p-6 min-h-[300px] flex items-center justify-center"
              >
                <Spinner />
              </motion.div>
            ) : output ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cardClass}
              >
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {output}
                </pre>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Badge variant="default">{wordCount(output)} words</Badge>
                  <CopyButton text={output} />
                  <button
                    onClick={clear}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-2xl p-6 min-h-[300px] flex items-center justify-center text-foreground-muted text-sm">
                Your generated email will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Social Media Caption
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORMS = ["Instagram", "Twitter/X", "LinkedIn", "TikTok", "Facebook"] as const;
type Platform = (typeof PLATFORMS)[number];
const MOODS = ["Inspiring", "Funny", "Educational", "Promotional", "Personal", "Question"];
const EMOJI_STYLES = ["None", "Minimal", "Expressive"];

function SocialCaption() {
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState("Inspiring");
  const [hashtags, setHashtags] = useState(true);
  const [emojiStyle, setEmojiStyle] = useState("Minimal");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("social-caption");

  // Parse output into individual captions (AI returns them separated by numbered list or blank lines)
  const captions = output
    ? output.split(/\n{2,}|\n(?=\d+\.)/).map((c) => c.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).slice(0, 3)
    : [];

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, platform, tone: mood, hashtags, emojiStyle });
  }

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-0">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              platform === p
                ? "text-emerald-500"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {p}
            {platform === p && (
              <motion.div
                layoutId="platform-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Topic
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="What is your post about?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Mood / Tone
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Emoji Style
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={emojiStyle}
            onChange={(e) => setEmojiStyle(e.target.value)}
          >
            {EMOJI_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <button
              role="switch"
              aria-checked={hashtags}
              onClick={() => setHashtags((h) => !h)}
              className={clsx(
                "relative w-11 h-6 rounded-full transition-colors",
                hashtags ? "bg-emerald-500" : "bg-border"
              )}
            >
              <span
                className={clsx(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                  hashtags ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-sm font-medium text-foreground">
              Include Hashtags
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Generating Captions…
          </>
        ) : (
          "Generate Caption"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      <AnimatePresence>
        {captions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {captions.map((caption, i) => (
              <CaptionCard key={i} caption={caption} index={i + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CaptionCard({
  caption,
  index,
}: {
  caption: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(caption).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className={clsx(cardClass, "flex flex-col gap-3")}>
      <div className="flex items-center justify-between">
        <Badge variant="default">Variation {index}</Badge>
        <button
          onClick={handleCopy}
          className={clsx(
            "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
            copied
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
              : "bg-background border-border text-foreground-muted hover:text-foreground"
          )}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap flex-1">
        {caption}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Headline Generator
// ─────────────────────────────────────────────────────────────────────────────

const HEADLINE_TYPES = [
  "Blog Post",
  "News Article",
  "Social Media",
  "Ad Copy",
  "YouTube Title",
] as const;
type HeadlineType = (typeof HEADLINE_TYPES)[number];

function HeadlineGenerator() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<HeadlineType>("Blog Post");
  const [count, setCount] = useState(5);
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("headline");

  // Parse numbered list from AI output
  const headlines = output
    ? output.split("\n").map((l) => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean)
    : [];

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, count, type });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Topic
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="What is your content about?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {HEADLINE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  type === t
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Number to Generate
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            <option value={5}>5 headlines</option>
            <option value={10}>10 headlines</option>
            <option value={15}>15 headlines</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Generating Headlines…
          </>
        ) : (
          "Generate Headlines"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      <AnimatePresence>
        {headlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {headlines.map((headline, i) => (
              <HeadlineRow
                key={i}
                index={i + 1}
                headline={headline}
                type={type}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeadlineRow({
  index,
  headline,
  type,
}: {
  index: number;
  headline: string;
  type: HeadlineType;
}) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(headline).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = headline.length;
  const charBadgeVariant =
    charCount > 70 ? "error" : charCount > 50 ? "warning" : "success";

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-card-border bg-card hover:border-emerald-500/30 transition-colors">
      <span className="text-xs text-foreground-muted font-mono mt-1 shrink-0 w-5 text-right">
        {index}.
      </span>
      <p className="text-sm font-semibold text-foreground flex-1 leading-snug">
        {headline}
      </p>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <Badge variant="default">{type}</Badge>
        <Badge variant={charBadgeVariant}>{charCount} chars</Badge>
        <button
          onClick={handleCopy}
          className={clsx(
            "text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
            copied
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
              : "bg-background border-border text-foreground-muted hover:text-foreground"
          )}
        >
          {copied ? "✓" : "Copy"}
        </button>
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 transition-colors"
        >
          Use This
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Text to Speech (client-side only — Web Speech API)
// ─────────────────────────────────────────────────────────────────────────────

const VOICES = [
  { label: "Emma (US Female)", lang: "English (US)" },
  { label: "James (US Male)", lang: "English (US)" },
  { label: "Sophie (UK Female)", lang: "English (UK)" },
  { label: "Oliver (UK Male)", lang: "English (UK)" },
  { label: "Aria (AU Female)", lang: "English (AU)" },
  { label: "Leo (IN Male)", lang: "Hindi / English" },
  { label: "Sara (ES Female)", lang: "Spanish" },
  { label: "Marco (IT Male)", lang: "Italian" },
];

const PITCH_OPTIONS = ["Low", "Normal", "High"] as const;
type Pitch = (typeof PITCH_OPTIONS)[number];

function TextToSpeech() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Emma (US Female)");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState<Pitch>("Normal");
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const selectedVoice = VOICES.find((v) => v.label === voice) || VOICES[0];

  function handleConvert() {
    if (!text.trim()) return;
    setLoading(true);
    setConverted(false);
    setPlaying(false);
    setTimeout(() => {
      setConverted(true);
      setLoading(false);
    }, 1500);
  }

  // Fake waveform bars — 30 bars with varying heights
  const bars = Array.from({ length: 30 }, (_, i) => {
    const heights = [
      20, 40, 60, 35, 55, 80, 45, 30, 70, 50, 65, 25, 75, 55, 40, 85, 35, 60,
      45, 70, 30, 55, 80, 40, 65, 50, 35, 70, 45, 25,
    ];
    return heights[i % heights.length];
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-foreground">
                Text to Convert
              </label>
              <span className="text-xs text-foreground-muted">
                {text.length} / 1000
              </span>
            </div>
            <textarea
              className={inputClass}
              rows={8}
              maxLength={1000}
              placeholder="Enter text to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Voice
              </label>
              <select
                className={clsx(inputClass, "cursor-pointer")}
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                {VOICES.map((v) => (
                  <option key={v.label} value={v.label}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Language
              </label>
              <input
                type="text"
                className={inputClass}
                value={selectedVoice.lang}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Speed: {speed}x
            </label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.25}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-foreground-muted mt-1">
              <span>0.5x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Pitch</p>
            <div className="flex gap-3">
              {PITCH_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPitch(p)}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    pitch === p
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!text.trim() || loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Spinner /> Converting…
              </>
            ) : (
              "Convert to Speech"
            )}
          </button>
        </div>

        {/* Audio player */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1.5">
            Audio Preview
          </p>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-card-border bg-card rounded-2xl p-6 min-h-[260px] flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <Spinner />
                  <p className="text-sm text-foreground-muted">
                    Generating audio…
                  </p>
                </div>
              </motion.div>
            ) : converted ? (
              <motion.div
                key="player"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={clsx(cardClass, "space-y-5")}
              >
                {/* Voice info */}
                <div className="flex items-center gap-2">
                  <Badge variant="success" dot>
                    Ready
                  </Badge>
                  <span className="text-xs text-foreground-muted">
                    {voice} · {speed}x · {pitch} pitch
                  </span>
                </div>

                {/* Waveform */}
                <div className="flex items-center gap-0.5 h-12">
                  {bars.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-full bg-emerald-500/70"
                      style={{ height: `${h}%` }}
                      animate={
                        playing
                          ? {
                              height: [
                                `${h}%`,
                                `${Math.min(h + 20, 100)}%`,
                                `${h}%`,
                              ],
                            }
                          : { height: `${h}%` }
                      }
                      transition={{
                        duration: 0.6,
                        repeat: playing ? Infinity : 0,
                        delay: i * 0.02,
                      }}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPlaying((p) => !p)}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shrink-0"
                    >
                      {playing ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-emerald-500 rounded-full" />
                    </div>
                    <span className="text-xs text-foreground-muted font-mono shrink-0">
                      0:00 / 0:24
                    </span>
                  </div>
                </div>

                {/* Download buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 h-9 rounded-lg border border-border bg-background text-foreground-muted text-xs font-medium flex items-center justify-center gap-1.5 hover:text-foreground hover:border-border-strong transition-colors">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download MP3
                  </button>
                  <button className="flex-1 h-9 rounded-lg border border-border bg-background text-foreground-muted text-xs font-medium flex items-center justify-center gap-1.5 hover:text-foreground hover:border-border-strong transition-colors">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download WAV
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-2xl p-6 min-h-[260px] flex flex-col items-center justify-center gap-3 text-foreground-muted">
                <svg
                  className="w-10 h-10 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <p className="text-sm">Audio will appear here after conversion</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Instagram Bio Generator
// ─────────────────────────────────────────────────────────────────────────────

const MOODS_BIO = [
  { emoji: "😊", label: "Happy" },
  { emoji: "🌙", label: "Mysterious" },
  { emoji: "💼", label: "Professional" },
  { emoji: "😂", label: "Funny" },
  { emoji: "💕", label: "Romantic" },
  { emoji: "🔥", label: "Motivational" },
  { emoji: "🌸", label: "Aesthetic" },
  { emoji: "😈", label: "Savage" },
  { emoji: "😎", label: "Chill" },
  { emoji: "🎨", label: "Creative" },
  { emoji: "🌟", label: "Dreamer" },
  { emoji: "💪", label: "Hustler" },
] as const;

type BioMood = (typeof MOODS_BIO)[number]["label"];
type BioLength = "short" | "medium" | "long";

function BioCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className={clsx(
        "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium shrink-0",
        copied
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
          : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
      )}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function InstagramBioGen() {
  const [selectedMood, setSelectedMood] = useState<BioMood>("Happy");
  const [showDetails, setShowDetails] = useState(false);
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [interests, setInterests] = useState("");
  const [tagline, setTagline] = useState("");
  const [bioLength, setBioLength] = useState<BioLength>("medium");
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("instagram-bio");

  // Parse bios — AI separates them with "---"; also handle numbered fallback
  const bios = output
    ? output
        .split(/\n?-{3,}\n?/)
        .map((b) => b.replace(/^(bio\s*\d+[:.]\s*|option\s*\d+[:.]\s*|\d+[.]\s*)/i, "").trim())
        .filter((b) => b.length > 5)
        .slice(0, 3)
    : [];

  async function handleGenerate() {
    await generate({
      name: name || "Anonymous",
      niche: profession || interests || "lifestyle",
      mood: selectedMood,
      interests,
      tagline,
      bioLength,
      includeEmoji,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Inputs */}
      <div className="space-y-5">
        {/* Mood grid */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Mood / Vibe</p>
          <div className="grid grid-cols-3 gap-2">
            {MOODS_BIO.map(({ emoji, label }) => (
              <button
                key={label}
                onClick={() => setSelectedMood(label)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all",
                  selectedMood === label
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-2 ring-emerald-500/30"
                    : "border-border bg-background text-foreground-muted hover:border-emerald-500/40 hover:bg-emerald-500/5"
                )}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional details toggle */}
        <div>
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <svg
              className={clsx("w-4 h-4 transition-transform", showDetails ? "rotate-90" : "")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showDetails ? "Hide" : "Add"} personal details
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 pl-1">
              <div>
                <label className="text-xs font-medium text-foreground-muted block mb-1">
                  Name / Nickname
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Alex, Mia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted block mb-1">
                  Profession / What you do
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Photographer, Student, Fitness Coach"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted block mb-1">
                  Personal interests
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. travel, coffee, music"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted block mb-1">
                  Tagline or quote{" "}
                  <span className="text-foreground-subtle font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Turning dreams into plans"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bio length */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Bio Length</p>
          <div className="flex gap-2">
            {(["short", "medium", "long"] as BioLength[]).map((l) => (
              <button
                key={l}
                onClick={() => setBioLength(l)}
                className={clsx(
                  "flex-1 py-2 rounded-lg border text-xs font-medium transition-colors capitalize",
                  bioLength === l
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                )}
              >
                {l}
                <span className="block text-[10px] font-normal opacity-75 mt-0.5">
                  {l === "short" ? "< 100" : l === "medium" ? "< 150" : "< 200"} chars
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Include emoji toggle */}
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <button
            role="switch"
            aria-checked={includeEmoji}
            onClick={() => setIncludeEmoji((v) => !v)}
            className={clsx(
              "relative w-11 h-6 rounded-full transition-colors",
              includeEmoji ? "bg-emerald-500" : "bg-border"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                includeEmoji ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span className="text-sm font-medium text-foreground">Include emoji in bio</span>
        </label>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Spinner /> Generating Bios…
            </>
          ) : (
            "Generate Bio"
          )}
        </button>
        {error && <ErrorBanner message={error} />}
      </div>

      {/* Right: Bio variations */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Bio Variations</p>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-card-border bg-card rounded-2xl p-6 min-h-[300px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <Spinner />
                <p className="text-sm text-foreground-muted">Crafting your bios…</p>
              </div>
            </motion.div>
          ) : bios.length > 0 ? (
            <motion.div
              key="bios"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {bios.map((bio, i) => {
                // Instagram counts characters including newlines
                const charCount = bio.length;
                const isOverLimit = charCount > 150;
                return (
                  <div key={i} className={clsx(cardClass, "space-y-3")}>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="default">Variation {i + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                            isOverLimit
                              ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          )}
                        >
                          {charCount}/150 {isOverLimit ? "⚠️ over limit" : "✓"}
                        </span>
                        <BioCopyButton text={bio} />
                      </div>
                    </div>
                    {/* Render each line as its own block for clarity */}
                    <div className="space-y-1">
                      {bio.split("\n").filter(Boolean).map((line, j) => (
                        <p key={j} className="text-sm text-foreground leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center gap-3 text-foreground-muted text-sm">
              <span className="text-3xl">📸</span>
              <p>Select a mood and click Generate Bio</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Description Writer
// ─────────────────────────────────────────────────────────────────────────────

const DESCRIPTION_TYPES = [
  { emoji: "📦", label: "Product / Item", value: "product" },
  { emoji: "🎬", label: "YouTube Video", value: "youtube" },
  { emoji: "📝", label: "Blog Post / Article", value: "blog" },
  { emoji: "🛒", label: "Amazon Listing", value: "amazon" },
  { emoji: "📱", label: "App / Software", value: "app" },
  { emoji: "🏠", label: "Real Estate Property", value: "realestate" },
  { emoji: "🎪", label: "Event", value: "event" },
  { emoji: "🔧", label: "Service / Business", value: "service" },
  { emoji: "🎮", label: "Game", value: "game" },
  { emoji: "📚", label: "Book / Course", value: "book" },
] as const;

type DescType = (typeof DESCRIPTION_TYPES)[number]["value"];

const DESC_TONES = ["Informative", "Persuasive", "Exciting", "Professional", "Casual", "Storytelling"] as const;
type DescTone = (typeof DESC_TONES)[number];

const DESC_LENGTHS = [
  { label: "Short (~50 words)", value: "short" },
  { label: "Medium (~100-150 words)", value: "medium" },
  { label: "Long (~250-300 words)", value: "long" },
  { label: "Detailed (~500 words)", value: "detailed" },
] as const;
type DescLength = (typeof DESC_LENGTHS)[number]["value"];

function DescriptionWriter() {
  const [descType, setDescType] = useState<DescType>("product");
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<DescTone>("Informative");
  const [length, setLength] = useState<DescLength>("medium");
  const [copied, setCopied] = useState(false);
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("description");

  const wc = output.trim() === "" ? 0 : output.trim().split(/\s+/).length;
  const readTimeSec = Math.max(Math.round(wc / 3), 5);
  const readTimeLabel = readTimeSec < 60 ? `~${readTimeSec} sec read` : `~${Math.round(readTimeSec / 60)} min read`;

  async function handleWrite() {
    if (!productName.trim()) return;
    await generate({
      title: productName,
      features: features.split("\n").filter(Boolean),
      audience,
      tone,
      length,
      descType,
    });
  }

  async function handleRegenerate() {
    if (!productName.trim()) return;
    await generate({
      title: productName,
      features: features.split("\n").filter(Boolean),
      audience,
      tone,
      length,
      descType,
      regenerate: true,
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.slice(0, 30).replace(/\s+/g, "-").toLowerCase() || "description"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">What are you describing?</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DESCRIPTION_TYPES.map(({ emoji, label, value }) => (
            <button
              key={value}
              onClick={() => setDescType(value)}
              className={clsx(
                "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all text-center",
                descType === value
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-2 ring-emerald-500/30"
                  : "border-border bg-background text-foreground-muted hover:border-emerald-500/40 hover:bg-emerald-500/5"
              )}
            >
              <span className="text-lg leading-none">{emoji}</span>
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Title / Name
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="What is the name of what you're describing?"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Key Features / Details
          </label>
          <textarea
            className={inputClass}
            rows={4}
            placeholder="List the main features, benefits, or highlights..."
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Target Audience
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. beginners, professionals, parents"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Length
          </label>
          <select
            className={clsx(inputClass, "cursor-pointer")}
            value={length}
            onChange={(e) => setLength(e.target.value as DescLength)}
          >
            {DESC_LENGTHS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-foreground mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {DESC_TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  tone === t
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleWrite}
        disabled={!productName.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Writing Description…
          </>
        ) : (
          "Write Description"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className={cardClass}
          >
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
              Generated Description
            </p>
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
              {output}
            </pre>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <Badge variant="default">{wc} words</Badge>
              <Badge variant="default">{readTimeLabel}</Badge>
              <button
                onClick={handleCopy}
                className={clsx(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
                )}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
              >
                Download .txt
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. AI Paraphraser
// ─────────────────────────────────────────────────────────────────────────────

type ParaStyle = "Standard" | "Fluent" | "Creative" | "Academic" | "Simple";
const PARA_STYLES: ParaStyle[] = ["Standard", "Fluent", "Creative", "Academic", "Simple"];

const PARA_STYLE_DESC: Record<ParaStyle, string> = {
  Standard: "Balanced rewrite — close in meaning, slightly varied wording.",
  Fluent: "Natural, flowing prose that reads smoothly.",
  Creative: "Fresh metaphors and inventive phrasing.",
  Academic: "Formal vocabulary and structured sentences.",
  Simple: "Plain language anyone can understand.",
};

function AIParaphraser() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<ParaStyle>("Standard");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("paraphrase");

  async function handleParaphrase() {
    if (!text.trim()) return;
    await generate({ text, style });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Original Text
            </label>
            <textarea
              className={inputClass}
              rows={8}
              placeholder="Paste the text you want to paraphrase..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-foreground-muted mt-1">{wordCount(text)} words</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Paraphrase Style</p>
            <div className="flex flex-wrap gap-2">
              {PARA_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    style === s
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-foreground-muted mt-2">{PARA_STYLE_DESC[style]}</p>
          </div>
          <button
            onClick={handleParaphrase}
            disabled={!text.trim() || isLoading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Spinner /> Paraphrasing…
              </>
            ) : (
              "Paraphrase Text"
            )}
          </button>
          {error && <ErrorBanner message={error} />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1.5">Paraphrased Version</p>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-card-border bg-card rounded-2xl p-6 min-h-[200px] flex items-center justify-center"
              >
                <Spinner />
              </motion.div>
            ) : output ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cardClass}
              >
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {output}
                </pre>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Badge variant="default">{wordCount(output)} words</Badge>
                  <CopyButton text={output} />
                  <button
                    onClick={clear}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-2xl p-6 min-h-[200px] flex items-center justify-center text-foreground-muted text-sm">
                Paraphrased text will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. AI Script Writer
// ─────────────────────────────────────────────────────────────────────────────

type ScriptType = "youtube-tutorial" | "youtube-short" | "podcast-intro" | "ad-copy" | "explainer";
type ScriptTone = "Energetic" | "Professional" | "Conversational" | "Inspiring" | "Humorous";

const SCRIPT_TYPES: { value: ScriptType; label: string; emoji: string; duration: string }[] = [
  { value: "youtube-tutorial", label: "YouTube Tutorial", emoji: "🎬", duration: "8–12 min" },
  { value: "youtube-short",    label: "YouTube Short",   emoji: "⚡", duration: "30–60 sec" },
  { value: "podcast-intro",    label: "Podcast Intro",   emoji: "🎙️", duration: "1–2 min" },
  { value: "ad-copy",          label: "Ad / Promo",      emoji: "📢", duration: "15–30 sec" },
  { value: "explainer",        label: "Explainer Video", emoji: "💡", duration: "2–3 min" },
];
const SCRIPT_TONES: ScriptTone[] = ["Energetic", "Professional", "Conversational", "Inspiring", "Humorous"];

function AIScriptWriter() {
  const [scriptType, setScriptType] = useState<ScriptType>("youtube-tutorial");
  const [topic, setTopic] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState<ScriptTone>("Energetic");
  const [copied, setCopied] = useState(false);
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate("script-writer");

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({
      topic,
      scriptType,
      keyPoints: points.split("\n").filter(Boolean),
      tone,
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.slice(0, 30).replace(/\s+/g, "-").toLowerCase() || "script"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Script type */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Script Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SCRIPT_TYPES.map(({ value, label, emoji, duration }) => (
            <button
              key={value}
              onClick={() => setScriptType(value)}
              className={clsx(
                "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all text-center",
                scriptType === value
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-2 ring-emerald-500/30"
                  : "border-border bg-background text-foreground-muted hover:border-emerald-500/40 hover:bg-emerald-500/5"
              )}
            >
              <span className="text-lg leading-none">{emoji}</span>
              <span className="leading-tight">{label}</span>
              <span className="text-[10px] opacity-70">{duration}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Topic / Title
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. How to grow on YouTube in 2025"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Key Points <span className="text-foreground-muted font-normal">(one per line, optional)</span>
          </label>
          <textarea
            className={inputClass}
            rows={4}
            placeholder={"e.g.\nOptimise your thumbnail\nPost consistently\nEngage with comments"}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-foreground mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {SCRIPT_TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  tone === t
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-background border-border text-foreground-muted hover:border-emerald-500/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Writing Script…
          </>
        ) : (
          "Generate Script"
        )}
      </button>

      {error && <ErrorBanner message={error} />}

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className={cardClass}
          >
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
              Generated Script
            </p>
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
              {output}
            </pre>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <Badge variant="default">{wordCount(output)} words</Badge>
              <button
                onClick={handleCopy}
                className={clsx(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
                )}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
              >
                Download .txt
              </button>
              <button
                onClick={clear}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Story Generator
// ─────────────────────────────────────────────────────────────────────────────

const STORY_GENRES = ["General", "Romance", "Thriller", "Fantasy", "Sci-Fi", "Comedy", "Horror", "Adventure", "Mystery", "Drama"] as const;
const STORY_EMOTIONS = ["Happy", "Sad", "Motivational", "Funny", "Romantic", "Emotional", "Suspenseful", "Inspiring", "Dark", "Nostalgic"] as const;
const STORY_WORD_COUNTS = [100, 300, 500, 1000, 2000] as const;
const STORY_LANGUAGES = ["English", "Hindi", "Urdu", "French", "Spanish", "German", "Arabic", "Chinese", "Japanese", "Portuguese"] as const;

function StoryGenerator() {
  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState<typeof STORY_GENRES[number]>("General");
  const [emotion, setEmotion] = useState<typeof STORY_EMOTIONS[number]>("Happy");
  const [wordCount, setWordCount] = useState<typeof STORY_WORD_COUNTS[number]>(500);
  const [language, setLanguage] = useState<typeof STORY_LANGUAGES[number]>("English");
  const [characters, setCharacters] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("story-generator");

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, genre, emotion, wordCount, language, characters });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Story Topic / Idea <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={3} placeholder="e.g. A young girl discovers she has magical powers on her 18th birthday..." value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={500} />
        <p className="text-xs text-foreground-muted mt-1">{topic.length}/500</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Genre</p>
          <div className="flex flex-wrap gap-1.5">
            {STORY_GENRES.map((g) => (
              <button key={g} onClick={() => setGenre(g)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", genre === g ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Emotion / Tone</p>
          <div className="flex flex-wrap gap-1.5">
            {STORY_EMOTIONS.map((e) => (
              <button key={e} onClick={() => setEmotion(e)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", emotion === e ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Word Count</p>
          <div className="flex flex-wrap gap-2">
            {STORY_WORD_COUNTS.map((w) => (
              <button key={w} onClick={() => setWordCount(w)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", wordCount === w ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{w} words</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Language</label>
          <select className={clsx(inputClass, "cursor-pointer")} value={language} onChange={(e) => setLanguage(e.target.value as typeof STORY_LANGUAGES[number])}>
            {STORY_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Characters (optional)</label>
        <input className={inputClass} placeholder="e.g. Sarah (brave girl, 18), Michael (wise mentor)" value={characters} onChange={(e) => setCharacters(e.target.value)} />
      </div>

      <button onClick={handleGenerate} disabled={!topic.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Writing story…</> : "✨ Generate Story"}
      </button>

      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Story — ${genre} · ${emotion} · ${wordCount} words · ${language}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Note Maker
// ─────────────────────────────────────────────────────────────────────────────

const NOTE_FORMATS = ["Bullet Points", "Numbered List", "Outline", "Mind Map Style", "Cornell Notes", "Summary"] as const;
const NOTE_DETAILS = ["Brief", "Standard", "Detailed", "Comprehensive"] as const;
const NOTE_LANGUAGES = ["English", "Hindi", "Urdu", "French", "Spanish", "German", "Arabic"] as const;

function NoteMaker() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<typeof NOTE_FORMATS[number]>("Bullet Points");
  const [detail, setDetail] = useState<typeof NOTE_DETAILS[number]>("Standard");
  const [language, setLanguage] = useState<typeof NOTE_LANGUAGES[number]>("English");
  const { output, loading, error, generate, clear } = useAIGenerate("note-maker");

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, format, detail, language });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Topic / Subject <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={4} placeholder="e.g. The French Revolution, Photosynthesis process, Python OOP concepts, World War 2..." value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={1000} />
        <p className="text-xs text-foreground-muted mt-1">{topic.length}/1000</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Format</p>
          <div className="flex flex-col gap-1.5">
            {NOTE_FORMATS.map((f) => (
              <button key={f} onClick={() => setFormat(f)} className={clsx("px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors", format === f ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Detail Level</p>
          <div className="flex flex-col gap-1.5">
            {NOTE_DETAILS.map((d) => (
              <button key={d} onClick={() => setDetail(d)} className={clsx("px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors", detail === d ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Language</p>
          <select className={clsx(inputClass, "cursor-pointer")} value={language} onChange={(e) => setLanguage(e.target.value as typeof NOTE_LANGUAGES[number])}>
            {NOTE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={!topic.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Making notes…</> : "📝 Generate Notes"}
      </button>

      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Notes — ${format} · ${detail} · ${language}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Article Writer
// ─────────────────────────────────────────────────────────────────────────────

const ARTICLE_TONES = ["Informative", "Persuasive", "Conversational", "Academic", "Journalistic", "SEO-Optimized"] as const;
const ARTICLE_WORD_COUNTS = [300, 500, 800, 1200, 2000] as const;
const ARTICLE_LANGUAGES = ["English", "Hindi", "Urdu", "French", "Spanish", "German", "Arabic", "Portuguese"] as const;

function ArticleWriter() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<typeof ARTICLE_TONES[number]>("Informative");
  const [wordCount, setWordCount] = useState<typeof ARTICLE_WORD_COUNTS[number]>(800);
  const [language, setLanguage] = useState<typeof ARTICLE_LANGUAGES[number]>("English");
  const [sections, setSections] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("article-writer");

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, tone, wordCount, language, sections });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Article Topic <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={3} placeholder="e.g. Benefits of meditation for students, How AI is changing healthcare, Top travel destinations in 2025..." value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={500} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Writing Tone</p>
          <div className="flex flex-wrap gap-1.5">
            {ARTICLE_TONES.map((t) => (
              <button key={t} onClick={() => setTone(t)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", tone === t ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{t}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Word Count</p>
            <div className="flex flex-wrap gap-1.5">
              {ARTICLE_WORD_COUNTS.map((w) => (
                <button key={w} onClick={() => setWordCount(w)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", wordCount === w ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{w}w</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Language</label>
            <select className={clsx(inputClass, "cursor-pointer")} value={language} onChange={(e) => setLanguage(e.target.value as typeof ARTICLE_LANGUAGES[number])}>
              {ARTICLE_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Custom Sections (optional)</label>
        <input className={inputClass} placeholder="e.g. Introduction, History, Benefits, Challenges, Future, Conclusion" value={sections} onChange={(e) => setSections(e.target.value)} />
      </div>

      <button onClick={handleGenerate} disabled={!topic.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Writing article…</> : "✍️ Write Article"}
      </button>

      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Article — ${tone} · ${wordCount} words · ${language}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hashtag Generator
// ─────────────────────────────────────────────────────────────────────────────

const HASHTAG_PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "LinkedIn", "YouTube"] as const;

function HashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<typeof HASHTAG_PLATFORMS[number]>("Instagram");
  const [niche, setNiche] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("hashtag-gen");

  async function handleGenerate() {
    if (!topic.trim()) return;
    await generate({ topic, platform, niche });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Platform</p>
        <div className="flex flex-wrap gap-2">
          {HASHTAG_PLATFORMS.map((p) => (
            <button key={p} onClick={() => setPlatform(p)} className={clsx("px-4 py-2 rounded-full text-xs font-medium border transition-colors", platform === p ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Post Topic <span className="text-rose-500">*</span></label>
        <input className={inputClass} placeholder="e.g. morning workout, homemade pasta recipe, travel photography in Paris..." value={topic} onChange={(e) => setTopic(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Your Niche (optional)</label>
        <input className={inputClass} placeholder="e.g. fitness coach, food blogger, travel vlogger, fashion..." value={niche} onChange={(e) => setNiche(e.target.value)} />
      </div>
      <button onClick={handleGenerate} disabled={!topic.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Generating hashtags…</> : "#️⃣ Generate Hashtags"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Hashtags — ${platform}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Business Name Generator
// ─────────────────────────────────────────────────────────────────────────────

const BIZ_STYLES = ["Creative", "Professional", "Catchy", "Technical", "Minimal", "Playful"] as const;
const BIZ_INDUSTRIES = ["Technology", "Food & Restaurant", "Fashion", "Health & Fitness", "Education", "Finance", "Travel", "Beauty", "Real Estate", "E-commerce", "Consulting", "Entertainment"] as const;

function BusinessNameGenerator() {
  const [keywords, setKeywords] = useState("");
  const [industry, setIndustry] = useState<typeof BIZ_INDUSTRIES[number]>("Technology");
  const [style, setStyle] = useState<typeof BIZ_STYLES[number]>("Creative");
  const { output, loading, error, generate, clear } = useAIGenerate("business-name");

  async function handleGenerate() {
    if (!keywords.trim()) return;
    await generate({ keywords, industry, style, count: 20 });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Keywords / Business Description <span className="text-rose-500">*</span></label>
        <input className={inputClass} placeholder="e.g. fast delivery, healthy food, premium coffee, AI-powered..." value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Industry</label>
          <select className={clsx(inputClass, "cursor-pointer")} value={industry} onChange={(e) => setIndustry(e.target.value as typeof BIZ_INDUSTRIES[number])}>
            {BIZ_INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Name Style</p>
          <div className="flex flex-wrap gap-1.5">
            {BIZ_STYLES.map((s) => (
              <button key={s} onClick={() => setStyle(s)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", style === s ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={handleGenerate} disabled={!keywords.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Generating names…</> : "🏢 Generate Business Names"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Business Names — ${industry} · ${style}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ad Copy Writer
// ─────────────────────────────────────────────────────────────────────────────

const AD_PLATFORMS = ["Facebook Ads", "Google Ads", "Instagram Ads", "LinkedIn Ads", "TikTok Ads", "Twitter Ads"] as const;
const AD_TONES = ["Persuasive", "Urgent", "Friendly", "Professional", "Emotional", "Humorous"] as const;

function AdCopyWriter() {
  const [product, setProduct] = useState("");
  const [benefits, setBenefits] = useState("");
  const [platform, setPlatform] = useState<typeof AD_PLATFORMS[number]>("Facebook Ads");
  const [tone, setTone] = useState<typeof AD_TONES[number]>("Persuasive");
  const { output, loading, error, generate, clear } = useAIGenerate("ad-copy");

  async function handleGenerate() {
    if (!product.trim() || !benefits.trim()) return;
    await generate({ product, benefits, platform, tone, count: 3 });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Product / Service Name <span className="text-rose-500">*</span></label>
        <input className={inputClass} placeholder="e.g. ProFit Gym App, Organic Coffee Blend, Online Spanish Course..." value={product} onChange={(e) => setProduct(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Key Benefits / Features <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={3} placeholder="e.g. Lose weight in 30 days, 100% organic, 24/7 support, money-back guarantee..." value={benefits} onChange={(e) => setBenefits(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Ad Platform</p>
          <div className="flex flex-wrap gap-1.5">
            {AD_PLATFORMS.map((p) => (
              <button key={p} onClick={() => setPlatform(p)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", platform === p ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Ad Tone</p>
          <div className="flex flex-wrap gap-1.5">
            {AD_TONES.map((t) => (
              <button key={t} onClick={() => setTone(t)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", tone === t ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={handleGenerate} disabled={!product.trim() || !benefits.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Writing ad copy…</> : "📢 Generate Ad Copy"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Ad Copy — ${platform} · ${tone}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Roast Generator
// ─────────────────────────────────────────────────────────────────────────────

function RoastGenerator() {
  const [name, setName] = useState("");
  const [traits, setTraits] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("roast-gen");

  async function handleGenerate() {
    if (!name.trim()) return;
    await generate({ name, traits });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
        <span className="text-lg">😄</span>
        <p className="text-xs text-amber-700 dark:text-amber-400">Friendly roasts only! All jokes are lighthearted and fun — perfect for friends and parties.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Person&apos;s Name <span className="text-rose-500">*</span></label>
        <input className={inputClass} placeholder="e.g. John, My best friend Alex..." value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Their Funny Traits / Habits (optional)</label>
        <input className={inputClass} placeholder="e.g. always late, obsessed with coffee, can't parallel park, never stops talking..." value={traits} onChange={(e) => setTraits(e.target.value)} />
      </div>
      <button onClick={handleGenerate} disabled={!name.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Preparing roast…</> : "🔥 Roast Them!"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label="🔥 The Roast" />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dad Joke Generator
// ─────────────────────────────────────────────────────────────────────────────

function DadJokeGenerator() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const { output, loading, error, generate, clear } = useAIGenerate("dad-jokes");

  async function handleGenerate() {
    await generate({ topic, count });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Topic (optional)</label>
        <input className={inputClass} placeholder="e.g. animals, food, science, school, sports... leave empty for random!" value={topic} onChange={(e) => setTopic(e.target.value)} />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Number of jokes</p>
        <div className="flex gap-2">
          {[3, 5, 10, 15].map((n) => (
            <button key={n} onClick={() => setCount(n)} className={clsx("px-4 py-2 rounded-lg text-sm font-medium border transition-colors", count === n ? "bg-amber-500 text-white border-amber-500" : "bg-background border-border text-foreground-muted hover:border-amber-500/50")}>{n}</button>
          ))}
        </div>
      </div>
      <button onClick={handleGenerate} disabled={loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Groaning up jokes…</> : "😂 Generate Dad Jokes"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label="👨 Dad Jokes" />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Emoji Translator
// ─────────────────────────────────────────────────────────────────────────────

function EmojiTranslator() {
  const [text, setText] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("emoji-translator");

  async function handleGenerate() {
    if (!text.trim()) return;
    await generate({ text });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Text to Translate <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={5} placeholder="I love pizza so much! Just had dinner with my friends and we laughed all night..." value={text} onChange={(e) => setText(e.target.value)} maxLength={500} />
        <p className="text-xs text-foreground-muted mt-1">{text.length}/500</p>
      </div>
      <button onClick={handleGenerate} disabled={!text.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Translating to emojis…</> : "😎 Translate to Emojis"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label="🎭 Emoji Translation" />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shakespeare Translator
// ─────────────────────────────────────────────────────────────────────────────

function ShakespeareTranslator() {
  const [text, setText] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("shakespeare");

  async function handleGenerate() {
    if (!text.trim()) return;
    await generate({ text });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Modern Text <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={5} placeholder="I can't believe you ate my lunch again. This is literally the worst thing ever." value={text} onChange={(e) => setText(e.target.value)} maxLength={500} />
      </div>
      <button onClick={handleGenerate} disabled={!text.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Translating, forsooth…</> : "🎭 Translate to Shakespeare"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label="🎭 As The Bard Would Say…" />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Corporate Jargon Generator
// ─────────────────────────────────────────────────────────────────────────────

function CorporateJargon() {
  const [text, setText] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("corporate-jargon");

  async function handleGenerate() {
    if (!text.trim()) return;
    await generate({ text });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 flex items-start gap-2">
        <span className="text-lg">💼</span>
        <p className="text-xs text-sky-700 dark:text-sky-400">Turn simple sentences into confusing corporate speak that impresses no one but sounds very important!</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Simple Statement <span className="text-rose-500">*</span></label>
        <textarea className={inputClass} rows={4} placeholder="e.g. We need to fix this bug before Friday. The meeting is cancelled. I'm going on vacation." value={text} onChange={(e) => setText(e.target.value)} maxLength={300} />
      </div>
      <button onClick={handleGenerate} disabled={!text.trim() || loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Synergizing paradigms…</> : "💼 Add Corporate Jargon"}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label="💼 Corporate Version" />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Default / Fallback
// ─────────────────────────────────────────────────────────────────────────────

function DefaultTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("");
  const { output, loading: isLoading, error, generate, clear } = useAIGenerate(tool.slug);

  async function handleGenerate() {
    if (!text.trim()) return;
    await generate({ text: text });
  }

  return (
    <div className="space-y-4">
      <textarea
        className={inputClass}
        rows={8}
        placeholder={`Enter your input for ${tool.name}...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={!text.trim() || isLoading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <>
            <Spinner /> Generating…
          </>
        ) : (
          "Generate with AI"
        )}
      </button>
      {error && <ErrorBanner message={error} />}
      <AnimatePresence>
        {output && (
          <OutputCard text={output} onClear={clear} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared CopyButton
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className={clsx(
        "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
        copied
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
          : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
      )}
    >
      {copied ? "Copied ✓" : "Copy to Clipboard"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fortune Cookie
// ─────────────────────────────────────────────────────────────────────────────

const FORTUNE_THEMES = ["General", "Love & Romance", "Career & Success", "Funny & Silly", "Wisdom & Philosophy", "Adventure & Travel"] as const;

function FortuneCookie() {
  const [theme, setTheme] = useState<typeof FORTUNE_THEMES[number]>("General");
  const { output, loading, error, generate, clear } = useAIGenerate("fortune-cookie");

  async function handleGenerate() {
    await generate({ theme });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Fortune Theme</p>
        <div className="flex flex-wrap gap-2">
          {FORTUNE_THEMES.map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                theme === t ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Cracking open your fortune…</> : "🥠 Get My Fortune"}
      </button>

      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Fortune — ${theme}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Excuse Generator
// ─────────────────────────────────────────────────────────────────────────────

const EXCUSE_SITUATIONS = [
  "Being late to work/school",
  "Missing a deadline",
  "Not replying to messages",
  "Forgetting homework",
  "Skipping a meeting",
  "Breaking a promise",
  "Custom situation",
] as const;

const CREATIVITY_LEVELS = ["Low (Believable)", "Medium (Creative)", "High (Outrageous)"] as const;

function ExcuseGenerator() {
  const [situation, setSituation] = useState<typeof EXCUSE_SITUATIONS[number]>("Being late to work/school");
  const [customSituation, setCustomSituation] = useState("");
  const [creativity, setCreativity] = useState<typeof CREATIVITY_LEVELS[number]>("Medium (Creative)");
  const { output, loading, error, generate, clear } = useAIGenerate("excuse-gen");

  async function handleGenerate() {
    const finalSituation = situation === "Custom situation" ? customSituation : situation;
    if (!finalSituation.trim()) return;
    await generate({ situation: finalSituation, creativity });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Situation</p>
        <div className="flex flex-wrap gap-2">
          {EXCUSE_SITUATIONS.map((s) => (
            <button key={s} onClick={() => setSituation(s)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                situation === s ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {situation === "Custom situation" && (
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Describe your situation <span className="text-rose-500">*</span></label>
          <input className={inputClass} placeholder="e.g. I forgot my boss's birthday party..." value={customSituation} onChange={(e) => setCustomSituation(e.target.value)} />
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Creativity Level</p>
        <div className="flex flex-wrap gap-2">
          {CREATIVITY_LEVELS.map((c) => (
            <button key={c} onClick={() => setCreativity(c)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                creativity === c ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate}
        disabled={loading || (situation === "Custom situation" && !customSituation.trim())}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Crafting your excuse…</> : "😅 Generate Excuses"}
      </button>

      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label="Your Excuses" />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compliment Generator
// ─────────────────────────────────────────────────────────────────────────────

const COMPLIMENT_VIBES = ["Funny & Cheesy", "Sweet & Sincere", "Savage but Kind", "Over the Top", "Professional", "Poetic"] as const;

function ComplimentGenerator() {
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState<typeof COMPLIMENT_VIBES[number]>("Funny & Cheesy");
  const { output, loading, error, generate, clear } = useAIGenerate("compliment-gen");

  async function handleGenerate() {
    await generate({ name: name.trim() || undefined, vibe, count: 5 });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Person&apos;s Name (optional)</label>
        <input className={inputClass} placeholder="e.g. Sarah, My Boss, My Crush..." value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Compliment Vibe</p>
        <div className="flex flex-wrap gap-2">
          {COMPLIMENT_VIBES.map((v) => (
            <button key={v} onClick={() => setVibe(v)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                vibe === v ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-foreground-muted hover:border-emerald-500/50")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        {loading ? <><Spinner /> Generating compliments…</> : "💝 Generate Compliments"}
      </button>

      {error && <ErrorBanner message={error} />}
      <AnimatePresence>{output && <OutputCard text={output} onClear={clear} label={`Compliments — ${vibe}`} />}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool title map
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_TITLES: Record<string, string> = {
  summarize: "AI Summarizer",
  translate: "AI Translator",
  rewrite: "AI Rewriter",
  "grammar-check": "Grammar Checker",
  "blog-writer": "AI Blog Writer",
  "email-writer": "AI Email Writer",
  "social-caption": "Social Media Caption",
  headline: "Headline Generator",
  "text-to-speech": "Text to Speech",
  "instagram-bio": "Instagram Bio Generator",
  description: "Description Writer",
  paraphrase: "AI Paraphraser",
  "script-writer": "AI Script Writer",
  "story-generator": "AI Story Generator",
  "note-maker": "AI Note Maker",
  "article-writer": "AI Article Writer",
  "hashtag-gen": "Hashtag Generator",
  "business-name": "Business Name Generator",
  "ad-copy": "Ad Copy Writer",
  "roast-gen": "Roast Generator",
  "dad-jokes": "Dad Joke Generator",
  "emoji-translator": "Emoji Translator",
  "shakespeare": "Shakespeare Translator",
  "corporate-jargon": "Corporate Jargon Generator",
  "fortune-cookie": "Fortune Cookie",
  "excuse-gen": "Excuse Generator",
  "compliment-gen": "Compliment Generator",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────────────────────────

export function AIWritingWorkspace({ tool }: { tool: Tool }) {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/generate")
      .then((r) => r.json())
      .then((d: { providers?: Array<{ id: string; name: string }> }) => {
        if (d.providers?.[0]) setActiveProvider(d.providers[0].name);
      })
      .catch(() => {});
  }, []);

  function renderTool() {
    switch (tool.slug) {
      case "summarize":
        return <AISummarizer />;
      case "translate":
        return <AITranslator />;
      case "rewrite":
        return <AIRewriter />;
      case "grammar-check":
        return <GrammarChecker />;
      case "blog-writer":
        return <AIBlogWriter />;
      case "email-writer":
        return <AIEmailWriter />;
      case "social-caption":
        return <SocialCaption />;
      case "headline":
        return <HeadlineGenerator />;
      case "text-to-speech":
        return <TextToSpeech />;
      case "instagram-bio":
        return <InstagramBioGen />;
      case "description":
        return <DescriptionWriter />;
      case "paraphrase":
        return <AIParaphraser />;
      case "script-writer":
        return <AIScriptWriter />;
      case "story-generator":
        return <StoryGenerator />;
      case "note-maker":
        return <NoteMaker />;
      case "article-writer":
        return <ArticleWriter />;
      case "hashtag-gen":
        return <HashtagGenerator />;
      case "business-name":
        return <BusinessNameGenerator />;
      case "ad-copy":
        return <AdCopyWriter />;
      case "roast-gen":
        return <RoastGenerator />;
      case "dad-jokes":
        return <DadJokeGenerator />;
      case "emoji-translator":
        return <EmojiTranslator />;
      case "shakespeare":
        return <ShakespeareTranslator />;
      case "corporate-jargon":
        return <CorporateJargon />;
      case "fortune-cookie":
        return <FortuneCookie />;
      case "excuse-gen":
        return <ExcuseGenerator />;
      case "compliment-gen":
        return <ComplimentGenerator />;
      default:
        return <DefaultTool tool={tool} />;
    }
  }

  const title = TOOL_TITLES[tool.slug] || tool.name;

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-tight">
              {title}
            </h2>
            {tool.shortDescription && (
              <p className="text-xs text-foreground-muted mt-0.5">
                {tool.shortDescription}
              </p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            {activeProvider && (() => {
              const style = PROVIDER_STYLES[activeProvider] ?? { label: activeProvider, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
              return (
                <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full border", style.color)}>
                  ⚡ {style.label}
                </span>
              );
            })()}
            {tool.isNew && <Badge variant="new" size="sm">New</Badge>}
            {tool.isPopular && !tool.isNew && <Badge variant="popular" size="sm">Popular</Badge>}
          </div>
        </div>

        {/* Language selector — hidden for translate tool (it has its own) */}
        {tool.slug !== "translate" && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <span className="text-xs text-foreground-muted">Output language:</span>
            <LanguageSelector />
          </div>
        )}

        {/* Tool content */}
        {renderTool()}
      </div>
    </div>
  );
}
