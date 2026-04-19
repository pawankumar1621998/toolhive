"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Zap,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Package,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { ToolOptions } from "./ToolOptions";
import {
  useToolStore,
  selectFiles,
  selectOverallStatus,
  selectResults,
  selectHasFiles,
  selectTotalProgress,
  selectToolOptions,
} from "@/lib/store/toolStore";
import { useToast } from "@/components/ui/Toaster";
import { recordRecentTool } from "@/components/features/home/RecentTools";
import { nanoid } from "nanoid";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Backend output file shape from job.outputData
// ─────────────────────────────────────────────

interface BackendOutputFile {
  id: string;
  name: string;
  size: number;
  type: string;
  downloadUrl: string;
  expiresAt: Date;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/**
 * Download all output files as a ZIP archive.
 */
async function downloadAllAsZip(files: BackendOutputFile[], zipName: string): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  await Promise.all(
    files.map(async (file) => {
      const res = await fetch(file.downloadUrl);
      if (!res.ok) throw new Error(`Failed to fetch ${file.name} (${res.status})`);
      const buf = await res.arrayBuffer();
      zip.file(file.name, buf);
    })
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = zipName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
}

/** Single download row with authenticated download handler. */
function DownloadRow({ file }: { file: BackendOutputFile }) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [dlError, setDlError] = React.useState<string | null>(null);
  const { toast } = useToast();

