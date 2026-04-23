"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Scissors, Upload, Play, Pause, Plus, Trash2, Download,
  Sparkles, Loader2, ChevronRight, Film, Clock, X, Check,
  Link as LinkIcon, AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useAIGenerate } from "@/hooks/useAIGenerate";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clip {
  id: string;
  label: string;
  start: number;
  end: number;
  status: "pending" | "extracting" | "done" | "error";
  blob?: string;
}

interface VideoMeta {
  title: string;
  author: string;
  duration: string;
  thumbnail: string | null;
  platform: string;
}

type InputMode = "file" | "url";

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function parseTimeInput(val: string, duration: number): number {
  const trimmed = val.trim();
  const parts = trimmed.split(":").map(Number);
  let secs = 0;
  if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) secs = parts[0] * 60 + parts[1];
  else secs = parseFloat(trimmed) || 0;
  return Math.min(Math.max(0, secs), duration);
}

let _clipId = 1;
function newClipId() { return `clip-${_clipId++}`; }

// ─── ClipRow ──────────────────────────────────────────────────────────────────

function ClipRow({
  clip, duration, onUpdate, onDelete, onExtract,
}: {
  clip: Clip; duration: number;
  onUpdate: (id: string, patch: Partial<Clip>) => void;
  onDelete: (id: string) => void;
  onExtract: (id: string) => void;
}) {
  const [startStr, setStartStr] = useState(fmtTime(clip.start));
  const [endStr, setEndStr] = useState(fmtTime(clip.end));

  function commitStart() {
    const v = parseTimeInput(startStr, duration);
    onUpdate(clip.id, { start: v });
    setStartStr(fmtTime(v));
  }
  function commitEnd() {
    const v = parseTimeInput(endStr, duration);
    onUpdate(clip.id, { end: Math.max(v, clip.start + 1) });
    setEndStr(fmtTime(Math.max(v, clip.start + 1)));
  }

  const clipDur = clip.end - clip.start;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-xl bg-background p-3 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Film className="h-4 w-4 text-orange-500 shrink-0" />
        <input
          value={clip.label}
          onChange={e => onUpdate(clip.id, { label: e.target.value })}
          className="flex-1 text-sm font-semibold bg-transparent text-foreground border-none outline-none placeholder:text-foreground-muted"
          placeholder="Clip name…"
        />
        <span className="text-xs text-foreground-muted bg-background-subtle px-2 py-0.5 rounded-full">
          {fmtTime(clipDur)}
        </span>
        <button onClick={() => onDelete(clip.id)} className="text-foreground-muted hover:text-red-500 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Start (mm:ss)", val: startStr, set: setStartStr, commit: commitStart },
          { label: "End (mm:ss)", val: endStr, set: setEndStr, commit: commitEnd },
        ].map(({ label, val, set, commit }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs font-medium text-foreground-muted">{label}</label>
            <input
              value={val}
              onChange={e => set(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === "Enter" && commit()}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="0:00"
            />
          </div>
        ))}
      </div>

      {duration > 0 && (
        <div className="relative h-3 bg-background-subtle rounded-full overflow-hidden">
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
            style={{
              left: `${(clip.start / duration) * 100}%`,
              width: `${((clip.end - clip.start) / duration) * 100}%`,
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {clip.status === "done" && clip.blob ? (
          <a
            href={clip.blob}
            download={`${clip.label || "clip"}.webm`}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Download Clip
          </a>
        ) : clip.status === "extracting" ? (
          <div className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-border text-xs text-foreground-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Extracting…
          </div>
        ) : clip.status === "error" ? (
          <button onClick={() => onExtract(clip.id)}
            className="flex-1 h-9 rounded-xl border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            Retry
          </button>
        ) : (
          <button onClick={() => onExtract(clip.id)}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <Scissors className="h-3.5 w-3.5" /> Extract Clip
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VideoClipper() {
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiClipCount, setAiClipCount] = useState(5);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { output: aiOutput, loading: aiLoading, generate: getAiClips, clear: clearAi } = useAIGenerate("video-clipper");

  useEffect(() => {
    return () => {
      clips.forEach(c => { if (c.blob) URL.revokeObjectURL(c.blob); });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetVideo() {
    if (videoUrl && !videoFile) { /* URL-based, don't revoke */ }
    else if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setClips([]);
    setCurrentTime(0);
    setPlaying(false);
    setDuration(0);
    clearAi();
    setUrlInput("");
    setUrlError("");
  }

  // ── File mode ──────────────────────────────────────────────────────────────

  const loadFile = useCallback((file: File) => {
    if (videoUrl && videoFile) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setVideoMeta({ title: file.name, author: "Local file", duration: "", thumbnail: null, platform: "File" });
    setClips([]);
    setCurrentTime(0);
    setPlaying(false);
    clearAi();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) loadFile(f);
  }

  // ── URL mode ───────────────────────────────────────────────────────────────

  async function loadFromUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setUrlLoading(true);
    setUrlError("");

    try {
      // 1. Get video info
      const infoRes = await fetch("/api/video/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30_000),
      });
      const infoJson = await infoRes.json() as { success: boolean; message?: string; data?: VideoMeta };
      if (!infoJson.success || !infoJson.data) throw new Error(infoJson.message ?? "Could not fetch video info");

      // 2. Get direct stream URL
      const dlRes = await fetch("/api/video/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality: "720p" }),
        signal: AbortSignal.timeout(35_000),
      });
      const dlJson = await dlRes.json() as { success: boolean; message?: string; downloadUrl?: string };
      if (!dlJson.success || !dlJson.downloadUrl) throw new Error(dlJson.message ?? "Could not get video stream");

      // 3. Proxy through our CORS-safe stream endpoint
      const proxyUrl = `/api/video/stream?u=${encodeURIComponent(dlJson.downloadUrl)}`;

      setVideoFile(null);
      setVideoUrl(proxyUrl);
      setVideoMeta(infoJson.data);
      setClips([]);
      setCurrentTime(0);
      setPlaying(false);
      clearAi();
      if (infoJson.data.title) setAiTopic(infoJson.data.title);
    } catch (err: unknown) {
      setUrlError((err as Error).message ?? "Failed to load video");
    } finally {
      setUrlLoading(false);
    }
  }

  // ── Player controls ────────────────────────────────────────────────────────

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  }

  function addClip() {
    const start = Math.floor(currentTime);
    const end = Math.min(start + 30, duration);
    setClips(p => [...p, { id: newClipId(), label: `Clip ${p.length + 1}`, start, end, status: "pending" }]);
  }

  function updateClip(id: string, patch: Partial<Clip>) {
    setClips(p => p.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  function deleteClip(id: string) {
    setClips(p => {
      const c = p.find(x => x.id === id);
      if (c?.blob) URL.revokeObjectURL(c.blob);
      return p.filter(x => x.id !== id);
    });
  }

  // ── Clip extraction ────────────────────────────────────────────────────────

  async function extractClip(id: string) {
    const clip = clips.find(c => c.id === id);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!clip || !video || !canvas) return;

    updateClip(id, { status: "extracting", blob: undefined });

    try {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d")!;
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm",
        videoBitsPerSecond: 4_000_000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      await new Promise<void>((resolve, reject) => {
        recorder.onerror = () => reject(new Error("MediaRecorder error"));
        recorder.onstop = () => resolve();
        recorder.start(100);

        let rafId: number;
        function drawFrame() {
          if (!video || !ctx) return;
          if (video.currentTime >= clip!.end) {
            cancelAnimationFrame(rafId);
            video.pause();
            recorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, canvas!.width, canvas!.height);
          rafId = requestAnimationFrame(drawFrame);
        }

        video.currentTime = clip.start;
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          video.play().then(() => { rafId = requestAnimationFrame(drawFrame); }).catch(reject);
        };
        video.addEventListener("seeked", onSeeked);
      });

      const blob = new Blob(chunks, { type: "video/webm" });
      updateClip(id, { status: "done", blob: URL.createObjectURL(blob) });
    } catch {
      updateClip(id, { status: "error" });
    }
  }

  // ── AI clip suggestions ────────────────────────────────────────────────────

  useEffect(() => {
    if (!aiOutput || !duration) return;
    const text = aiOutput;
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const arr = JSON.parse(jsonMatch[0]) as Array<{
          label?: string; title?: string;
          start?: string | number; from?: string | number;
          end?: string | number; to?: string | number;
        }>;
        const newClips: Clip[] = arr.slice(0, 10).map(item => {
          const s = item.start ?? item.from ?? 0;
          const e = item.end ?? item.to ?? (Number(s) + 30);
          const start = typeof s === "string" ? parseTimeInput(s, duration) : Math.min(Number(s), duration);
          const end   = typeof e === "string" ? parseTimeInput(e, duration) : Math.min(Number(e), duration);
          return { id: newClipId(), label: item.label ?? item.title ?? "AI Clip", start, end: Math.max(end, start + 3), status: "pending" as const };
        });
        if (newClips.length) { setClips(p => [...p, ...newClips]); return; }
      } catch { /* ignore */ }
    }
    // Fallback: parse "0:30 - 1:00" patterns
    const matches = [...text.matchAll(/(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})/g)];
    if (matches.length) {
      setClips(p => [
        ...p,
        ...matches.map((m, i) => ({
          id: newClipId(),
          label: `AI Clip ${i + 1}`,
          start: parseTimeInput(m[1], duration),
          end: parseTimeInput(m[2], duration),
          status: "pending" as const,
        })),
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiOutput]);

  function requestAiClips() {
    if (!duration) return;
    clearAi();
    const prompt = `Video duration: ${fmtTime(duration)} (${Math.round(duration)} seconds).
${aiTopic ? `Content: ${aiTopic}` : ""}
Find the best ${aiClipCount} clip segments (each 15-60 seconds). Spread across the full duration.
${aiTopic ? `Focus on interesting/key moments from: ${aiTopic}` : "Focus on high-energy or informative moments."}
Return ONLY valid JSON array (no markdown, no explanation):
[{"label":"Short clip name","start":"m:ss","end":"m:ss"},...]
All times must be within 0:00 to ${fmtTime(duration)}.`;
    getAiClips({ text: prompt, options: { task: prompt } });
  }

  const hasVideo = !!videoUrl;
  const doneCount = clips.filter(c => c.status === "done").length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
          <Scissors className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Video Clipper</h1>
        <p className="text-foreground-muted max-w-xl mx-auto text-sm">
          Upload a video or paste a URL (YouTube, TikTok, Vimeo…). Let AI find the best clips, or mark your own time segments.
        </p>
      </div>

      {/* Input mode tabs */}
      {!hasVideo && (
        <div className="flex rounded-xl border border-border overflow-hidden w-fit mx-auto">
          {(["file", "url"] as InputMode[]).map(m => (
            <button
              key={m}
              onClick={() => { setInputMode(m); setUrlError(""); }}
              className={clsx(
                "flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors",
                inputMode === m ? "bg-orange-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle"
              )}
            >
              {m === "file" ? <><Upload className="h-3.5 w-3.5" />Upload File</> : <><LinkIcon className="h-3.5 w-3.5" />From URL</>}
            </button>
          ))}
        </div>
      )}

      {/* ── File upload ── */}
      {!hasVideo && inputMode === "file" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
            dragOver ? "border-orange-500 bg-orange-500/5" : "border-border hover:border-orange-500/50 hover:bg-orange-500/5"
          )}
        >
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={onFileChange} />
          <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">Drop a video file here</p>
          <p className="text-sm text-foreground-muted mt-1">or click to browse — MP4, WebM, MOV, AVI, MKV</p>
          <p className="text-xs text-foreground-muted mt-3">Processed entirely in your browser — nothing uploaded</p>
        </div>
      )}

      {/* ── URL input ── */}
      {!hasVideo && inputMode === "url" && (
        <div className="space-y-4">
          <div className="border border-card-border bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LinkIcon className="h-4 w-4 text-orange-500" />
              Paste Video URL
            </div>
            <div className="space-y-2">
              <input
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
                onKeyDown={e => e.key === "Enter" && loadFromUrl()}
                placeholder="https://youtube.com/watch?v=... or TikTok, Vimeo URL"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              {urlError && (
                <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{urlError}</span>
                </div>
              )}
            </div>
            <button
              onClick={loadFromUrl}
              disabled={urlLoading || !urlInput.trim()}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {urlLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Loading video…</>
                : <><Film className="h-4 w-4" />Load Video<ChevronRight className="h-4 w-4" /></>
              }
            </button>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "YouTube", emoji: "▶️" },
                { name: "TikTok", emoji: "🎵" },
                { name: "Vimeo", emoji: "🎬" },
              ].map(({ name, emoji }) => (
                <div key={name} className="text-center py-2 px-3 rounded-xl bg-background-subtle border border-card-border">
                  <span className="text-lg">{emoji}</span>
                  <p className="text-xs font-medium text-foreground mt-0.5">{name}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground-muted text-center">
              YouTube, TikTok, and Vimeo URLs supported. Instagram/Facebook videos must be uploaded as files.
            </p>
          </div>
        </div>
      )}

      {/* ── Video loaded ── */}
      {hasVideo && (
        <div className="space-y-4">
          {/* Video meta card */}
          {videoMeta && (
            <div className="flex items-center gap-3 border border-card-border bg-card rounded-2xl p-3">
              {videoMeta.thumbnail && (
                <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0">
                  <Image src={videoMeta.thumbnail} alt={videoMeta.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{videoMeta.title}</p>
                <p className="text-xs text-foreground-muted">{videoMeta.author} · {videoMeta.platform}</p>
              </div>
              <button onClick={resetVideo} className="text-xs text-foreground-muted hover:text-foreground flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg border border-border">
                <X className="h-3.5 w-3.5" /> Change
              </button>
            </div>
          )}

          {/* Video player */}
          <div className="border border-card-border rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoUrl!}
              crossOrigin="anonymous"
              className="w-full max-h-80 object-contain"
              onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
              onDurationChange={e => setDuration(e.currentTarget.duration)}
              onEnded={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              controls
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-muted">Position:</span>
              <span className="font-mono font-semibold text-orange-500">{fmtTime(currentTime)}</span>
              <span className="text-foreground-muted">/ {fmtTime(duration)}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:bg-background-subtle transition-colors text-foreground"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pause" : "Play"}
              </button>
              <button
                onClick={addClip}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" /> Add Clip Here
              </button>
            </div>
          </div>

          {/* AI Clip Suggester */}
          <div className="border border-orange-200 dark:border-orange-800 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-semibold text-foreground">AI Clip Suggester</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Describe the video (helps AI pick better clips)</label>
                <input
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="e.g. cooking tutorial, wedding highlights, sports reel…"
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Number of clips</label>
                <select
                  value={aiClipCount}
                  onChange={e => setAiClipCount(Number(e.target.value))}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none"
                >
                  {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} clips</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={requestAiClips}
              disabled={aiLoading || !duration}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {aiLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Finding best clips…</>
                : <><Sparkles className="h-4 w-4" />Find Best Clips with AI<ChevronRight className="h-4 w-4" /></>
              }
            </button>
            {aiOutput && !aiLoading && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> AI added suggestions below — review and extract them
              </p>
            )}
          </div>

          {/* Clips list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Clips ({clips.length})
                {doneCount > 0 && <span className="ml-2 text-xs text-emerald-600 font-normal">{doneCount} ready</span>}
              </h3>
              {clips.length > 0 && (
                <button
                  onClick={() => { clips.forEach(c => { if (c.blob) URL.revokeObjectURL(c.blob); }); setClips([]); }}
                  className="text-xs text-foreground-muted hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {clips.map(clip => (
                <ClipRow key={clip.id} clip={clip} duration={duration} onUpdate={updateClip} onDelete={deleteClip} onExtract={extractClip} />
              ))}
            </AnimatePresence>

            {clips.length === 0 && (
              <div className="text-center py-8 text-sm text-foreground-muted border border-dashed border-border rounded-2xl">
                <Scissors className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No clips yet — click "Add Clip Here" while playing,</p>
                <p>or use AI to suggest the best moments.</p>
              </div>
            )}
          </div>

          <div className="text-xs text-foreground-muted text-center p-3 rounded-xl bg-background-subtle border border-card-border">
            Clips are extracted in real-time using canvas recording. A 30-second clip takes ~30 seconds. Downloads as <strong>.webm</strong> (plays in Chrome, VLC, Firefox).
          </div>
        </div>
      )}

      {/* Hidden canvas for extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
