"use client";

import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Square, Mic2, Settings2, Download,
  AlertCircle, CheckCircle, Volume2, Loader2, Sparkles,
} from "lucide-react";

// ─── AI TTS voices (StreamElements — free, no API key) ───────────────────────

const AI_VOICES = [
  { id: "Brian",    label: "Brian — English UK · Male"    },
  { id: "Amy",      label: "Amy — English UK · Female"    },
  { id: "Emma",     label: "Emma — English UK · Female"   },
  { id: "Joanna",   label: "Joanna — English US · Female" },
  { id: "Joey",     label: "Joey — English US · Male"     },
  { id: "Matthew",  label: "Matthew — English US · Male"  },
  { id: "Salli",    label: "Salli — English US · Female"  },
  { id: "Kendra",   label: "Kendra — English US · Female" },
  { id: "Justin",   label: "Justin — English US · Male"   },
  { id: "Nicole",   label: "Nicole — Australian · Female" },
  { id: "Russell",  label: "Russell — Australian · Male"  },
  { id: "Conchita", label: "Conchita — Spanish · Female"  },
  { id: "Celine",   label: "Céline — French · Female"     },
  { id: "Marlene",  label: "Marlene — German · Female"    },
  { id: "Carla",    label: "Carla — Italian · Female"     },
];

const BROWSER_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "hi-IN", label: "Hindi"        },
  { code: "es-ES", label: "Spanish"      },
  { code: "fr-FR", label: "French"       },
  { code: "de-DE", label: "German"       },
  { code: "it-IT", label: "Italian"      },
  { code: "pt-BR", label: "Portuguese"   },
  { code: "ja-JP", label: "Japanese"     },
  { code: "ko-KR", label: "Korean"       },
  { code: "zh-CN", label: "Chinese"      },
  { code: "ar-SA", label: "Arabic"       },
] as const;

const SAMPLE_TEXTS = [
  "Welcome to ToolHive — your all-in-one AI tools platform, completely free.",
  "The quick brown fox jumps over the lazy dog.",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
  "Technology is best when it brings people together.",
] as const;

const MAX_CHARS = 3000;
type Mode = "nvidia" | "browser";

// ─── Component ────────────────────────────────────────────────────────────────

