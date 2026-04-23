"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none font-mono";

const cardClass = "border border-card-border bg-card rounded-2xl p-5";

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
          ? "bg-sky-500/10 border-sky-500/30 text-sky-600"
          : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
      )}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON Formatter
// ─────────────────────────────────────────────────────────────────────────────

type JsonIndent = 2 | 4 | "tab";

function formatJson(raw: string, indent: JsonIndent): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(raw);
    const spaces = indent === "tab" ? "\t" : indent;
    return { result: JSON.stringify(parsed, null, spaces), error: null };
  } catch (e: unknown) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function minifyJson(raw: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(raw);
    return { result: JSON.stringify(parsed), error: null };
  } catch (e: unknown) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<JsonIndent>(2);
  const [mode, setMode] = useState<"format" | "minify">("format");

  const handleProcess = useCallback(() => {
    if (!input.trim()) return;
    if (mode === "format") {
      const { result, error: err } = formatJson(input, indent);
      setOutput(result);
      setError(err);
    } else {
      const { result, error: err } = minifyJson(input);
      setOutput(result);
      setError(err);
    }
  }, [input, indent, mode]);

  function handleDownload() {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const lineCount = output ? output.split("\n").length : 0;
  const charCount = output.length;

  return (
    <div className="space-y-5">
      {/* Mode + Indent controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={clsx(
                "px-4 py-2 text-xs font-semibold capitalize transition-colors",
                mode === m
                  ? "bg-sky-500 text-white"
                  : "bg-background text-foreground-muted hover:bg-background-subtle"
              )}
            >
              {m === "format" ? "Pretty Print" : "Minify"}
            </button>
          ))}
        </div>
        {mode === "format" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">Indent:</span>
            {([2, 4, "tab"] as JsonIndent[]).map((v) => (
              <button
                key={String(v)}
                onClick={() => setIndent(v)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  indent === v
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-background border-border text-foreground-muted hover:border-sky-500/50"
                )}
              >
                {v === "tab" ? "Tab" : `${v} spaces`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Input JSON</label>
          <textarea
            className={inputClass}
            rows={14}
            placeholder={'{\n  "key": "value",\n  "array": [1, 2, 3]\n}'}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput("");
              setError(null);
            }}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground block">Output</label>
            {output && (
              <span className="text-xs text-foreground-muted">
                {lineCount} lines · {charCount} chars
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-rose-500/30 bg-rose-500/5 rounded-xl p-4 min-h-[14rem]"
              >
                <p className="text-sm font-semibold text-rose-600 mb-1">Invalid JSON</p>
                <p className="text-xs text-rose-500 font-mono">{error}</p>
              </motion.div>
            ) : output ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  readOnly
                  className={clsx(inputClass, "bg-background-subtle cursor-text")}
                  rows={14}
                  value={output}
                  spellCheck={false}
                />
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-4 min-h-[14rem] flex items-center justify-center text-sm text-foreground-muted">
                Formatted JSON will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleProcess}
          disabled={!input.trim()}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {mode === "format" ? "Format JSON" : "Minify JSON"}
        </button>
        {output && (
          <>
            <CopyButton text={output} />
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
            >
              Download .json
            </button>
            <button
              onClick={() => { setInput(""); setOutput(""); setError(null); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Base64 Encoder / Decoder
// ─────────────────────────────────────────────────────────────────────────────

type B64Mode = "encode" | "decode";

function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    throw new Error("Failed to encode. Make sure your text is valid UTF-8.");
  }
}

function decodeBase64(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text.trim())));
  } catch {
    throw new Error("Invalid Base64 string. Check the input and try again.");
  }
}

function Base64Tool() {
  const [mode, setMode] = useState<B64Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleProcess() {
    if (!input.trim()) return;
    try {
      const result = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
      setOutput(result);
      setError(null);
    } catch (e: unknown) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Processing failed");
    }
  }

  function handleSwap() {
    setInput(output);
    setOutput("");
    setError(null);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `base64-${mode}d.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(["encode", "decode"] as B64Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setOutput(""); setError(null); }}
              className={clsx(
                "px-5 py-2 text-xs font-semibold capitalize transition-colors",
                mode === m
                  ? "bg-sky-500 text-white"
                  : "bg-background text-foreground-muted hover:bg-background-subtle"
              )}
            >
              {m === "encode" ? "Encode → Base64" : "Decode ← Base64"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            {mode === "encode" ? "Plain Text" : "Base64 String"}
          </label>
          <textarea
            className={inputClass}
            rows={10}
            placeholder={
              mode === "encode"
                ? "Enter any text to encode to Base64..."
                : "Paste a Base64-encoded string to decode..."
            }
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(""); setError(null); }}
            spellCheck={false}
          />
          <p className="text-xs text-foreground-muted">{input.length} characters</p>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            {mode === "encode" ? "Base64 Output" : "Decoded Text"}
          </label>
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-rose-500/30 bg-rose-500/5 rounded-xl p-4 min-h-[10rem]"
              >
                <p className="text-sm font-semibold text-rose-600 mb-1">Error</p>
                <p className="text-xs text-rose-500">{error}</p>
              </motion.div>
            ) : output ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  readOnly
                  className={clsx(inputClass, "bg-background-subtle cursor-text")}
                  rows={10}
                  value={output}
                  spellCheck={false}
                />
                <p className="text-xs text-foreground-muted mt-1">{output.length} characters</p>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-4 min-h-[10rem] flex items-center justify-center text-sm text-foreground-muted">
                {mode === "encode" ? "Base64 output" : "Decoded text"} will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleProcess}
          disabled={!input.trim()}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
        </button>
        {output && (
          <>
            <CopyButton text={output} />
            <button
              onClick={handleSwap}
              className="text-xs px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-600 font-medium hover:bg-sky-500/20 transition-colors"
            >
              ↕ Swap &amp; Flip
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
            >
              Download .txt
            </button>
          </>
        )}
        {(input || output) && (
          <button
            onClick={() => { setInput(""); setOutput(""); setError(null); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Info badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          "Runs 100% in your browser",
          "No data sent to servers",
          "Supports Unicode / UTF-8",
          "Instant results",
        ].map((label) => (
          <Badge key={label} variant="default" size="sm">
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// URL Encoder / Decoder
// ─────────────────────────────────────────────────────────────────────────────

type UrlMode = "encode" | "decode";

function URLTool() {
  const [mode, setMode] = useState<UrlMode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleProcess() {
    if (!input.trim()) return;
    try {
      const result = mode === "encode"
        ? encodeURIComponent(input)
        : decodeURIComponent(input);
      setOutput(result);
      setError(null);
    } catch (e: unknown) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["encode", "decode"] as UrlMode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setOutput(""); setError(null); }}
            className={clsx("px-5 py-2 text-xs font-semibold capitalize transition-colors",
              mode === m ? "bg-sky-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "encode" ? "Encode URL" : "Decode URL"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            {mode === "encode" ? "Plain Text / URL" : "Encoded URL"}
          </label>
          <textarea className={inputClass} rows={8}
            placeholder={mode === "encode" ? "https://example.com/search?q=hello world&lang=en" : "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"}
            value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); setError(null); }} spellCheck={false} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            {mode === "encode" ? "Encoded URL" : "Decoded Text"}
          </label>
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="border border-rose-500/30 bg-rose-500/5 rounded-xl p-4 min-h-[10rem]">
                <p className="text-sm font-semibold text-rose-600">Error</p>
                <p className="text-xs text-rose-500 mt-1">{error}</p>
              </motion.div>
            ) : output ? (
              <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={8} value={output} spellCheck={false} />
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-4 min-h-[10rem] flex items-center justify-center text-sm text-foreground-muted">
                Result will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleProcess} disabled={!input.trim()}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
          {mode === "encode" ? "Encode URL" : "Decode URL"}
        </button>
        {output && <CopyButton text={output} />}
        {(input || output) && (
          <button onClick={() => { setInput(""); setOutput(""); setError(null); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Word Counter
// ─────────────────────────────────────────────────────────────────────────────

function countText(text: string) {
  if (!text.trim()) return { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: 0 };
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime };
}

function getTopKeywords(text: string, limit = 8): Array<{ word: string; count: number }> {
  const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","this","that","these","those","it","its","i","you","he","she","we","they","their","our","your","my","his","her"]);
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count }));
}

function WordCounter() {
  const [text, setText] = useState("");
  const stats = countText(text);
  const keywords = text.trim() ? getTopKeywords(text) : [];

  const statCards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "No Spaces", value: stats.charsNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Read Time", value: `${stats.readingTime} min` },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Your Text</label>
        <textarea className={inputClass} rows={12}
          placeholder="Paste or type your text here to count words, characters, sentences, paragraphs, and estimated reading time..."
          value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statCards.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-card-border bg-card p-3 text-center">
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {keywords.length > 0 && (
        <div className="rounded-xl border border-card-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-3">Top Keywords</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map(({ word, count }) => (
              <span key={word} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 text-xs font-medium">
                {word} <span className="opacity-70">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {text && (
        <button onClick={() => setText("")}
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">
          Clear
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Generator
// ─────────────────────────────────────────────────────────────────────────────

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length: number, opts: Record<string, boolean>): string {
  let pool = "";
  if (opts.upper) pool += CHARS.upper;
  if (opts.lower) pool += CHARS.lower;
  if (opts.digits) pool += CHARS.digits;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower + CHARS.digits;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

function passwordStrength(pwd: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-rose-500", width: "w-1/4" };
  if (score <= 3) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
  if (score <= 4) return { label: "Good", color: "bg-yellow-500", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
}

function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: false });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function handleGenerate() {
    setPasswords(Array.from({ length: 5 }, () => generatePassword(length, opts)));
  }

  function handleCopy(pwd: string, idx: number) {
    navigator.clipboard.writeText(pwd).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  const strength = passwords[0] ? passwordStrength(passwords[0]) : null;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-card-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground w-24 shrink-0">Length: {length}</label>
          <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))}
            className="flex-1 accent-sky-500" />
          <span className="text-sm font-mono text-foreground-muted w-8">{length}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(opts) as Array<keyof typeof opts>).map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={opts[key]} onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
                className="rounded accent-sky-500" />
              <span className="text-sm text-foreground capitalize">{key === "upper" ? "Uppercase (A-Z)" : key === "lower" ? "Lowercase (a-z)" : key === "digits" ? "Numbers (0-9)" : "Symbols (!@#$)"}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate}
        className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
        Generate Passwords
      </button>

      {passwords.length > 0 && (
        <div className="space-y-3">
          {strength && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">Strength</span>
                <span className={clsx("font-medium", strength.label === "Strong" ? "text-emerald-500" : strength.label === "Good" ? "text-yellow-500" : strength.label === "Fair" ? "text-amber-500" : "text-rose-500")}>{strength.label}</span>
              </div>
              <div className="h-1.5 bg-background-subtle rounded-full overflow-hidden">
                <div className={clsx("h-full rounded-full transition-all", strength.color, strength.width)} />
              </div>
            </div>
          )}
          {passwords.map((pwd, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3">
              <span className="flex-1 font-mono text-sm text-foreground break-all">{pwd}</span>
              <button onClick={() => handleCopy(pwd, idx)}
                className={clsx("text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium shrink-0",
                  copiedIdx === idx ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
                {copiedIdx === idx ? "Copied ✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Converter
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

type ColorInput = "hex" | "rgb" | "hsl";

function ColorConverter() {
  const [activeInput, setActiveInput] = useState<ColorInput>("hex");
  const [hexVal, setHexVal] = useState("#6d28d9");
  const [rgbVal, setRgbVal] = useState("109, 40, 217");
  const [hslVal, setHslVal] = useState("263, 70%, 50%");
  const [colorPreview, setColorPreview] = useState("#6d28d9");
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleCopy(val: string, key: string) {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function applyHex(hex: string) {
    const rgb = hexToRgb(hex);
    if (!rgb) { setError("Invalid HEX color (e.g. #ff5733)"); return; }
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);
    setRgbVal(`${r}, ${g}, ${b}`);
    setHslVal(`${h}, ${s}%, ${l}%`);
    setColorPreview(hex.startsWith("#") ? hex : "#" + hex);
    setError(null);
  }

  function applyRgb(val: string) {
    const parts = val.split(",").map((v) => parseInt(v.trim()));
    if (parts.length !== 3 || parts.some((v) => isNaN(v) || v < 0 || v > 255)) { setError("Invalid RGB (e.g. 255, 87, 51)"); return; }
    const [r, g, b] = parts as [number, number, number];
    const hex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);
    setHexVal(hex);
    setHslVal(`${h}, ${s}%, ${l}%`);
    setColorPreview(hex);
    setError(null);
  }

  function applyHsl(val: string) {
    const cleaned = val.replace(/%/g, "");
    const parts = cleaned.split(",").map((v) => parseFloat(v.trim()));
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) { setError("Invalid HSL (e.g. 263, 70%, 50%)"); return; }
    const [h, s, l] = parts;
    const [r, g, b] = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);
    setHexVal(hex);
    setRgbVal(`${r}, ${g}, ${b}`);
    setColorPreview(hex);
    setError(null);
  }

  function handlePickerChange(hex: string) {
    setHexVal(hex);
    applyHex(hex);
  }

  const colorFields = [
    { key: "hex", label: "HEX", value: hexVal, placeholder: "#6d28d9", onChange: (v: string) => { setHexVal(v); if (activeInput === "hex") applyHex(v); }, display: hexVal },
    { key: "rgb", label: "RGB", value: rgbVal, placeholder: "109, 40, 217", onChange: (v: string) => { setRgbVal(v); if (activeInput === "rgb") applyRgb(v); }, display: `rgb(${rgbVal})` },
    { key: "hsl", label: "HSL", value: hslVal, placeholder: "263, 70%, 50%", onChange: (v: string) => { setHslVal(v); if (activeInput === "hsl") applyHsl(v); }, display: `hsl(${hslVal})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-32 rounded-2xl border border-card-border shadow-lg" style={{ backgroundColor: colorPreview }} />
          <input type="color" value={colorPreview} onChange={(e) => handlePickerChange(e.target.value)}
            className="w-32 h-10 rounded-xl cursor-pointer border border-card-border" title="Pick a color" />
        </div>
        <div className="flex-1 space-y-3">
          {colorFields.map(({ key, label, value, placeholder, onChange, display }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider w-8">{label}</label>
                <input
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  value={value}
                  placeholder={placeholder}
                  onFocus={() => setActiveInput(key as ColorInput)}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={() => {
                    if (key === "hex") applyHex(value);
                    else if (key === "rgb") applyRgb(value);
                    else applyHsl(value);
                  }}
                />
                <button onClick={() => handleCopy(display, key)}
                  className={clsx("text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium shrink-0",
                    copiedKey === key ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
                  {copiedKey === key ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          ))}
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV to JSON
// ─────────────────────────────────────────────────────────────────────────────

function parseCSV(csv: string, delimiter: string): Record<string, string>[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    return headers.reduce<Record<string, string>>((obj, h, i) => { obj[h] = values[i] ?? ""; return obj; }, {});
  });
}

function CsvToJsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState(",");

  function handleConvert() {
    if (!input.trim()) return;
    try {
      const result = parseCSV(input, delimiter);
      if (result.length === 0) { setError("Could not parse CSV. Make sure it has headers and data rows."); return; }
      setOutput(JSON.stringify(result, null, 2));
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
    }
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "data.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground-muted">Delimiter:</span>
        {([",", ";", "\t"] as const).map((d) => (
          <button key={d} onClick={() => setDelimiter(d)}
            className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              delimiter === d ? "bg-sky-500 text-white border-sky-500" : "bg-background border-border text-foreground-muted hover:border-sky-500/50")}>
            {d === "\t" ? "Tab" : d === "," ? "Comma (,)" : "Semicolon (;)"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">CSV Input</label>
          <textarea className={inputClass} rows={12}
            placeholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
            value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); setError(null); }} spellCheck={false} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">JSON Output</label>
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="border border-rose-500/30 bg-rose-500/5 rounded-xl p-4 min-h-[12rem]">
                <p className="text-sm font-semibold text-rose-600">Error</p>
                <p className="text-xs text-rose-500 mt-1">{error}</p>
              </motion.div>
            ) : output ? (
              <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={12} value={output} spellCheck={false} />
              </motion.div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-4 min-h-[12rem] flex items-center justify-center text-sm text-foreground-muted">
                JSON will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleConvert} disabled={!input.trim()}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
          Convert to JSON
        </button>
        {output && <><CopyButton text={output} /><button onClick={handleDownload} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Download .json</button></>}
        {(input || output) && <button onClick={() => { setInput(""); setOutput(""); setError(null); }} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Clear</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML to Markdown
// ─────────────────────────────────────────────────────────────────────────────

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul[^>]*>|<\/ul>/gi, "")
    .replace(/<ol[^>]*>|<\/ol>/gi, "")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^---$/gm, "<hr/>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

type HtmlMdMode = "html-to-md" | "md-to-html";

function HtmlMarkdownTool() {
  const [mode, setMode] = useState<HtmlMdMode>("html-to-md");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function handleConvert() {
    if (!input.trim()) return;
    setOutput(mode === "html-to-md" ? htmlToMarkdown(input) : markdownToHtml(input));
  }

  function handleDownload() {
    const ext = mode === "html-to-md" ? ".md" : ".html";
    const type = mode === "html-to-md" ? "text/markdown" : "text/html";
    const blob = new Blob([output], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `converted${ext}`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["html-to-md", "md-to-html"] as HtmlMdMode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setOutput(""); }}
            className={clsx("px-4 py-2 text-xs font-semibold transition-colors",
              mode === m ? "bg-sky-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "html-to-md" ? "HTML → Markdown" : "Markdown → HTML"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            {mode === "html-to-md" ? "HTML Input" : "Markdown Input"}
          </label>
          <textarea className={inputClass} rows={12}
            placeholder={mode === "html-to-md" ? "<h1>Hello</h1>\n<p>This is <strong>bold</strong> text.</p>" : "# Hello\n\nThis is **bold** text."}
            value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); }} spellCheck={false} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            {mode === "html-to-md" ? "Markdown Output" : "HTML Output"}
          </label>
          {output ? (
            <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={12} value={output} spellCheck={false} />
          ) : (
            <div className="border border-dashed border-border rounded-xl p-4 min-h-[12rem] flex items-center justify-center text-sm text-foreground-muted">
              Converted output will appear here
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleConvert} disabled={!input.trim()}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
          Convert
        </button>
        {output && <><CopyButton text={output} /><button onClick={handleDownload} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Download</button></>}
        {(input || output) && <button onClick={() => { setInput(""); setOutput(""); }} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Clear</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Editor
// ─────────────────────────────────────────────────────────────────────────────

const MARKDOWN_PLACEHOLDER = `# Welcome to Markdown Editor

Write your **Markdown** here and see the *live preview* on the right.

## Features
- Real-time HTML preview
- GitHub Flavored Markdown support
- Download as .md file

## Code
Inline \`code\` looks like this.

---

> Blockquotes are supported too.

[Visit ToolHive](https://toolhive.app)
`;

function renderMarkdownToHtml(md: string): string {
  const escaped = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/^#### (.+)$/gm, "<h4 class='text-base font-semibold mt-4 mb-1'>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold mt-5 mb-1'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-6 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-background-subtle px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-sky-500 underline" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^&gt; (.+)$/gm, "<blockquote class='border-l-4 border-sky-500 pl-4 text-foreground-muted italic my-2'>$1</blockquote>")
    .replace(/^---$/gm, "<hr class='border-border my-4'/>")
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    .replace(/\n/g, "<br/>");
}

function MarkdownEditor() {
  const [md, setMd] = useState(MARKDOWN_PLACEHOLDER);

  function handleDownload() {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "document.md"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-foreground-muted">{md.split(/\s+/).filter(Boolean).length} words · {md.length} chars</div>
        <div className="flex items-center gap-2">
          <CopyButton text={md} />
          <button onClick={handleDownload} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">
            Download .md
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Markdown</label>
          <textarea className={clsx(inputClass, "min-h-[400px]")} value={md} onChange={(e) => setMd(e.target.value)} spellCheck={false} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Preview</label>
          <div className="border border-border rounded-xl px-5 py-4 min-h-[400px] bg-background text-foreground text-sm overflow-auto prose-sm"
            dangerouslySetInnerHTML={{ __html: `<p class='mb-3'>${renderMarkdownToHtml(md)}</p>` }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Case Converter
// ─────────────────────────────────────────────────────────────────────────────

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab";

function toCaseType(text: string, type: CaseType): string {
  const words = text.trim().split(/[\s_\-]+/).filter(Boolean);
  switch (type) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    case "sentence": return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case "camel": return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "pascal": return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snake": return words.map((w) => w.toLowerCase()).join("_");
    case "kebab": return words.map((w) => w.toLowerCase()).join("-");
  }
}

function CaseConverter() {
  const [input, setInput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseType>("title");
  const [copied, setCopied] = useState(false);

  const cases: Array<{ id: CaseType; label: string }> = [
    { id: "upper", label: "UPPERCASE" },
    { id: "lower", label: "lowercase" },
    { id: "title", label: "Title Case" },
    { id: "sentence", label: "Sentence case" },
    { id: "camel", label: "camelCase" },
    { id: "pascal", label: "PascalCase" },
    { id: "snake", label: "snake_case" },
    { id: "kebab", label: "kebab-case" },
  ];

  const output = input ? toCaseType(input, activeCase) : "";

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {cases.map((c) => (
          <button key={c.id} onClick={() => setActiveCase(c.id)}
            className={clsx("px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors",
              activeCase === c.id ? "bg-sky-500 text-white border-sky-500" : "bg-background border-border text-foreground-muted hover:border-sky-500/50")}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Input Text</label>
          <textarea className={inputClass} rows={10} placeholder="Enter text to convert..." value={input} onChange={(e) => setInput(e.target.value)} />
          <p className="text-xs text-foreground-muted">{input.split(/\s+/).filter(Boolean).length} words &middot; {input.length} chars</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">
            Output &mdash; <span className="font-mono text-sky-600">{cases.find(c => c.id === activeCase)?.label}</span>
          </label>
          {output ? (
            <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={10} value={output} spellCheck={false} />
          ) : (
            <div className="border border-dashed border-border rounded-xl p-4 min-h-[10rem] flex items-center justify-center text-sm text-foreground-muted">
              Converted text will appear here
            </div>
          )}
        </div>
      </div>
      {output && (
        <div className="flex gap-3">
          <button onClick={handleCopy}
            className={clsx("text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
              copied ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
            {copied ? "Copied \u2713" : "Copy"}
          </button>
          <button onClick={() => setInput("")} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lorem Ipsum Generator
// ─────────────────────────────────────────────────────────────────────────────

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident culpa qui officia deserunt mollit anim est laborum".split(" ");

type LoremType = "paragraphs" | "sentences" | "words";

function generateLorem(type: LoremType, count: number): string {
  const words = LOREM_WORDS;
  function getWord(i: number) { return words[i % words.length]; }
  if (type === "words") {
    const result: string[] = [];
    for (let i = 0; i < count; i++) result.push(getWord(i));
    result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
    return result.join(" ") + ".";
  }
  if (type === "sentences") {
    const sentences: string[] = [];
    let wi = 0;
    for (let s = 0; s < count; s++) {
      const len = 8 + (s % 7);
      const sent: string[] = [];
      for (let w = 0; w < len; w++) sent.push(getWord(wi++));
      sent[0] = sent[0].charAt(0).toUpperCase() + sent[0].slice(1);
      sentences.push(sent.join(" ") + ".");
    }
    return sentences.join(" ");
  }
  const paragraphs: string[] = [];
  let wi = 0;
  for (let p = 0; p < count; p++) {
    const sentCount = 3 + (p % 4);
    const sentences: string[] = [];
    for (let s = 0; s < sentCount; s++) {
      const len = 8 + (s % 8);
      const sent: string[] = [];
      for (let w = 0; w < len; w++) sent.push(getWord(wi++));
      sent[0] = sent[0].charAt(0).toUpperCase() + sent[0].slice(1);
      sentences.push(sent.join(" ") + ".");
    }
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}

function LoremIpsum() {
  const [type, setType] = useState<LoremType>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setOutput(generateLorem(type, count));
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(["paragraphs", "sentences", "words"] as LoremType[]).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={clsx("px-4 py-2 text-xs font-semibold capitalize transition-colors",
                type === t ? "bg-sky-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">Count:</span>
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
        </div>
        <button onClick={generate} className="h-10 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          Generate
        </button>
      </div>
      {output ? (
        <div className="space-y-3">
          <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={12} value={output} spellCheck={false} />
          <div className="flex items-center gap-3">
            <button onClick={handleCopy}
              className={clsx("text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                copied ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
              {copied ? "Copied \u2713" : "Copy"}
            </button>
            <button onClick={generate} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">
              Regenerate
            </button>
            <span className="text-xs text-foreground-muted">{output.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-8 flex items-center justify-center text-sm text-foreground-muted">
          Click Generate to create Lorem Ipsum text
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Number Base Converter
// ─────────────────────────────────────────────────────────────────────────────

type NumberBase = "dec" | "bin" | "hex" | "oct";

function NumberBaseConverter() {
  const [activeBase, setActiveBase] = useState<NumberBase>("dec");
  const [values, setValues] = useState<Record<NumberBase, string>>({ dec: "", bin: "", hex: "", oct: "" });
  const [error, setError] = useState<string | null>(null);

  function updateAll(decValue: number) {
    setValues({
      dec: decValue.toString(),
      bin: decValue.toString(2),
      hex: decValue.toString(16).toUpperCase(),
      oct: decValue.toString(8),
    });
    setError(null);
  }

  function handleChange(base: NumberBase, val: string) {
    setValues((prev) => ({ ...prev, [base]: val }));
    setActiveBase(base);
    if (!val.trim()) { setValues({ dec: "", bin: "", hex: "", oct: "" }); setError(null); return; }
    try {
      const radix = base === "dec" ? 10 : base === "bin" ? 2 : base === "hex" ? 16 : 8;
      const num = parseInt(val, radix);
      if (isNaN(num)) throw new Error("Invalid input");
      updateAll(num);
    } catch {
      setError(`Invalid ${base.toUpperCase()} value`);
    }
  }

  const bases: Array<{ id: NumberBase; label: string; placeholder: string }> = [
    { id: "dec", label: "Decimal (Base 10)", placeholder: "255" },
    { id: "bin", label: "Binary (Base 2)", placeholder: "11111111" },
    { id: "hex", label: "Hexadecimal (Base 16)", placeholder: "FF" },
    { id: "oct", label: "Octal (Base 8)", placeholder: "377" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bases.map((base) => (
          <div key={base.id} className={clsx("rounded-xl border p-4 space-y-2 transition-colors", activeBase === base.id ? "border-sky-500/50 bg-sky-500/5" : "border-card-border bg-card")}>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">{base.label}</label>
            <input
              className="w-full bg-transparent font-mono text-lg font-bold text-foreground placeholder:text-foreground-muted focus:outline-none"
              placeholder={base.placeholder}
              value={values[base.id]}
              onChange={(e) => handleChange(base.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        {["Instant conversion", "Supports large numbers", "No libraries \u2014 pure math"].map((label) => (
          <Badge key={label} variant="default" size="sm">{label}</Badge>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UUID Generator
// ─────────────────────────────────────────────────────────────────────────────

function generateUUIDv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function generate() {
    setUuids(Array.from({ length: count }, generateUUIDv4));
  }

  function handleCopy(uuid: string, idx: number) {
    navigator.clipboard.writeText(uuid).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function handleCopyAll() {
    if (!uuids.length) return;
    navigator.clipboard.writeText(uuids.join("\n")).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">Generate</span>
          <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
          <span className="text-sm text-foreground-muted">UUIDs</span>
        </div>
        <button onClick={generate} className="h-10 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          Generate
        </button>
        {uuids.length > 0 && (
          <button onClick={handleCopyAll}
            className={clsx("text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
              copiedAll ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
            {copiedAll ? "All Copied \u2713" : "Copy All"}
          </button>
        )}
      </div>
      {uuids.length > 0 && (
        <div className="space-y-2">
          {uuids.map((uuid, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-2.5">
              <span className="flex-1 font-mono text-sm text-foreground">{uuid}</span>
              <button onClick={() => handleCopy(uuid, idx)}
                className={clsx("text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium shrink-0",
                  copiedIdx === idx ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
                {copiedIdx === idx ? "\u2713" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Text Reverser
// ─────────────────────────────────────────────────────────────────────────────

type ReverseMode = "chars" | "words" | "lines";

function TextReverser() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ReverseMode>("chars");
  const [copied, setCopied] = useState(false);

  function reverse(text: string, mode: ReverseMode): string {
    if (!text) return "";
    if (mode === "chars") return text.split("").reverse().join("");
    if (mode === "words") return text.split(" ").reverse().join(" ");
    return text.split("\n").reverse().join("\n");
  }

  const output = reverse(input, mode);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["chars", "words", "lines"] as ReverseMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={clsx("px-4 py-2 text-xs font-semibold rounded-xl border capitalize transition-colors",
              mode === m ? "bg-sky-500 text-white border-sky-500" : "bg-background border-border text-foreground-muted hover:border-sky-500/50")}>
            Reverse {m}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Input</label>
          <textarea className={inputClass} rows={8} placeholder="Enter text to reverse..." value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Reversed Output</label>
          {output ? (
            <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={8} value={output} spellCheck={false} />
          ) : (
            <div className="border border-dashed border-border rounded-xl p-4 min-h-[8rem] flex items-center justify-center text-sm text-foreground-muted">
              Reversed text will appear here
            </div>
          )}
        </div>
      </div>
      {output && (
        <div className="flex gap-3">
          <button onClick={handleCopy}
            className={clsx("text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
              copied ? "bg-sky-500/10 border-sky-500/30 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
            {copied ? "Copied \u2713" : "Copy"}
          </button>
          <button onClick={() => setInput("")} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Clear</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Random Number Generator
// ─────────────────────────────────────────────────────────────────────────────

function RandomNumberGen() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);

  function generate() {
    const minN = parseInt(min), maxN = parseInt(max);
    if (isNaN(minN) || isNaN(maxN) || minN >= maxN) return;
    const arr = new Uint32Array(count);
    crypto.getRandomValues(arr);
    setNumbers(Array.from(arr, (n) => minN + (n % (maxN - minN + 1))));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Min", val: min, set: setMin, placeholder: "1" },
          { label: "Max", val: max, set: setMax, placeholder: "100" },
          { label: "Count", val: String(count), set: (v: string) => setCount(Math.min(100, Math.max(1, parseInt(v) || 1))), placeholder: "1" },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
          </div>
        ))}
      </div>
      <button onClick={generate} className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
        Generate
      </button>
      {numbers.length > 0 && (
        <div className="space-y-3">
          {count === 1 ? (
            <div className="rounded-2xl border border-card-border bg-card p-8 text-center">
              <p className="text-5xl font-bold text-foreground">{numbers[0]}</p>
              <p className="text-sm text-foreground-muted mt-2">Random number between {min} and {max}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {numbers.map((n, i) => (
                <span key={i} className="inline-flex items-center justify-center min-w-[3rem] h-10 px-3 rounded-xl border border-card-border bg-card font-mono text-sm font-bold text-foreground">
                  {n}
                </span>
              ))}
            </div>
          )}
          <CopyButton text={numbers.join(", ")} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Remove Duplicate Lines
// ─────────────────────────────────────────────────────────────────────────────

function DedupeTool() {
  const [input, setInput] = useState("");
  const [sortLines, setSortLines] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<{ original: number; unique: number; removed: number } | null>(null);

  function process() {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) { seen.add(key); unique.push(line); }
    }
    const sorted = sortLines ? [...unique].sort((a, b) => a.localeCompare(b)) : unique;
    setOutput(sorted.join("\n"));
    setStats({ original: lines.length, unique: unique.length, removed: lines.length - unique.length });
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "unique-lines.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={sortLines} onChange={(e) => setSortLines(e.target.checked)} className="accent-sky-500 rounded" />
          <span className="text-sm text-foreground">Sort lines A&ndash;Z</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-sky-500 rounded" />
          <span className="text-sm text-foreground">Case sensitive</span>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Input (one item per line)</label>
          <textarea className={inputClass} rows={12} placeholder={"apple\nbanana\napple\norange\nbanana\ngrape"} value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); setStats(null); }} spellCheck={false} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Unique Lines</label>
          {output ? (
            <textarea readOnly className={clsx(inputClass, "bg-background-subtle cursor-text")} rows={12} value={output} spellCheck={false} />
          ) : (
            <div className="border border-dashed border-border rounded-xl p-4 min-h-[12rem] flex items-center justify-center text-sm text-foreground-muted">
              Unique lines will appear here
            </div>
          )}
        </div>
      </div>
      {stats && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Original Lines", value: stats.original },
            { label: "Unique Lines", value: stats.unique },
            { label: "Removed", value: stats.removed },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-card-border bg-card px-4 py-2 text-center">
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-foreground-muted">{label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={process} disabled={!input.trim()} className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
          Remove Duplicates
        </button>
        {output && <><CopyButton text={output} /><button onClick={handleDownload} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Download .txt</button></>}
        {(input || output) && <button onClick={() => { setInput(""); setOutput(""); setStats(null); }} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground transition-colors font-medium">Clear</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Code Formatter
// ─────────────────────────────────────────────────────────────────────────────

type CodeLang = "json" | "html" | "css" | "sql";

function formatHtml(html: string): string {
  const voidTags = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  let result = "", indent = 0;
  const parts = html.replace(/>\s+</g, "><").trim().split(/(<[^>]+>)/);
  for (const part of parts) {
    const t = part.trim();
    if (!t) continue;
    if (t.startsWith("</")) { indent = Math.max(0, indent - 1); result += "  ".repeat(indent) + t + "\n"; }
    else if (t.startsWith("<")) {
      result += "  ".repeat(indent) + t + "\n";
      const tag = t.match(/<([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase();
      if (tag && !voidTags.has(tag) && !t.endsWith("/>") && !t.startsWith("<!")) indent++;
    } else { result += "  ".repeat(indent) + t + "\n"; }
  }
  return result.trim();
}

function formatCss(css: string): string {
  return css
    .replace(/\s*\{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*\}\s*/g, "\n}\n\n")
    .replace(/,\s*(?=[^}]*\{)/g, ",\n")
    .replace(/  \n\}/g, "\n}")
    .trim();
}

