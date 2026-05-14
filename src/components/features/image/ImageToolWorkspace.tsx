"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, Download, RotateCcw, CheckCircle2, ImageIcon, Plus, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { ToolOptions } from "@/components/features/tool/ToolOptions";
import { useToolStore, selectToolOptions } from "@/lib/store/toolStore";
import { recordRecentTool } from "@/components/features/home/RecentTools";
import type { Tool } from "@/types";

// ─── Button labels ─────────────────────────────────────────────────────────────

const BTN_LABELS: Record<string, string> = {
  compress:            "Compress Images",
  "reduce-kb":         "Reduce to KB",
  "increase-kb":       "Increase Size",
  resize:              "Resize Images",
  "resize-cm":         "Resize Images",
  "social-resize":     "Resize for Social",
  convert:             "Convert Format",
  rotate:              "Rotate Images",
  flip:                "Flip Images",
  "black-white":       "Convert to B&W",
  "blur-image":        "Apply Blur",
  "remove-background": "Remove BG",
  watermark:           "Add Watermark",
  "image-to-pdf":      "Convert to PDF",
  upscale:             "Upscale Image",
  "remove-metadata":   "Remove Metadata",
  "view-metadata":     "View Metadata",
  "split-image":       "Split Image",
  "add-logo":          "Add Logo",
  "resize-3-5-cm":     "Passport Photo",
  "pixel-art":         "Pixel Art",
  crop:                "Crop Image",
  "color-filter":      "Color Filter",
  adjust:              "Adjust Image",
  "add-border":        "Add Border",
  "round-image":       "Round Image",
  "profile-photo":     "Profile Photo",
  "blur-background":   "Blur Background",
  "pixelate":          "Pixelate",
  collage:             "Create Collage",
  combine:             "Combine Images",
  "thumbnail-creator": "Create Thumbnail",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtKB(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutFile { name: string; url: string; size: number; }

interface FileWithPreview { file: File; previewUrl: string; }

// ─── Animated gradient orb (decorative) ───────────────────────────────────────

function GradientOrb({ className }: { className?: string }) {
  return (
    <div className={clsx("absolute pointer-events-none overflow-hidden rounded-full", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/30 to-brand-cyan/20 animate-float" />
      <div className="absolute -inset-4 bg-gradient-to-br from-brand-blue/20 to-transparent blur-xl" />
    </div>
  );
}

// ─── Tool stats banner ───────────────────────────────────────────────────────

function ToolStatsBanner({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {tool.usageCount && (
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-violet/10 text-brand-violet">
            <Sparkles className="h-3 w-3" />
          </span>
          <span>{(tool.usageCount / 1_000_000).toFixed(1)}M uses</span>
        </div>
      )}
      {tool.estimatedTime && (
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-cyan/10 text-brand-cyan">
            ⚡
          </span>
          <span>{tool.estimatedTime}</span>
        </div>
      )}
      {tool.maxFiles && tool.maxFiles > 1 && (
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue">
            📁
          </span>
          <span>Up to {tool.maxFiles} files</span>
        </div>
      )}
    </div>
  );
}

// ─── Image Preview Card ───────────────────────────────────────────────────────

function ImagePreviewCard({
  fwp,
  index,
  onRemove,
  total,
}: {
  fwp: FileWithPreview;
  index: number;
  onRemove: (i: number) => void;
  total: number;
}) {
  return (
    <div className="group relative bg-card rounded-2xl border border-card-border overflow-hidden hover:border-brand-violet/40 hover:shadow-xl hover:shadow-brand-violet/5 transition-all duration-300 card-lift">
      {/* Glow accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/5 to-transparent" />
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-background-muted to-background-subtle">
        <img
          src={fwp.previewUrl}
          alt={fwp.file.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
        {/* Index badge */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold flex items-center justify-center">
          {index + 1}
        </div>
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${fwp.file.name}`}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:scale-110 hover:shadow-lg"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* File info */}
      <div className="px-3 py-2.5 bg-card relative z-10">
        <p className="text-xs font-semibold text-card-foreground truncate leading-tight" title={fwp.file.name}>
          {fwp.file.name}
        </p>
        <p className="text-[10px] text-foreground-subtle mt-0.5 font-mono">{fmtKB(fwp.file.size)}</p>
      </div>
    </div>
  );
}

// ─── Result Download Card ──────────────────────────────────────────────────────

function ResultCard({ file, index }: { file: OutFile; index: number }) {
  const isImage = /\.(jpe?g|png|webp|gif|bmp|avif|tiff?)$/i.test(file.name);

  return (
    <div className="group relative bg-card rounded-2xl border border-emerald-500/20 overflow-hidden hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 card-lift">
      {/* Success glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      </div>

      {isImage && (
        <div className="relative bg-[repeating-conic-gradient(#1a1a2e_0%_25%,#16161f_0%_50%)] bg-[length:12px_12px] aspect-video overflow-hidden">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          {/* Result badge */}
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Result
          </div>
        </div>
      )}
      {!isImage && (
        <div className="relative bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 aspect-video flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500/60" />
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 bg-card relative z-10">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-card-foreground truncate">{file.name}</p>
          <p className="text-[11px] text-foreground-subtle mt-0.5 font-mono">{fmtKB(file.size)}</p>
        </div>
        <a
          href={file.url}
          download={file.name}
          className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ImageToolWorkspace({ tool }: { tool: Tool }) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);

  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);
  const [isDragging, setDrag]    = useState(false);
  const [processing, setProc]    = useState(false);
  const [outputs, setOutputs]    = useState<OutFile[]>([]);
  const [error, setError]        = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const toolOpts = useToolStore(selectToolOptions);

  useEffect(() => {
    recordRecentTool({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      icon: tool.icon,
    });
  }, [tool.id]);

  useEffect(() => {
    return () => { filesWithPreviews.forEach((fwp) => URL.revokeObjectURL(fwp.previewUrl)); };
  }, [filesWithPreviews]);

  useEffect(() => {
    return () => { outputs.forEach((o) => URL.revokeObjectURL(o.url)); };
  }, [outputs]);

  const maxFiles = tool.maxFiles > 0 ? tool.maxFiles : 20;
  const accept   = tool.acceptedFileTypes.length > 0 ? tool.acceptedFileTypes.join(",") : "image/*";

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming = Array.from(list);
      setFilesWithPreviews((prev) => {
        const combined = [
          ...prev,
          ...incoming.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
        ].slice(0, maxFiles);
        const kept = new Set(combined.map((c) => c.previewUrl));
        prev.forEach((p) => { if (!kept.has(p.previewUrl)) URL.revokeObjectURL(p.previewUrl); });
        return combined;
      });
      setOutputs([]);
      setError(null);
    },
    [maxFiles]
  );

  const removeFile = useCallback((i: number) => {
    setFilesWithPreviews((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  }, []);

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  const handleProcess = async () => {
    if (!filesWithPreviews.length || processing) return;
    setProc(true);
    setError(null);
    setShowSuccess(false);
    try {
      const fd = new FormData();
      fd.append("toolSlug", tool.slug);
      fd.append("options", JSON.stringify(toolOpts));
      filesWithPreviews.forEach(({ file }) => fd.append("files", file, file.name));

      const res  = await fetch("/api/tools/process", { method: "POST", body: fd });
      const data = await res.json() as { files?: Array<{ name: string; data: string; type: string }>; error?: string };

      if (data.error) throw new Error(data.error);
      if (!data.files?.length) throw new Error("No output files returned.");

      const outs: OutFile[] = data.files.map((f) => {
        const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
        const blob  = new Blob([bytes], { type: f.type });
        return { name: f.name, url: URL.createObjectURL(blob), size: blob.size };
      });
      setOutputs(outs);
      setShowSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Processing failed. Please try again.");
    } finally {
      setProc(false);
    }
  };

  const reset = () => {
    filesWithPreviews.forEach((fwp) => URL.revokeObjectURL(fwp.previewUrl));
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setFilesWithPreviews([]);
    setOutputs([]);
    setError(null);
    setShowSuccess(false);
  };

  const btnLabel = BTN_LABELS[tool.slug] ?? tool.name;
  const hasFiles = filesWithPreviews.length > 0;

  // ── Idle ──────────────────────────────────────────────────────────────────────

  if (!hasFiles && outputs.length === 0) {
    return (
      <div className="w-full">
        {/* Tool stats */}
        <ToolStatsBanner tool={tool} />

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload image files"
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={clsx(
            "relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
            isDragging
              ? "border-brand-violet bg-brand-violet/5 dark:bg-brand-violet/10 scale-[1.01]"
              : "border-border/60 hover:border-brand-violet/50 hover:bg-background-subtle/50 dark:hover:bg-background-subtle/30"
          )}
        >
          {/* Background gradient orbs */}
          <GradientOrb className="w-64 h-64 -top-20 -left-20 opacity-30 group-hover:opacity-50 transition-opacity" />
          <GradientOrb className="w-48 h-48 -bottom-12 -right-12 opacity-20 group-hover:opacity-40 transition-opacity" />

          <input ref={inputRef} type="file" accept={accept} multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />

          {/* Content */}
          <div className="relative z-10 py-20 px-8 text-center">
            {/* Icon */}
            <div className={clsx(
              "relative mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragging
                ? "bg-brand-violet/20 ring-4 ring-brand-violet/20 scale-110"
                : "bg-gradient-to-br from-brand-violet/10 to-brand-cyan/10 ring-1 ring-border group-hover:ring-brand-violet/30 group-hover:scale-105"
            )}>
              <ImageIcon className={clsx(
                "h-10 w-10 transition-all duration-300",
                isDragging ? "text-brand-violet scale-110" : "text-foreground-muted group-hover:text-brand-violet"
              )} />
              {/* Pulse ring on hover */}
              <div className="absolute inset-0 rounded-2xl animate-pulse-ring opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand-violet transition-colors">
              {isDragging ? "Drop your images here" : "Upload Images"}
            </h3>
            <p className="text-sm text-foreground-muted mb-8 max-w-sm mx-auto leading-relaxed">
              Drag & drop images here or click to browse. Supports JPG, PNG, WebP, GIF and more.
            </p>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className={clsx(
                "inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                "bg-gradient-to-r from-brand-violet to-brand-blue text-white",
                "hover:shadow-xl hover:shadow-brand-violet/30 hover:scale-105 active:scale-95",
                "shadow-lg shadow-brand-violet/20"
              )}
            >
              <Upload className="h-4 w-4" />
              Select Images
            </button>

            {maxFiles > 1 && (
              <p className="mt-6 text-xs text-foreground-subtle flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-violet/10 text-brand-violet text-[10px] font-bold">i</span>
                Batch processing — up to {maxFiles} images at once
              </p>
            )}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {["AI-Powered", "100% Free", "No Sign-up", "Secure"].map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-subtle/60 dark:bg-background-muted/40 border border-border/40 text-[11px] font-semibold text-foreground-muted backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-violet" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────

  if (outputs.length > 0) {
    return (
      <div className="w-full">
        {/* Success banner */}
        <div className={clsx(
          "relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6 mb-6",
          "animate-fade-up"
        )}>
          <GradientOrb className="w-40 h-40 -top-10 -right-10 opacity-20" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-25 bg-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">All done!</p>
                <p className="text-sm text-foreground-muted mt-0.5">
                  {outputs.length} file{outputs.length > 1 ? "s" : ""} processed successfully
                  {filesWithPreviews.length !== outputs.length && ` from ${filesWithPreviews.length} uploads`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground border border-border/40 hover:border-border bg-background/50 hover:bg-background backdrop-blur-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Process More
            </button>
          </div>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outputs.map((f, i) => (
            <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
              <ResultCard file={f} index={i} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-foreground-subtle">
          <span>Files are processed securely and automatically deleted.</span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready to download
          </span>
        </div>
      </div>
    );
  }

  // ── Files selected ───────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Tool stats */}
      <ToolStatsBanner tool={tool} />

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Left: preview grid ── */}
        <div className="flex-1 min-w-0">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={clsx(
              "relative rounded-2xl border-2 transition-all duration-300 overflow-hidden",
              isDragging
                ? "border-brand-violet bg-brand-violet/5 dark:bg-brand-violet/10"
                : "border-border/60 bg-background-subtle/30 dark:bg-background-muted/20",
              processing && "pointer-events-none"
            )}
          >
            {/* Background orbs */}
            <GradientOrb className="w-32 h-32 top-0 right-0 opacity-10" />

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-brand-violet/10 backdrop-blur-sm border-2 border-brand-violet border-dashed rounded-2xl">
                <div className="h-16 w-16 rounded-2xl bg-brand-violet/20 flex items-center justify-center mb-3">
                  <Upload className="h-8 w-8 text-brand-violet" />
                </div>
                <p className="text-sm font-bold text-brand-violet">Drop to add images</p>
              </div>
            )}

            {/* Processing overlay */}
            {processing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md rounded-2xl">
                <div className="relative mb-4">
                  <div className="h-14 w-14 rounded-full border-4 border-brand-violet/20 border-t-brand-violet animate-spin" />
                  <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-brand-violet" />
                </div>
                <p className="text-base font-bold text-foreground mb-1">Processing your images</p>
                <p className="text-xs text-foreground-muted">This usually takes a few seconds</p>
              </div>
            )}

            <div className="p-4 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-violet/10">
                    <ImageIcon className="h-4 w-4 text-brand-violet" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {filesWithPreviews.length} Image{filesWithPreviews.length > 1 ? "s" : ""} Selected
                    </p>
                    {filesWithPreviews.length > 1 && (
                      <p className="text-[11px] text-foreground-muted">
                        Batch processing enabled
                      </p>
                    )}
                  </div>
                </div>
                {filesWithPreviews.length < maxFiles && (
                  <button
                    type="button"
                    onClick={() => addMoreRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-violet hover:text-brand-violet/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-violet/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add More
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filesWithPreviews.map((fwp, i) => (
                  <ImagePreviewCard
                    key={`${fwp.file.name}-${i}`}
                    fwp={fwp}
                    index={i}
                    onRemove={removeFile}
                    total={filesWithPreviews.length}
                  />
                ))}

                {filesWithPreviews.length < maxFiles && (
                  <button
                    type="button"
                    onClick={() => addMoreRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border/40 hover:border-brand-violet/50 hover:bg-brand-violet/5 flex flex-col items-center justify-center gap-2 text-foreground-muted hover:text-brand-violet transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-7 w-7" />
                    <span className="text-[10px] font-semibold">Add More</span>
                  </button>
                )}
              </div>

              {maxFiles > 1 && (
                <p className="text-[11px] text-foreground-subtle mt-4 text-center font-mono">
                  {filesWithPreviews.length}/{maxFiles} images
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: options + action ── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-4">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm">

              {/* Options header */}
              <div className="px-5 py-4 border-b border-border/40 bg-gradient-to-r from-brand-violet/5 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-violet/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-brand-violet" />
                  </div>
                  <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest">Options</p>
                </div>
              </div>

              {/* Tool options */}
              <div className="px-5 py-5">
                <ToolOptions tool={tool} />
              </div>

              {/* Process button */}
              <div className="px-5 pb-5 space-y-3">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={!filesWithPreviews.length || processing}
                  aria-busy={processing}
                  className={clsx(
                    "w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3",
                    filesWithPreviews.length && !processing
                      ? "bg-gradient-to-r from-brand-violet to-brand-blue text-white shadow-lg shadow-brand-violet/25 hover:shadow-xl hover:shadow-brand-violet/40 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-border text-foreground-muted cursor-not-allowed"
                  )}
                >
                  {processing ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-foreground-muted/30 border-t-foreground animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {btnLabel}
                    </>
                  )}
                </button>

                {error && (
                  <div role="alert" aria-live="assertive" className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <span className="shrink-0 mt-0.5 text-base">&#x26A0;</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 border-t border-border/40 bg-background-subtle/30">
                <p className="text-[10px] text-foreground-subtle text-center leading-relaxed flex items-center justify-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-success/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  </span>
                  {maxFiles > 1 ? `${maxFiles} files max · ` : ""}Secure processing — files never stored
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ImageToolWorkspace;