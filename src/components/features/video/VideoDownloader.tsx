"use client";

import React, { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";
import {
  Play,
  Download,
  CheckCircle2,
  Check,
  RefreshCw,
  Music,
  Video,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Platform {
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
}

interface QualityOption {
  id: string;
  label: string;
  format: "mp4" | "mp3" | "webm";
  badge?: string;
  badgeColor?: string;
  fileSize: string;
  resolution?: string;
}

interface VideoInfo {
  title: string;
  author: string;
  duration: string;
  views: string | null;
  platform: string;
  thumbnail: string | null;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PLATFORM_PILLS: Platform[] = [
  { name: "YouTube",     color: "bg-red-100 dark:bg-red-950/40",       textColor: "text-red-600 dark:text-red-400",       borderColor: "border-red-200 dark:border-red-800" },
  { name: "Instagram",   color: "bg-pink-100 dark:bg-pink-950/40",     textColor: "text-pink-600 dark:text-pink-400",     borderColor: "border-pink-200 dark:border-pink-800" },
  { name: "TikTok",      color: "bg-slate-100 dark:bg-slate-800/60",   textColor: "text-slate-700 dark:text-slate-300",   borderColor: "border-slate-200 dark:border-slate-700" },
  { name: "Facebook",    color: "bg-blue-100 dark:bg-blue-950/40",     textColor: "text-blue-600 dark:text-blue-400",     borderColor: "border-blue-200 dark:border-blue-800" },
  { name: "Twitter/X",   color: "bg-zinc-100 dark:bg-zinc-800/60",     textColor: "text-zinc-700 dark:text-zinc-300",     borderColor: "border-zinc-200 dark:border-zinc-700" },
  { name: "Pinterest",   color: "bg-red-100 dark:bg-red-950/40",       textColor: "text-red-600 dark:text-red-400",       borderColor: "border-red-200 dark:border-red-800" },
  { name: "Vimeo",       color: "bg-teal-100 dark:bg-teal-950/40",     textColor: "text-teal-600 dark:text-teal-400",     borderColor: "border-teal-200 dark:border-teal-800" },
  { name: "Dailymotion", color: "bg-blue-100 dark:bg-blue-950/40",     textColor: "text-blue-600 dark:text-blue-400",     borderColor: "border-blue-200 dark:border-blue-800" },
  { name: "Twitch",      color: "bg-purple-100 dark:bg-purple-950/40", textColor: "text-purple-600 dark:text-purple-400", borderColor: "border-purple-200 dark:border-purple-800" },
  { name: "Reddit",      color: "bg-orange-100 dark:bg-orange-950/40", textColor: "text-orange-600 dark:text-orange-400", borderColor: "border-orange-200 dark:border-orange-800" },
];

const QUALITY_OPTIONS: QualityOption[] = [
  { id: "4k",    label: "4K Ultra HD",   format: "mp4",  badge: "Best Quality", badgeColor: "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800", fileSize: "~3.2 GB",  resolution: "3840×2160" },
  { id: "1080p", label: "1080p Full HD", format: "mp4",  badge: "Recommended",  badgeColor: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",               fileSize: "~850 MB",  resolution: "1920×1080" },
  { id: "720p",  label: "720p HD",       format: "mp4",  badge: "Popular",      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",               fileSize: "~420 MB",  resolution: "1280×720"  },
  { id: "480p",  label: "480p",          format: "mp4",  badge: undefined,      badgeColor: undefined,                                                                                                              fileSize: "~220 MB",  resolution: "854×480"   },
  { id: "360p",  label: "360p",          format: "mp4",  badge: "Smallest",     badgeColor: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",         fileSize: "~80 MB",   resolution: "640×360"   },
  { id: "mp3",   label: "MP3 Audio",     format: "mp3",  badge: "Audio",        badgeColor: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",         fileSize: "~12 MB",   resolution: undefined   },
  { id: "webm",  label: "WebM 1080p",    format: "webm", badge: undefined,      badgeColor: undefined,                                                                                                              fileSize: "~600 MB",  resolution: "1920×1080" },
];

// ─────────────────────────────────────────────
// Platform detection
// ─────────────────────────────────────────────

function detectPlatform(url: string): { name: string; pill: Platform | null } {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return { name: "YouTube",     pill: PLATFORM_PILLS[0] };
  if (u.includes("instagram.com"))                          return { name: "Instagram",   pill: PLATFORM_PILLS[1] };
  if (u.includes("tiktok.com"))                             return { name: "TikTok",      pill: PLATFORM_PILLS[2] };
  if (u.includes("facebook.com") || u.includes("fb.watch"))return { name: "Facebook",    pill: PLATFORM_PILLS[3] };
  if (u.includes("twitter.com") || u.includes("x.com"))    return { name: "Twitter/X",   pill: PLATFORM_PILLS[4] };
  if (u.includes("pinterest.com"))                          return { name: "Pinterest",   pill: PLATFORM_PILLS[5] };
  if (u.includes("vimeo.com"))                              return { name: "Vimeo",       pill: PLATFORM_PILLS[6] };
  if (u.includes("dailymotion.com"))                        return { name: "Dailymotion", pill: PLATFORM_PILLS[7] };
  if (u.includes("twitch.tv"))                              return { name: "Twitch",      pill: PLATFORM_PILLS[8] };
  if (u.includes("reddit.com"))                             return { name: "Reddit",      pill: PLATFORM_PILLS[9] };
  return { name: "Unknown", pill: null };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function PlatformPill({ platform }: { platform: Platform }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
      platform.color, platform.textColor, platform.borderColor
    )}>
      {platform.name}
    </span>
  );
}

function FormatBadge({ format }: { format: "mp4" | "mp3" | "webm" }) {
  const styles: Record<string, string> = {
    mp4:  "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    mp3:  "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    webm: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
  };
  return (
    <span className={clsx(
      "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      styles[format]
    )}>
      {format}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function VideoDownloader({ tool }: { tool: Tool }) {
  const [url, setUrl]                     = useState("");
  const [isFetching, setIsFetching]       = useState(false);
  const [videoInfo, setVideoInfo]         = useState<VideoInfo | null>(null);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadDone, setDownloadDone]   = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const detected = url.trim() ? detectPlatform(url) : null;
  const selectedOption = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) ?? QUALITY_OPTIONS[2];

  // ── Fetch real video info from backend ──
  async function handleFetch() {
    if (!url.trim()) return;
    setIsFetching(true);
    setVideoInfo(null);
    setFetchError(null);
    setDownloadDone(false);
    setDownloadProgress(0);
    setDownloadError(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/video/info`;

      const res = await fetch(apiUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not fetch video info.");
      }

      setVideoInfo(json.data);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch video info.");
    } finally {
      setIsFetching(false);
    }
  }

  // ── Download real video from backend ──
  async function handleDownload() {
    if (isDownloading || downloadDone) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/video/download`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), quality: selectedQuality }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Server error ${res.status}`);
      }

      // Stream response with progress tracking
      const contentLength = res.headers.get("Content-Length");
      const totalBytes    = contentLength ? parseInt(contentLength, 10) : 0;
      const reader        = res.body!.getReader();
      const chunks: ArrayBuffer[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
        loaded += value.length;
        if (totalBytes > 0) {
          setDownloadProgress(Math.min(Math.round((loaded / totalBytes) * 100), 99));
        } else {
          // No Content-Length — show indeterminate progress
          setDownloadProgress((prev) => Math.min(prev + 2, 90));
        }
      }

      setDownloadProgress(100);

      // Trigger browser download
      const mimeType =
        selectedOption.format === "mp3"  ? "audio/mpeg" :
        selectedOption.format === "webm" ? "video/webm" : "video/mp4";

      const blob    = new Blob(chunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = blobUrl;
      a.download    = `toolhive_video.${selectedOption.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadDone(true);
      }, 300);

    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : "Download failed. Please try again.");
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }

  // ── Reset ──
  function handleReset() {
    setUrl("");
    setVideoInfo(null);
    setFetchError(null);
    setIsFetching(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    setDownloadDone(false);
    setDownloadError(null);
    setSelectedQuality("720p");
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6 space-y-6">

        {/* ── Supported Platforms ── */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
            Supported Platforms
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_PILLS.map((p) => (
              <PlatformPill key={p.name} platform={p} />
            ))}
          </div>
        </div>

        {/* ── URL Input ── */}
        <div className="rounded-2xl border border-card-border bg-background p-5 space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Video URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setVideoInfo(null);
                setFetchError(null);
                setDownloadDone(false);
                setDownloadProgress(0);
                setDownloadError(null);
              }}
              placeholder="Paste video URL here... (YouTube, Instagram, TikTok, Facebook...)"
              className="border-2 border-border rounded-2xl px-5 py-4 text-base bg-background w-full focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-foreground-muted transition-all"
            />

            {/* Platform detection badge */}
            <AnimatePresence>
              {detected && url.trim() && (
                <motion.div
                  key="platform-badge"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  {detected.pill ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="text-sm text-foreground-muted">Platform detected:</span>
                      <PlatformPill platform={detected.pill} />
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Unknown platform — please check the URL
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fetch error */}
            {fetchError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{fetchError}</p>
              </div>
            )}
          </div>

          <Button
            variant="gradient"
            size="lg"
            fullWidth
            isLoading={isFetching}
            loadingText="Fetching video info..."
            disabled={!url.trim() || isFetching}
            onClick={handleFetch}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 shadow-md"
          >
            {!isFetching && <Video className="h-4 w-4" />}
            {isFetching ? "Fetching video info..." : "Fetch Video Info"}
          </Button>
        </div>

        {/* ── Video Info + Quality + Download ── */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div
              key="video-info"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-5"
            >
              {/* Video Info Card */}
              <div className="rounded-2xl border border-card-border bg-background overflow-hidden">
                {/* Thumbnail — real image or fallback gradient */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  {videoInfo.thumbnail ? (
                    <Image
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="rounded-full bg-white/20 backdrop-blur-sm p-5 shadow-lg">
                      <Play className="h-10 w-10 text-white fill-white" />
                    </div>
                  )}
                  {/* Play icon overlay */}
                  {videoInfo.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="rounded-full bg-black/40 backdrop-blur-sm p-4">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                  )}
                  {/* Duration badge */}
                  <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {videoInfo.duration}
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2">
                    {videoInfo.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
                    <span>{videoInfo.author}</span>
                    {videoInfo.views && (
                      <>
                        <span className="text-border">•</span>
                        <span>{videoInfo.views}</span>
                      </>
                    )}
                    <span className="text-border">•</span>
                    <span>{videoInfo.duration}</span>
                    <span className="text-border">•</span>
                    <span className="capitalize">{videoInfo.platform}</span>
                  </div>
                </div>
              </div>

              {/* Quality Selection */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Select Quality &amp; Format</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {QUALITY_OPTIONS.map((opt) => {
                    const isSelected = selectedQuality === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedQuality(opt.id)}
                        className={clsx(
                          "relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
                          "hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30",
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-sm"
                            : "border-border bg-background-subtle"
                        )}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                            <Check className="h-3 w-3 text-white" />
                          </span>
                        )}
                        <span className={clsx(
                          "flex h-7 w-7 items-center justify-center rounded-lg",
                          opt.format === "mp3" ? "bg-amber-100 dark:bg-amber-950/40"
                            : opt.format === "webm" ? "bg-teal-100 dark:bg-teal-950/40"
                            : "bg-blue-100 dark:bg-blue-950/40"
                        )}>
                          {opt.format === "mp3"
                            ? <Music className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            : <Video className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          }
                        </span>
                        <span className={clsx(
                          "text-xs font-bold leading-tight",
                          isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-foreground"
                        )}>
                          {opt.label}
                        </span>
                        <FormatBadge format={opt.format} />
                        <span className="text-[11px] text-foreground-muted">{opt.fileSize}</span>
                        {opt.badge && (
                          <span className={clsx(
                            "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium",
                            opt.badgeColor
                          )}>
                            {opt.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Download error */}
              {downloadError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{downloadError}</p>
                </div>
              )}

              {/* Download / Progress / Success */}
              <AnimatePresence mode="wait">
                {downloadDone ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-5 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-green-800 dark:text-green-200">
                          Download Complete!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Check your Downloads folder
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-green-100/60 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">File</span>
                        <span className="font-medium text-foreground">
                          toolhive_video.{selectedOption.format}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">Format</span>
                        <FormatBadge format={selectedOption.format} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">Quality</span>
                        <span className="font-medium text-foreground">{selectedOption.label}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="md" fullWidth onClick={handleReset}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Download Another Video
                    </Button>
                  </motion.div>

                ) : isDownloading ? (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-card-border bg-background p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Downloading {selectedOption.label}...
                      </span>
                      <span className="font-bold text-primary tabular-nums">
                        {downloadProgress}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-background-subtle border border-border">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${downloadProgress}%` }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                    <p className="text-xs text-foreground-muted text-center">
                      Processing video on server — this may take a moment for large files...
                    </p>
                  </motion.div>

                ) : (
                  <motion.div
                    key="download-btn"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="gradient"
                      size="xl"
                      fullWidth
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 shadow-lg text-base font-semibold"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Now
                    </Button>
                    <p className="mt-2 text-center text-xs text-foreground-muted">
                      {selectedOption.label}&nbsp;&bull;&nbsp;{selectedOption.format.toUpperCase()}&nbsp;&bull;&nbsp;{selectedOption.fileSize}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <p className="text-xs text-foreground-muted text-center leading-relaxed border-t border-border pt-4">
          ToolHive processes video downloads for personal, non-commercial use only. Respect copyright and platform terms of service.
        </p>

      </div>
    </div>
  );
}
