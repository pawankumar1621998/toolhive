"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  Sparkles,
  PackageOpen,
  ChevronDown,
  Gift,
  Crown,
  LayoutGrid,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { TOOLS, TOOL_CATEGORIES } from "@/config/tools";
import { Badge } from "@/components/ui/Badge";
import type { Tool, ToolCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type PriceFilter = "all" | "free" | "premium";
type SortOption = "relevance" | "popular" | "new";

interface ActiveFilters {
  category: string; // "" = all
  price: PriceFilter;
  sort: SortOption;
}

// ─────────────────────────────────────────────────────────────────
// Search logic (pure, memoised)
// ─────────────────────────────────────────────────────────────────

function scoreToolMatch(tool: Tool, q: string): number {
  const ql = q.toLowerCase();
  let score = 0;
  if (tool.name.toLowerCase().includes(ql)) score += 8;
  if (tool.shortDescription.toLowerCase().includes(ql)) score += 4;
  if (tool.description.toLowerCase().includes(ql)) score += 2;
  if (tool.tags.some((t) => t.toLowerCase().includes(ql))) score += 3;
  if (tool.category.toLowerCase().includes(ql)) score += 1;
  return score;
}

function filterAndSort(
  query: string,
  filters: ActiveFilters
): Tool[] {
  const q = query.trim().toLowerCase();

  let results = TOOLS.filter((tool) => {
    // Category filter
    if (filters.category && tool.category !== filters.category) return false;
    // Price filter
    if (filters.price === "free" && tool.isPremium) return false;
    if (filters.price === "premium" && !tool.isPremium) return false;
    // Query filter
    if (q && scoreToolMatch(tool, q) === 0) return false;
    return true;
  });

  // Sort
  if (filters.sort === "popular" || (!q && filters.sort === "relevance")) {
    results = results.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
  } else if (filters.sort === "new") {
    results = results.filter((t) => t.isNew).concat(results.filter((t) => !t.isNew));
  } else if (q) {
    // Relevance — sort by score
    results = results.sort(
      (a, b) => scoreToolMatch(b, q) - scoreToolMatch(a, q)
    );
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────
// Highlight matched text
// ─────────────────────────────────────────────────────────────────

function HighlightText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  if (!query.trim()) return <span className={className}>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-primary/15 text-primary font-semibold rounded-sm px-px"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Format count
// ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─────────────────────────────────────────────────────────────────
// Category gradient map
// ─────────────────────────────────────────────────────────────────

const CATEGORY_GRADIENT: Record<string, string> = {
  pdf: "from-rose-500 to-orange-400",
  image: "from-violet-500 to-purple-400",
  video: "from-blue-500 to-cyan-400",
  "ai-writing": "from-emerald-500 to-teal-400",
  audio: "from-amber-500 to-yellow-400",
  converter: "from-sky-500 to-indigo-400",
};

// ─────────────────────────────────────────────────────────────────
// SearchPageClient
// ─────────────────────────────────────────────────────────────────

export function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const [query, setQueryState] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>({
    category: initialCategory,
    price: "all",
    sort: "relevance",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
      // Sync URL without pushing to history stack
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (filters.category) params.set("category", filters.category);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filters.category, pathname, router]);

  // Memoised filtered results
  const results = useMemo(
    () => filterAndSort(debouncedQuery, filters),
    [debouncedQuery, filters]
  );

  // Result counts per category for the sidebar facets
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TOOLS.forEach((t) => {
      const q = debouncedQuery.trim().toLowerCase();
      if (q && scoreToolMatch(t, q) === 0) return;
      if (filters.price === "free" && t.isPremium) return;
      if (filters.price === "premium" && !t.isPremium) return;
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    });
    return counts;
  }, [debouncedQuery, filters.price]);

  const totalCount = useMemo(
    () => Object.values(categoryCounts).reduce((a, b) => a + b, 0),
    [categoryCounts]
  );

  const updateFilter = useCallback(
    <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters({ category: "", price: "all", sort: "relevance" });
  }, []);

  const hasActiveFilters =
    filters.category !== "" ||
    filters.price !== "all" ||
    filters.sort !== "relevance";

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* ── Search header bar ── */}
      <div className="sticky top-0 z-navbar border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div
            className={clsx(
              "flex items-center gap-3 rounded-xl border bg-background px-4 h-12",
              "transition-all duration-200",
              "border-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--tw-primary)_20%,transparent)]"
            )}
          >
            <span className="shrink-0 text-foreground-subtle" aria-hidden="true">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </span>
            <input
              ref={inputRef}
              type="search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search all tools"
              placeholder="Search tools, categories, features…"
              value={query}
              onChange={(e) => setQueryState(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  inputRef.current?.blur();
                }
              }}
              className={clsx(
                "flex-1 bg-transparent text-sm text-foreground",
                "placeholder:text-foreground-subtle",
                "outline-none border-none focus:ring-0"
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQueryState("")}
                aria-label="Clear search"
                className={clsx(
                  "flex items-center justify-center h-5 w-5 rounded-full shrink-0",
                  "bg-foreground-subtle/20 hover:bg-foreground-subtle/30",
                  "text-foreground-subtle hover:text-foreground",
                  "transition-colors duration-150"
                )}
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              aria-label="Toggle filters"
              className={clsx(
                "flex lg:hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 shrink-0",
                "text-xs font-medium transition-all duration-150",
                hasActiveFilters
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:border-border-strong hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {[
                    filters.category !== "",
                    filters.price !== "all",
                    filters.sort !== "relevance",
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* ── Sidebar (desktop) ── */}
          <aside
            className="hidden lg:flex flex-col gap-6 w-56 shrink-0"
            aria-label="Search filters"
          >
            <FilterSidebar
              filters={filters}
              categoryCounts={categoryCounts}
              totalCount={totalCount}
              onFilterChange={updateFilter}
              onClearAll={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                {isSearching ? (
                  <div className="h-5 w-48 rounded animate-shimmer" />
                ) : (
                  <p className="text-sm text-foreground-muted">
                    {debouncedQuery.trim() ? (
                      <>
                        <span className="font-semibold text-foreground">
                          {results.length}
                        </span>{" "}
                        result{results.length !== 1 ? "s" : ""} for{" "}
                        <span className="font-semibold text-foreground">
                          &ldquo;{debouncedQuery}&rdquo;
                        </span>
                      </>
                    ) : (
                      <>
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                          {results.length}
                        </span>{" "}
                        tool{results.length !== 1 ? "s" : ""}
                      </>
                    )}
                    {filters.category && (
                      <span className="text-foreground-subtle">
                        {" "}
                        in{" "}
                        {TOOL_CATEGORIES.find((c) => c.id === filters.category)
                          ?.label ?? filters.category}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Sort control */}
              <SortSelect
                value={filters.sort}
                onChange={(v) => updateFilter("sort", v)}
              />
            </div>

            {/* Active filter chips */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 mb-4 overflow-hidden"
                >
                  {filters.category && (
                    <FilterChip
                      label={
                        TOOL_CATEGORIES.find((c) => c.id === filters.category)
                          ?.label ?? filters.category
                      }
                      onRemove={() => updateFilter("category", "")}
                    />
                  )}
                  {filters.price !== "all" && (
                    <FilterChip
                      label={filters.price === "free" ? "Free" : "Premium"}
                      onRemove={() => updateFilter("price", "all")}
                    />
                  )}
                  {filters.sort !== "relevance" && (
                    <FilterChip
                      label={
                        filters.sort === "popular"
                          ? "Most Popular"
                          : "New first"
                      }
                      onRemove={() => updateFilter("sort", "relevance")}
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-foreground-subtle hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results grid */}
            {isSearching ? (
              <SearchSkeleton />
            ) : results.length > 0 ? (
              <motion.div
                key={`${debouncedQuery}-${filters.category}-${filters.price}-${filters.sort}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                role="list"
                aria-label="Search results"
              >
                {results.map((tool, i) => (
                  <SearchResultCard
                    key={tool.id}
                    tool={tool}
                    query={debouncedQuery}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              <EmptySearchState
                query={debouncedQuery}
                hasFilters={hasActiveFilters}
                onClearFilters={clearAllFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter sheet ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-overlay lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className={clsx(
                "fixed bottom-0 left-0 right-0 z-modal lg:hidden",
                "rounded-t-3xl border-t border-border bg-card",
                "max-h-[80vh] overflow-y-auto pb-safe"
              )}
              style={{ zIndex: 60 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-foreground">
                    Filters
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close filters"
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background-subtle text-foreground-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  categoryCounts={categoryCounts}
                  totalCount={totalCount}
                  onFilterChange={updateFilter}
                  onClearAll={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className={clsx(
                    "mt-6 w-full rounded-xl bg-primary py-3",
                    "text-sm font-medium text-primary-foreground",
                    "hover:bg-primary-hover transition-colors"
                  )}
                >
                  Show {results.length} result{results.length !== 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FilterSidebar
// ─────────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  filters: ActiveFilters;
  categoryCounts: Record<string, number>;
  totalCount: number;
  onFilterChange: <K extends keyof ActiveFilters>(
    key: K,
    value: ActiveFilters[K]
  ) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

function FilterSidebar({
  filters,
  categoryCounts,
  totalCount,
  onFilterChange,
  onClearAll,
  hasActiveFilters,
}: FilterSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Category facets */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Category
        </p>
        <nav className="flex flex-col gap-0.5">
          {/* All */}
          <CategoryFilterBtn
            label="All categories"
            count={totalCount}
            isActive={filters.category === ""}
            onClick={() => onFilterChange("category", "")}
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
          />
          {TOOL_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const catIcon =
              (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[cat.iconName] ??
              LucideIcons.Wrench;
            const CatIcon = catIcon;
            return (
              <CategoryFilterBtn
                key={cat.id}
                label={cat.label}
                count={count}
                isActive={filters.category === cat.id}
                onClick={() =>
                  onFilterChange(
                    "category",
                    filters.category === cat.id ? "" : (cat.id as ToolCategory)
                  )
                }
                icon={<CatIcon className="h-3.5 w-3.5" />}
                gradient={CATEGORY_GRADIENT[cat.id]}
              />
            );
          })}
        </nav>
      </div>

      {/* Price filter */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Pricing
        </p>
        <nav className="flex flex-col gap-0.5">
          {[
            { id: "all" as PriceFilter, label: "All", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
            { id: "free" as PriceFilter, label: "Free", icon: <Gift className="h-3.5 w-3.5" /> },
            { id: "premium" as PriceFilter, label: "Premium", icon: <Crown className="h-3.5 w-3.5" /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange("price", id)}
              className={clsx(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filters.price === id
                  ? "bg-sidebar-item-active text-sidebar-item-active-text font-medium"
                  : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
              )}
            >
              <span
                className={clsx(
                  filters.price === id
                    ? "text-sidebar-item-active-text"
                    : "text-foreground-subtle"
                )}
                aria-hidden="true"
              >
                {icon}
              </span>
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Clear all */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            type="button"
            onClick={onClearAll}
            className={clsx(
              "rounded-xl border border-border px-3 py-2",
              "text-sm text-foreground-muted",
              "hover:border-border-strong hover:text-foreground hover:bg-background-subtle",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            Clear all filters
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CategoryFilterBtn
// ─────────────────────────────────────────────────────────────────

interface CategoryFilterBtnProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  gradient?: string;
}

function CategoryFilterBtn({
  label,
  count,
  isActive,
  onClick,
  icon,
  gradient,
}: CategoryFilterBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-sidebar-item-active text-sidebar-item-active-text font-medium"
          : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
      )}
    >
      <span
        className={clsx(
          "shrink-0",
          isActive
            ? "text-sidebar-item-active-text"
            : gradient
            ? "text-foreground-subtle"
            : "text-foreground-subtle"
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1 truncate text-left">{label}</span>
      {count > 0 && (
        <span
          className={clsx(
            "ml-auto shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium",
            isActive
              ? "bg-sidebar-item-active-text/20 text-sidebar-item-active-text"
              : "bg-background-muted text-foreground-subtle"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// SortSelect
// ─────────────────────────────────────────────────────────────────

interface SortSelectProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

function SortSelect({ value, onChange }: SortSelectProps) {
  const labels: Record<SortOption, string> = {
    relevance: "Relevance",
    popular: "Most Popular",
    new: "Newest first",
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort results"
        className={clsx(
          "appearance-none rounded-lg border border-border bg-background",
          "py-1.5 pl-3 pr-8 text-xs font-medium text-foreground",
          "hover:border-border-strong transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "cursor-pointer"
        )}
      >
        {(["relevance", "popular", "new"] as SortOption[]).map((opt) => (
          <option key={opt} value={opt}>
            {labels[opt]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle"
        aria-hidden="true"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FilterChip
// ─────────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full",
        "border border-primary/25 bg-primary/10",
        "px-2.5 py-0.5 text-xs font-medium text-primary"
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors p-px"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// SearchResultCard
// ─────────────────────────────────────────────────────────────────

interface SearchResultCardProps {
  tool: Tool;
  query: string;
  index: number;
}

function SearchResultCard({ tool, query, index }: SearchResultCardProps) {
  const [hovered, setHovered] = useState(false);

  const Icon =
    (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.icon] ??
    LucideIcons.Wrench;
  const gradient = CATEGORY_GRADIENT[tool.category] ?? "from-violet-500 to-blue-500";
  const href = `/tools/${tool.category}/${tool.slug}`;

  const catConfig = TOOL_CATEGORIES.find((c) => c.id === tool.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      role="listitem"
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "relative flex flex-col gap-4 rounded-2xl border bg-card p-5",
          "transition-all duration-200 overflow-hidden",
          hovered
            ? "border-primary/25 shadow-lg -translate-y-0.5"
            : "border-card-border shadow-sm"
        )}
      >
        {/* Hover glow */}
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200",
            `bg-gradient-to-br ${gradient}`,
            hovered ? "opacity-[0.055]" : "opacity-0"
          )}
        />

        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              `bg-gradient-to-br ${gradient}`,
              "shadow-sm transition-transform duration-200",
              hovered && "scale-105"
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          <div className="flex flex-wrap justify-end gap-1">
            {tool.isNew && (
              <Badge variant="new" size="sm">
                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                New
              </Badge>
            )}
            {tool.isPremium ? (
              <Badge variant="premium" size="sm">Pro</Badge>
            ) : (
              <Badge variant="free" size="sm">Free</Badge>
            )}
          </div>
        </div>

        {/* Name + description */}
        <div className="flex-1 space-y-1">
          <HighlightText
            text={tool.name}
            query={query}
            className={clsx(
              "block text-sm font-semibold transition-colors",
              hovered ? "text-primary" : "text-foreground"
            )}
          />
          <HighlightText
            text={tool.shortDescription}
            query={query}
            className="block text-xs leading-relaxed text-foreground-muted line-clamp-2"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {catConfig && (
            <span className="text-xs text-foreground-subtle">
              {catConfig.label}
            </span>
          )}
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1",
              "text-xs font-medium transition-all duration-200 ml-auto",
              hovered
                ? `bg-gradient-to-r ${gradient} text-white shadow-sm opacity-100 translate-x-0`
                : "opacity-0 translate-x-1"
            )}
            aria-hidden="true"
          >
            Use Now
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EmptySearchState
// ─────────────────────────────────────────────────────────────────

function EmptySearchState({
  query,
  hasFilters,
  onClearFilters,
}: {
  query: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  // Suggest popular tools
  const suggestions = TOOLS.filter((t) => t.isPopular || t.isFeatured).slice(0, 4);

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background-muted">
        <PackageOpen className="h-7 w-7 text-foreground-subtle" />
      </div>

      <div>
        <p className="text-base font-medium text-foreground">
          {query.trim()
            ? `No results for "${query}"`
            : "No tools match your filters"}
        </p>
        <p className="mt-1.5 text-sm text-foreground-muted max-w-sm">
          {hasFilters
            ? "Try removing some filters or broadening your search."
            : "Try a different search term."}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2",
              "text-sm text-foreground-muted hover:border-border-strong hover:text-foreground",
              "transition-all duration-150"
            )}
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
        <Link
          href="/tools"
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2",
            "text-sm text-foreground-muted hover:border-border-strong hover:text-foreground",
            "transition-all duration-150"
          )}
        >
          Browse all tools
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Suggestion pills */}
      {suggestions.length > 0 && (
        <div className="mt-2">
          <p className="mb-3 text-xs font-medium text-foreground-subtle uppercase tracking-wider">
            Popular tools
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.category}/${tool.slug}`}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full border border-border",
                  "bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted",
                  "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                  "transition-all duration-150"
                )}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SearchSkeleton
// ─────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl animate-shimmer" />
            <div className="h-5 w-12 rounded-full animate-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-2/5 rounded animate-shimmer" />
            <div className="h-2.5 w-4/5 rounded animate-shimmer" />
            <div className="h-2.5 w-3/5 rounded animate-shimmer" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-16 rounded animate-shimmer" />
            <div className="h-6 w-20 rounded-lg animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
