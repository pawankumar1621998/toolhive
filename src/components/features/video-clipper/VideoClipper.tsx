"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Scissors, Upload, Play, Pause, Plus, Trash2, Download,
  Sparkles, Loader2, ChevronRight, Film, Clock, X, Check,
} from "lucide-react";
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
  // mm:ss or hh:mm:ss
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
      {/* Label row */}
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

      {/* Time inputs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Start", val: startStr, set: setStartStr, commit: commitStart },
          { label: "End", val: endStr, set: setEndStr, commit: commitEnd },
        ].map(({ label, val, set, commit }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs font-medium text-foreground-muted">{label} (mm:ss)</label>
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

      {/* Visual timeline bar */}
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

      {/* Extract button */}
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
            className="flex-1 h-9 rounded-xl border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      clips.forEach(c => { if (c.blob) URL.revokeObjectURL(c.blob); });
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVideo = useCallback((file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setClips([]);
    setCurrentTime(0);
    setPlaying(false);
    clearAi();
  }, [videoUrl, clearAi]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) loadVideo(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) loadVideo(f);
  }

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

  // Extract a clip using canvas + MediaRecorder (real-time)
  async function extractClip(id: string) {
    const clip = clips.find(c => c.id === id);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!clip || !video || !canvas) return;

    updateClip(id, { status: "extracting", blob: undefined });

    try {
      video.currentTime = clip.start;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;

      const ctx = canvas.getContext("2d")!;
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
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
        video.oncanplay = null;
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          video.play().then(() => {
            rafId = requestAnimationFrame(drawFrame);
          }).catch(reject);
        };
        video.addEventListener("seeked", onSeeked);
      });

      const blob = new Blob(chunks, { type: "video/webm" });
      const blobUrl = URL.createObjectURL(blob);
      updateClip(id, { status: "done", blob: blobUrl });
    } catch {
      updateClip(id, { status: "error" });
    }
  }

  // AI-suggested clip times
  useEffect(() => {
    if (!aiOutput || !duration) return;
    const text = aiOutput;

    // Try to parse JSON array
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const arr = JSON.parse(jsonMatch[0]) as Array<{
          label?: string; start?: string | number; end?: string | number;
          from?: string | number; to?: string | number;
          title?: string; reason?: string;
        }>;

        const newClips: Clip[] = arr.slice(0, 10).map((item) => {
          const startRaw = item.start ?? item.from ?? 0;
          const endRaw = item.end ?? item.to ?? (Number(startRaw) + 30);
          const start = typeof startRaw === "string" ? parseTimeInput(startRaw, duration) : Math.min(Number(startRaw), duration);
          const end = typeof endRaw === "string" ? parseTimeInput(endRaw, duration) : Math.min(Number(endRaw), duration);
          return {
            id: newClipId(),
            label: item.label ?? item.title ?? `AI Clip`,
            start,
            end: Math.max(end, start + 3),
            status: "pending" as const,
          };
        });

        if (newClips.length) {
          setClips(p => [...p, ...newClips]);
          return;
        }
      } catch { /* ignore */ }
    }

    // Fallback: parse "mm:ss - mm:ss" patterns
    const timeRegex = /(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})/g;
    const labelRegex = /(?:clip|moment|scene|highlight)[:\s]+([^\n\r]+)/gi;
    const timeMatches = [...text.matchAll(timeRegex)];
    const labelMatches = [...text.matchAll(labelRegex)];

    if (timeMatches.length) {
      const newClips: Clip[] = timeMatches.map((m, i) => ({
        id: newClipId(),
        label: labelMatches[i]?.[1]?.trim() ?? `AI Clip ${i + 1}`,
        start: parseTimeInput(m[1], duration),
        end: parseTimeInput(m[2], duration),
        status: "pending" as const,
      }));
      setClips(p => [...p, ...newClips]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiOutput]);

  function requestAiClips() {
    if (!duration) return;
    clearAi();
    const prompt = `Video duration: ${fmtTime(duration)} (${Math.round(duration)} seconds total).
${aiTopic ? `Content description: ${aiTopic}` : ""}

Find the best ${aiClipCount} short clip segments (each 15-60 seconds long) from this video.
Spread them across the full duration to capture the most interesting/valuable moments.
${aiTopic ? `Focus on: ${aiTopic}` : "Focus on high-energy, informative, or entertaining moments."}

Return ONLY a valid JSON array, no explanation:
[{"label":"Clip name","start":"mm:ss","end":"mm:ss"},...]

Make sure start/end times are within 0:00 to ${fmtTime(duration)}.`;

    getAiClips({ text: prompt, options: { task: prompt } });
  }

  const doneCount = clips.filter(c => c.status === "done").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
          <Scissors className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Video Clipper</h1>
        <p className="text-foreground-muted max-w-xl mx-auto text-sm">
          Upload a video, let AI suggest the best clips, or mark your own time segments. Extract as many clips as you need.
        </p>
      </div>

      {/* Upload zone */}
      {!videoFile ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
            dragOver
              ? "border-orange-500 bg-orange-500/5"
              : "border-border hover:border-orange-500/50 hover:bg-orange-500/5"
          )}
        >
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={onFileChange} />
          <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">Drop a video file here</p>
          <p className="text-sm text-foreground-muted mt-1">or click to browse — MP4, WebM, MOV, AVI, MKV supported</p>
          <p className="text-xs text-foreground-muted mt-3">Processing happens entirely in your browser — no upload to any server</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Video player */}
          <div className="border border-card-border rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoUrl!}
              className="w-full max-h-80 object-contain"
              onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
              onDurationChange={e => setDuration(e.currentTarget.duration)}
              onEnded={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              controls
            />
          </div>

          {/* Video info + controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <Film className="h-4 w-4" />
              <span className="font-medium text-foreground">{videoFile.name}</span>
              <span>·</span>
              <Clock className="h-3.5 w-3.5" />
              <span>{fmtTime(duration)}</span>
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
                onClick={() => { setVideoFile(null); setVideoUrl(null); setClips([]); clearAi(); }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:bg-background-subtle transition-colors text-foreground-muted"
              >
                <X className="h-3.5 w-3.5" /> Change Video
              </button>
            </div>
          </div>

          {/* Current position indicator */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-foreground-muted">Current position:</span>
            <span className="font-mono font-semibold text-orange-500">{fmtTime(currentTime)}</span>
            <button
              onClick={addClip}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Add Clip from Here
            </button>
          </div>

          {/* AI Clip Suggester */}
          <div className="border border-orange-200 dark:border-orange-800 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-semibold text-foreground">AI Clip Suggester</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Describe your video (optional)</label>
                <input
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="e.g. cooking tutorial, wedding ceremony, sports highlights…"
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Number of clips</label>
                <select
                  value={aiClipCount}
                  onChange={e => setAiClipCount(Number(e.target.value))}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
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
                <Check className="h-3.5 w-3.5" /> AI added clip suggestions below — review and extract them
              </p>
            )}
          </div>

          {/* Clips list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Clips ({clips.length})
                {doneCount > 0 && <span className="ml-2 text-xs text-emerald-600 font-normal">{doneCount} ready to download</span>}
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
                <ClipRow
                  key={clip.id}
                  clip={clip}
                  duration={duration}
                  onUpdate={updateClip}
                  onDelete={deleteClip}
                  onExtract={extractClip}
                />
              ))}
            </AnimatePresence>

            {clips.length === 0 && (
              <div className="text-center py-8 text-sm text-foreground-muted border border-dashed border-border rounded-2xl">
                <Scissors className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No clips yet — use "Add Clip from Here" while playing,</p>
                <p>or let AI suggest the best moments.</p>
              </div>
            )}
          </div>

          {/* Extraction note */}
          <div className="text-xs text-foreground-muted text-center p-3 rounded-xl bg-background-subtle border border-card-border">
            Clips are extracted in real-time in your browser using canvas recording. Extraction takes as long as the clip duration.
            Downloaded clips are in <strong>.webm</strong> format (open in VLC, Chrome, or convert with HandBrake).
          </div>
        </div>
      )}

      {/* Hidden canvas for extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
