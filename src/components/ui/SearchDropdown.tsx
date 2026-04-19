"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import {
  Search,
  X,
  Loader2,
  Clock,
  ArrowRight,
  Layers,
  Trash2,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useSearch } from "@/hooks/useSearch";
import type { SearchResult, ToolCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Returns the segments of `text` split around `highlight`, case-insensitive. */
function splitHighlight(
  text: string,
  highlight: string
): { part: string; match: boolean }[] {
  if (!highlight.trim()) return [{ part: text, match: false }];
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((p) => ({
    part: p,
    match: p.toLowerCase() === highlight.toLowerCase(),
  }));
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const parts = splitHighlight(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            className="bg-primary/15 text-primary font-semibold rounded-sm px-px"
            style={{ background: "none" }}
          >
            {p.part}
          </mark>
        ) : (
          <span key={i}>{p.part}</span>
        )
      )}
    </>
  );
}

/** Category gradient map — matches TOOL_CATEGORIES config */
const CATEGORY_GRADIENT: Record<string, string> = {
  pdf: "from-rose-500 to-orange-400",
  image: "from-violet-500 to-purple-400",
  video: "from-blue-500 to-cyan-400",
  "ai-writing": "from-emerald-500 to-teal-400",
  audio: "from-amber-500 to-yellow-400",
  converter: "from-sky-500 to-indigo-400",
};

/** Category label map */
const CATEGORY_LABEL: Record<string, string> = {
  pdf: "PDF",
  image: "Image",
  video: "Video",
  "ai-writing": "AI Writing",
  audio: "Audio",
  converter: "Converter",
};

