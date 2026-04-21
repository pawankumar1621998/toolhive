"use client";

import React, { useRef, useState } from "react";
import { FileText, ArrowUpDown, Sparkles, Info, Download, RotateCcw, Upload } from "lucide-react";
import { clsx } from "clsx";

// ─── Language lists ────────────────────────────────────────────────────────────

const FROM_LANGS = [
  "Auto Detect", "English", "Hindi", "Spanish", "French", "German",
  "Arabic", "Portuguese", "Bengali", "Urdu", "Japanese", "Chinese",
  "Russian", "Italian", "Korean", "Turkish",
];

const TO_LANGS = [
  "Hindi", "Hinglish", "English", "Spanish", "French", "German",
  "Arabic", "Portuguese", "Bengali", "Urdu", "Japanese", "Chinese",
  "Russian", "Italian", "Korean", "Turkish",
];

// ─── Main Component ────────────────────────────────────────────────────────────

export function TranslatePdfWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]           = useState<File | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [fromLang, setFromLang]   = useState("Auto Detect");
  const [toLang, setToLang]       = useState("Hindi");
  const [processing, setProcessing] = useState(false);
  const [output, setOutput]       = useState<{ name: string; url: string } | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    setFile(f);
    setOutput(null);
    setError(null);
  };

  const swap = () => {
    if (fromLang !== "Auto Detect") {
      const prev = fromLang;
      setFromLang(toLang);
      setToLang(prev);
    }
  };

  const handleTranslate = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    setOutput(null);
    try {
      const fd = new FormData();
      fd.append("toolSlug", "translate-pdf");
      fd.append("options", JSON.stringify({ targetLanguage: toLang, sourceLanguage: fromLang }));
      fd.append("files", file, file.name);
      const res  = await fetch("/api/tools/process", { method: "POST", body: fd });
      const data = await res.json() as { files?: Array<{ name: string; data: string; type: string }>; error?: string };
      if (data.error) throw new Error(data.error);
      if (!data.files?.length) throw new Error("No output returned from server.");
      const f = data.files[0];
      const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: f.type });
      setOutput({ name: f.name, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError((err as Error).message ?? "Translation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setOutput(null); setError(null); };

  const selectClass = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="border border-card-border rounded-2xl overflow-hidden shadow-sm bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ── Left: File Upload ── */}
          <div
            className={clsx(
              "flex flex-col items-center justify-center p-8 min-h-[340px] border-b md:border-b-0 md:border-r border-border transition-colors",
              isDragging ? "bg-primary/5" : "bg-background-subtle"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            {file ? (
              /* ── File selected ── */
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-28 h-36 bg-white dark:bg-background border border-border rounded-xl shadow-md flex flex-col items-center justify-center gap-2 relative">
                  <FileText className="h-10 w-10 text-red-500" />
                  <span className="text-xs font-bold text-red-500 tracking-wide">PDF</span>
                </div>
                <p className="text-xs text-foreground-muted max-w-[180px] truncate font-medium">{file.name}</p>
                <p className="text-xs text-foreground-subtle">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); reset(); inputRef.current?.click(); }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Change file
                </button>
              </div>
            ) : (
              /* ── No file ── */
              <div className="flex flex-col items-center gap-4 text-center cursor-pointer">
                <div className={clsx(
                  "w-20 h-24 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors",
                  isDragging ? "border-primary" : "border-border"
                )}>
                  <Upload className="h-8 w-8 text-foreground-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drop PDF here</p>
                  <p className="text-xs text-foreground-muted mt-0.5">or click to browse</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Select PDF
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Settings ── */}
          <div className="p-6 flex flex-col gap-4">

            {/* AI badge + title */}
            <div className="flex items-center gap-1.5 text-purple-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI</span>
            </div>
            <h2 className="text-xl font-bold text-foreground -mt-2">Translate PDF</h2>

            {/* Info box */}
            <div className="flex gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3.5 py-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Selecting the correct source language improves translation accuracy.
              </p>
            </div>
            {/* 4000 char limit warning */}
            <div className="flex gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3.5 py-3">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                <strong>Limit:</strong> Only the first ~4,000 characters of your PDF will be translated. For longer documents, split into smaller sections and translate each separately.
              </p>
            </div>

            {/* From language */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">From:</label>
              <select value={fromLang} onChange={(e) => setFromLang(e.target.value)} className={selectClass}>
                {FROM_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Swap button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={swap}
                title="Swap languages"
                className="p-2 rounded-full border border-border bg-background hover:bg-background-subtle hover:text-primary text-foreground-muted transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>

            {/* To language */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">To:</label>
              <select value={toLang} onChange={(e) => setToLang(e.target.value)} className={selectClass}>
                {TO_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Action buttons */}
            {output ? (
              <div className="flex flex-col gap-2 mt-auto">
                <a
                  href={output.url}
                  download={output.name}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Translation
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full py-2.5 rounded-xl border border-border text-sm text-foreground-muted hover:bg-background-subtle transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Translate Another PDF
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTranslate}
                disabled={!file || processing}
                className={clsx(
                  "mt-auto w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity",
                  file && !processing
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
                    : "bg-border text-foreground-muted cursor-not-allowed"
                )}
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Translating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Translate PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background-subtle px-6 py-3 text-center">
          <p className="text-xs text-foreground-subtle">
            Powered by AI · Text is extracted and translated · Result downloaded as .txt file
          </p>
        </div>
      </div>
    </div>
  );
}

export default TranslatePdfWorkspace;
