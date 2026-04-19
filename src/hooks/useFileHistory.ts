"use client";

/**
 * useFileHistory — no-auth version.
 * File history is not persisted (no backend). Returns empty list.
 */

import type { HistoryItem } from "@/types";

export function useFileHistory(_initialLimit = 20) {
  return {
    items:      [] as HistoryItem[],
    loading:    false,
    error:      null,
    total:      0,
    page:       1,
    totalPages: 1,
    setPage:    (_p: number) => {},
    deleteItem: (_id: string) => {},
    refresh:    () => {},
  };
}