export function TextToAudio() {
  const [mode, setMode]               = useState<Mode>("nvidia");
  const [text, setText]               = useState("");
  const [speed, setSpeed]             = useState(1.0);

  // AI TTS mode state
  const [nvidiaVoice, setNvidiaVoice] = useState<string>(AI_VOICES[0].id);
  const [nvidiaLoading, setNvidiaLoading] = useState(false);
  const [nvidiaError, setNvidiaError] = useState("");
  const [audioUrl, setAudioUrl]       = useState("");
  const [audioDone, setAudioDone]     = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Browser mode state
  const [browserLang, setBrowserLang] = useState("en-US");
  const [voices, setVoices]           = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [pitch, setPitch]             = useState(1.0);
  const [volume, setVolume]           = useState(1.0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [isPaused, setIsPaused]       = useState(false);
  const [progress, setProgress]       = useState(0);
  const [browserError, setBrowserError] = useState("");
  const [browserDone, setBrowserDone] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);

  // Load browser voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setBrowserSupported(false);
      return;
    }
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      const def = v.find((x) => x.lang.startsWith("en")) ?? v[0];
      if (def && !selectedVoice) setSelectedVoice(def.voiceURI);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup audio blob URL on unmount
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  // ─── NVIDIA TTS ────────────────────────────────────────────────────────────

  async function handleNvidiaTTS() {
    if (!text.trim()) return;
    setNvidiaLoading(true);
    setNvidiaError("");
    setAudioDone(false);
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(""); }

    try {
      const res = await fetch("/api/ai/nvidia-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voice: nvidiaVoice }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `Error ${res.status}` })) as { error?: string };
        throw new Error(errData.error ?? `Request failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioDone(true);
      // Auto-play
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (err: unknown) {
      setNvidiaError((err as Error).message ?? "Generation failed");
    } finally {
      setNvidiaLoading(false);
    }
  }

  function handleDownload() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `toolhive-tts-${nvidiaVoice}-${Date.now()}.mp3`;
    a.click();
  }

  // ─── Browser TTS ───────────────────────────────────────────────────────────

  const langCode = browserLang.slice(0, 2);
  const filteredVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langCode));
  const voiceList = filteredVoices.length > 0 ? filteredVoices : voices;

  function handleBrowserPlay() {
    if (!text.trim() || !browserSupported) return;
    setBrowserError("");
    setBrowserDone(false);

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
    utterance.lang   = browserLang;
    utterance.rate   = speed;
    utterance.pitch  = pitch;
    utterance.volume = volume;

    utterance.onstart    = () => { setIsPlaying(true); setIsPaused(false); setProgress(0); };
    utterance.onend      = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); setBrowserDone(true); };
    utterance.onerror    = (e) => {
      setIsPlaying(false); setIsPaused(false);
      if (e.error !== "interrupted") setBrowserError(`Speech error: ${e.error}`);
    };
    utterance.onboundary = (e) => {
      if (e.name === "word") setProgress(Math.round((e.charIndex / text.length) * 100));
    };

    window.speechSynthesis.speak(utterance);
  }

  function handleBrowserPause() {
    if (!isPlaying) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }

  function handleBrowserStop() {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setBrowserDone(false);
  }

  // ─── Shared ────────────────────────────────────────────────────────────────

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
          <Mic2 className="h-3.5 w-3.5" />
          Text to Audio
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Text to Audio</h1>
        <p className="mt-2 text-foreground-muted">Convert any text to natural speech with AI voices</p>
      </div>

      {/* Mode tabs */}
      <div className="mb-5 flex rounded-2xl border border-card-border bg-card p-1.5 gap-1.5">
        <button
          onClick={() => setMode("nvidia")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
            mode === "nvidia"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" /> AI Voice
          <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px]", mode === "nvidia" ? "bg-white/20" : "bg-foreground/10")}>Downloadable</span>
        </button>
        <button
          onClick={() => setMode("browser")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
            mode === "browser"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Volume2 className="h-4 w-4" /> Browser TTS
          <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px]", mode === "browser" ? "bg-white/20" : "bg-foreground/10")}>Free</span>
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Text input */}
        <div className="rounded-2xl border border-card-border bg-card p-5">
          <label className="mb-2 block text-sm font-semibold text-foreground">📝 Your text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any text to convert to speech..."
            rows={7}
            className={clsx(
              "w-full resize-none rounded-xl border bg-background",
              "p-3 text-sm text-foreground placeholder:text-foreground-subtle",
              "focus:outline-none focus:ring-2 focus:border-transparent transition-colors",
              isOverLimit
                ? "border-red-400 focus:ring-red-400/40"
                : "border-border focus:ring-emerald-400/40 focus:border-emerald-400/60"
            )}
          />
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
            <span className={clsx("shrink-0 text-xs font-medium tabular-nums", isOverLimit ? "text-red-500" : "text-foreground-subtle")}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          {isOverLimit && <p className="mt-1 text-xs text-red-500">Text too long. Max {MAX_CHARS.toLocaleString()} characters.</p>}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SAMPLE_TEXTS.map((s) => (
              <button key={s} onClick={() => setText(s)}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground-muted hover:border-emerald-400/40 hover:text-emerald-600 transition-colors">
                {s.slice(0, 38)}…
              </button>
            ))}
          </div>
        </div>

        {/* ── NVIDIA Mode Settings ── */}
        <AnimatePresence mode="wait" initial={false}>
          {mode === "nvidia" ? (
            <motion.div key="nvidia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4">

              <div className="rounded-2xl border border-card-border bg-card p-5">
                <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Settings2 className="h-4 w-4 text-emerald-500" /> Choose Voice
                </p>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Voice & Language</label>
                  <select value={nvidiaVoice} onChange={(e) => setNvidiaVoice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/40">
                    {AI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <button onClick={handleNvidiaTTS} disabled={!text.trim() || isOverLimit || nvidiaLoading}
                className={clsx(
                  "flex w-full items-center justify-center gap-2 rounded-2xl py-4",
                  "text-base font-semibold text-white",
                  "bg-gradient-to-r from-emerald-500 to-teal-500",
                  "shadow-lg hover:opacity-90 hover:shadow-xl transition-all duration-200 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                )}>
                {nvidiaLoading
                  ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating audio...</>
                  : <><Sparkles className="h-5 w-5" /> Generate Audio</>
                }
              </button>

              {/* Audio player */}
              <AnimatePresence>
                {(audioUrl || nvidiaError) && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl border border-card-border bg-card overflow-hidden">
                    {audioUrl && (
                      <div className="p-5">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          Audio ready — play or download
                        </p>
                        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                        <audio ref={audioRef} src={audioUrl} controls className="w-full rounded-xl" />
                        <button onClick={handleDownload}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white hover:opacity-90 shadow-sm">
                          <Download className="h-4 w-4" />
                          Download MP3
                        </button>
                      </div>
                    )}
                    {nvidiaError && (
                      <div className="p-5 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Generation failed</p>
                          <p className="mt-0.5 text-xs text-foreground-muted">{nvidiaError}</p>
                          <p className="mt-2 text-xs text-foreground-subtle">
                            Try <button onClick={() => setMode("browser")} className="text-primary underline underline-offset-2">Browser TTS</button> as an alternative.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-2xl border border-card-border bg-card/50 p-4">
                <p className="flex items-start gap-2 text-xs text-foreground-subtle">
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                  15 natural voices across English, Spanish, French, German & Italian.
                  Audio generated as downloadable <strong>MP3</strong>.
                </p>
              </div>
            </motion.div>
          ) : (
            // ── Browser Mode ──
            <motion.div key="browser" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4">

              {!browserSupported && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                  <p className="text-sm text-foreground-muted">Browser does not support TTS. Use Chrome or Edge.</p>
                </div>
              )}

              <div className="rounded-2xl border border-card-border bg-card p-5">
                <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Settings2 className="h-4 w-4 text-primary" /> Voice Settings
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Language</label>
                    <select value={browserLang} onChange={(e) => { setBrowserLang(e.target.value); setSelectedVoice(""); }}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {BROWSER_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Voice</label>
                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {voiceList.length > 0 ? voiceList.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                      )) : <option value="">Default</option>}
                    </select>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {([
                    { label: "Speed",  value: speed,  min: 0.5, max: 2.0, step: 0.1, set: setSpeed,   fmt: (v: number) => `${v.toFixed(1)}x` },
                    { label: "Pitch",  value: pitch,  min: 0.5, max: 2.0, step: 0.1, set: setPitch,   fmt: (v: number) => `${v.toFixed(1)}x` },
                    { label: "Volume", value: volume, min: 0.1, max: 1.0, step: 0.1, set: setVolume,  fmt: (v: number) => `${Math.round(v * 100)}%` },
                  ] as const).map(({ label, value, min, max, step, set, fmt }) => (
                    <div key={label}>
                      <div className="mb-1.5 flex justify-between">
                        <label className="text-xs font-medium text-foreground-muted">{label}</label>
                        <span className="text-xs font-semibold text-foreground">{fmt(value)}</span>
                      </div>
                      <input type="range" min={min} max={max} step={step} value={value}
                        onChange={(e) => set(parseFloat(e.target.value) as never)}
                        className="w-full accent-primary" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Player */}
              <div className="rounded-2xl border border-card-border bg-card p-6">
                <div className="mb-4 h-1.5 rounded-full bg-background-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                </div>
                <p className={clsx("mb-5 text-center text-sm font-medium",
                  isPlaying ? "text-emerald-500" : isPaused ? "text-amber-500" : browserDone ? "text-emerald-500" : "text-foreground-muted")}>
                  {browserDone && <CheckCircle className="inline h-4 w-4 mr-1 mb-0.5" />}
                  {isPlaying ? "Speaking..." : isPaused ? "Paused" : browserDone ? "Done!" : "Press play to listen"}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={handleBrowserStop} disabled={!isPlaying && !isPaused}
                    className={clsx("flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                      isPlaying || isPaused ? "border-border hover:border-red-400 hover:text-red-500 text-foreground-muted" : "border-border opacity-30 cursor-not-allowed text-foreground-subtle")}>
                    <Square className="h-5 w-5" fill="currentColor" />
                  </button>
                  <button onClick={isPlaying ? handleBrowserPause : handleBrowserPlay}
                    disabled={!text.trim() || isOverLimit || !browserSupported}
                    className={clsx("flex h-[68px] w-[68px] items-center justify-center rounded-full transition-all",
                      "bg-gradient-to-br from-primary to-violet-500 text-white shadow-lg hover:opacity-90 active:scale-95",
                      "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100")}>
                    {isPlaying ? <Pause className="h-7 w-7" fill="currentColor" /> : <Play className="h-7 w-7 ml-0.5" fill="currentColor" />}
                  </button>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border text-foreground-subtle">
                    <Volume2 className="h-5 w-5" />
                  </div>
                </div>
                {browserError && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-xs text-red-600 dark:text-red-400">{browserError}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-card-border bg-card/50 p-4">
                <p className="flex items-start gap-2 text-xs text-foreground-subtle">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                  100% private — uses your browser&apos;s built-in speech engine. No data sent to any server. Best results in Chrome or Edge.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
