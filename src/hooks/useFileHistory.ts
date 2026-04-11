"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiDelete } from "@/lib/api";
import type { HistoryItem, ToolCategory } from "@/types";

// ─── Raw backend File record ──────────────────────────────────────────────────

interface BackendFile {
  _id:          string;
  originalName: string;
  url:          string;
  processedUrl: string | null;
  size:         number;
  category:     string;
  toolUsed:     string;
  status:       "pending" | "processing" | "processed" | "failed";
  createdAt:    string;
  expiresAt:    string;
}

interface FileHistoryResponse {
  files: BackendFile[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Map backend file → HistoryItem ──────────────────────────────────────────

function toHistoryItem(f: BackendFile): HistoryItem {
  const toolName = (f.toolUsed ?? f.category ?? "tool")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id:         f._id,
    tool: {
      id:       f._id,
      name:     toolName,
      slug:     f.toolUsed ?? "",
      category: (f.category as ToolCategory) ?? "converter",
      icon:     "FileText",
    },
    inputFiles:  [f.originalName],
    outputFiles: f.processedUrl
      ? [
          {
            id:          `${f._id}_out`,
            name:        f.originalName.replace(/(\.[^.]+)$/, "_processed$1"),
            size:        f.size,
            type:        "application/octet-stream",
            downloadUrl: f.processedUrl,
            expiresAt:   new Date(f.expiresAt),
          },
        ]
      : [],
    createdAt: new Date(f.createdAt),
    status:    f.status === "processed" ? "success" : f.status === "failed" ? "error" : "success",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFileHistory(initialLimit = 20) {
  const [items,   setItems]   = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<FileHistoryResponse>("/dashboard/files", {
        page: p,
        limit: initialLimit,
      });
      setItems(res.data.files.map(toHistoryItem));
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
      setPage(p);
    } catch {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const deleteItem = useCallback(async (id: string) => {
    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTotal((t) => t - 1);
    try {
      await apiDelete(`/files/${id}`);
    } catch {
      // If delete fails, refetch to restore
      fetchPage(page);
    }
  }, [page, fetchPage]);

  const refresh = useCallback(() => fetchPage(page), [page, fetchPage]);

  return {
    items,
    loading,
    error,
    total,
    page,
    totalPages,
    setPage: fetchPage,
    deleteItem,
    refresh,
  };
}
