"use client";

import { useState, useCallback } from "react";
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
// Main export
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_TITLES: Record<string, string> = {
  "json-formatter": "JSON Formatter & Validator",
  base64: "Base64 Encoder / Decoder",
};

export function ConverterTextWorkspace({ tool }: { tool: Tool }) {
  function renderTool() {
    switch (tool.slug) {
      case "json-formatter":
        return <JSONFormatter />;
      case "base64":
        return <Base64Tool />;
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