function formatSql(sql: string): string {
  const kw = ["SELECT","FROM","WHERE","LEFT JOIN","RIGHT JOIN","INNER JOIN","JOIN","ON","GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","CREATE TABLE","ALTER TABLE","DROP TABLE","UNION ALL","UNION","AND","OR"];
  let s = sql;
  for (const k of kw) s = s.replace(new RegExp(`\\b${k}\\b`, "gi"), `\n${k}`);
  return s.replace(/^\n/, "").trim();
}

function CodeFormatter() {
  const [lang, setLang] = useState<CodeLang>("json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleFormat() {
    setError(null);
    try {
      if (lang === "json") { setOutput(JSON.stringify(JSON.parse(input), null, 2)); }
      else if (lang === "html") setOutput(formatHtml(input));
      else if (lang === "css") setOutput(formatCss(input));
      else if (lang === "sql") setOutput(formatSql(input));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Format error"); }
  }

  function handleMinify() {
    if (lang === "json") {
      try { setOutput(JSON.stringify(JSON.parse(input))); setError(null); }
      catch (e: unknown) { setError(e instanceof Error ? e.message : "Invalid JSON"); }
    }
  }

  function copy() {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const langTabs: { id: CodeLang; label: string }[] = [
    { id: "json", label: "JSON" }, { id: "html", label: "HTML" }, { id: "css", label: "CSS" }, { id: "sql", label: "SQL" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {langTabs.map(t => (
          <button key={t.id} onClick={() => { setLang(t.id); setOutput(""); setError(null); }}
            className={clsx("px-4 py-2 text-xs font-semibold rounded-xl border transition-colors",
              lang === t.id ? "bg-sky-500 text-white border-sky-500" : "bg-background border-border text-foreground-muted hover:border-sky-400")}>
            {t.label}
          </button>
        ))}
      </div>
      <textarea className={clsx(cardClass, "w-full font-mono text-xs resize-none h-40 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")} value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste your ${lang.toUpperCase()} code here…`} />
      <div className="flex gap-2">
        <button className="h-10 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity" onClick={handleFormat} disabled={!input}>Format / Beautify</button>
        {lang === "json" && <button className="h-10 px-4 rounded-xl border border-border bg-background text-foreground-muted text-sm hover:bg-background-subtle transition-colors" onClick={handleMinify} disabled={!input}>Minify</button>}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {output && (
        <div className="relative">
          <pre className={clsx(cardClass, "font-mono text-xs overflow-auto max-h-64 whitespace-pre-wrap")}>{output}</pre>
          <button onClick={copy} className={clsx("absolute top-2 right-2 text-xs px-2.5 py-1 rounded-lg border transition-colors", copied ? "bg-sky-500/10 border-sky-400 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Diff Checker
// ─────────────────────────────────────────────────────────────────────────────

function diffText(a: string, b: string): Array<{ type: "same" | "added" | "removed"; line: string }> {
  const la = a.split("\n"), lb = b.split("\n");
  const result: Array<{ type: "same" | "added" | "removed"; line: string }> = [];
  let i = 0, j = 0;
  while (i < la.length || j < lb.length) {
    if (i >= la.length) { result.push({ type: "added", line: lb[j++] }); }
    else if (j >= lb.length) { result.push({ type: "removed", line: la[i++] }); }
    else if (la[i] === lb[j]) { result.push({ type: "same", line: la[i] }); i++; j++; }
    else {
      const nextInB = lb.slice(j, j + 5).indexOf(la[i]);
      const nextInA = la.slice(i, i + 5).indexOf(lb[j]);
      if (nextInB !== -1 && (nextInA === -1 || nextInB <= nextInA)) {
        result.push({ type: "added", line: lb[j++] });
      } else {
        result.push({ type: "removed", line: la[i++] });
      }
    }
  }
  return result;
}

function DiffChecker() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diff, setDiff] = useState<Array<{ type: "same" | "added" | "removed"; line: string }> | null>(null);

  function compare() { setDiff(diffText(textA, textB)); }

  const added = diff?.filter(d => d.type === "added").length ?? 0;
  const removed = diff?.filter(d => d.type === "removed").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Original Text</label>
          <textarea className={clsx(cardClass, "w-full font-mono text-xs resize-none h-36 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")} value={textA} onChange={e => { setTextA(e.target.value); setDiff(null); }} placeholder="Paste original text here…" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Changed Text</label>
          <textarea className={clsx(cardClass, "w-full font-mono text-xs resize-none h-36 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")} value={textB} onChange={e => { setTextB(e.target.value); setDiff(null); }} placeholder="Paste modified text here…" />
        </div>
      </div>
      <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity" onClick={compare} disabled={!textA && !textB}>Compare Texts</button>
      {diff && (
        <div className="space-y-2">
          <div className="flex gap-4 text-xs">
            <span className="text-emerald-600 font-semibold">+{added} lines added</span>
            <span className="text-rose-600 font-semibold">−{removed} lines removed</span>
          </div>
          <div className={clsx(cardClass, "font-mono text-xs overflow-auto max-h-72")}>
            {diff.map((d, i) => (
              <div key={i} className={clsx("px-3 py-0.5 leading-5",
                d.type === "added" && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
                d.type === "removed" && "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300",
                d.type === "same" && "text-foreground-muted")}>
                <span className="select-none mr-2">{d.type === "added" ? "+" : d.type === "removed" ? "−" : " "}</span>
                {d.line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hash Generator (Web Crypto API)
// ─────────────────────────────────────────────────────────────────────────────

async function computeHash(text: string, algo: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function generate() {
    if (!input) return;
    setLoading(true);
    const [sha1, sha256, sha512] = await Promise.all([
      computeHash(input, "SHA-1"),
      computeHash(input, "SHA-256"),
      computeHash(input, "SHA-512"),
    ]);
    setHashes({ SHA1: sha1, "SHA-256": sha256, "SHA-512": sha512 });
    setLoading(false);
  }

  function copy(key: string, val: string) {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-foreground-muted">Generate cryptographic hash of any text. Useful for verifying file integrity, storing passwords, and data verification.</p>
      <textarea className={clsx(cardClass, "w-full font-mono text-xs resize-none h-28 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")} value={input} onChange={e => { setInput(e.target.value); setHashes({}); }} placeholder="Enter text to hash…" />
      <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50" onClick={generate} disabled={!input || loading}>
        {loading ? "Generating…" : "Generate Hashes"}
      </button>
      {Object.entries(hashes).map(([algo, hash]) => (
        <div key={algo} className={cardClass}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-sky-600">{algo}</span>
            <button onClick={() => copy(algo, hash)} className={clsx("text-xs px-2.5 py-1 rounded-lg border transition-colors", copiedKey === algo ? "bg-sky-500/10 border-sky-400 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
              {copiedKey === algo ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <p className="font-mono text-xs text-foreground break-all">{hash}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Regex Tester
// ─────────────────────────────────────────────────────────────────────────────

function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("gi");
  const [testText, setTestText] = useState("");
  const [matches, setMatches] = useState<RegExpExecArray[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function testRegex() {
    if (!pattern) return;
    try {
      const re = new RegExp(pattern, flags);
      const ms: RegExpExecArray[] = [];
      let m: RegExpExecArray | null;
      const src = flags.includes("g") ? testText : testText.slice(0, 5000);
      const re2 = new RegExp(pattern, flags);
      while ((m = re2.exec(src)) !== null) {
        ms.push(m);
        if (!flags.includes("g") || ms.length > 500) break;
      }
      setMatches(ms); setError(null);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Invalid pattern"); setMatches(null); }
  }

  const allFlags = ["g", "i", "m", "s"];

  function toggleFlag(f: string) {
    setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);
    setMatches(null);
  }

  const highlightText = () => {
    if (!matches || matches.length === 0 || !testText) return testText;
    let result = "", last = 0;
    for (const m of matches) {
      result += testText.slice(last, m.index).replace(/</g, "&lt;");
      result += `<mark class="bg-yellow-200 dark:bg-yellow-700 rounded">${m[0].replace(/</g, "&lt;")}</mark>`;
      last = (m.index ?? 0) + m[0].length;
      if (last >= testText.length) break;
    }
    result += testText.slice(last).replace(/</g, "&lt;");
    return result;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Pattern</label>
          <input className={clsx(cardClass, "w-full font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2")} value={pattern} onChange={e => { setPattern(e.target.value); setMatches(null); setError(null); }} placeholder="e.g. \b[A-Z][a-z]+\b" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Flags</label>
          <div className="flex gap-1">
            {allFlags.map(f => (
              <button key={f} onClick={() => toggleFlag(f)}
                className={clsx("w-8 h-9 rounded-lg text-xs font-mono font-bold border transition-colors",
                  flags.includes(f) ? "bg-sky-500 text-white border-sky-500" : "bg-background border-border text-foreground-muted hover:border-sky-400")}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Test String</label>
        <textarea className={clsx(cardClass, "w-full font-mono text-xs resize-none h-28 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")} value={testText} onChange={e => { setTestText(e.target.value); setMatches(null); }} placeholder="Paste text to test your regex against…" />
      </div>
      <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity" onClick={testRegex} disabled={!pattern}>Test Regex</button>
      {error && <p className="text-xs text-rose-500 font-mono">{error}</p>}
      {matches !== null && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{matches.length === 0 ? "No matches found" : `${matches.length} match${matches.length !== 1 ? "es" : ""} found`}</p>
          {matches.length > 0 && (
            <>
              <div className={clsx(cardClass, "font-mono text-xs overflow-auto max-h-36")} dangerouslySetInnerHTML={{ __html: highlightText() }} />
              <div className={clsx(cardClass, "max-h-36 overflow-auto space-y-1")}>
                {matches.slice(0, 50).map((m, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-foreground-muted w-6 shrink-0">{i + 1}.</span>
                    <span className="font-mono text-sky-600 font-semibold">{JSON.stringify(m[0])}</span>
                    {m.index !== undefined && <span className="text-foreground-muted">@ index {m.index}</span>}
                  </div>
                ))}
                {matches.length > 50 && <p className="text-xs text-foreground-muted">…and {matches.length - 50} more</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Currency Converter
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCIES = ["USD","EUR","GBP","INR","JPY","CAD","AUD","CHF","CNY","AED","SGD","HKD","MYR","THB","IDR","BRL","MXN","PKR","BDT","NZD","SEK","NOK","DKK","ZAR","KRW","TRY","SAR","QAR","KWD","OMR"];

function CurrencyConverter() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [amount, setAmount] = useState("1");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  async function convert() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await res.json() as { rates?: Record<string, number> };
      if (data.rates?.[to]) {
        setRate(data.rates[to]);
        setUpdated(new Date().toLocaleTimeString());
      } else throw new Error("Rate not found");
    } catch { setError("Could not fetch rates. Try again."); }
    setLoading(false);
  }

  const result = rate !== null && amount ? parseFloat(amount) * rate : null;

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Live exchange rates — updated in real time via open.er-api.com</p>
      <div className="grid grid-cols-3 gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Amount</label>
          <input type="number" className={clsx(cardClass, "w-full font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2.5")} value={amount} onChange={e => { setAmount(e.target.value); setRate(null); }} placeholder="1" min="0" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">From</label>
          <select className={clsx(cardClass, "w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2.5")} value={from} onChange={e => { setFrom(e.target.value); setRate(null); }}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">To</label>
          <select className={clsx(cardClass, "w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2.5")} value={to} onChange={e => { setTo(e.target.value); setRate(null); }}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50" onClick={convert} disabled={loading || !amount}>
        {loading ? "Fetching rates…" : "Convert"}
      </button>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {result !== null && rate !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx(cardClass, "text-center space-y-2")}>
          <p className="text-3xl font-bold text-sky-600">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-lg">{to}</span></p>
          <p className="text-sm text-foreground-muted">{amount} {from} = {result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}</p>
          <p className="text-xs text-foreground-muted">1 {from} = {rate.toFixed(4)} {to} {updated && `· Updated ${updated}`}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timezone Converter
// ─────────────────────────────────────────────────────────────────────────────

const TZ_LIST = [
  { label: "UTC / GMT", tz: "UTC" },
  { label: "India (IST, UTC+5:30)", tz: "Asia/Kolkata" },
  { label: "New York (EST/EDT)", tz: "America/New_York" },
  { label: "London (GMT/BST)", tz: "Europe/London" },
  { label: "Dubai (GST, UTC+4)", tz: "Asia/Dubai" },
  { label: "Tokyo (JST, UTC+9)", tz: "Asia/Tokyo" },
  { label: "Sydney (AEST/AEDT)", tz: "Australia/Sydney" },
  { label: "Singapore (SGT, UTC+8)", tz: "Asia/Singapore" },
  { label: "Los Angeles (PST/PDT)", tz: "America/Los_Angeles" },
  { label: "Paris (CET/CEST)", tz: "Europe/Paris" },
  { label: "Toronto (EST/EDT)", tz: "America/Toronto" },
  { label: "Chicago (CST/CDT)", tz: "America/Chicago" },
  { label: "Berlin (CET/CEST)", tz: "Europe/Berlin" },
  { label: "São Paulo (BRT)", tz: "America/Sao_Paulo" },
  { label: "Karachi (PKT, UTC+5)", tz: "Asia/Karachi" },
  { label: "Dhaka (BST, UTC+6)", tz: "Asia/Dhaka" },
  { label: "Riyadh (AST, UTC+3)", tz: "Asia/Riyadh" },
  { label: "Shanghai (CST, UTC+8)", tz: "Asia/Shanghai" },
];

function TimezoneConverter() {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 16));
  const [fromTz, setFromTz] = useState("Asia/Kolkata");
  const [toTzList, setToTzList] = useState(["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"]);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function formatInTz(date: Date, tz: string) {
    return date.toLocaleString("en-US", { timeZone: tz, year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }

  const inputDate = new Date(dateStr);
  const conversions = toTzList.map(tz => ({ tz, label: TZ_LIST.find(t => t.tz === tz)?.label ?? tz, converted: formatInTz(inputDate, tz) }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Date & Time</label>
          <input type="datetime-local" className={clsx(cardClass, "w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2.5")} value={dateStr} onChange={e => setDateStr(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">From Timezone</label>
          <select className={clsx(cardClass, "w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2.5")} value={fromTz} onChange={e => setFromTz(e.target.value)}>
            {TZ_LIST.map(t => <option key={t.tz} value={t.tz}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        {conversions.map(({ tz, label, converted }) => (
          <div key={tz} className={clsx(cardClass, "flex justify-between items-center")}>
            <div>
              <p className="text-xs font-semibold text-foreground-muted">{label}</p>
              <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{converted}</p>
            </div>
            <div className="text-right text-xs text-sky-600 font-mono font-bold">{formatInTz(liveTime, tz).split(",")[1]?.trim()}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground-muted text-center">Live clocks update every second</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fancy Text Generator
// ─────────────────────────────────────────────────────────────────────────────

const FONT_MAPS: Record<string, [string, string, string]> = {
  Bold: ["𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz0123456789"],
  Italic: ["𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"],
  "Bold Italic": ["𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"],
  Script: ["𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"],
  Fraktur: ["𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"],
  Monospace: ["𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"],
  "Double Struck": ["𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"],
};

function convertToFancy(text: string, fontName: string): string {
  const [chars, upper, lower] = FONT_MAPS[fontName];
  const charsArr = [...chars];
  return [...text].map(c => {
    const ui = upper.indexOf(c);
    const li = lower.indexOf(c);
    if (ui !== -1) return charsArr[ui] ?? c;
    if (li !== -1) return charsArr[upper.length + li] ?? c;
    return c;
  }).join("");
}

function FancyText() {
  const [input, setInput] = useState("");
  const [copiedFont, setCopiedFont] = useState<string | null>(null);

  function copy(font: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedFont(font); setTimeout(() => setCopiedFont(null), 2000);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-foreground-muted">Convert text into fancy Unicode fonts for Instagram bio, WhatsApp, Twitter, Facebook and more.</p>
      <input className={clsx(cardClass, "w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-3")} value={input} onChange={e => setInput(e.target.value)} placeholder="Type your text here…" />
      {input && (
        <div className="space-y-2">
          {Object.keys(FONT_MAPS).map(font => {
            const converted = convertToFancy(input, font);
            return (
              <div key={font} className={clsx(cardClass, "flex items-center justify-between gap-3")}>
                <div>
                  <p className="text-xs text-foreground-muted mb-0.5">{font}</p>
                  <p className="text-base">{converted}</p>
                </div>
                <button onClick={() => copy(font, converted)}
                  className={clsx("shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors", copiedFont === font ? "bg-sky-500/10 border-sky-400 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
                  {copiedFont === font ? "Copied ✓" : "Copy"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Text to Speech
// ─────────────────────────────────────────────────────────────────────────────

function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  useEffect(() => {
    if (!supported) return;
    function load() {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v.find(x => x.lang.startsWith("en"))?.name ?? v[0].name);
    }
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  function speak() {
    if (!text || !supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) u.voice = voice;
    u.rate = rate; u.pitch = pitch;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function stop() { window.speechSynthesis.cancel(); setSpeaking(false); }

  if (!supported) return <p className="text-sm text-foreground-muted">Your browser does not support the Web Speech API. Try Chrome or Edge.</p>;

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Convert any text to speech using your browser&apos;s built-in voices. Works offline — no API needed.</p>
      <textarea className={clsx(cardClass, "w-full text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")} value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text to read aloud…" />
      {voices.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Voice</label>
          <select className={clsx(cardClass, "w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground px-3 py-2.5")} value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
            {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Speed</label>
            <span className="text-xs font-bold text-sky-600">{rate}×</span>
          </div>
          <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-sky-500" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Pitch</label>
            <span className="text-xs font-bold text-sky-600">{pitch}</span>
          </div>
          <input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full accent-sky-500" />
        </div>
      </div>
      <div className="flex gap-3">
        <button className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50" onClick={speak} disabled={!text || speaking}>
          {speaking ? "Speaking…" : "▶ Speak"}
        </button>
        {speaking && (
          <button className="h-11 px-5 rounded-xl border border-border bg-background text-foreground-muted text-sm hover:bg-background-subtle transition-colors" onClick={stop}>■ Stop</button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Morse Code Translator
// ─────────────────────────────────────────────────────────────────────────────

const MORSE: Record<string, string> = {
  A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",".":".-.-.-",",":"--..--","?":"..--..","/":"-..-.","-":"-....-","(":"-.--.",")":"-.--.-",
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

function MorseCode() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function convert() {
    if (mode === "encode") {
      setOutput(input.toUpperCase().split("").map(c => c === " " ? "/" : (MORSE[c] ?? "?")).join(" "));
    } else {
      setOutput(input.trim().split(" / ").map(word => word.split(" ").map(code => REVERSE_MORSE[code] ?? "?").join("")).join(" "));
    }
  }

  function copy() {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["encode","decode"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setInput(""); setOutput(""); }}
            className={clsx("px-5 py-2 text-xs font-semibold capitalize transition-colors", mode===m?"bg-sky-500 text-white":"bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "encode" ? "Text → Morse" : "Morse → Text"}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">{mode === "encode" ? "Text" : "Morse Code"}</label>
        <textarea className={clsx(cardClass, "w-full font-mono text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-background text-foreground")}
          value={input} onChange={e => { setInput(e.target.value); setOutput(""); }}
          placeholder={mode === "encode" ? "Type text to convert to Morse…" : "Enter Morse code (dots/dashes, space between letters, / between words)…"} />
      </div>
      <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity" onClick={convert} disabled={!input}>Convert</button>
      {output && (
        <div className={clsx(cardClass, "relative")}>
          <p className="font-mono text-sm break-all pr-16">{output}</p>
          <button onClick={copy} className={clsx("absolute top-2 right-2 text-xs px-2.5 py-1 rounded-lg border transition-colors", copied ? "bg-sky-500/10 border-sky-400 text-sky-600" : "bg-background border-border text-foreground-muted hover:text-foreground")}>
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}
      <p className="text-xs text-foreground-muted">Encode: spaces become /  |  Decode: use spaces between codes, / between words</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Roman Numeral Converter
// ─────────────────────────────────────────────────────────────────────────────

function RomanNumeral() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"to-roman" | "to-arabic">("to-roman");
  const [result, setResult] = useState("");

  function toRoman(num: number): string {
    if (num < 1 || num > 3999) return "Out of range (1–3999)";
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
    let r = "";
    for (let i = 0; i < vals.length; i++) { while (num >= vals[i]) { r += syms[i]; num -= vals[i]; } }
    return r;
  }

  function fromRoman(s: string): number | string {
    const map: Record<string, number> = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    s = s.toUpperCase();
    let res = 0;
    for (let i = 0; i < s.length; i++) {
      const cur = map[s[i]], next = map[s[i+1]];
      if (!cur) return "Invalid Roman numeral";
      res += next > cur ? -cur : cur;
    }
    return res;
  }

  function convert() {
    if (mode === "to-roman") {
      const n = parseInt(input);
      setResult(isNaN(n) ? "Enter a valid integer" : toRoman(n));
    } else {
      const r = fromRoman(input);
      setResult(String(r));
    }
  }

  const inputClass2 = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30";

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(["to-roman","to-arabic"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(""); setInput(""); }}
            className={clsx("flex-1 py-2.5 text-sm font-semibold transition-colors", mode === m ? "bg-sky-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "to-roman" ? "Number → Roman" : "Roman → Number"}
          </button>
        ))}
      </div>
      <input className={inputClass2} value={input} onChange={e => setInput(e.target.value)}
        placeholder={mode === "to-roman" ? "Enter number (1–3999)" : "Enter Roman numerals (e.g. XIV)"} />
      <button onClick={convert} className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">Convert</button>
      {result && <div className="rounded-xl border border-card-border bg-background-subtle p-4 text-center text-2xl font-bold text-foreground">{result}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Text ↔ Binary Converter
// ─────────────────────────────────────────────────────────────────────────────

function TextBinaryTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"to-bin" | "to-text">("to-bin");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function convert() {
    if (mode === "to-bin") {
      setResult(input.split("").map(c => c.charCodeAt(0).toString(2).padStart(8,"0")).join(" "));
    } else {
      try {
        setResult(input.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b,2))).join(""));
      } catch { setResult("Invalid binary input"); }
    }
  }

  function copy() { navigator.clipboard.writeText(result).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  const inputClass2 = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-mono";

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(["to-bin","to-text"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(""); setInput(""); }}
            className={clsx("flex-1 py-2.5 text-sm font-semibold transition-colors", mode === m ? "bg-sky-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "to-bin" ? "Text → Binary" : "Binary → Text"}
          </button>
        ))}
      </div>
      <textarea className={inputClass2} rows={4} value={input} onChange={e => setInput(e.target.value)}
        placeholder={mode === "to-bin" ? "Enter text..." : "Enter binary (space-separated bytes)..."} />
      <button onClick={convert} className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">Convert</button>
      {result && (
        <div className="space-y-2">
          <textarea className={inputClass2} rows={4} value={result} readOnly />
          <button onClick={copy} className="text-xs text-sky-500 hover:underline">{copied ? "Copied!" : "Copy result"}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Size Converter
// ─────────────────────────────────────────────────────────────────────────────

function DataSizeTool() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("MB");
  const UNITS = ["Bit","Byte","KB","MB","GB","TB","PB"];
  const TO_BYTES: Record<string,number> = { Bit:0.125, Byte:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776, PB:1125899906842624 };

  const num = parseFloat(value);
  const bytes = isNaN(num) ? 0 : num * TO_BYTES[fromUnit];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value" />
        <select className="border border-border rounded-xl px-3 py-3 text-sm bg-background text-foreground focus:outline-none"
          value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
          {UNITS.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      {value && !isNaN(num) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {UNITS.map(u => (
            <div key={u} className="rounded-xl border border-card-border bg-background-subtle p-3 text-center">
              <div className="text-xs text-foreground-muted mb-1">{u}</div>
              <div className="font-mono text-sm font-bold text-foreground">{(bytes / TO_BYTES[u]).toLocaleString("en", {maximumFractionDigits:6})}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Readability Analyzer
// ─────────────────────────────────────────────────────────────────────────────

function ReadabilityTool() {
  const [text, setText] = useState("");

  function syllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g,"");
    if (!word) return 0;
    const matches = word.match(/[aeiouy]+/g);
    let count = matches ? matches.length : 0;
    if (word.endsWith("e") && count > 1) count--;
    return Math.max(1, count);
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sylCount = words.reduce((a,w) => a + syllables(w), 0);
  const W = words.length || 1, S = sentences.length || 1;
  const fk = 206.835 - 1.015*(W/S) - 84.6*(sylCount/W);
  const fkGrade = 0.39*(W/S) + 11.8*(sylCount/W) - 15.59;

  function gradeLabel(g: number) {
    if (g <= 6) return "Elementary";
    if (g <= 8) return "Middle School";
    if (g <= 12) return "High School";
    if (g <= 16) return "College";
    return "Graduate";
  }

  return (
    <div className="space-y-4">
      <textarea className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30" rows={6}
        value={text} onChange={e => setText(e.target.value)} placeholder="Paste your text here to analyze readability..." />
      {text.trim().length > 10 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Words", value: W.toLocaleString() },
            { label: "Sentences", value: S.toLocaleString() },
            { label: "Syllables", value: sylCount.toLocaleString() },
            { label: "Flesch Score", value: fk.toFixed(1), note: fk >= 70 ? "Easy" : fk >= 50 ? "Moderate" : "Difficult" },
            { label: "Grade Level", value: fkGrade.toFixed(1), note: gradeLabel(fkGrade) },
            { label: "Avg Sentence", value: (W/S).toFixed(1) + " words" },
          ].map(({label, value, note}) => (
            <div key={label} className="rounded-xl border border-card-border bg-background-subtle p-3 text-center">
              <div className="text-xs text-foreground-muted mb-1">{label}</div>
              <div className="font-bold text-foreground">{value}</div>
              {note && <div className="text-xs text-sky-500 mt-0.5">{note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Speech to Text
// ─────────────────────────────────────────────────────────────────────────────

function SpeechToTextTool() {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(prev => prev + final + (interim ? ` [${interim}]` : ""));
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  function toggle() {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { recRef.current.start(); setListening(true); }
  }

  function copy() { navigator.clipboard.writeText(transcript).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  if (!supported) return <div className="rounded-xl border border-card-border bg-background-subtle p-6 text-center text-sm text-foreground-muted">Speech recognition is not supported in this browser. Try Chrome or Edge.</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={toggle} className={clsx("h-11 px-6 rounded-xl font-semibold text-sm transition-all", listening ? "bg-red-500 text-white animate-pulse" : "bg-gradient-to-r from-sky-500 to-indigo-400 text-white hover:opacity-90")}>
          {listening ? "Stop Recording" : "Start Recording"}
        </button>
        <button onClick={() => setTranscript("")} className="h-11 px-4 rounded-xl border border-border text-sm text-foreground-muted hover:bg-background-subtle">Clear</button>
      </div>
      <textarea className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none min-h-[160px]"
        value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Click 'Start Recording' and speak — text will appear here..." />
      {transcript && <button onClick={copy} className="text-xs text-sky-500 hover:underline">{copied ? "Copied!" : "Copy text"}</button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Strength Checker
// ─────────────────────────────────────────────────────────────────────────────

function PasswordStrengthTool() {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);

  function analyze(p: string) {
    const checks = [
      { label: "At least 8 characters", ok: p.length >= 8 },
      { label: "At least 12 characters", ok: p.length >= 12 },
      { label: "Uppercase letters (A–Z)", ok: /[A-Z]/.test(p) },
      { label: "Lowercase letters (a–z)", ok: /[a-z]/.test(p) },
      { label: "Numbers (0–9)", ok: /\d/.test(p) },
      { label: "Special characters (!@#…)", ok: /[^a-zA-Z0-9]/.test(p) },
      { label: "No common patterns", ok: !/^(password|123456|qwerty|abc123)/i.test(p) },
    ];
    const score = checks.filter(c => c.ok).length;
    const label = score <= 2 ? "Very Weak" : score <= 4 ? "Weak" : score <= 5 ? "Moderate" : score === 6 ? "Strong" : "Very Strong";
    const color = score <= 2 ? "bg-red-500" : score <= 4 ? "bg-orange-400" : score <= 5 ? "bg-yellow-400" : "bg-emerald-500";
    return { checks, score, label, color };
  }

  const { checks, score, label, color } = analyze(pwd);
  const pct = Math.round((score / 7) * 100);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input type={show ? "text" : "password"} className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Type or paste a password to check strength..." />
        <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted hover:text-foreground">{show ? "Hide" : "Show"}</button>
      </div>
      {pwd && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1"><span className="text-foreground-muted">Strength</span><span className="font-bold text-foreground">{label}</span></div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className={clsx("h-full rounded-full transition-all duration-300", color)} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {checks.map(c => (
              <div key={c.label} className="flex items-center gap-2 text-xs">
                <span className={c.ok ? "text-emerald-500" : "text-foreground-muted"}>{c.ok ? "✓" : "✗"}</span>
                <span className={c.ok ? "text-foreground" : "text-foreground-muted"}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TOOL_TITLES: Record<string, string> = {
  "json-formatter": "JSON Formatter & Validator",
  base64: "Base64 Encoder / Decoder",
  "url-encode": "URL Encoder / Decoder",
  "word-counter": "Word Counter & Text Analyzer",
  "password-gen": "Password Generator",
  "color-converter": "Color Converter",
  "csv-to-json": "CSV to JSON Converter",
  "html-to-markdown": "HTML \u2194 Markdown Converter",
  markdown: "Markdown Editor",
  "case-converter": "Case Converter",
  "lorem-ipsum": "Lorem Ipsum Generator",
  "number-converter": "Number Base Converter",
  "uuid-gen": "UUID Generator",
  "text-reverser": "Text Reverser",
  "random-number": "Random Number Generator",
  "remove-duplicates": "Remove Duplicate Lines",
  "code-formatter": "Code Formatter & Beautifier",
  "diff-checker": "Text Diff Checker",
  "hash-generator": "Hash Generator",
  "regex-tester": "Regex Tester",
  "currency-converter": "Currency Converter",
  "timezone-converter": "Timezone Converter",
  "fancy-text": "Fancy Text Generator",
  "text-to-speech": "Text to Speech",
  "morse-code": "Morse Code Translator",
  "roman-numeral": "Roman Numeral Converter",
  "text-binary": "Text ↔ Binary Converter",
  "data-size": "Data Size Converter",
  "readability": "Readability Analyzer",
  "speech-to-text": "Speech to Text",
  "password-strength": "Password Strength Checker",
};

export function ConverterTextWorkspace({ tool }: { tool: Tool }) {
  function renderTool() {
    switch (tool.slug) {
      case "json-formatter":
        return <JSONFormatter />;
      case "base64":
        return <Base64Tool />;
      case "url-encode":
        return <URLTool />;
      case "word-counter":
        return <WordCounter />;
      case "password-gen":
        return <PasswordGenerator />;
      case "color-converter":
        return <ColorConverter />;
      case "csv-to-json":
        return <CsvToJsonTool />;
      case "html-to-markdown":
        return <HtmlMarkdownTool />;
      case "markdown":
        return <MarkdownEditor />;
      case "case-converter":
        return <CaseConverter />;
      case "lorem-ipsum":
        return <LoremIpsum />;
      case "number-converter":
        return <NumberBaseConverter />;
      case "uuid-gen":
        return <UuidGenerator />;
      case "text-reverser":
        return <TextReverser />;
      case "random-number":
        return <RandomNumberGen />;
      case "remove-duplicates":
        return <DedupeTool />;
      case "code-formatter":
        return <CodeFormatter />;
      case "diff-checker":
        return <DiffChecker />;
      case "hash-generator":
        return <HashGenerator />;
      case "regex-tester":
        return <RegexTester />;
      case "currency-converter":
        return <CurrencyConverter />;
      case "timezone-converter":
        return <TimezoneConverter />;
      case "fancy-text":
        return <FancyText />;
      case "text-to-speech":
        return <TextToSpeech />;
      case "morse-code":
        return <MorseCode />;
      case "roman-numeral":
        return <RomanNumeral />;
      case "text-binary":
        return <TextBinaryTool />;
      case "data-size":
        return <DataSizeTool />;
      case "readability":
        return <ReadabilityTool />;
      case "speech-to-text":
        return <SpeechToTextTool />;
      case "password-strength":
        return <PasswordStrengthTool />;
      default:
        return (
          <p className="text-sm text-foreground-muted">
            This tool is not yet available.
          </p>
        );
    }
  }

  const title = TOOL_TITLES[tool.slug] ?? tool.name;

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-400 flex items-center justify-center shrink-0">
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
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-tight">{title}</h2>
            {tool.shortDescription && (
              <p className="text-xs text-foreground-muted mt-0.5">{tool.shortDescription}</p>
            )}
          </div>
        </div>

        {/* Tool UI */}
        {renderTool()}
      </div>
      <div className="border-t border-border bg-background-subtle px-6 py-3 text-xs text-center text-foreground-muted">
        All processing runs locally in your browser — your data never leaves your device.
      </div>
    </div>
  );
}

export default ConverterTextWorkspace;
