"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Upload,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Film,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo", "video/webm", "video/x-matroska", "video/mpeg", "video/3gpp"];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// ─────────────────────────────────────────────
// Tool-specific option panels
// ─────────────────────────────────────────────

function CompressOptions({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Quality</label>
      <div className="flex gap-2">
        {(["high", "medium", "low"] as const).map((q) => (
          <button
            key={q}
            onClick={() => onChange({ ...value, quality: q })}
            className={clsx(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
              (value.quality || "medium") === q
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background-subtle text-foreground-muted hover:border-primary/40"
            )}
          >
            {q}
          </button>
        ))}
      </div>
      <p className="text-xs text-foreground-muted">High = best quality / larger file. Low = smallest file.</p>
    </div>
  );
}

function TrimOptions({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Start time (HH:MM:SS)</label>
        <input
          type="text"
          placeholder="00:00:00"
          value={value.startTime || ""}
          onChange={(e) => onChange({ ...value, startTime: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">End time (HH:MM:SS)</label>
        <input
          type="text"
          placeholder="00:01:00"
          value={value.endTime || ""}
          onChange={(e) => onChange({ ...value, endTime: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
        />
      </div>
      <p className="text-xs text-foreground-muted">Example: start 00:00:10, end 00:00:45 will extract a 35-second clip.</p>
    </div>
  );
}

function ConvertOptions({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Output Format</label>
      <div className="grid grid-cols-3 gap-2">
        {(["mp4", "webm", "avi", "mov", "mkv"] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => onChange({ ...value, format: fmt })}
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm font-medium uppercase transition-colors",
              (value.format || "mp4") === fmt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background-subtle text-foreground-muted hover:border-primary/40"
            )}
          >
            {fmt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpeedOptions({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const speeds = ["0.5", "0.75", "1.25", "1.5", "2.0"];
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Speed Multiplier</label>
      <div className="flex gap-2 flex-wrap">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onChange({ ...value, speed: s })}
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              (value.speed || "1.5") === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background-subtle text-foreground-muted hover:border-primary/40"
            )}
          >
            {s}x
          </button>
        ))}
      </div>
      <p className="text-xs text-foreground-muted">Below 1x = slow motion. Above 1x = fast forward.</p>
    </div>
  );
}

function GifOptions({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Frame Rate (fps)</label>
        <div className="flex gap-2">
          {["5", "10", "15", "20"].map((fps) => (
            <button
              key={fps}
              onClick={() => onChange({ ...value, fps })}
              className={clsx(
                "flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                (value.fps || "10") === fps
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background-subtle text-foreground-muted hover:border-primary/40"
              )}
            >
              {fps} fps
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Width (px)</label>
        <div className="flex gap-2">
          {["320", "480", "640"].map((w) => (
            <button
              key={w}
              onClick={() => onChange({ ...value, scale: w })}
              className={clsx(
                "flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                (value.scale || "480") === w
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background-subtle text-foreground-muted hover:border-primary/40"
              )}
            >
              {w}px
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-foreground-muted">Keep clips short (under 10s) for smaller GIF sizes.</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Drop Zone
// ─────────────────────────────────────────────

function VideoDropZone({
  multiple,
  files,
  onFiles,
  onRemove,
}: {
  multiple: boolean;
  files: File[];
  onFiles: (f: File[]) => void;
  onRemove: (idx: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (!valid.length) return;
    onFiles(multiple ? [...files, ...valid] : [valid[0]]);
  }, [files, multiple, onFiles]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed",
          "cursor-pointer min-h-[180px] px-6 py-8 text-center transition-colors duration-200",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-background-subtle hover:border-primary/50 hover:bg-primary/3"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Film className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Drop video{multiple ? "s" : ""} here or <span className="text-primary">browse</span>
          </p>
          <p className="mt-1 text-xs text-foreground-muted">MP4, MOV, AVI, WebM, MKV supported</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background-subtle px-4 py-3">
              <Film className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-foreground-muted">{formatBytes(f.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="shrink-0 rounded-lg p-1 text-foreground-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

interface VideoToolWorkspaceProps {
  tool: Tool;
}

type Status = "idle" | "processing" | "done" | "error";

export function VideoToolWorkspace({ tool }: VideoToolWorkspaceProps) {
  const isMerge   = tool.slug === "merge";
  const [files, setFiles]     = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [status, setStatus]   = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError]     = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputName, setOutputName]   = useState("output");
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  // Fake progress animation while processing
  const startFakeProgress = () => {
    setProgress(5);
    let p = 5;
    progressRef.current = setInterval(() => {
      p = Math.min(p + Math.random() * 8, 85);
      setProgress(Math.round(p));
    }, 600);
  };

  const stopFakeProgress = () => {
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  };

  const handleProcess = async () => {
    if (!files.length || status === "processing") return;

    setStatus("processing");
    setError(null);
    startFakeProgress();

    try {
      const formData = new FormData();
      formData.append("toolSlug", tool.slug);
      formData.append("options", JSON.stringify(options));

      if (isMerge) {
        files.forEach((f) => formData.append("files", f));
      } else {
        formData.append("file", files[0]);
      }

      const response = await fetch(
        `${API_URL}/video/process${isMerge ? "?merge=1" : ""}`,
        { method: "POST", body: formData }
      );

      stopFakeProgress();

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: "Processing failed" })) as { message?: string };
        throw new Error(errData.message ?? `Server error ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] ?? `toolhive_${tool.slug}_output`;

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setOutputName(filename);
      setProgress(100);
      setStatus("done");
    } catch (err: unknown) {
      stopFakeProgress();
      setStatus("error");
      setError((err as Error)?.message ?? "An unexpected error occurred.");
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setStatus("idle");
    setError(null);
    setProgress(0);
    setDownloadUrl(null);
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderOptions = () => {
    switch (tool.slug) {
      case "compress":     return <CompressOptions value={options} onChange={setOptions} />;
      case "trim":         return <TrimOptions value={options} onChange={setOptions} />;
      case "convert":      return <ConvertOptions value={options} onChange={setOptions} />;
      case "speed":        return <SpeedOptions value={options} onChange={setOptions} />;
      case "video-to-gif": return <GifOptions value={options} onChange={setOptions} />;
      default:             return null;
    }
  };

  const optionsPanel = renderOptions();
  const isProcessing = status === "processing";
  const isDone       = status === "done";
  const isError      = status === "error";

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">

        {/* ── Left: file upload + process button ── */}
        <div className="flex-1 min-w-0 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {!isDone ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VideoDropZone
                  multiple={isMerge}
                  files={files}
                  onFiles={setFiles}
                  onRemove={removeFile}
                />

                {/* Progress bar */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground-muted">Processing…</span>
                      <span className="text-xs font-semibold text-primary tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-background-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-foreground-muted text-center">
                      This may take a minute for large files…
                    </p>
                  </div>
                )}

                {/* Error banner */}
                {isError && error && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Processing failed</p>
                      <p className="mt-0.5 text-xs text-foreground-muted">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="mt-5">
                  <Button
                    variant="gradient"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                    disabled={!files.length || isProcessing}
                    onClick={handleProcess}
                    leftIcon={!isProcessing ? <Zap className="h-4 w-4" /> : undefined}
                  >
                    {isProcessing ? `Processing ${tool.name}…` : `Process with ${tool.name}`}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 mx-auto mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </motion.div>

                <h3 className="text-lg font-semibold text-foreground">Done!</h3>
                <p className="mt-1 text-sm text-foreground-muted mb-6">
                  Your video has been processed. Click below to download.
                </p>

                <button
                  onClick={handleDownload}
                  className={clsx(
                    "flex items-center justify-between w-full rounded-xl border border-border",
                    "bg-background-subtle px-4 py-3 text-sm group text-left",
                    "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-150"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Film className="h-4 w-4 shrink-0 text-primary" />
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {outputName}
                    </p>
                  </div>
                  <div className="shrink-0 ml-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground pointer-events-none">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </div>
                </button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleReset}
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  className="mt-3 w-full"
                >
                  Process another video
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: options panel (desktop) ── */}
        {optionsPanel && (
          <div className="hidden lg:block w-72 shrink-0 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Options
            </h3>
            {optionsPanel}
          </div>
        )}
      </div>

      {/* Mobile options (below upload zone) */}
      {optionsPanel && (
        <div className="lg:hidden border-t border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Options</h3>
          {optionsPanel}
        </div>
      )}
    </div>
  );
}
