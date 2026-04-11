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
import api, { apiUpload, apiGet, apiPost, tokenStorage } from "@/lib/api";
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
 * Fetches each file through the authenticated proxy, bundles with JSZip,
 * then triggers a browser save-as dialog.
 */
async function downloadAllAsZip(files: BackendOutputFile[], zipName: string): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const token = tokenStorage.getAccess();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  await Promise.all(
    files.map(async (file) => {
      const res = await fetch(file.downloadUrl, { headers });
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
      // Use the axios api instance (not raw fetch) so the 401 → token-refresh
      // interceptor fires automatically when the access token has expired.
      // responseType: 'blob' tells axios to return binary data directly.
      // downloadUrl is always an absolute URL (http://...) so axios ignores
      // the instance baseURL and sends directly to the backend proxy.
      const response = await api.get(file.downloadUrl, {
        responseType: "blob",
      });

      const blob: Blob = response.data;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (err: unknown) {
      // axios wraps HTTP errors. When responseType is 'blob', error response
      // bodies arrive as Blobs — attempt to read them as JSON for the message.
      const axiosErr = err as {
        response?: { data?: Blob | { message?: string }; status?: number };
        message?: string;
      };
      let msg = axiosErr?.message ?? "Download failed";
      if (axiosErr?.response?.data instanceof Blob) {
        try {
          const text = await (axiosErr.response.data as Blob).text();
          const parsed = JSON.parse(text) as { message?: string };
          if (parsed?.message) msg = parsed.message;
        } catch { /* use axios message */ }
      } else if (
        axiosErr?.response?.data &&
        typeof axiosErr.response.data === "object" &&
        "message" in axiosErr.response.data
      ) {
        msg = (axiosErr.response.data as { message: string }).message ?? msg;
      }
      setDlError(msg);
      toast({ title: "Download failed", description: msg, variant: "error" });
      console.error("[DownloadRow]", msg, "url:", file.downloadUrl);
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
// Real backend processing
//   1. Upload file → POST /files/upload
//   2. Poll job status → GET /tools/jobs/:jobId/status
//   3. Resolve output files from job.outputData
// ─────────────────────────────────────────────

const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 150; // 5 minutes max

async function processFilesWithBackend(
  files: ReturnType<typeof selectFiles>,
  tool: Tool,
  toolOptions: Record<string, string | number | boolean>,
  callbacks: {
    onFileStart:    (id: string) => void;
    onFileProgress: (id: string, p: number) => void;
    onFileDone:     (id: string, outputs: BackendOutputFile[]) => void;
    onFileError:    (id: string, err: string) => void;
  }
): Promise<void> {
  // Special handling for pdf-merge: upload all files first, then queue merge
  if (tool.slug === "merge" && files.length >= 2) {
    callbacks.onFileStart(files[0].id);
    files.slice(1).forEach((f) => callbacks.onFileStart(f.id));

    try {
      // Upload all files without a tool to get their IDs
      const fileIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i].file);
        fd.append("category", "pdf");
        const res = await apiUpload<{ file: { id: string } }>("/files/upload", fd, (p) => {
          const overall = Math.round((i / files.length) * 30 + (p / 100) * (30 / files.length));
          files.forEach((f) => callbacks.onFileProgress(f.id, overall));
        });
        fileIds.push(res.data.file.id);
      }

      files.forEach((f) => callbacks.onFileProgress(f.id, 35));

      // Queue merge job (JSON body, not multipart)
      const queueRes = await apiPost<{ job: { jobId: string } }>("/tools/queue", {
        tool:      "pdf-merge",
        category:  "pdf",
        inputData: { fileIds },
      });

      const jobId = queueRes.data.job?.jobId;
      if (!jobId) throw new Error("No job ID returned for merge");

      // Poll job status
      const outputs = await pollJobStatus(jobId, files[0].name, (p) => {
        files.forEach((f) => callbacks.onFileProgress(f.id, p));
      });

      files.forEach((f) => callbacks.onFileDone(f.id, outputs));
    } catch (err) {
      files.forEach((f) => callbacks.onFileError(f.id, (err as Error).message ?? "Merge failed"));
    }
    return;
  }

  // Standard: process each file individually
  for (const file of files) {
    callbacks.onFileStart(file.id);
    try {
      // Step 1: upload
      const fd = new FormData();
      fd.append("file", file.file);
      fd.append("tool", tool.slug);
      fd.append("category", tool.category);
      if (Object.keys(toolOptions).length > 0) {
        fd.append("options", JSON.stringify(toolOptions));
      }

      const uploadRes = await apiUpload<{
        file: { id: string; url: string; originalName: string; size: number };
        job:  { jobId: string } | null;
      }>("/files/upload", fd, (p) => {
        // Upload progress counts as 0–30%
        callbacks.onFileProgress(file.id, Math.round(p * 0.3));
      });

      callbacks.onFileProgress(file.id, 30);

      const jobId = uploadRes.data.job?.jobId;
      if (!jobId) {
        // No job queued — tool just stored the file (shouldn't normally happen)
        callbacks.onFileDone(file.id, [{
          id:          nanoid(),
          name:        uploadRes.data.file.originalName,
          size:        uploadRes.data.file.size,
          type:        file.type,
          downloadUrl: proxyUrl(uploadRes.data.file.url, uploadRes.data.file.originalName),
          expiresAt:   new Date(Date.now() + 3_600_000),
        }]);
        continue;
      }

      // Step 2: poll job until complete
      const outputs = await pollJobStatus(jobId, file.name, (p) =>
        callbacks.onFileProgress(file.id, p)
      );

      callbacks.onFileDone(file.id, outputs);
    } catch (err) {
      callbacks.onFileError(file.id, (err as Error).message ?? "Processing failed");
    }
  }
}

/**
 * Poll GET /tools/jobs/:jobId/status until completed/failed.
 * Returns resolved BackendOutputFile[].
 */
async function pollJobStatus(
  jobId: string,
  originalName: string,
  onProgress: (p: number) => void
): Promise<BackendOutputFile[]> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await apiGet<{
      job: {
        status:     string;
        progress:   number;
        outputData: {
          processedUrl?:      string;
          processedPublicId?: string;
          pages?:             Array<{ page: number; url: string }>;
          originalSize?:      number;
          processedSize?:     number;
        };
        error?: string;
      };
    }>(`/tools/jobs/${jobId}/status`);

    const job = res.data.job;
    // Map backend progress (0-100) to 30-95% in the UI
    onProgress(30 + Math.round((job.progress ?? 0) * 0.65));

    if (job.status === "completed") {
      onProgress(100);
      return resolveOutputFiles(job.outputData, originalName);
    }

    if (job.status === "failed") {
      throw new Error(job.error ?? "Processing failed on the server");
    }
  }

  throw new Error("Processing timed out. Please try again.");
}

