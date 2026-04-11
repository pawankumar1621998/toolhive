"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Download,
  Trash2,
  Search,
  FileText,
  Image,
  Video,
  Pen,
  FileAudio,
  Repeat2,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { HistoryItemSkeleton } from "@/components/ui/Skeletons";
import { useFileHistory } from "@/hooks/useFileHistory";
import type { HistoryItem, ToolCategory } from "@/types";


// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  pdf: FileText,
  image: Image,
  video: Video,
  "ai-writing": Pen,
  audio: FileAudio,
  converter: Repeat2,
};

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  pdf: { text: "text-primary", bg: "bg-primary/10" },
  image: { text: "text-secondary", bg: "bg-secondary/10" },
  video: { text: "text-warning", bg: "bg-warning/10" },
  "ai-writing": { text: "text-accent", bg: "bg-accent/10" },
  audio: { text: "text-success", bg: "bg-success/10" },
  converter: { text: "text-foreground-muted", bg: "bg-background-muted" },
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

const FILTER_CATEGORIES: { label: string; value: "all" | ToolCategory }[] = [
  { label: "All", value: "all" },
  { label: "PDF", value: "pdf" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "AI Writing", value: "ai-writing" },
  { label: "Audio", value: "audio" },
];

// ─────────────────────────────────────────────
// History Item Row
// ─────────────────────────────────────────────

interface HistoryRowProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
  index: number;
}

function HistoryRow({ item, onDelete, index }: HistoryRowProps) {
  const Icon = CATEGORY_ICONS[item.tool.category] ?? FileText;
  const colors = CATEGORY_COLORS[item.tool.category] ?? CATEGORY_COLORS.converter;
  const output = item.outputFiles[0];

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={clsx(
        "group flex items-center gap-4 rounded-xl border border-card-border bg-card p-4",
        "hover:border-primary/15 hover:shadow-sm transition-all duration-200"
      )}
    >
      {/* Tool icon */}
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          colors.bg
        )}
        aria-hidden="true"
      >
        <Icon className={clsx("h-5 w-5", colors.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{item.tool.name}</p>
          <Badge
            variant={item.status === "success" ? "success" : "error"}
            size="sm"
            dot
          >
            {item.status}
          </Badge>
        </div>
        <p className="text-xs text-foreground-muted mt-0.5 truncate">
          {item.inputFiles.join(", ")}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {output && (
            <span className="text-xs text-foreground-subtle">
              {output.name}
              {" "}
              <span className="text-foreground-muted">({formatFileSize(output.size)})</span>
            </span>
          )}
          {item.status === "success" ? (
            <CheckCircle2 className="h-3 w-3 text-success shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-3 w-3 text-destructive shrink-0" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Time */}
      <time
        className="hidden sm:block shrink-0 text-xs text-foreground-subtle whitespace-nowrap"
        dateTime={item.createdAt.toISOString()}
      >
        {formatRelativeTime(item.createdAt)}
      </time>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {output && (
          <a href={output.downloadUrl} download={output.name}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              className="h-8"
            >
              <span className="hidden sm:inline">Download</span>
            </Button>
          </a>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(item.id)}
          className="text-foreground-subtle hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
          aria-label={`Delete ${item.tool.name} result`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.li>
  );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background-muted mb-4">
        <Clock className="h-8 w-8 text-foreground-muted" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-foreground">
        {isFiltered ? "No results found" : "No history yet"}
      </p>
      <p className="mt-1 text-sm text-foreground-muted text-center max-w-xs">
        {isFiltered
          ? "Try adjusting your search or filters"
          : "Files you process will appear here for easy access and re-download"}
      </p>
      {!isFiltered && (
        <Button
          variant="primary"
          size="sm"
          className="mt-5"
          asChild
        >
          <a href="/tools">Browse tools</a>
        </Button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// HistoryPage
// ─────────────────────────────────────────────

export function HistoryPage() {
  const { items, loading: isLoading, deleteItem, total, page, totalPages, setPage } = useFileHistory();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ToolCategory>("all");
  const [sortDesc, setSortDesc] = useState(true);

  const handleDelete = useCallback((id: string) => {
    deleteItem(id);
  }, [deleteItem]);

  const handleClearAll = useCallback(() => {
    // Delete all visible items
    items.forEach((item) => deleteItem(item.id));
  }, [items, deleteItem]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (activeCategory !== "all") {
      result = result.filter((i) => i.tool.category === activeCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (i) =>
          i.tool.name.toLowerCase().includes(q) ||
          i.inputFiles.some((f) => f.toLowerCase().includes(q)) ||
          i.outputFiles.some((f) => f.name.toLowerCase().includes(q))
      );
    }

    return sortDesc
      ? [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      : [...result].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [items, query, activeCategory, sortDesc]);

  const isFiltered = query.trim() !== "" || activeCategory !== "all";
  const successCount = filteredItems.filter((i) => i.status === "success").length;
  const errorCount = filteredItems.filter((i) => i.status === "error").length;

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Processing history</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Your recently processed files — links expire after 72 hours
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleClearAll}
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* ── Filters ────────────────────────────── */}
      <div className="space-y-3">
        {/* Search */}
        <Input
          placeholder="Search by tool or file name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftElement={<Search className="h-4 w-4" />}
          rightElement={
            query ? (
              <button
                onClick={() => setQuery("")}
                className="hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
          srOnlyLabel
          label="Search history"
        />

        {/* Category tabs + sort */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTER_CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={clsx(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  activeCategory === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background-muted text-foreground-muted hover:text-foreground hover:bg-background-subtle"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortDesc((s) => !s)}
            className="shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors"
            aria-label={sortDesc ? "Sort oldest first" : "Sort newest first"}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortDesc ? "Newest" : "Oldest"}</span>
            <ChevronDown
              className={clsx(
                "h-3.5 w-3.5 transition-transform",
                !sortDesc && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────── */}
      {!isLoading && total > 0 && (
        <div className="flex items-center gap-4 text-xs text-foreground-muted">
          <span>
            <strong className="text-foreground tabular-nums">{filteredItems.length}</strong>{" "}
            {filteredItems.length === 1 ? "result" : "results"}
            {total > items.length && (
              <span className="text-foreground-subtle"> (of {total} total)</span>
            )}
          </span>
          {successCount > 0 && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {successCount} success
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorCount} failed
            </span>
          )}
        </div>
      )}

      {/* ── Content ────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <HistoryItemSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState isFiltered={isFiltered} />
      ) : (
        <ul className="space-y-3" aria-label="Processing history">
          <AnimatePresence>
            {filteredItems.map((item, i) => (
              <HistoryRow
                key={item.id}
                item={item}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* ── Pagination ─────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-foreground-muted px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
