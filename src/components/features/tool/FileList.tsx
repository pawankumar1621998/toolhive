"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  FileImage,
  Film,
  Music,
  File,
  Download,
} from "lucide-react";
import { useToolStore, selectFiles } from "@/lib/store/toolStore";
import type { UploadedFile } from "@/types";

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

/** Format a byte count into a human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/** Returns the appropriate Lucide icon component for a MIME type */
function FileTypeIcon({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) {
  if (mimeType.startsWith("image/"))
    return <FileImage className={className} aria-hidden="true" />;
  if (mimeType === "application/pdf" || mimeType.includes("pdf"))
    return <FileText className={className} aria-hidden="true" />;
  if (mimeType.startsWith("video/"))
    return <Film className={className} aria-hidden="true" />;
  if (mimeType.startsWith("audio/"))
    return <Music className={className} aria-hidden="true" />;
  return <File className={className} aria-hidden="true" />;
}

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  idle: "Ready",
  uploading: "Uploading",
  processing: "Processing",
  done: "Done",
  error: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-background-muted text-foreground-muted border-border",
  uploading: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-secondary/10 text-secondary border-secondary/20",
  done: "bg-success/10 text-success border-success/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? STATUS_COLORS.idle
      )}
    >
      {status === "uploading" || status === "processing" ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden="true" />
      ) : status === "done" ? (
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
      ) : status === "error" ? (
        <AlertCircle className="h-2.5 w-2.5" aria-hidden="true" />
      ) : null}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─────────────────────────────────────────────
// FileItem
// ─────────────────────────────────────────────

function FileItem({ file }: { file: UploadedFile }) {
  const removeFile = useToolStore((s) => s.removeFile);
  const isActive =
    file.status === "uploading" || file.status === "processing";
  const isDone = file.status === "done";
  const isError = file.status === "error";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={clsx(
        "group flex items-center gap-3 rounded-xl border p-3",
        "transition-colors duration-150",
        isError
          ? "border-destructive/30 bg-destructive/5"
          : isDone
          ? "border-success/20 bg-success/5"
          : "border-card-border bg-card hover:border-border-strong"
      )}
    >
      {/* Preview / file type icon */}
      <div className="shrink-0" aria-hidden="true">
        {file.preview ? (
          <img
            src={file.preview}
            alt=""
            className="h-11 w-11 rounded-lg object-cover border border-border"
          />
        ) : (
          <div
            className={clsx(
              "flex h-11 w-11 items-center justify-center rounded-lg",
              isError
                ? "bg-destructive/10"
                : isDone
                ? "bg-success/10"
                : isActive
                ? "bg-primary/10"
                : "bg-background-muted"
            )}
          >
            <FileTypeIcon
              mimeType={file.type}
              className={clsx(
                "h-5 w-5",
                isError
                  ? "text-destructive"
                  : isDone
                  ? "text-success"
                  : isActive
                  ? "text-primary"
                  : "text-foreground-muted"
              )}
            />
          </div>
        )}
      </div>

      {/* File info + progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <StatusBadge status={file.status} />
        </div>

        <p className="mt-0.5 text-xs text-foreground-subtle">
          {formatBytes(file.size)}
        </p>

        {/* Animated progress bar */}
        {isActive && (
          <div
            className="mt-2 h-1.5 w-full rounded-full bg-background-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={file.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${file.name} progress: ${file.progress}%`}
          >
            <motion.div
              className={clsx(
                "h-full rounded-full",
                file.status === "uploading"
                  ? "bg-gradient-to-r from-primary to-secondary"
                  : "bg-gradient-brand"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        )}

        {/* Done — completed bar */}
        {isDone && (
          <div
            className="mt-2 h-1.5 w-full rounded-full bg-success/20 overflow-hidden"
            aria-hidden="true"
          >
            <div className="h-full w-full rounded-full bg-success" />
          </div>
        )}

        {/* Error message */}
        {isError && file.error && (
          <p className="mt-1 text-xs text-destructive">{file.error}</p>
        )}
      </div>

      {/* Actions: download (if done with result) or remove */}
      <div className="flex items-center gap-1 shrink-0">
        {isDone && file.result && (
          <a
            href={file.result}
            download={file.name}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-success hover:bg-success/10 transition-colors"
            aria-label={`Download ${file.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}
        {!isActive && (
          <button
            onClick={() => removeFile(file.id)}
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              "text-foreground-subtle hover:text-foreground hover:bg-background-muted",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            )}
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.li>
  );
}

// ─────────────────────────────────────────────
// FileList
// ─────────────────────────────────────────────

/**
 * FileList — renders all uploaded files with animated progress bars.
 *
 * Reads from Zustand toolStore via selector.
 * Returns null when no files have been added.
 * Each item animates in/out with framer-motion layout animations.
 */
export function FileList() {
  const files = useToolStore(selectFiles);

  if (files.length === 0) return null;

  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </p>
        <div className="flex items-center gap-3 text-xs text-foreground-subtle">
          {doneCount > 0 && (
            <span className="text-success font-medium">
              {doneCount} done
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-destructive font-medium">
              {errorCount} failed
            </span>
          )}
        </div>
      </div>

      {/* File list with layout animations */}
      <ul className="space-y-2" aria-label="Selected files" aria-live="polite">
        <AnimatePresence initial={false}>
          {files.map((file) => (
            <FileItem key={file.id} file={file} />
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}

export default FileList;
