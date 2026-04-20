"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, X, Download, RotateCcw, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { ToolOptions } from "@/components/features/tool/ToolOptions";
import { useToolStore, selectToolOptions } from "@/lib/store/toolStore";
import { recordRecentTool } from "@/components/features/home/RecentTools";
import type { Tool } from "@/types";

// ─── Button labels per slug ───────────────────────────────────────────────────

const BTN_LABELS: Record<string, string> = {
  compress:           "Compress Images",
  "reduce-kb":        "Reduce to KB",
  "increase-kb":      "Increase Size",
  resize:             "Resize Images",
  "resize-cm":        "Resize Images",
  "social-resize":    "Resize for Social Media",
  convert:            "Convert Format",
  rotate:             "Rotate Images",
  flip:               "Flip Images",
  "black-white":      "Convert to Black & White",
  "blur-image":       "Apply Blur",
  "remove-background":"Remove Background",
  watermark:          "Add Watermark",
  "image-to-pdf":     "Convert to PDF",
  upscale:            "Upscale Image",
  "remove-metadata":  "Remove Metadata",
  "view-metadata":    "View Metadata",
  "split-image":      "Split Image",
  "add-logo":         "Add Logo",
  "resize-3-5-cm":    "Create Passport Photo",
  "pixel-art":        "Create Pixel Art",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtKB(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// ─── Output file type ─────────────────────────────────────────────────────────

interface OutFile { name: string; url: string; size: number; }

// ─── Main Component ───────────────────────────────────────────────────────────

export function ImageToolWorkspace({ tool }: { tool: Tool }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles]       = useState<File[]>([]);
  const [isDragging, setDrag]   = useState(false);
  const [processing, setProc]   = useState(false);
  const [outputs, setOutputs]   = useState<OutFile[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const toolOpts = useToolStore(selectToolOptions);

  // register tool for recent history
  React.useEffect(() => {
    recordRecentTool({ id: tool.id, name: tool.name, slug: tool.slug, category: tool.category, icon: tool.icon });
  }, [tool.id]);

  const maxFiles = tool.maxFiles > 0 ? tool.maxFiles : 10;
  const accept   = tool.acceptedFileTypes.length > 0 ? tool.acceptedFileTypes.join(",") : "image/*";

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => {
      const next = [...prev, ...Array.from(list)].slice(0, maxFiles);
      return next;
    });
    setOutputs([]);
    setError(null);
  }, [maxFiles]);

  const removeFile = (i: number) => setFiles((f) => f.filter((_, idx) => idx !== i));

  // ── Drag handlers ────────────────────────────────────────────────────────────

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDrag(true); }
  function onDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    addFiles(e.dataTransfer.files);
  }

  // ── Process ──────────────────────────────────────────────────────────────────

  const handleProcess = async () => {
    if (!files.length || processing) return;
    setProc(true);
    setError(null);
    setOutputs([]);
    try {
      const fd = new FormData();
      fd.append("toolSlug", tool.slug);
      fd.append("options", JSON.stringify(toolOpts));
      files.forEach((f) => fd.append("files", f, f.name));

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
    } catch (err) {
      setError((err as Error).message ?? "Processing failed. Please try again.");
    } finally {
      setProc(false);
    }
  };

  const reset = () => { setFiles([]); setOutputs([]); setError(null); };

  const btnLabel = BTN_LABELS[tool.slug] ?? tool.name;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">

        {/* ── Upload Zone ── */}
        {outputs.length === 0 && (
          <div className="p-6">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={clsx(
                "border-2 border-dashed rounded-xl py-10 px-6 text-center cursor-pointer",
                "transition-colors duration-200 select-none",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-background-subtle"
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
              <Upload className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground mb-1">
                Select Or Drag &amp; Drop Images Here
              </p>
              <p className="text-sm text-foreground-muted mb-4">
                {accept.replace(/image\//g, "").replace(/,/g, ", ").toUpperCase()} · Max {tool.maxFileSizeMB > 0 ? `${tool.maxFileSizeMB} MB` : "50 MB"}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Select Images
              </button>
            </div>

            {/* ── Selected Files ── */}
            {files.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background-subtle rounded-lg px-3 py-2 text-sm">
                    <span className="flex-1 truncate text-foreground">{f.name}</span>
                    <span className="text-xs text-foreground-muted shrink-0">{fmtKB(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="shrink-0 text-foreground-muted hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tool Options (inline) ── */}
            <div className="mt-5">
              <ToolOptions tool={tool} />
            </div>

            {/* ── Process Button ── */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleProcess}
                disabled={!files.length || processing}
                className={clsx(
                  "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  files.length && !processing
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-border text-foreground-muted cursor-not-allowed"
                )}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Processing…
                  </span>
                ) : btnLabel}
              </button>
              {!files.length && (
                <p className="mt-1.5 text-center text-xs text-foreground-subtle">
                  Select images above to get started
                </p>
              )}
            </div>

            {/* ── Error ── */}
            {error && (
              <p className="mt-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {outputs.length > 0 && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <span className="font-semibold text-foreground">
                Done! {outputs.length} file{outputs.length > 1 ? "s" : ""} ready
              </span>
            </div>
            <div className="space-y-2">
              {outputs.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  download={f.name}
                  className="flex items-center justify-between w-full rounded-xl border border-border bg-background-subtle px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <span className="truncate text-foreground font-medium group-hover:text-primary transition-colors">
                    {f.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-primary font-semibold ml-3 shrink-0">
                    <Download className="h-4 w-4" />
                    Download
                  </span>
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-4 w-full py-2.5 rounded-xl border border-border text-sm text-foreground-muted hover:bg-background-subtle transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Process More Images
            </button>
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="border-t border-border bg-background-subtle px-6 py-3 text-center">
          <p className="text-xs text-foreground-subtle">
            {maxFiles > 1 ? `You can process up to ${maxFiles} images at once. ` : ""}
            Files are processed securely and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImageToolWorkspace;