/**
 * Wrap a Cloudinary URL with our backend proxy so the browser never hits
 * Cloudinary directly (avoids 401 when PDF/ZIP delivery is disabled).
 */
function proxyUrl(cloudinaryUrl: string, filename: string): string {
  if (!cloudinaryUrl) return cloudinaryUrl;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base}/files/proxy-download?url=${encodeURIComponent(cloudinaryUrl)}&name=${encodeURIComponent(filename)}`;
}

/**
 * Pick the correct output extension from a Cloudinary URL.
 * Recognises both image and document formats.
 */
function outputExtFromUrl(url: string, fallbackExt: string): string {
  if (!url) return fallbackExt;
  const clean = url.split("?")[0];
  const segment = clean.split("/").pop() ?? "";
  const dot = segment.lastIndexOf(".");
  if (dot > 0) {
    const ext = segment.slice(dot + 1).toLowerCase();
    const known = [
      // images
      "jpg", "jpeg", "png", "webp", "gif", "tiff", "bmp", "svg", "avif",
      // documents
      "pdf", "docx", "doc", "xlsx", "xls", "csv", "txt", "pptx", "ppt",
      // archives
      "zip",
    ];
    if (known.includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  }
  return fallbackExt;
}

/** Derive a proper MIME type from a file extension. */
function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
    webp: "image/webp",
    gif:  "image/gif",
    tiff: "image/tiff",
    bmp:  "image/bmp",
    svg:  "image/svg+xml",
    avif: "image/avif",
    pdf:  "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc:  "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls:  "application/vnd.ms-excel",
    csv:  "text/csv",
    txt:  "text/plain",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip:  "application/zip",
  };
  return map[ext] ?? "application/octet-stream";
}

/**
 * Convert job.outputData into a list of download-ready files.
 */
function resolveOutputFiles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputData: Record<string, any>,
  originalName: string
): BackendOutputFile[] {
  // Original file extension (e.g. "jpg" from "photo.jpg")
  const origExt = (originalName.split(".").pop() ?? "jpg").toLowerCase();

  // Multi-file result (e.g. pdf-split pages, pdf-to-jpg pages)
  if (Array.isArray(outputData?.pages) && outputData.pages.length > 0) {
    return outputData.pages.map((p: { page: number; url: string }) => {
      const urlExt  = outputExtFromUrl(p.url, origExt);
      const pageName = originalName.replace(/(\.[^.]+)$/, `_page${p.page}.${urlExt}`);
      return {
        id:          nanoid(),
        name:        pageName,
        size:        outputData.processedSize ?? 0,
        type:        mimeFromExt(urlExt),
        downloadUrl: proxyUrl(p.url, pageName),
        expiresAt:   new Date(Date.now() + 72 * 3_600_000),
      };
    });
  }

  // Single file result
  const url = outputData?.processedUrl ?? "";
  // Use format hint from outputData if present, else detect from URL, else keep original extension
  const formatHint: string = outputData?.format ?? outputData?.outputFormat ?? "";
  const ext = formatHint || outputExtFromUrl(url, origExt);
  // Name: strip original extension, append correct ext
  const baseName = originalName.replace(/\.[^.]+$/, "");
  const name = `${baseName}_processed.${ext}`;

  return [{
    id:          nanoid(),
    name,
    size:        outputData?.processedSize ?? outputData?.originalSize ?? 0,
    type:        mimeFromExt(ext),
    downloadUrl: proxyUrl(url, name),
    expiresAt:   new Date(Date.now() + 72 * 3_600_000),
  }];
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
      await processFilesWithBackend(files, tool, toolOptions, {
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
    toolOptions,
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
