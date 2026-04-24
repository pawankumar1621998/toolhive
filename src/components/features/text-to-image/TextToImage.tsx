"use client";

import React, { useState, useCallback } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Download, RefreshCw, Loader2, Copy, Check,
  ImageIcon, Settings, Wand2, AlertCircle,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const STYLE_PRESETS = [
  { id: "realistic",  label: "Photorealistic", suffix: "photorealistic, ultra detailed, professional photography, 8k resolution" },
  { id: "digital",   label: "Digital Art",     suffix: "digital art, concept art, trending on artstation, vibrant colors" },
  { id: "oil",       label: "Oil Painting",    suffix: "oil painting, textured brushstrokes, classical art masterpiece" },
  { id: "watercolor",label: "Watercolor",      suffix: "watercolor painting, soft edges, delicate colors, artistic" },
  { id: "anime",     label: "Anime",           suffix: "anime style, manga illustration, vibrant, studio ghibli inspired" },
  { id: "cinematic", label: "Cinematic",       suffix: "cinematic lighting, movie scene, dramatic composition, film grain" },
  { id: "fantasy",   label: "Fantasy",         suffix: "fantasy art, magical, ethereal, intricate detailed illustration" },
  { id: "minimal",   label: "Minimalist",      suffix: "minimalist design, clean lines, simple composition, modern aesthetic" },
] as const;

const ASPECT_RATIOS = [
  { id: "1:1",  label: "Square",    w: 1024, h: 1024 },
  { id: "16:9", label: "Landscape", w: 1024, h: 576  },
  { id: "9:16", label: "Portrait",  w: 576,  h: 1024 },
  { id: "4:3",  label: "Standard",  w: 1024, h: 768  },
] as const;

const QUALITY_OPTS = [
  { id: "fast",     label: "Fast",     steps: 4,  desc: "~5s"  },
  { id: "balanced", label: "Balanced", steps: 10, desc: "~12s" },
  { id: "quality",  label: "Quality",  steps: 20, desc: "~25s" },
] as const;

const EXAMPLE_PROMPTS = [
  "A majestic lion at golden hour in the African savanna",
  "A futuristic city with flying cars and neon lights at night",
  "A cozy cabin surrounded by snowy pine trees",
  "An astronaut floating above a colorful nebula",
  "A dragon breathing fire over a medieval castle",
  "A serene Japanese garden with cherry blossoms",
];

type AspectRatio = (typeof ASPECT_RATIOS)[number]["id"];
type Quality = (typeof QUALITY_OPTS)[number]["id"];

