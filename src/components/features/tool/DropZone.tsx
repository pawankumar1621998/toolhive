"use client";

import React, { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { CloudUpload, FolderOpen, FileImage, FileText, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToolStore, selectFiles } from "@/lib/store/toolStore";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/** Returns a Lucide icon component that best represents the accepted file types */
function getFileTypeIcon(acceptedFileTypes: string[]) {
  const types = acceptedFileTypes.join(",").toLowerCase();
  if (types.includes("pdf") || types.includes(".doc")) return FileText;
  if (types.includes("image") || types.includes(".jpg") || types.includes(".png"))
    return FileImage;
  if (types.includes("video") || types.includes(".mp4") || types.includes(".mov"))
    return Film;
  if (types.includes("audio") || types.includes(".mp3") || types.includes(".wav"))
    return Music;
  return CloudUpload;
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface DropZoneProps {
  tool: Tool;
  onError?: (message: string) => void;
  className?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * DropZone — premium drag-and-drop file upload area.
 *
 * Features:
 * - Animated dashed border that glows on drag-over (framer-motion)
 * - Icon changes on drag-over; bounces on drop
 * - Reads file constraints from tool config
 * - Delegates validation + store writes to useFileUpload hook
 * - Accessible: role="button", keyboard nav, aria-label
 */
export function DropZone({ tool, onError }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const files = useToolStore(selectFiles);
  const isAtLimit = tool.maxFiles > 0 && files.length >= tool.maxFiles;

  const { handleDrop, handleInputChange, openFilePicker, inputRef } =
    useFileUpload({
      maxFiles: tool.maxFiles,
      maxSizeMB: tool.maxFileSizeMB,
      acceptedTypes: tool.acceptedFileTypes,
      onError,
    });

  const FileTypeIcon = getFileTypeIcon(tool.acceptedFileTypes);

  // ── Drag handlers ────────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAtLimit) setIsDragOver(true);
  }, [isAtLimit]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Only clear when leaving the outer element, not a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      setIsDragOver(false);
      handleDrop(e);
      // Trigger bounce animation
      setJustDropped(true);
    },
    [handleDrop]
  );

  // Reset dropped state
  useEffect(() => {
    if (justDropped) {
      const t = setTimeout(() => setJustDropped(false), 600);
      return () => clearTimeout(t);
    }
  }, [justDropped]);

  const acceptAttr =
    tool.acceptedFileTypes.length > 0
      ? tool.acceptedFileTypes.join(",")
      : undefined;

  const ariaLabel = [
    "Upload files.",
    tool.acceptedFileTypes.length > 0
      ? `Accepted formats: ${tool.acceptedFileTypes.join(", ")}.`
      : "",
    tool.maxFileSizeMB > 0 ? `Max file size: ${tool.maxFileSizeMB} MB.` : "",
    tool.maxFiles > 1 ? `Up to ${tool.maxFiles} files.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={isAtLimit ? undefined : openFilePicker}
      role="button"
      tabIndex={isAtLimit ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={isAtLimit}
      onKeyDown={(e) => {
        if (!isAtLimit && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          openFilePicker();
        }
      }}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-5",
        "rounded-2xl border-2 border-dashed",
        "px-8 py-14 text-center",
        "select-none outline-none",
        "transition-all duration-300",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // States
        isAtLimit
          ? "cursor-not-allowed border-border opacity-60"
          : isDragOver
          ? "cursor-copy border-primary bg-primary/5 scale-[1.01] shadow-glow"
          : "cursor-pointer border-border hover:border-primary/40 hover:bg-primary/[0.02]"
      )}
    >
      {/* Animated glow ring on drag-over */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            key="glow-ring"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in oklch, var(--color-primary) 8%, transparent) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Upload icon — animates on drag-over and drop */}
      <motion.div
        animate={
          justDropped
            ? { scale: [1, 1.25, 0.9, 1.1, 1], y: [0, -12, 4, -4, 0] }
            : isDragOver
            ? { scale: 1.1, y: -4 }
            : { scale: 1, y: 0 }
        }
        transition={{ duration: justDropped ? 0.5 : 0.25, ease: "easeOut" }}
        className={clsx(
          "relative flex h-18 w-18 items-center justify-center rounded-2xl",
          "transition-colors duration-300",
          isDragOver
            ? "bg-primary text-primary-foreground shadow-glow-lg"
            : "bg-background-muted text-foreground-muted"
        )}
        aria-hidden="true"
        style={{ width: 72, height: 72 }}
      >
        {/* Pulse ring on drag-over */}
        {isDragOver && (
          <motion.span
            className="absolute inset-0 rounded-2xl bg-primary/30"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
        <FileTypeIcon
          className={clsx(
            "h-8 w-8 transition-all duration-200",
            isDragOver && "drop-shadow-sm"
          )}
        />
      </motion.div>

      {/* Text content */}
      <div className="space-y-1">
        <p
          className={clsx(
            "text-base font-semibold transition-colors duration-200",
            isDragOver ? "text-primary" : "text-foreground"
          )}
        >
          {isAtLimit
            ? `Maximum ${tool.maxFiles} files reached`
            : isDragOver
            ? "Drop files here"
            : "Drag & drop files here"}
        </p>
        {!isAtLimit && (
          <p className="text-sm text-foreground-muted">
            or{" "}
            <span className="font-medium text-primary underline underline-offset-2 decoration-dashed">
              click to browse
            </span>{" "}
            from your computer
          </p>
        )}
      </div>

      {/* Constraint chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tool.acceptedFileTypes.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background-muted px-3 py-1 text-xs font-medium text-foreground-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary/60"
              aria-hidden="true"
            />
            {tool.acceptedFileTypes.join(", ")}
          </span>
        )}
        {tool.maxFileSizeMB > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background-muted px-3 py-1 text-xs font-medium text-foreground-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-secondary/60"
              aria-hidden="true"
            />
            Max {formatBytes(tool.maxFileSizeMB * 1024 * 1024)}
          </span>
        )}
        {tool.maxFiles > 1 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background-muted px-3 py-1 text-xs font-medium text-foreground-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent/60"
              aria-hidden="true"
            />
            Up to {tool.maxFiles} files
          </span>
        )}
      </div>

      {/* Browse button */}
      {!isAtLimit && (
        <Button
          variant="outline"
          size="md"
          leftIcon={<FolderOpen className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
          className="pointer-events-auto relative z-10"
        >
          Browse files
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={acceptAttr}
        multiple={tool.maxFiles !== 1}
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

export default DropZone;
