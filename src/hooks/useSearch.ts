"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TOOLS } from "@/config/tools";
import { TOOL_CATEGORIES } from "@/config/navigation";
import type { SearchResult, ToolCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────
// Local search — no API round-trip. Filters TOOLS + TOOL_CATEGORIES
// client-side with fuzzy substring matching across name, description,
// shortDescription, tags, and category.
// ─────────────────────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = "toolhive:recent-searches";
const MAX_RECENT = 6;

function scoreMatch(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h === n) return 3;
  if (h.startsWith(n)) return 2;
  if (h.includes(n)) return 1;
  return 0;
}

function searchTools(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: Array<{ result: SearchResult; score: number }> = [];

  // Search tools
  for (const tool of TOOLS) {
    const scores = [
      scoreMatch(tool.name, q) * 4,
      scoreMatch(tool.shortDescription, q) * 2,
      scoreMatch(tool.description, q),
      tool.tags.some((t) => scoreMatch(t, q) > 0) ? 2 : 0,
      scoreMatch(tool.category, q),
    ];
    const total = scores.reduce((a, b) => a + b, 0);
    if (total > 0) {
      scored.push({
        score: total,
        result: {
          type: "tool",
          id: tool.id,
          name: tool.name,
          description: tool.shortDescription,
          href: `/tools/${tool.category}/${tool.slug}`,
          category: tool.category as ToolCategory,
          icon: tool.icon,
        },
      });
    }
  }

  // Search categories
  for (const cat of TOOL_CATEGORIES) {
    const scores = [
      scoreMatch(cat.label, q) * 4,
      scoreMatch(cat.description, q) * 2,
      scoreMatch(cat.id, q) * 3,
    ];
    const total = scores.reduce((a, b) => a + b, 0);
    if (total > 0) {
      scored.push({
        score: total,
        result: {
          type: "category",
          id: cat.id,
          name: cat.label,
          description: cat.description,
          href: cat.href,
          icon: cat.iconName,
        },
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.result);
}

// ─────────────────────────────────────────────────────────────────
// Recent searches — persisted in localStorage
// ─────────────────────────────────────────────────────────────────

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const existing = loadRecentSearches();
    const updated = [
      query.trim(),
      ...existing.filter((r) => r.toLowerCase() !== query.trim().toLowerCase()),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage not available
  }
}

function removeRecentSearch(query: string): string[] {
  const existing = loadRecentSearches();
  const updated = existing.filter((r) => r !== query);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // noop
    }
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────
// Hook return type
// ─────────────────────────────────────────────────────────────────

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clearSearch: () => void;
  commitSearch: (q?: string) => void;
  recentSearches: string[];
  removeRecent: (q: string) => void;
  clearRecent: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

// ─────────────────────────────────────────────────────────────────
// useSearch hook
// ─────────────────────────────────────────────────────────────────

export function useSearch(debounceMs = 300): UseSearchReturn {
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches from localStorage on mount (client only)
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    // Simulate minimal async tick so the UI renders the spinner
    const id = setTimeout(() => {
      setResults(searchTools(q));
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      setIsOpen(true);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!q.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        runSearch(q);
      }, debounceMs);
    },
    [runSearch, debounceMs]
  );

  /** Called when the user presses Enter or clicks a result — persists to recent. */
  const commitSearch = useCallback(
    (q?: string) => {
      const term = (q ?? query).trim();
      if (!term) return;
      saveRecentSearch(term);
      setRecentSearches(loadRecentSearches());
    },
    [query]
  );

  const clearSearch = useCallback(() => {
    setQueryState("");
    setResults([]);
    setIsOpen(false);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setIsLoading(false);
    inputRef.current?.focus();
  }, []);

  const removeRecent = useCallback((q: string) => {
    const updated = removeRecentSearch(q);
    setRecentSearches(updated);
  }, []);

  const clearRecent = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      } catch {
        // noop
      }
    }
    setRecentSearches([]);
  }, []);

  // Escape key closes the dropdown and blurs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    []
  );

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    clearSearch,
    commitSearch,
    recentSearches,
    removeRecent,
    clearRecent,
    inputRef,
  };
}
