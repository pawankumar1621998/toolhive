"use client";

import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  Play, Pause, Square, Mic2, Settings2,
  AlertCircle, CheckCircle, Volume2,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "ar-SA", label: "Arabic" },
  { code: "ru-RU", label: "Russian" },
] as const;

const SAMPLE_TEXTS = [
  "Welcome to ToolHive! Your all-in-one platform for free AI-powered tools.",
  "The quick brown fox jumps over the lazy dog.",
  "Technology is best when it brings people together.",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
] as const;

const MAX_CHARS = 5000;

// ─── Component ────────────────────────────────────────────────────────────────

export function TextToAudio() {
  const [text, setText]               = useState("");
  const [lang, setLang]               = useState("en-US");
  const [voices, setVoices]           = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setVoiceURI]  = useState("");
  const [rate, setRate]               = useState(1.0);
  const [pitch, setPitch]             = useState(1.0);
  const [volume, setVolume]           = useState(1.0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [isPaused, setIsPaused]       = useState(false);
  const [progress, setProgress]       = useState(0);
  const [error, setError]             = useState("");
  const [supported, setSupported]     = useState(true);
  const [done, setDone]               = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      const def = v.find((x) => x.lang.startsWith("en")) ?? v[0];
      if (def && !selectedVoice) setVoiceURI(def.voiceURI);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter voices by selected language (or fallback to all)
  const langCode = lang.slice(0, 2);
  const filteredVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langCode));
  const voiceList = filteredVoices.length > 0 ? filteredVoices : voices;

  function handlePlay() {
    if (!text.trim() || !supported) return;
    setError("");
    setDone(false);

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart  = () => { setIsPlaying(true); setIsPaused(false); setProgress(0); };
    utterance.onend    = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); setDone(true); };
    utterance.onerror  = (e) => {
      setIsPlaying(false);
      setIsPaused(false);
      if (e.error !== "interrupted") setError(`Speech error: ${e.error}`);
    };
    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setProgress(Math.round((e.charIndex / text.length) * 100));
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function handlePause() {
    if (!isPlaying) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setDone(false);
  }

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  const statusText = isPlaying
    ? "Speaking..."
    : isPaused
    ? "Paused — click play to resume"
    : done
    ? "Done!"
    : "Enter text and press play";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
          <Mic2 className="h-3.5 w-3.5" />
          Browser Text-to-Speech
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Text to Audio</h1>
        <p className="mt-2 text-foreground-muted">Convert any text to natural speech — free, private, no API key</p>
      </div>

      {/* Unsupported browser warning */}
      {!supported && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-foreground-muted">
            Your browser does not support Text-to-Speech. Please use Google Chrome or Microsoft Edge.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Text input */}
        <div className="rounded-2xl border border-card-border bg-card p-5">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            📝 Your text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any text here to convert it to speech..."
            rows={8}
            className={clsx(
              "w-full resize-none rounded-xl border bg-background",
              "p-3 text-sm text-foreground placeholder:text-foreground-subtle",
              "focus:outline-none focus:ring-2 focus:border-transparent transition-colors",
              isOverLimit
                ? "border-red-400 focus:ring-red-400/40"
                : "border-border focus:ring-emerald-400/40 focus:border-emerald-400/60"
            )}
          />

          {/* Character bar */}
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-background-muted overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-300",
                  isOverLimit ? "bg-red-500" : charPercent > 80 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${charPercent}%` }}
              />
            </div>
            <span className={clsx(
              "shrink-0 text-xs font-medium tabular-nums",
              isOverLimit ? "text-red-500" : "text-foreground-subtle"
            )}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          {isOverLimit && (
            <p className="mt-1 text-xs text-red-500">Text too long. Reduce to {MAX_CHARS.toLocaleString()} characters.</p>
          )}

          {/* Sample texts */}
          <p className="mt-3 text-xs font-medium text-foreground-subtle mb-1.5">Try a sample:</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TEXTS.map((s) => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground-muted hover:border-emerald-400/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {s.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="rounded-2xl border border-card-border bg-card p-5">
          <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Settings2 className="h-4 w-4 text-emerald-500" />
            Voice Settings
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Language</label>
              <select
                value={lang}
                onChange={(e) => { setLang(e.target.value); setVoiceURI(""); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setVoiceURI(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              >
                {voiceList.length > 0 ? voiceList.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                )) : (
                  <option value="">Default voice</option>
                )}
              </select>
            </div>
          </div>

          {/* Sliders */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {([
              { label: "Speed",  value: rate,   min: 0.5, max: 2.0, step: 0.1, set: setRate,   fmt: (v: number) => `${v.toFixed(1)}x` },
              { label: "Pitch",  value: pitch,  min: 0.5, max: 2.0, step: 0.1, set: setPitch,  fmt: (v: number) => `${v.toFixed(1)}x` },
              { label: "Volume", value: volume, min: 0.1, max: 1.0, step: 0.1, set: setVolume, fmt: (v: number) => `${Math.round(v * 100)}%` },
            ] as const).map(({ label, value, min, max, step, set, fmt }) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground-muted">{label}</label>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{fmt(value)}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => set(parseFloat(e.target.value) as never)}
                  className="w-full accent-emerald-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-foreground-subtle">
                  <span>{label === "Volume" ? "10%" : "0.5x"}</span>
                  <span>{label === "Volume" ? "100%" : "2.0x"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player */}
        <div className="rounded-2xl border border-card-border bg-card p-6">
          {/* Progress bar */}
          <div className="mb-5 h-2 rounded-full bg-background-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Status */}
          <p className={clsx(
            "mb-5 text-center text-sm font-medium",
            isPlaying ? "text-emerald-500" : isPaused ? "text-amber-500" : done ? "text-emerald-500" : "text-foreground-muted"
          )}>
            {done && <CheckCircle className="inline h-4 w-4 mr-1 mb-0.5" />}
            {statusText}
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Stop */}
            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              title="Stop"
              className={clsx(
                "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                isPlaying || isPaused
                  ? "border-border hover:border-red-400 hover:text-red-500 text-foreground-muted"
                  : "border-border text-foreground-subtle opacity-30 cursor-not-allowed"
              )}
            >
              <Square className="h-5 w-5" fill="currentColor" />
            </button>

            {/* Play / Pause (main) */}
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={!text.trim() || isOverLimit || !supported}
              className={clsx(
                "flex h-18 w-18 items-center justify-center rounded-full transition-all",
                "h-[72px] w-[72px]",
                "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg",
                "hover:opacity-90 hover:shadow-xl active:scale-95",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              )}
            >
              {isPlaying
                ? <Pause className="h-8 w-8" fill="currentColor" />
                : <Play  className="h-8 w-8 ml-1" fill="currentColor" />
              }
            </button>

            {/* Volume indicator */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border text-foreground-subtle">
              <Volume2 className="h-5 w-5" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rounded-2xl border border-card-border bg-card/50 p-4">
          <p className="flex items-start gap-2 text-xs text-foreground-subtle">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
            100% private — uses your browser&apos;s built-in speech engine. No text is sent to any server.
            For the best voice quality and most voice options, use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
