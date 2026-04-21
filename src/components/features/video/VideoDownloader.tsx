"use client";

import React, { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";
import {
  Download,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Music,
  Video,
  Play,
  Clock,
  Eye,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoInfo {
  title: string;
  author: string;
  duration: string;
  views: string | null;
  platform: string;
  thumbnail: string | null;
}

interface QualityOption {
  id: string;
  label: string;
  format: "mp4" | "mp3" | "webm";
  badge?: string;
  badgeColor?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SUPPORTED_PLATFORMS = [
  "YouTube", "Instagram", "TikTok", "Facebook",
  "Twitter/X", "Vimeo", "Pinterest", "Dailymotion", "Twitch", "Reddit",
];

const QUALITY_OPTIONS: QualityOption[] = [
  { id: "1080p", label: "1080p Full HD", format: "mp4",  badge: "Best",    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { id: "720p",  label: "720p HD",       format: "mp4",  badge: "Popular", badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { id: "480p",  label: "480p",          format: "mp4" },
  { id: "360p",  label: "360p",          format: "mp4",  badge: "Small",   badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { id: "mp3",   label: "MP3 Audio",     format: "mp3",  badge: "Audio",   badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { id: "4k",    label: "4K Ultra HD",   format: "mp4",  badge: "4K",      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
];

// ─── Platform detection ───────────────────────────────────────────────────────

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("instagram.com"))  return "Instagram";
  if (u.includes("tiktok.com"))     return "TikTok";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "Facebook";
  if (u.includes("twitter.com") || u.includes("x.com"))     return "Twitter/X";
  if (u.includes("vimeo.com"))      return "Vimeo";
  if (u.includes("pinterest.com"))  return "Pinterest";
  if (u.includes("dailymotion.com"))return "Dailymotion";
  if (u.includes("twitch.tv"))      return "Twitch";
  if (u.includes("reddit.com"))     return "Reddit";
  return "";
}

const PLATFORM_COLORS: Record<string, string> = {
  "YouTube":     "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  "Instagram":   "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  "TikTok":      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "Facebook":    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "Twitter/X":   "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  "Vimeo":       "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  "Pinterest":   "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  "Dailymotion": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "Twitch":      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  "Reddit":      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function VideoDownloader({ tool }: { tool: Tool }) {
  const [url, setUrl]                 = useState("");
  const [isFetching, setIsFetching]   = useState(false);
  const [videoInfo, setVideoInfo]     = useState<VideoInfo | null>(null);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [selectedQuality, setQuality] = useState("720p");
  const [isDownloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const platform = url.trim() ? detectPlatform(url) : "";
  const selectedOpt = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) ?? QUALITY_OPTIONS[1];

  const RENDER_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

  function buildStreamUrl(extra = "") {
    return (
      `${RENDER_BASE}/video/download` +
      `?url=${encodeURIComponent(url.trim())}` +
      `&quality=${encodeURIComponent(selectedQuality)}` +
      `&_t=${Date.now()}` +
      extra
    );
  }

  // ── Fetch video info ──────────────────────────────────────────────────────
  async function handleFetch() {
    if (!url.trim()) return;
    setIsFetching(true);
    setVideoInfo(null);
    setFetchError(null);
    setDownloadDone(false);
    setDownloadError(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const res  = await fetch("/api/video/info", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: url.trim() }),
        signal:  controller.signal,
      });
      const json = await res.json() as { success: boolean; message?: string; data?: VideoInfo };
      if (!res.ok || !json.success) throw new Error(json.message || "Could not fetch video info.");
      setVideoInfo(json.data!);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Failed to fetch video info.";
      setFetchError(
        msg.includes("aborted") || msg.includes("AbortError")
          ? "Request timed out. The server may be starting up — please try again."
          : msg
      );
    } finally {
      clearTimeout(timer);
      setIsFetching(false);
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────
  async function handleDownload() {
    if (isDownloading || downloadDone) return;
    setDownloading(true);
    setDownloadError(null);

    const isYouTube = /youtube\.com|youtu\.be/.test(url.trim());

    try {
      if (isYouTube) {
        // YouTube: yt-dlp handles it reliably — navigate directly to stream
        window.location.href = buildStreamUrl();
      } else {
        // Non-YouTube: validate first (Cobalt parallel + yt-dlp fallback, max 45s)
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 50_000);
        const validateRes = await fetch(buildStreamUrl("&validate=1"), { signal: controller.signal });
        clearTimeout(timer);

        const data = await validateRes.json() as { success: boolean; message?: string; directUrl?: string };
        if (!data.success) throw new Error(data.message || "This video cannot be downloaded. Check the URL and try again.");

        window.location.href = data.directUrl ?? buildStreamUrl();
      }

      setTimeout(() => { setDownloading(false); setDownloadDone(true); }, 3_000);
    } catch (err: unknown) {
      const e = err as Error;
      setDownloadError(
        e.name === "AbortError"
          ? "Request timed out. The server may be starting up — please try again in a moment."
          : (e.message || "Download failed. Please try again.")
      );
      setDownloading(false);
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function handleReset() {
    setUrl(""); setVideoInfo(null); setFetchError(null);
    setIsFetching(false); setDownloading(false);
    setDownloadDone(false); setDownloadError(null);
    setQuality("720p");
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6 space-y-6">

        {/* ── Supported platforms ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Supported Platforms</p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_PLATFORMS.map((p) => (
              <span
                key={p}
                className={clsx(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  PLATFORM_COLORS[p] ?? "bg-muted text-foreground-muted border-border"
                )}
              >{p}</span>
            ))}
          </div>
        </div>

        {/* ── URL input ── */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground">Video URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setVideoInfo(null); setFetchError(null); setDownloadDone(false); setDownloadError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="Paste YouTube, Instagram, TikTok or any video URL…"
                className={clsx(
                  "w-full rounded-xl border bg-background px-4 py-3 pr-28 text-sm text-foreground placeholder:text-foreground-subtle",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors",
                  fetchError ? "border-red-400 dark:border-red-600" : "border-border"
                )}
              />
              {platform && (
                <span className={clsx(
                  "absolute right-3 top-1/2 -translate-y-1/2 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  PLATFORM_COLORS[platform] ?? "bg-muted text-foreground-muted border-border"
                )}>{platform}</span>
              )}
            </div>
            <Button
              onClick={handleFetch}
              disabled={!url.trim() || isFetching}
              className="shrink-0 gap-1.5"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isFetching ? "Fetching…" : "Get Info"}
            </Button>
          </div>

          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fetchError}</span>
            </motion.div>
          )}
        </div>

        {/* ── Video info card ── */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-card-border bg-background overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                {videoInfo.thumbnail ? (
                  <div className="relative w-32 h-20 shrink-0 rounded-xl overflow-hidden bg-muted">
                    <Image src={videoInfo.thumbnail} alt={videoInfo.title} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-6 h-6 text-white drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-20 shrink-0 rounded-xl bg-muted flex items-center justify-center">
                    <Video className="w-8 h-8 text-foreground-muted" />
                  </div>
                )}

                {/* Meta */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">{videoInfo.title}</p>
                  <p className="text-xs text-foreground-muted">{videoInfo.author}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {videoInfo.duration && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                        <Clock className="w-3 h-3" /> {videoInfo.duration}
                      </span>
                    )}
                    {videoInfo.views && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                        <Eye className="w-3 h-3" /> {videoInfo.views}
                      </span>
                    )}
                    {videoInfo.platform && (
                      <span className={clsx(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        PLATFORM_COLORS[videoInfo.platform] ?? "bg-muted text-foreground-muted border-border"
                      )}>{videoInfo.platform}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quality selector ── */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Format & Quality</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setQuality(opt.id)}
                className={clsx(
                  "relative flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all",
                  selectedQuality === opt.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-background hover:bg-background-subtle"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {opt.format === "mp3"
                    ? <Music className="w-3.5 h-3.5 text-amber-500" />
                    : <Video className="w-3.5 h-3.5 text-blue-500" />
                  }
                  <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                </div>
                {opt.badge && (
                  <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", opt.badgeColor)}>
                    {opt.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Download error ── */}
        <AnimatePresence>
          {downloadError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{downloadError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Download / Reset buttons ── */}
        <div className="flex gap-3">
          {downloadDone ? (
            <Button onClick={handleReset} variant="secondary" className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" /> Download Another
            </Button>
          ) : (
            <Button
              onClick={handleDownload}
              disabled={!url.trim() || isDownloading}
              className="flex-1 gap-2"
            >
              {isDownloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
              ) : downloadDone ? (
                <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
              ) : (
                <><Download className="w-4 h-4" /> Download {selectedOpt.format.toUpperCase()}</>
              )}
            </Button>
          )}
          {url.trim() && !downloadDone && (
            <Button onClick={handleReset} variant="ghost" size="icon" title="Clear">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* ── Note ── */}
        <p className="text-xs text-foreground-subtle text-center">
          Paste any video URL and click <strong>Get Info</strong> to preview, then choose quality and download.
          Works with YouTube, Instagram, TikTok, Facebook, Twitter/X and 100+ platforms.
        </p>

      </div>
    </div>
  );
}