  async function handleClick() {
    if (isDownloading) return;
    setIsDownloading(true);
    setDlError(null);
    try {
      const a = document.createElement("a");
      a.href = file.downloadUrl;
      a.download = file.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "Download failed";
      setDlError(msg);
      toast({ title: "Download failed", description: msg, variant: "error" });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isDownloading}
        className={clsx(
          "flex items-center justify-between w-full rounded-xl border border-border",
          "bg-background-subtle px-4 py-3 text-sm group text-left",
          "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-150",
          "min-h-[56px] disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Package
            className="h-4 w-4 shrink-0 text-foreground-muted group-hover:text-primary transition-colors"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {file.name}
            </p>
            <p className="text-xs text-foreground-subtle">
              {formatBytes(file.size)}
            </p>
          </div>
        </div>
        {/* div instead of Button to avoid nested <button> hydration error */}
        <div
          aria-hidden="true"
          className={clsx(
            "shrink-0 ml-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
            "bg-primary text-primary-foreground pointer-events-none"
          )}
        >
          {isDownloading ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">{isDownloading ? "Saving…" : "Download"}</span>
        </div>
      </button>
      {dlError && (
        <p className="text-xs text-red-500 px-1">{dlError}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Client-side simulation (no backend required)
// ─────────────────────────────────────────────

async function simulateFileProcessing(
  files: ReturnType<typeof selectFiles>,
  callbacks: {
    onFileStart:    (id: string) => void;
    onFileProgress: (id: string, p: number) => void;
    onFileDone:     (id: string, outputs: BackendOutputFile[]) => void;
    onFileError:    (id: string, err: string) => void;
  }
): Promise<void> {
  for (const file of files) {
    callbacks.onFileStart(file.id);
    try {
      // Simulate progress steps
      for (const p of [15, 35, 55, 75, 90]) {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
        callbacks.onFileProgress(file.id, p);
      }
      await new Promise((r) => setTimeout(r, 250));

      // Return original file as a downloadable blob URL
      const blobUrl = URL.createObjectURL(file.file);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();

      callbacks.onFileDone(file.id, [{
        id:          nanoid(),
        name:        `${baseName}_processed.${ext}`,
        size:        file.size,
        type:        file.type,
        downloadUrl: blobUrl,
        expiresAt:   new Date(Date.now() + 3_600_000),
      }]);
    } catch (err) {
      callbacks.onFileError(file.id, (err as Error).message ?? "Processing failed");
    }
  }
}

// ─────────────────────────────────────────────
// Overall progress bar
// ─────────────────────────────────────────────

function OverallProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-foreground-muted">Processing…</span>
        <span className="text-xs font-semibold text-primary tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-background-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-brand"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Collapsible options panel (accordion on mobile)
// Always visible on lg+
// ─────────────────────────────────────────────

function OptionsPanel({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Accordion toggle — only visible below lg */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex w-full items-center justify-between",
          "rounded-xl border border-border bg-background-subtle px-4 py-3",
          "text-sm font-medium text-foreground",
          "transition-colors duration-150 hover:bg-background-muted"
        )}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
          Options
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-foreground-muted transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="options-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Results panel
// ─────────────────────────────────────────────

function ResultsPanel({
  result,
  toolName,
  onReset,
}: {
  result: NonNullable<ReturnType<typeof selectResults>[number]>;
  toolName: string;
  onReset: () => void;
}) {
  const allSize = result.outputFiles.reduce((a, f) => a + f.size, 0);
  const [isZipping, setIsZipping] = React.useState(false);
  const { toast } = useToast();

  async function handleDownloadAll() {
    if (isZipping) return;
    setIsZipping(true);
    try {
      const zipName = `${toolName.replace(/\s+/g, "_")}_files.zip`;
      await downloadAllAsZip(result.outputFiles, zipName);
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "ZIP download failed";
      toast({ title: "Download failed", description: msg, variant: "error" });
    } finally {
      setIsZipping(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="text-center py-4"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 mx-auto mb-4"
        aria-hidden="true"
      >
        <CheckCircle2 className="h-8 w-8 text-success" />
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground">
        Processing complete!
      </h3>
      <p className="mt-1 text-sm text-foreground-muted">
        {result.outputFiles.length} file
        {result.outputFiles.length !== 1 ? "s" : ""} ready &mdash;{" "}
        {formatBytes(allSize)} total
      </p>

      {/* Download list */}
      <ul className="mt-5 space-y-2 text-left" aria-label="Processed files ready to download">
        {result.outputFiles.map((file, i) => (
          <motion.li
            key={`${i}-${file.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06 }}
          >
            <DownloadRow file={file} />
          </motion.li>
        ))}
      </ul>

      {/* Download all — full-width (already fullWidth prop) */}
      {result.outputFiles.length > 1 && (
        <Button
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={isZipping}
          loadingText="Preparing ZIP…"
          leftIcon={!isZipping ? <Download className="h-4 w-4" /> : undefined}
          className="mt-4"
          onClick={handleDownloadAll}
        >
          Download all as ZIP
        </Button>
      )}

      {/* Reset — full-width */}
      <Button
        variant="outline"
        size="md"
        onClick={onReset}
        leftIcon={<RotateCcw className="h-4 w-4" />}
        className="mt-3 w-full"
      >
        Process more files
      </Button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ToolWorkspaceProps {
  tool: Tool;
  /** Optional tool-specific options rendered in the collapsible panel */
  optionsChildren?: React.ReactNode;
}

// ─────────────────────────────────────────────
// ToolWorkspace
// ─────────────────────────────────────────────

/**
 * ToolWorkspace — the primary interactive zone on a tool page.
 *
 * Mobile-first layout changes:
 * - flex-col on mobile, flex-col lg:flex-row for side-by-side on desktop
 * - DropZone: full-width, min-h-[200px] on mobile
 * - Options panel: collapsible accordion on mobile, always visible on lg+
 * - Process button: full-width on all sizes
 * - Results: full-width download rows with min-h touch targets
 * - File list items get more vertical padding for touch
 *
 * State: all managed through Zustand toolStore.
 * On mount: registers current tool and records recent usage.
 * On unmount: resets the session to clear file object URLs.
 */
export function ToolWorkspace({ tool, optionsChildren: optionsChildrenProp }: ToolWorkspaceProps) {
  // Auto-generate options from ToolOptions if caller didn't provide custom children
  const autoOptions = <ToolOptions tool={tool} />;
  const optionsChildren = optionsChildrenProp ?? (autoOptions.type !== null ? autoOptions : null);
  const files = useToolStore(selectFiles);
  const status = useToolStore(selectOverallStatus);
  const results = useToolStore(selectResults);
  const hasFiles = useToolStore(selectHasFiles);
  const totalProgress = useToolStore(selectTotalProgress);

  const {
    setCurrentTool,
    setOverallStatus,
    setFileStatus,
    setFileProgress,
    setFileResult,
    setFileError,
    addResult,
    resetSession,
  } = useToolStore();

  const toolOptions = useToolStore(selectToolOptions);
  const { toast } = useToast();
  const startTimeRef = useRef<number>(0);

  // ── Register tool on mount ─────────────────────────────────

  useEffect(() => {
    setCurrentTool(tool.id);
    recordRecentTool({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      icon: tool.icon,
    });
    return () => {
      resetSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  // ── Process handler ────────────────────────────────────────

  const handleProcess = useCallback(async () => {
    if (!hasFiles || status === "processing") return;

    setOverallStatus("processing");
    startTimeRef.current = Date.now();

    files.forEach((f) => setFileStatus(f.id, "processing", 0));

    // Collect real output files per fileId
    const outputMap  = new Map<string, BackendOutputFile[]>();
    const errorMap   = new Map<string, string>();

    try {
      await simulateFileProcessing(files, {
        onFileStart:    (id) => setFileStatus(id, "processing", 5),
        onFileProgress: (id, p) => setFileProgress(id, p),
        onFileDone:     (id, outputs) => {
          outputMap.set(id, outputs);
          setFileResult(id, outputs[0]?.downloadUrl ?? "");
        },
        onFileError:    (id, err) => {
          errorMap.set(id, err);
          setFileError(id, err);
        },
      });

      const duration = Date.now() - startTimeRef.current;

      // Flatten all output files
      const allOutputs: BackendOutputFile[] = [];
      outputMap.forEach((outs) => allOutputs.push(...outs));

      // If no files succeeded → show error instead of "Done"
      if (allOutputs.length === 0) {
        const firstError = errorMap.size > 0
          ? Array.from(errorMap.values())[0]
          : "Processing failed — no output was generated.";
        setOverallStatus("error");
        toast({
          title: "Processing failed",
          description: firstError,
          variant: "error",
        });
        return;
      }

      addResult({
        id:         nanoid(),
        toolId:     tool.id,
        toolName:   tool.name,
        inputFiles: files.map((f) => f.name),
        outputFiles: allOutputs,
        createdAt:  new Date(),
        duration,
        status:     "success",
      });

      setOverallStatus("done");
      toast({
        title: "Done!",
        description: `${tool.name} completed in ${(duration / 1000).toFixed(1)}s.`,
        variant: "success",
      });
    } catch (err) {
      setOverallStatus("error");
      toast({
        title: "Processing failed",
        description: (err as Error).message ?? "An unexpected error occurred.",
        variant: "error",
      });
    }
  }, [
    hasFiles,
    status,
    files,
    tool,
    setOverallStatus,
    setFileStatus,
    setFileProgress,
    setFileResult,
    setFileError,
    addResult,
    toast,
  ]);

  // ── Reset handler ──────────────────────────────────────────

  const handleReset = useCallback(() => {
    resetSession();
    setCurrentTool(tool.id);
  }, [resetSession, setCurrentTool, tool.id]);

  // ── Derived state ──────────────────────────────────────────

  const isProcessing = status === "processing";
  const isDone = status === "done" && results.length > 0;
  const isError = status === "error";
  const latestResult = results[0];

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      {/* Inner layout:
          mobile  → flex-col (upload zone stacked above options)
          lg+     → flex-row (upload zone left, options panel right) */}
      <div className="flex flex-col lg:flex-row lg:gap-0 lg:divide-x lg:divide-border">

        {/* ── Left / main column: upload + file list + actions ── */}
        <div className="flex-1 min-w-0 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {!isDone && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* DropZone: full-width on mobile, min height comfortable for touch */}
                <DropZone
                  tool={tool}
                  className="min-h-[200px] w-full"
                  onError={(msg) =>
                    toast({ title: "Upload error", description: msg, variant: "error" })
                  }
                />

                <FileList />

                {/* Options accordion — mobile only; desktop panel shown at right */}
                {optionsChildren && (
                  <div className="mt-4">
                    <OptionsPanel>{optionsChildren}</OptionsPanel>
                  </div>
                )}

                {/* Overall progress bar during processing */}
                {isProcessing && (
                  <OverallProgressBar progress={totalProgress} />
                )}

                {/* Error state banner */}
                {isError && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
                    role="alert"
                  >
                    <AlertCircle
                      className="h-5 w-5 text-destructive shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Processing failed
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-muted">
                        One or more files could not be processed. Check the list
                        above and try again.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Process button — always full-width */}
                <div className="mt-5">
                  <Button
                    variant="gradient"
                    size="lg"
                    fullWidth
                    isLoading={isProcessing}
                    disabled={!hasFiles || isProcessing}
                    onClick={handleProcess}
                    leftIcon={!isProcessing ? <Zap className="h-4 w-4" /> : undefined}
                    aria-label={
                      !hasFiles
                        ? "Upload files first"
                        : isProcessing
                        ? `Running ${tool.name}…`
                        : `Run ${tool.name}`
                    }
                  >
                    {isProcessing ? `Running ${tool.name}…` : `Run ${tool.name}`}
                  </Button>
                  {!hasFiles && (
                    <p className="mt-2 text-center text-xs text-foreground-subtle">
                      Add files above to get started
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Results panel ──────────────────────────────── */}
            {isDone && latestResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsPanel
                  result={latestResult}
                  toolName={tool.name}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column: options panel (desktop only) ──────── */}
        {optionsChildren && (
          <div className="hidden lg:block w-64 xl:w-72 shrink-0 p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground-subtle mb-4">
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              Options
            </p>
            {optionsChildren}
          </div>
        )}
      </div>

      {/* Bottom security note */}
      <div className="border-t border-border bg-background-subtle px-4 sm:px-6 py-3">
        <p className="text-xs text-foreground-subtle text-center">
          Files are processed securely and automatically deleted within 1 hour.
          We never store or share your data.
        </p>
      </div>
    </div>
  );
}

export default ToolWorkspace;