interface GenResult {
  image: string;
  seed: number;
  width: number;
  height: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TextToImage() {
  const [prompt, setPrompt]           = useState("");
  const [activeStyle, setActiveStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality, setQuality]         = useState<Quality>("fast");
  const [seed, setSeed]               = useState("");
  const [generating, setGenerating]   = useState(false);
  const [error, setError]             = useState("");
  const [result, setResult]           = useState<GenResult | null>(null);
  const [copied, setCopied]           = useState(false);

  const buildPrompt = useCallback(() => {
    const style = STYLE_PRESETS.find((s) => s.id === activeStyle);
    const base = prompt.trim();
    return style ? `${base}, ${style.suffix}` : base;
  }, [prompt, activeStyle]);

  async function handleGenerate() {
    const p = buildPrompt();
    if (!p) return;
    setGenerating(true);
    setError("");
    setResult(null);

    const steps = QUALITY_OPTS.find((q) => q.id === quality)?.steps ?? 4;
    const seedNum = seed ? parseInt(seed, 10) : undefined;

    try {
      const res = await fetch("/api/ai/text-to-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, aspectRatio, steps, seed: seedNum }),
      });
      const data = await res.json() as { image?: string; seed?: number; width?: number; height?: number; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");
      setResult(data as GenResult);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${result.image}`;
    a.download = `toolhive-ai-${result.seed}.png`;
    a.click();
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const arConfig = ASPECT_RATIOS.find((a) => a.id === aspectRatio)!;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 px-4 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by NVIDIA FLUX AI
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">AI Image Generator</h1>
        <p className="mt-2 text-foreground-muted">Turn your words into stunning images in seconds — free</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: Controls ── */}
        <div className="flex flex-col gap-4">

          {/* Prompt */}
          <div className="rounded-2xl border border-card-border bg-card p-5">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Wand2 className="h-4 w-4 text-violet-500" />
              Describe your image
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic dragon flying over snow-capped mountains at golden hour, dramatic lighting..."
              rows={4}
              className={clsx(
                "w-full resize-none rounded-xl border border-border bg-background",
                "p-3 text-sm text-foreground placeholder:text-foreground-subtle",
                "focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400/60",
                "transition-colors"
              )}
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground-muted hover:border-violet-400/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  {ex.split(" ").slice(0, 5).join(" ")}…
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div className="rounded-2xl border border-card-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold text-foreground">🎨 Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setActiveStyle(activeStyle === style.id ? "" : style.id)}
                  className={clsx(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                    activeStyle === style.id
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm"
                      : "border border-border bg-background-muted text-foreground-muted hover:text-foreground hover:border-border-strong"
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="rounded-2xl border border-card-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold text-foreground">📐 Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                    aspectRatio === ar.id
                      ? "border-violet-400 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                      : "border-border bg-background-muted text-foreground-muted hover:border-border-strong hover:text-foreground"
                  )}
                >
                  {/* Visual aspect ratio indicator */}
                  <div
                    className={clsx(
                      "rounded border-2 border-current",
                      aspectRatio === ar.id ? "border-violet-400" : "border-current opacity-50"
                    )}
                    style={{
                      width:  ar.id === "9:16" ? 12 : ar.id === "1:1" ? 16 : 22,
                      height: ar.id === "9:16" ? 22 : ar.id === "1:1" ? 16 : ar.id === "4:3" ? 14 : 12,
                    }}
                  />
                  <span>{ar.id}</span>
                  <span className="text-[10px] opacity-60">{ar.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality + Seed row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-card-border bg-card p-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">⚡ Quality</label>
              <div className="flex flex-col gap-1.5">
                {QUALITY_OPTS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    className={clsx(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all",
                      quality === q.id
                        ? "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-700"
                        : "border border-border bg-background-muted text-foreground-muted hover:text-foreground"
                    )}
                  >
                    <span>{q.label}</span>
                    <span className="opacity-60">{q.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-card-border bg-card p-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                🎲 Seed
                <span className="ml-1 text-xs text-foreground-subtle font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random"
                className={clsx(
                  "w-full rounded-xl border border-border bg-background px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-foreground-subtle",
                  "focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400/60"
                )}
              />
              <p className="mt-2 text-xs text-foreground-subtle leading-relaxed">
                Same seed + prompt = same image
              </p>
              {result && (
                <button
                  onClick={() => setSeed(String(result.seed))}
                  className="mt-2 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Use last seed: {result.seed}
                </button>
              )}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className={clsx(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-4",
              "text-base font-semibold text-white",
              "bg-gradient-to-r from-violet-500 to-purple-600",
              "shadow-lg hover:opacity-90 hover:shadow-xl",
              "transition-all duration-200 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            )}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating image...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* ── Right: Result ── */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-card-border bg-card p-8"
                style={{
                  aspectRatio: `${arConfig.w} / ${arConfig.h}`,
                  minHeight: 280,
                }}
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-500 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Creating your image</p>
                  <p className="mt-1 text-sm text-foreground-muted">NVIDIA FLUX AI is working its magic...</p>
                </div>
                <div className="w-full max-w-48 h-1.5 rounded-full bg-background-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-card-border bg-card overflow-hidden"
              >
                {/* Image */}
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${result.image}`}
                    alt="AI generated image"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-white shadow-lg"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Save PNG
                    </button>
                  </div>
                </div>

                {/* Actions bar */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-foreground-subtle">
                    <span className="font-mono">{result.seed}</span>
                    <span className="mx-1.5 opacity-40">·</span>
                    {result.width}×{result.height}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy prompt"}
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-8 text-center"
                style={{ minHeight: 240 }}
              >
                <AlertCircle className="h-10 w-10 text-red-500" />
                <div>
                  <p className="font-semibold text-foreground">Generation Failed</p>
                  <p className="mt-1 text-sm text-foreground-muted">{error}</p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-card-border bg-card/50 p-8 text-center"
                style={{ minHeight: 380 }}
              >
                <div className="rounded-2xl bg-background-muted p-4">
                  <ImageIcon className="h-10 w-10 text-foreground-subtle" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Your image will appear here</p>
                  <p className="mt-1 text-sm text-foreground-muted">Enter a prompt and hit Generate</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {["Photorealistic", "Anime", "Fantasy", "Cinematic", "Watercolor"].map((s) => (
                    <span key={s} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground-subtle">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="rounded-2xl border border-card-border bg-card p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Settings className="h-3.5 w-3.5 text-violet-500" />
              Pro Tips for Better Results
            </p>
            <ul className="space-y-1.5 text-xs text-foreground-muted">
              <li>• Be specific: add lighting, angle, mood ("golden hour", "aerial view")</li>
              <li>• Add details: "ultra detailed, 8k, sharp focus, high quality"</li>
              <li>• Save the seed to recreate or refine your favorite images</li>
              <li>• Portrait 9:16 is best for people & characters</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
