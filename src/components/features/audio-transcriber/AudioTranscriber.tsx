"use client";

import React, { useState, useRef, useCallback } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Mic, Square, FileAudio, Loader2, Copy, Check,
  Download, Trash2, AlertCircle, CheckCircle, Sparkles, Radio,
} from "lucide-react";

const ACCEPT = ".mp3,.wav,.m4a,.ogg,.webm,.flac,.mp4";
const MAX_MB = 25;

// ─── Browser SpeechRecognition types ─────────────────────────────────────────

interface ISpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}
interface ISpeechRecognitionEvent {
  results: ISpeechRecognitionResultList;
  resultIndex: number;
}
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as Record<string, unknown>).SpeechRecognition as SpeechRecognitionCtor ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition as SpeechRecognitionCtor ||
    null
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AudioTranscriber() {
  const [mode, setMode] = useState<"mic" | "file">("mic");

  // Shared output
  const [transcript, setTranscript]   = useState("");
  const [error, setError]             = useState("");
  const [copied, setCopied]           = useState(false);

  // Mic mode
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const finalTextRef                  = useRef("");
  const recognitionRef                = useRef<ISpeechRecognition | null>(null);

  // File mode
  const [file, setFile]               = useState<File | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // ─── Mic Mode ──────────────────────────────────────────────────────────────

  function startListening() {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("Speech recognition not supported. Please use Chrome or Edge browser.");
      return;
    }
    setError("");
    setTranscript("");
    finalTextRef.current = "";
    setInterimText("");

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalTextRef.current += r[0].transcript + " ";
        } else {
          interim = r[0].transcript;
        }
      }
      setInterimText(interim);
      setTranscript((finalTextRef.current + interim).trim());
    };

    rec.onerror = (e: { error: string }) => {
      if (e.error !== "aborted") setError(`Microphone error: ${e.error}. Allow mic access and try again.`);
      setIsListening(false);
      setInterimText("");
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText("");
  }

  function switchMode(next: "mic" | "file") {
    stopListening();
    setMode(next);
    setError("");
    setTranscript("");
  }

  // ─── File Mode ─────────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setError("");
    setTranscript("");
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File too large. Max ${MAX_MB} MB.`); return; }
    setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  async function handleTranscribe() {
    if (!file) return;
    setTranscribing(true);
    setError("");
    setTranscript("");
    const form = new FormData();
    form.append("file", file, file.name);
    try {
      const res = await fetch("/api/ai/audio-transcribe", { method: "POST", body: form });
      const data = await res.json() as { text?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`);
      setTranscript(data.text ?? "");
    } catch (err: unknown) {
      setError((err as Error).message ?? "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }

  // ─── Output actions ────────────────────────────────────────────────────────

  async function handleCopy() {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadText() {
    const blob = new Blob([transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transcript-${Date.now()}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          AI Speech to Text
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Audio Transcriber</h1>
        <p className="mt-2 text-foreground-muted">Live mic transcription or upload an audio file</p>
      </div>

      {/* Mode tabs */}
      <div className="mb-5 flex rounded-2xl border border-card-border bg-card p-1.5 gap-1.5">
        <button onClick={() => switchMode("mic")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
            mode === "mic" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm" : "text-foreground-muted hover:text-foreground"
          )}>
          <Mic className="h-4 w-4" /> Live Mic
          <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px]", mode === "mic" ? "bg-white/20" : "bg-foreground/10")}>Real-time · Free</span>
        </button>
        <button onClick={() => switchMode("file")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
            mode === "file" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm" : "text-foreground-muted hover:text-foreground"
          )}>
          <Upload className="h-4 w-4" /> Upload File
          <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px]", mode === "file" ? "bg-white/20" : "bg-foreground/10")}>MP3 / WAV</span>
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <AnimatePresence mode="wait" initial={false}>

          {mode === "mic" ? (
            /* ── LIVE MIC MODE ── */
            <motion.div key="mic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-5">

              <div className={clsx(
                "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 p-10 text-center transition-all",
                isListening ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-dashed border-card-border bg-card"
              )}>
                {isListening ? (
                  <>
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">
                          <Mic className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Listening…</p>
                      <p className="text-xs text-foreground-muted mt-0.5">Speak clearly — transcript appears below</p>
                    </div>
                    {interimText && (
                      <p className="text-xs text-foreground-muted italic bg-background-muted rounded-xl px-4 py-2 max-w-sm">
                        {interimText}
                      </p>
                    )}
                    <button onClick={stopListening}
                      className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 shadow-md">
                      <Square className="h-4 w-4" fill="currentColor" />
                      Stop &amp; Save
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl bg-background-muted p-4">
                      <Mic className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Speak to transcribe in real-time</p>
                      <p className="text-xs text-foreground-muted mt-0.5">Uses your browser's built-in speech engine — no server needed</p>
                    </div>
                    <button onClick={startListening}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 shadow-md active:scale-95 transition-all">
                      <Mic className="h-4 w-4" />
                      Start Listening
                    </button>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-card-border bg-card/50 p-4">
                <p className="flex items-start gap-2 text-xs text-foreground-subtle">
                  <Radio className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                  100% private — runs in your browser (Chrome / Edge). No audio sent to any server.
                  For Hindi, Spanish or other languages, switch language in browser settings first.
                </p>
              </div>
            </motion.div>

          ) : (
            /* ── FILE UPLOAD MODE ── */
            <motion.div key="file" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-5">

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200",
                  dragOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : file
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-card-border bg-card hover:border-blue-400/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/10"
                )}
              >
                <input ref={fileInputRef} type="file" accept={ACCEPT} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                {file ? (
                  <>
                    <FileAudio className="h-10 w-10 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setTranscript(""); setError(""); }}
                      className="absolute top-3 right-3 rounded-full p-1 text-foreground-subtle hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl bg-background-muted p-4">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Drop audio here or click to upload</p>
                      <p className="text-xs text-foreground-muted mt-0.5">MP3, WAV, M4A, OGG, FLAC · Max {MAX_MB} MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Transcribe button */}
              <button onClick={handleTranscribe} disabled={!file || transcribing}
                className={clsx(
                  "flex w-full items-center justify-center gap-2 rounded-2xl py-4",
                  "text-base font-semibold text-white",
                  "bg-gradient-to-r from-blue-500 to-indigo-500",
                  "shadow-lg hover:opacity-90 hover:shadow-xl transition-all duration-200 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                )}>
                {transcribing
                  ? <><Loader2 className="h-5 w-5 animate-spin" /> Transcribing with Whisper AI…</>
                  : <><Sparkles className="h-5 w-5" /> Transcribe Audio</>
                }
              </button>

              <div className="rounded-2xl border border-card-border bg-card/50 p-4">
                <p className="flex items-start gap-2 text-xs text-foreground-subtle">
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                  Powered by <strong>OpenAI Whisper</strong> — multilingual. First request may take 20–30 s to warm up the model.
                  Add a free <strong>HF_TOKEN</strong> in Vercel env vars for faster, more reliable transcription.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Error</p>
              <p className="mt-0.5 text-xs text-foreground-muted">{error}</p>
              {mode === "file" && (
                <p className="mt-1.5 text-xs text-foreground-subtle">
                  Try <button onClick={() => switchMode("mic")} className="text-primary underline underline-offset-2">Live Mic mode</button> — it works instantly without any server.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Transcript result */}
        <AnimatePresence>
          {transcript && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Transcript
                  <span className="text-xs font-normal text-foreground-subtle">
                    {transcript.split(/\s+/).filter(Boolean).length} words · {transcript.length} chars
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={handleDownloadText}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                    <Download className="h-3.5 w-3.5" />
                    Download .txt
                  </button>
                </div>
              </div>
              <div className="p-5">
                {isListening && (
                  <p className="text-xs text-blue-500 mb-3 flex items-center gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Live transcription active…
                  </p>
                )}
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
