"use client";

import React, { useState, useRef, useCallback } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Mic, Square, FileAudio, Loader2, Copy, Check,
  Download, Trash2, AlertCircle, CheckCircle, Sparkles,
} from "lucide-react";

const ACCEPT = ".mp3,.wav,.m4a,.ogg,.webm,.flac,.mp4";
const MAX_MB = 25;

// ─── Component ────────────────────────────────────────────────────────────────

export function AudioTranscriber() {
  const [file, setFile]               = useState<File | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript]   = useState("");
  const [error, setError]             = useState("");
  const [copied, setCopied]           = useState(false);

  // Mic recording
  const [recording, setRecording]     = useState(false);
  const [recSeconds, setRecSeconds]   = useState(0);
  const mediaRecRef  = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<Blob[]>([]);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setError("");
    setTranscript("");
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ─── Microphone recording ───────────────────────────────────────────────────

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const f = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        handleFile(f);
      };
      rec.start(200);
      mediaRecRef.current = rec;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (err: unknown) {
      setError("Microphone access denied: " + (err as Error).message);
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
  }

  // ─── Transcription ──────────────────────────────────────────────────────────

  async function handleTranscribe() {
    if (!file) return;
    setTranscribing(true);
    setError("");
    setTranscript("");

    const form = new FormData();
    form.append("file", file, file.name);
    form.append("language", "en");

    try {
      const res = await fetch("/api/ai/audio-transcribe", {
        method: "POST",
        body: form,
      });
      const data = await res.json() as { text?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`);
      setTranscript(data.text ?? "");
    } catch (err: unknown) {
      setError((err as Error).message ?? "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }

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
    a.click();
  }

  function handleReset() {
    setFile(null);
    setTranscript("");
    setError("");
    setRecSeconds(0);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          NVIDIA Parakeet ASR
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Audio Transcriber</h1>
        <p className="mt-2 text-foreground-muted">Convert speech to text instantly — upload audio or record live</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Upload + Record row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !recording && fileInputRef.current?.click()}
            className={clsx(
              "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
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
                <FileAudio className="h-9 w-9 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">{file.name}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="absolute top-3 right-3 rounded-full p-1 text-foreground-subtle hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-background-muted p-3">
                  <Upload className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Upload audio file</p>
                  <p className="text-xs text-foreground-muted mt-0.5">MP3, WAV, M4A, OGG, FLAC · Max {MAX_MB} MB</p>
                </div>
              </>
            )}
          </div>

          {/* Mic recording */}
          <div className={clsx(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-8 text-center transition-all",
            recording ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-dashed border-card-border bg-card"
          )}>
            {recording ? (
              <>
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-red-500/20 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-red-500 animate-pulse flex items-center justify-center">
                      <Mic className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Recording {fmt(recSeconds)}
                </p>
                <button onClick={stopRecording}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                  <Square className="h-4 w-4" fill="currentColor" />
                  Stop & Use
                </button>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-background-muted p-3">
                  <Mic className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Record from mic</p>
                  <p className="text-xs text-foreground-muted mt-0.5">Speak directly into your microphone</p>
                </div>
                <button onClick={startRecording}
                  className="flex items-center gap-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                  <Mic className="h-4 w-4" />
                  Start Recording
                </button>
              </>
            )}
          </div>
        </div>

        {/* Transcribe button */}
        <button
          onClick={handleTranscribe}
          disabled={!file || transcribing}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-4",
            "text-base font-semibold text-white",
            "bg-gradient-to-r from-blue-500 to-indigo-500",
            "shadow-lg hover:opacity-90 hover:shadow-xl transition-all duration-200 active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          {transcribing
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Transcribing with NVIDIA Parakeet...</>
            : <><Sparkles className="h-5 w-5" /> Transcribe Audio</>
          }
        </button>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Transcription failed</p>
              <p className="mt-0.5 text-xs text-foreground-muted">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Transcript result */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Transcript
                  <span className="text-xs font-normal text-foreground-subtle">
                    {transcript.split(/\s+/).length} words · {transcript.length} chars
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
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="rounded-2xl border border-card-border bg-card/50 p-4">
          <p className="flex items-start gap-2 text-xs text-foreground-subtle">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
            Powered by <strong>NVIDIA Parakeet TDT 0.6B v2</strong> — fast, accurate English ASR model.
            Supports MP3, WAV, M4A, OGG, FLAC, WebM up to {MAX_MB} MB.
          </p>
        </div>
      </div>
    </div>
  );
}
