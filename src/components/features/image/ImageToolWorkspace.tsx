"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, Download, RotateCcw, CheckCircle2, ImageIcon, Plus } from "lucide-react";
import { clsx } from "clsx";
import { ToolOptions } from "@/components/features/tool/ToolOptions";
import { useToolStore, selectToolOptions } from "@/lib/store/toolStore";
import { recordRecentTool } from "@/components/features/home/RecentTools";
import type { Tool } from "@/types";

// ─── Button labels per slug ───────────────────────────────────────────────────

const BTN_LABELS: Record<string, string> = {
  compress:            "Compress Images",
  "reduce-kb":         "Reduce to KB",
  "increase-kb":       "Increase Size",
  resize:              "Resize Images",
  "resize-cm":         "Resize Images",
  "social-resize":     "Resize for Social Media",
  convert:             "Convert Format",
  rotate:              "Rotate Images",
  flip:                "Flip Images",
  "black-white":       "Convert to Black & White",
  "blur-image":        "Apply Blur",
  "remove-background": "Remove Background",
  watermark:           "Add Watermark",
  "image-to-pdf":      "Convert to PDF",
  upscale:             "Upscale Image",
  "remove-metadata":   "Remove Metadata",
  "view-metadata":     "View Metadata",
  "split-image":       "Split Image",
  "add-logo":          "Add Logo",
  "resize-3-5-cm":     "Create Passport Photo",
  "pixel-art":         "Create Pixel Art",
  "crop":              "Crop Image",
  "color-filter":      "Apply Color Filter",
  "adjust":            "Adjust Image",
  "add-border":        "Add Border",
  "round-image":       "Round Image",
  "profile-photo":     "Create Profile Photo",
  "blur-background":   "Blur Background",
  "pixelate":          "Pixelate Image",
  "collage":           "Create Collage",
  "combine":           "Combine Images",
  "thumbnail-creator": "Create Thumbnail",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtKB(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutFile { name: string; url: string; size: number; }

interface FileWithPreview {
  file: File;
  previewUrl: string;
}

// ─── Image Preview Card ───────────────────────────────────────────────────────

function ImagePreviewCard({
  fwp,
  index,
  onRemove,
}: {
  fwp: FileWithPreview;
  index: number;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="group relative bg-background rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] aspect-square overflow-hidden">
        <img
          src={fwp.previewUrl}
          alt={fwp.file.name}
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${fwp.file.name}`}
          className="absolute top-1.5 right-1.5 z-10 h-6 w-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-black/80"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* File info */}
      <div className="px-2.5 py-2 bg-background">
        <p className="text-xs font-medium text-foreground truncate leading-tight" title={fwp.file.name}>
          {fwp.file.name}
        </p>
        <p className="text-[10px] text-foreground-muted mt-0.5">{fmtKB(fwp.file.size)}</p>
      </div>
    </div>
  );
}

// ─── Result Download Card ─────────────────────────────────────────────────────

function ResultCard({ file }: { file: OutFile }) {
  const isImage = /\.(jpe?g|png|webp|gif|bmp|avif|tiff?)$/i.test(file.name);

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden hover:border-emerald-400/50 hover:shadow-sm transition-all group">
      {isImage && (
        <div className="bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] aspect-video overflow-hidden">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
          <p className="text-[10px] text-foreground-muted mt-0.5">{fmtKB(file.size)}</p>
        </div>
        <a
          href={file.url}
          download={file.name}
          className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ImageToolWorkspace — dashboard-style image tool UI.
 *
 * States:
 *  idle      — full-width dashed upload zone
 *  selected  — two-column layout (previews left, options + button right)
 *  processing — spinner overlay on preview area
 *  done      — results panel with per-file download cards
 */
export function ImageToolWorkspace({ tool }: { tool: Tool }) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const addMoreRef  = useRef<HTMLInputElement>(null);

  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);
  const [isDragging, setDrag]  = useState(false);
  const [processing, setProc]  = useState(false);
  const [outputs, setOutputs]  = useState<OutFile[]>([]);
  const [error, setError]      = useState<string | null>(null);

  const toolOpts = useToolStore(selectToolOptions);

  // Register for recent history
  useEffect(() => {
    recordRecentTool({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      icon: tool.icon,
    });
  }, [tool.id]);

  // Clean up object URLs on unmount or when previews change
  useEffect(() => {
    return () => {
      filesWithPreviews.forEach((fwp) => URL.revokeObjectURL(fwp.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also clean up output blob URLs on unmount
  useEffect(() => {
    return () => {
      outputs.forEach((o) => URL.revokeObjectURL(o.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxFiles = tool.maxFiles > 0 ? tool.maxFiles : 10;
  const accept   = tool.acceptedFileTypes.length > 0 ? tool.acceptedFileTypes.join(",") : "image/*";

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming = Array.from(list);
      setFilesWithPreviews((prev) => {
        const combined = [
          ...prev,
          ...incoming.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
          })),
        ].slice(0, maxFiles);
        // Revoke URLs for any items that were sliced off
        const kept = new Set(combined.map((c) => c.previewUrl));
        prev.forEach((p) => {
          if (!kept.has(p.previewUrl)) URL.revokeObjectURL(p.previewUrl);
        });
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

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Process ──────────────────────────────────────────────────────────────────

  const handleProcess = async () => {
    if (!filesWithPreviews.length || processing) return;
    setProc(true);
    setError(null);
    setOutputs([]);
    try {
      const fd = new FormData();
      fd.append("toolSlug", tool.slug);
      fd.append("options", JSON.stringify(toolOpts));
      filesWithPreviews.forEach(({ file }) => fd.append("files", file, file.name));

      const res  = await fetch("/api/tools/process", { method: "POST", body: fd });
      const data = await res.json() as {
        files?: Array<{ name: string; data: string; type: string }>;
        error?: string;
      };

      if (data.error) throw new Error(data.error);
      if (!data.files?.length) throw new Error("No output files returned.");

      const outs: OutFile[] = data.files.map((f) => {
        const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
        const blob  = new Blob([bytes], { type: f.type });
        return { name: f.name, url: URL.createObjectURL(blob), size: blob.size };
      });
      setOutputs(outs);
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
  };

  const btnLabel = BTN_LABELS[tool.slug] ?? tool.name;
  const hasFiles = filesWithPreviews.length > 0;

  // ── Idle state: full-width upload zone ───────────────────────────────────────

  if (!hasFiles && outputs.length === 0) {
    return (
      <div className="w-full">
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
            "border-2 border-dashed rounded-2xl py-16 px-8 text-center cursor-pointer",
            "transition-all duration-200 select-none",
            isDragging
              ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/20 scale-[1.01]"
              : "border-border hover:border-teal-400 hover:bg-background-subtle"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={maxFiles !== 1}
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />

          {/* Upload icon cluster */}
          <div className="flex items-center justify-center mb-5">
            <div className={clsx(
              "h-16 w-16 rounded-2xl flex items-center justify-center transition-colors",
              isDragging ? "bg-teal-100 dark:bg-teal-900/40" : "bg-background-subtle border border-border"
            )}>
              <ImageIcon className={clsx("h-8 w-8", isDragging ? "text-teal-600" : "text-foreground-muted")} />
            </div>
          </div>

          <p className="text-lg font-semibold text-foreground mb-1.5">
            {isDragging ? "Drop images here" : "Select Or Drag & Drop Images Here"}
          </p>
          <p className="text-sm text-foreground-muted mb-6">
            {accept === "image/*"
              ? "JPG, PNG, WebP, GIF and more"
              : accept.replace(/image\//g, "").replace(/,/g, ", ").toUpperCase()
            }
            {" · "}Max {tool.maxFileSizeMB > 0 ? `${tool.maxFileSizeMB} MB` : "50 MB"} per file
          </p>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Select Images
          </button>

          {maxFiles > 1 && (
            <p className="mt-4 text-xs text-foreground-subtle">
              You can select up to {maxFiles} images at once
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Results state ─────────────────────────────────────────────────────────────

  if (outputs.length > 0) {
    return (
      <div className="w-full">
        {/* Success header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground leading-tight">
                {outputs.length} file{outputs.length > 1 ? "s" : ""} ready to download
              </p>
              <p className="text-xs text-foreground-muted">Processing complete</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground border border-border hover:border-foreground/30 bg-background hover:bg-background-subtle px-3 py-2 rounded-lg transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Process More
          </button>
        </div>

        {/* Results grid */}
        <div className={clsx(
          "grid gap-3",
          outputs.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {outputs.map((f, i) => (
            <ResultCard key={i} file={f} />
          ))}
        </div>

        {/* Batch download if multiple */}
        {outputs.length > 1 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-foreground-subtle text-center">
              Download each file individually above
            </p>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-foreground-subtle">
          Files are processed securely and never stored on our servers.
        </p>
      </div>
    );
  }

  // ── Files selected state: two-column layout ───────────────────────────────────

  return (
    <div className="w-full">
      {/* Hidden inputs */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles !== 1}
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />
      <input
        ref={addMoreRef}
        type="file"
        accept={accept}
        multiple={maxFiles !== 1}
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── Left column: image preview grid ── */}
        <div className="flex-1 min-w-0">

          {/* Preview grid with drag-drop overlay */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={clsx(
              "relative rounded-2xl border-2 transition-all duration-200",
              isDragging
                ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/10"
                : "border-border bg-background-subtle/40",
              processing && "pointer-events-none"
            )}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center bg-teal-50/80 dark:bg-teal-950/40 border-2 border-teal-500 border-dashed">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">Drop to add images</p>
                </div>
              </div>
            )}

            {/* Processing overlay */}
            {processing && (
              <div className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-full border-[3px] border-border border-t-teal-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-foreground">Processing…</p>
                <p className="text-xs text-foreground-muted mt-0.5">This may take a moment</p>
              </div>
            )}

            <div className="p-3">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
                  {filesWithPreviews.length} Image{filesWithPreviews.length > 1 ? "s" : ""} Selected
                </span>
                {filesWithPreviews.length < maxFiles && (
                  <button
                    type="button"
                    onClick={() => addMoreRef.current?.click()}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add More
                  </button>
                )}
              </div>

              {/* Thumbnails grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filesWithPreviews.map((fwp, i) => (
                  <ImagePreviewCard
                    key={`${fwp.file.name}-${i}`}
                    fwp={fwp}
                    index={i}
                    onRemove={removeFile}
                  />
                ))}

                {/* Drop zone tile to add more */}
                {filesWithPreviews.length < maxFiles && (
                  <button
                    type="button"
                    onClick={() => addMoreRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-teal-400 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 flex flex-col items-center justify-center gap-1.5 text-foreground-muted hover:text-teal-600 transition-all"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Add More</span>
                  </button>
                )}
              </div>

              {maxFiles > 1 && (
                <p className="text-[10px] text-foreground-subtle mt-3 px-1">
                  {filesWithPreviews.length}/{maxFiles} images
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: options + action ── */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="sticky top-4">
            <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">

              {/* Options panel header */}
              <div className="px-4 py-3 border-b border-border bg-background-subtle/50">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
                  Options
                </p>
              </div>

              {/* Tool-specific options */}
              <div className="px-4 py-4">
                <ToolOptions tool={tool} />
              </div>

              {/* Process button */}
              <div className="px-4 pb-4 pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={!filesWithPreviews.length || processing}
                  aria-busy={processing}
                  className={clsx(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                    "flex items-center justify-center gap-2",
                    filesWithPreviews.length && !processing
                      ? "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm hover:shadow-md"
                      : "bg-border text-foreground-muted cursor-not-allowed"
                  )}
                >
                  {processing ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Processing…
                    </>
                  ) : btnLabel}
                </button>

                {/* Error inline */}
                {error && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-3 py-2.5"
                  >
                    <span className="shrink-0 mt-0.5">&#x26A0;</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Footer note */}
              <div className="px-4 py-2.5 border-t border-border bg-background-subtle/40">
                <p className="text-[10px] text-foreground-subtle text-center leading-relaxed">
                  {maxFiles > 1
                    ? `Up to ${maxFiles} images at once. `
                    : ""}
                  Processed securely — files are never stored.
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
