/**
 * Zustand store for tool upload and processing state.
 *
 * Architecture note:
 * Kept outside React Context deliberately — frequent progress % updates would
 * cause full-tree re-renders in Context. Zustand's selector pattern ensures
 * only subscribed components re-render on change.
 *
 * State slices:
 * - currentToolId   — which tool page is active
 * - files           — UploadedFile[] with per-file status/progress
 * - overallStatus   — aggregate ToolStatus for the session
 * - results         — ProcessingResult[] from completed runs
 * - toolOptions     — key/value map of user-selected tool options
 */

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { UploadedFile, ProcessingResult, ToolStatus } from "@/types";
import { nanoid } from "nanoid";

// ─────────────────────────────────────────────
// State Shape
// ─────────────────────────────────────────────

interface ToolState {
  // ── Active session ──────────────────────────────────────────
  currentToolId: string | null;
  files: UploadedFile[];
  overallStatus: ToolStatus;
  results: ProcessingResult[];
  /** Key/value map of user-selected tool options (e.g. { quality: 80, format: "webp" }) */
  toolOptions: Record<string, string | number | boolean>;

  // ── File management ──────────────────────────────────────────
  addFiles: (fileList: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  // ── Per-file lifecycle ───────────────────────────────────────
  setFileStatus: (id: string, status: ToolStatus, progress?: number) => void;
  setFileError: (id: string, error: string) => void;
  setFileProgress: (id: string, progress: number) => void;
  setFileResult: (id: string, result: string) => void;

  // ── Processing lifecycle ─────────────────────────────────────
  setOverallStatus: (status: ToolStatus) => void;
  addResult: (result: ProcessingResult) => void;
  clearResults: () => void;

  // ── Tool options ─────────────────────────────────────────────
  setToolOption: (key: string, value: string | number | boolean) => void;
  resetToolOptions: () => void;

  // ── Session lifecycle ────────────────────────────────────────
  setCurrentTool: (toolId: string) => void;
  resetSession: () => void;
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useToolStore = create<ToolState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      currentToolId: null,
      files: [],
      overallStatus: "idle",
      results: [],
      toolOptions: {},

      // ── File management ──────────────────────────────────────

      addFiles: (fileList) => {
        const newFiles: UploadedFile[] = fileList.map((file) => ({
          id: nanoid(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          status: "idle",
          progress: 0,
        }));
        set(
          (state) => ({ files: [...state.files, ...newFiles] }),
          false,
          "addFiles"
        );
      },

      removeFile: (id) => {
        const file = get().files.find((f) => f.id === id);
        if (file?.preview) URL.revokeObjectURL(file.preview);
        set(
          (state) => ({ files: state.files.filter((f) => f.id !== id) }),
          false,
          "removeFile"
        );
      },

      clearFiles: () => {
        get().files.forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        set({ files: [], overallStatus: "idle" }, false, "clearFiles");
      },

      // ── Per-file lifecycle ───────────────────────────────────

      setFileStatus: (id, status, progress) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id
                ? { ...f, status, progress: progress ?? f.progress }
                : f
            ),
          }),
          false,
          "setFileStatus"
        ),

      setFileError: (id, error) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, status: "error" as ToolStatus, error } : f
            ),
          }),
          false,
          "setFileError"
        ),

      setFileProgress: (id, progress) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, progress } : f
            ),
          }),
          false,
          "setFileProgress"
        ),

      setFileResult: (id, result) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, result, status: "done" as ToolStatus, progress: 100 } : f
            ),
          }),
          false,
          "setFileResult"
        ),

      // ── Processing lifecycle ─────────────────────────────────

      setOverallStatus: (status) =>
        set({ overallStatus: status }, false, "setOverallStatus"),

      addResult: (result) =>
        set(
          (state) => ({ results: [result, ...state.results] }),
          false,
          "addResult"
        ),

      clearResults: () =>
        set({ results: [] }, false, "clearResults"),

      // ── Tool options ─────────────────────────────────────────

      setToolOption: (key, value) =>
        set(
          (state) => ({ toolOptions: { ...state.toolOptions, [key]: value } }),
          false,
          "setToolOption"
        ),

      resetToolOptions: () =>
        set({ toolOptions: {} }, false, "resetToolOptions"),

      // ── Session lifecycle ────────────────────────────────────

      setCurrentTool: (toolId) =>
        set({ currentToolId: toolId }, false, "setCurrentTool"),

      resetSession: () => {
        get().files.forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        set(
          {
            currentToolId: null,
            files: [],
            overallStatus: "idle",
            results: [],
            toolOptions: {},
          },
          false,
          "resetSession"
        );
      },
    })),
    { name: "toolhive-tool-store" }
  )
);

// ─────────────────────────────────────────────
// Selectors — stable references for useToolStore(selector)
// ─────────────────────────────────────────────

export const selectFiles = (s: ToolState) => s.files;
export const selectOverallStatus = (s: ToolState) => s.overallStatus;
export const selectResults = (s: ToolState) => s.results;
export const selectToolOptions = (s: ToolState) => s.toolOptions;
export const selectCurrentToolId = (s: ToolState) => s.currentToolId;

export const selectHasFiles = (s: ToolState) => s.files.length > 0;
export const selectFileCount = (s: ToolState) => s.files.length;

export const selectAllDone = (s: ToolState) =>
  s.files.length > 0 && s.files.every((f) => f.status === "done");

export const selectHasErrors = (s: ToolState) =>
  s.files.some((f) => f.status === "error");

export const selectIsProcessing = (s: ToolState) =>
  s.overallStatus === "processing" || s.overallStatus === "uploading";

/** Overall progress as 0–100 average across all files */
export const selectTotalProgress = (s: ToolState): number => {
  if (!s.files.length) return 0;
  return Math.round(
    s.files.reduce((acc, f) => acc + f.progress, 0) / s.files.length
  );
};

/** Files that completed processing successfully */
export const selectDoneFiles = (s: ToolState) =>
  s.files.filter((f) => f.status === "done");

/** Files that failed with an error */
export const selectErrorFiles = (s: ToolState) =>
  s.files.filter((f) => f.status === "error");
