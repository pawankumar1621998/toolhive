"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";
import {
  Download, Search, AlertCircle, Loader2, CheckCircle2,
  RefreshCw, Music, Video, Play, Clock, Eye, Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  format: "mp4" | "mp3";
  badge?: string;
  badgeColor?: string;
}

// ─── Platform config ──────────────────────────────────────────────────────────

interface PlatformConfig {
  name: string;
  badgeClass: string;
  borderClass: string;
  btnClass: string;
  domains: RegExp;
  urlPlaceholder: string;
  tips: string[];
  qualities: QualityOption[];
  defaultQuality: string;
  directDownload?: boolean;   // skip validate step, navigate directly
  limitedSupport?: string;    // show a warning banner if set
}

const YOUTUBE_QUALITIES: QualityOption[] = [
  { id: "4k",    label: "4K Ultra HD", format: "mp4", badge: "4K",      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  { id: "1080p", label: "1080p Full HD",format: "mp4", badge: "Best",   badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { id: "720p",  label: "720p HD",      format: "mp4", badge: "Popular",badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { id: "480p",  label: "480p",         format: "mp4" },
  { id: "360p",  label: "360p",         format: "mp4", badge: "Small",  badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { id: "mp3",   label: "MP3 Audio",    format: "mp3", badge: "Audio",  badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
];

const SOCIAL_QUALITIES: QualityOption[] = [
  { id: "1080p", label: "1080p HD",  format: "mp4", badge: "Best",    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { id: "720p",  label: "720p",      format: "mp4", badge: "Popular", badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { id: "480p",  label: "480p",      format: "mp4" },
  { id: "360p",  label: "360p",      format: "mp4", badge: "Small",   badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { id: "mp3",   label: "MP3 Audio", format: "mp3", badge: "Audio",   badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
];

const VIMEO_QUALITIES: QualityOption[] = [
  { id: "1080p", label: "1080p Full HD", format: "mp4", badge: "Best",    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { id: "720p",  label: "720p HD",       format: "mp4", badge: "Popular", badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { id: "480p",  label: "480p",          format: "mp4" },
  { id: "mp3",   label: "MP3 Audio",     format: "mp3", badge: "Audio",   badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
];

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  youtube: {
    name: "YouTube",
    badgeClass: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    borderClass: "border-red-200 dark:border-red-800",
    btnClass: "bg-red-600 hover:bg-red-700 text-white",
    domains: /youtube\.com|youtu\.be/i,
    urlPlaceholder: "Paste YouTube video URL — e.g. https://youtube.com/watch?v=...",
    tips: ["Works with YouTube Shorts, regular videos, and playlists", "MP3 option extracts audio only", "4K quality needs good internet speed"],
    qualities: YOUTUBE_QUALITIES,
    defaultQuality: "720p",
    directDownload: true,
  },
  instagram: {
    name: "Instagram",
    badgeClass: "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    borderClass: "border-pink-200 dark:border-pink-800",
    btnClass: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
    domains: /instagram\.com/i,
    urlPlaceholder: "Paste Instagram Reel or post URL — e.g. https://instagram.com/reel/...",
    tips: ["Tap the 3-dot menu on Instagram post → Copy Link", "Only public posts can be downloaded", "Private accounts and Stories cannot be downloaded"],
    qualities: SOCIAL_QUALITIES,
    defaultQuality: "720p",
    limitedSupport: "Instagram requires account login to access videos. Only fully public posts from public accounts may work. Private or login-protected content will fail.",
  },
  facebook: {
    name: "Facebook",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    borderClass: "border-blue-200 dark:border-blue-800",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
    domains: /facebook\.com|fb\.watch/i,
    urlPlaceholder: "Paste Facebook video URL — e.g. https://facebook.com/watch/?v=... or fb.watch/...",
    tips: ["Use the public watch URL format: facebook.com/watch/?v=VIDEO_ID", "Also supports fb.watch short links", "Private/friends-only videos cannot be downloaded"],
    qualities: SOCIAL_QUALITIES,
    defaultQuality: "720p",
    limitedSupport: "Facebook video downloads work for some public videos. Due to Facebook's anti-scraping measures, some videos may fail. Try the fb.watch short link format for best results.",
  },
  tiktok: {
    name: "TikTok",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
    borderClass: "border-slate-200 dark:border-slate-700",
    btnClass: "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white",
    domains: /tiktok\.com/i,
    urlPlaceholder: "Paste TikTok video URL — e.g. https://tiktok.com/@user/video/123...",
    tips: ["Tap Share on any TikTok video → Copy Link", "Downloads WITHOUT TikTok watermark", "Paste URL and click Download — no preview needed"],
    qualities: SOCIAL_QUALITIES,
    defaultQuality: "720p",
    directDownload: true,
  },
  twitter: {
    name: "Twitter / X",
    badgeClass: "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600",
    borderClass: "border-zinc-200 dark:border-zinc-700",
    btnClass: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900",
    domains: /twitter\.com|x\.com/i,
    urlPlaceholder: "Paste Twitter / X tweet URL — e.g. https://x.com/user/status/123...",
    tips: ["Must be a tweet that contains a video (not just text/images)", "Get the URL from the browser address bar", "Works with twitter.com and x.com links"],
    qualities: SOCIAL_QUALITIES,
    defaultQuality: "720p",
    limitedSupport: "Only tweets that contain a native video can be downloaded. Text-only tweets and external YouTube embeds won't work. Make sure your tweet URL contains a video.",
  },
  vimeo: {
    name: "Vimeo",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
    borderClass: "border-teal-200 dark:border-teal-800",
    btnClass: "bg-teal-600 hover:bg-teal-700 text-white",
    domains: /vimeo\.com/i,
    urlPlaceholder: "Paste Vimeo video URL — e.g. https://vimeo.com/123456789",
    tips: ["Only public Vimeo videos can be downloaded", "Password-protected videos are not supported", "High-quality downloads available up to 1080p"],
    qualities: VIMEO_QUALITIES,
    defaultQuality: "720p",
    directDownload: true,
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function VideoDownloader({ tool }: { tool: Tool }) {
  const cfg = PLATFORM_CONFIGS[tool.slug] ?? PLATFORM_CONFIGS["youtube"];

  const [url, setUrl]                     = useState("");
  const [isFetching, setIsFetching]       = useState(false);
  const [videoInfo, setVideoInfo]         = useState<VideoInfo | null>(null);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [wrongPlatform, setWrongPlatform] = useState(false);
  const [selectedQuality, setQuality]     = useState(cfg.defaultQuality);
  const [isDownloading, setDownloading]   = useState(false);
  const [downloadDone, setDownloadDone]   = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Reset quality when tool changes
  useEffect(() => {
    setQuality(cfg.defaultQuality);
  }, [cfg.defaultQuality]);

  function handleUrlChange(val: string) {
    setUrl(val);
    setVideoInfo(null);
    setFetchError(null);
    setDownloadDone(false);
    setDownloadError(null);
    setWrongPlatform(val.trim() !== "" && !cfg.domains.test(val.trim()));
  }

  async function handleFetch() {
    if (!url.trim() || wrongPlatform) return;
    setIsFetching(true);
    setVideoInfo(null);
    setFetchError(null);
    setDownloadDone(false);
    setDownloadError(null);

    try {
      const res = await fetch("/api/video/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: AbortSignal.timeout(30_000),
      });
      const json = await res.json() as { success: boolean; message?: string; data?: VideoInfo };
      if (!res.ok || !json.success) throw new Error(json.message || "Could not fetch video info.");
      setVideoInfo(json.data!);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Failed to fetch video info.";
      setFetchError(
        msg.includes("aborted") || msg.includes("TimeoutError")
          ? "Preview timed out. You can still try downloading below."
          : msg
      );
    } finally {
      setIsFetching(false);
    }
  }

  async function handleDownload() {
    if (isDownloading || downloadDone) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      const res = await fetch("/api/video/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), quality: selectedQuality }),
        signal: AbortSignal.timeout(40_000),
      });
      const json = await res.json() as {
        success: boolean; message?: string; guidance?: boolean;
        downloadUrl?: string; filename?: string;
      };

      if (!json.success) {
        // Platform returned guidance (Instagram/Facebook)
        throw new Error(json.message ?? "Download failed.");
      }

      if (!json.downloadUrl) throw new Error("No download URL returned.");

      // Trigger browser download
      const a = document.createElement("a");
      a.href = json.downloadUrl;
      a.download = json.filename ?? "video.mp4";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloading(false);
      setDownloadDone(true);
    } catch (err: unknown) {
      const e = err as Error;
      setDownloadError(
        e.name === "AbortError" || e.name === "TimeoutError"
          ? "Request timed out. Please try again."
          : (e.message || "Download failed. Please try again.")
      );
      setDownloading(false);
    }
  }

  function handleReset() {
    setUrl(""); setVideoInfo(null); setFetchError(null);
    setIsFetching(false); setDownloading(false);
    setDownloadDone(false); setDownloadError(null);
    setWrongPlatform(false);
    setQuality(cfg.defaultQuality);
  }

  const selectedOpt = cfg.qualities.find((q) => q.id === selectedQuality) ?? cfg.qualities[1];

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6 space-y-6">

        {/* Platform badge */}
        <div className="flex items-center gap-3">
          <span className={clsx("inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold", cfg.badgeClass)}>
            {cfg.name} Downloader
          </span>
          <span className="text-xs text-foreground-muted">Free · No signup · HD quality</span>
        </div>

        {/* Limited support warning */}
        {cfg.limitedSupport && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{cfg.limitedSupport}</span>
          </div>
        )}

        {/* Direct download hint for TikTok */}
        {cfg.directDownload && tool.slug === "tiktok" && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Paste the TikTok URL and click <strong>Download</strong> directly — no need to click &quot;Get Info&quot; first.</span>
          </div>
        )}

        {/* URL input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">{cfg.name} Video URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder={cfg.urlPlaceholder}
                className={clsx(
                  "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors",
                  wrongPlatform ? "border-amber-400 dark:border-amber-600" : fetchError ? "border-red-400 dark:border-red-600" : "border-border"
                )}
              />
            </div>
            <Button
              onClick={handleFetch}
              disabled={!url.trim() || isFetching || wrongPlatform}
              className="shrink-0 gap-1.5"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isFetching ? "Fetching…" : "Get Info"}
            </Button>
          </div>

          {/* Wrong platform warning */}
          {wrongPlatform && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>This doesn&apos;t look like a {cfg.name} URL. Please paste a link from {cfg.name}.</span>
            </motion.div>
          )}

          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
                cfg.directDownload
                  ? "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                  : "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-700 dark:text-red-300"
              )}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fetchError}</span>
            </motion.div>
          )}
        </div>

        {/* Video info card */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={clsx("rounded-2xl border bg-background overflow-hidden", cfg.borderClass)}
            >
              <div className="flex gap-4 p-4">
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
                    <span className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg.badgeClass)}>
                      {cfg.name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality selector */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Format & Quality</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cfg.qualities.map((opt) => (
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

        {/* Download error */}
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

        {/* Download / Reset buttons */}
        <div className="flex gap-3">
          {downloadDone ? (
            <Button onClick={handleReset} variant="secondary" className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" /> Download Another
            </Button>
          ) : (
            <Button
              onClick={handleDownload}
              disabled={!url.trim() || wrongPlatform || isDownloading}
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

        {/* Platform tips */}
        <div className="rounded-xl border border-border bg-background-subtle p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" /> How to get the {cfg.name} URL
          </div>
          <ul className="space-y-1">
            {cfg.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground-muted">
                <span className="mt-0.5 text-primary font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