function ResultIcon({
  result,
}: {
  result: SearchResult;
}) {
  if (result.type === "category") {
    const gradient = CATEGORY_GRADIENT[result.id] ?? "from-violet-500 to-blue-500";
    const Icon =
      result.icon
        ? (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[result.icon] ??
          LucideIcons.Layers
        : LucideIcons.Layers;
    return (
      <div
        className={clsx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          `bg-gradient-to-br ${gradient}`
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
    );
  }

  const Icon =
    result.icon
      ? (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[result.icon] ??
        LucideIcons.Wrench
      : LucideIcons.Wrench;
  const gradient =
    result.category ? CATEGORY_GRADIENT[result.category] ?? "from-violet-500 to-blue-500"
    : "from-violet-500 to-blue-500";

  return (
    <div
      className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        `bg-gradient-to-br ${gradient} opacity-90`
      )}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Group results by category for display
// ─────────────────────────────────────────────────────────────────

interface GroupedResults {
  categories: SearchResult[];
  byCategory: Record<string, SearchResult[]>;
  categoryOrder: ToolCategory[];
}

function groupResults(results: SearchResult[]): GroupedResults {
  const categories = results.filter((r) => r.type === "category");
  const tools = results.filter((r) => r.type === "tool");

  const byCategory: Record<string, SearchResult[]> = {};
  const seen = new Set<string>();
  const categoryOrder: ToolCategory[] = [];

  for (const tool of tools) {
    const cat = tool.category ?? "other";
    if (!byCategory[cat]) {
      byCategory[cat] = [];
      if (!seen.has(cat)) {
        seen.add(cat);
        categoryOrder.push(cat as ToolCategory);
      }
    }
    byCategory[cat].push(tool);
  }

  return { categories, byCategory, categoryOrder };
}

// ─────────────────────────────────────────────────────────────────
// SearchDropdown component
// ─────────────────────────────────────────────────────────────────

export interface SearchDropdownProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Additional class names for the wrapper */
  className?: string;
  /** If true, shows the Cmd+K keyboard shortcut badge */
  showShortcut?: boolean;
  /** Called when a result is selected (before navigation) */
  onSelect?: (result: SearchResult) => void;
}

export function SearchDropdown({
  placeholder = "Search tools…",
  className,
  showShortcut = true,
  onSelect,
}: SearchDropdownProps) {
  const router = useRouter();
  const {
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
  } = useSearch(300);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMac, setIsMac] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Detect macOS for shortcut display
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(
      typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac")
    );
  }, []);

  // Flatten results list for keyboard navigation
  const flatResults = React.useMemo(() => {
    return results;
  }, [results]);

  // Reset active index when results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(-1);
  }, [results, query]);

  // Global Cmd+K / Ctrl+K shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [inputRef, setIsOpen]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  // Scroll the active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[role='option']");
    const el = items[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleNavigate = useCallback(
    (result: SearchResult) => {
      commitSearch(query);
      onSelect?.(result);
      setIsOpen(false);
      router.push(result.href);
    },
    [commitSearch, query, onSelect, setIsOpen, router]
  );

  const handleRecentSelect = useCallback(
    (term: string) => {
      setQuery(term);
      inputRef.current?.focus();
    },
    [setQuery, inputRef]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (activeIndex >= 0 && flatResults[activeIndex]) {
            handleNavigate(flatResults[activeIndex]);
          } else if (query.trim()) {
            commitSearch();
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          }
          break;
        }
        case "Escape": {
          setIsOpen(false);
          inputRef.current?.blur();
          break;
        }
      }
    },
    [isOpen, flatResults, activeIndex, handleNavigate, query, commitSearch, setIsOpen, router, inputRef]
  );

  const showDropdown = isOpen && (query.trim() || recentSearches.length > 0);
  const showResults = query.trim().length > 0;
  const grouped = React.useMemo(() => groupResults(results), [results]);

  // Build a flat index → result map for ARIA activedescendant
  const resultId = (i: number) => `search-result-${i}`;

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      {/* ── Search input ── */}
      <div
        role="combobox"
        aria-expanded={!!showDropdown}
        aria-haspopup="listbox"
        aria-owns="search-listbox"
        className={clsx(
          "flex items-center gap-2 rounded-xl border bg-background px-3.5",
          "transition-all duration-200",
          isOpen
            ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--tw-primary)_20%,transparent)]"
            : "border-border hover:border-border-strong",
          "h-11"
        )}
      >
        {/* Search icon / loader */}
        <span className="shrink-0 text-foreground-subtle" aria-hidden="true">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Search tools"
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? resultId(activeIndex) : undefined
          }
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className={clsx(
            "flex-1 bg-transparent text-sm text-foreground",
            "placeholder:text-foreground-subtle",
            "outline-none border-none focus:ring-0",
            "min-w-0"
          )}
        />

        {/* Right side: clear button OR keyboard shortcut badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {query ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className={clsx(
                "flex items-center justify-center h-5 w-5 rounded-full",
                "bg-foreground-subtle/20 hover:bg-foreground-subtle/30",
                "text-foreground-subtle hover:text-foreground",
                "transition-colors duration-150"
              )}
            >
              <X className="h-3 w-3" />
            </button>
          ) : showShortcut ? (
            <kbd
              aria-label={isMac ? "Command K" : "Control K"}
              className={clsx(
                "hidden sm:flex items-center gap-0.5",
                "rounded-md border border-border bg-background-muted",
                "px-1.5 py-0.5 text-[10px] font-medium text-foreground-subtle",
                "pointer-events-none select-none"
              )}
            >
              {isMac ? (
                <Command className="h-2.5 w-2.5" />
              ) : (
                <span>Ctrl</span>
              )}
              <span>K</span>
            </kbd>
          ) : null}
        </div>
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            key="search-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={clsx(
              "absolute left-0 right-0 top-[calc(100%+8px)]",
              "rounded-2xl border border-card-border bg-card shadow-xl",
              "z-modal overflow-hidden",
              "max-h-[480px] flex flex-col"
            )}
            style={{ zIndex: 60 }}
          >
            {/* Results or empty states */}
            {showResults ? (
              <>
                {/* Results list */}
                {results.length > 0 ? (
                  <ul
                    id="search-listbox"
                    ref={listRef}
                    role="listbox"
                    aria-label="Search results"
                    className="overflow-y-auto scrollbar-thin flex-1 py-2"
                  >
                    {/* Category results first */}
                    {grouped.categories.length > 0 && (
                      <li>
                        <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
                          Categories
                        </p>
                        <ul role="group">
                          {grouped.categories.map((result) => {
                            const idx = flatResults.indexOf(result);
                            return (
                              <ResultRow
                                key={result.id}
                                result={result}
                                query={query}
                                id={resultId(idx)}
                                isActive={idx === activeIndex}
                                onSelect={handleNavigate}
                                onMouseEnter={() => setActiveIndex(idx)}
                              />
                            );
                          })}
                        </ul>
                      </li>
                    )}

                    {/* Tool results grouped by category */}
                    {grouped.categoryOrder.map((cat) => {
                      const catTools = grouped.byCategory[cat] ?? [];
                      if (!catTools.length) return null;
                      return (
                        <li key={cat}>
                          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
                            {CATEGORY_LABEL[cat] ?? cat}
                          </p>
                          <ul role="group">
                            {catTools.map((result) => {
                              const idx = flatResults.indexOf(result);
                              return (
                                <ResultRow
                                  key={result.id}
                                  result={result}
                                  query={query}
                                  id={resultId(idx)}
                                  isActive={idx === activeIndex}
                                  onSelect={handleNavigate}
                                  onMouseEnter={() => setActiveIndex(idx)}
                                />
                              );
                            })}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                ) : isLoading ? (
                  <div className="flex flex-col gap-2 p-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg animate-shimmer shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-2/5 rounded animate-shimmer" />
                          <div className="h-2.5 w-3/5 rounded animate-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No results */
                  <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background-muted">
                      <Search className="h-5 w-5 text-foreground-subtle" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        No results for &ldquo;{query}&rdquo;
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Try a different keyword or browse all tools
                      </p>
                    </div>
                    <Link
                      href="/tools"
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary",
                        "hover:underline underline-offset-2"
                      )}
                    >
                      Browse all tools
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {/* Footer: "See all results" link */}
                {results.length > 0 && (
                  <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
                    <p className="text-xs text-foreground-subtle">
                      {results.length} result{results.length !== 1 ? "s" : ""}
                    </p>
                    <Link
                      href={`/search?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => {
                        commitSearch();
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-2"
                    >
                      See all results
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* Empty query — show recent searches */
              recentSearches.length > 0 ? (
                <div className="py-2">
                  <div className="flex items-center justify-between px-4 pt-2 pb-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
                      Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-[11px] text-foreground-subtle hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="py-1">
                    {recentSearches.map((term) => (
                      <li key={term}>
                        <div className="flex items-center group px-2">
                          <button
                            type="button"
                            onClick={() => handleRecentSelect(term)}
                            className={clsx(
                              "flex flex-1 items-center gap-3 rounded-lg px-2 py-2",
                              "text-sm text-foreground-muted",
                              "hover:bg-background-subtle hover:text-foreground",
                              "transition-colors duration-100 text-left"
                            )}
                          >
                            <Clock className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
                            <span className="flex-1 truncate">{term}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRecent(term)}
                            aria-label={`Remove "${term}" from recent searches`}
                            className={clsx(
                              "ml-1 flex items-center justify-center h-6 w-6 rounded-md",
                              "opacity-0 group-hover:opacity-100",
                              "text-foreground-subtle hover:text-foreground hover:bg-background-muted",
                              "transition-all duration-100"
                            )}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground-muted">
                    Search for tools, categories, or features
                  </p>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ResultRow — individual result item
// ─────────────────────────────────────────────────────────────────

interface ResultRowProps {
  result: SearchResult;
  query: string;
  id: string;
  isActive: boolean;
  onSelect: (result: SearchResult) => void;
  onMouseEnter: () => void;
}

function ResultRow({
  result,
  query,
  id,
  isActive,
  onSelect,
  onMouseEnter,
}: ResultRowProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      onMouseEnter={onMouseEnter}
    >
      <button
        type="button"
        onClick={() => onSelect(result)}
        className={clsx(
          "flex w-full items-center gap-3 px-4 py-2.5",
          "transition-colors duration-100",
          isActive
            ? "bg-primary/8 text-foreground"
            : "hover:bg-background-subtle text-foreground"
        )}
      >
        <ResultIcon result={result} />

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              <HighlightedText text={result.name} query={query} />
            </p>
            {result.type === "tool" && result.category && (
              <span
                className={clsx(
                  "shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium",
                  "bg-background-muted text-foreground-subtle border border-border"
                )}
              >
                {CATEGORY_LABEL[result.category] ?? result.category}
              </span>
            )}
            {result.type === "category" && (
              <span
                className={clsx(
                  "shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium",
                  "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                Category
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-foreground-muted truncate">
            <HighlightedText text={result.description} query={query} />
          </p>
        </div>

        <ArrowRight
          className={clsx(
            "h-3.5 w-3.5 shrink-0 transition-all duration-150",
            isActive ? "text-primary translate-x-0.5" : "text-foreground-subtle"
          )}
          aria-hidden="true"
        />
      </button>
    </li>
  );
}
