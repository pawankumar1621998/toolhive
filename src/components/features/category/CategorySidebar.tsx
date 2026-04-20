"use client";

import React from "react";
import {
  Flame,
  Sparkles,
  Gift,
  Clock,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { ToolCategory } from "@/types";
import type { ToolFilter } from "./ToolsGrid";

// ─────────────────────────────────────────────────────────────────
// Sub-category definitions per category
// ─────────────────────────────────────────────────────────────────

const SUB_CATEGORIES: Record<ToolCategory, string[]> = {
  pdf: ["Convert", "Compress", "Edit", "Merge", "Split", "Security"],
  image: ["Compress", "Resize", "Convert", "Enhance", "Background"],
  video: ["Compress", "Trim", "Convert", "Audio", "Subtitle"],
  "ai-writing": ["Summarize", "Translate", "Rewrite", "Grammar", "Generate"],
  converter: ["Document", "Image", "Video", "Audio", "Archive"],
  resume: ["Builder", "Templates", "Analyzer", "Skills", "Cover Letter", "ATS"],
  calculator: ["Finance", "Health", "Math", "Date", "Shopping"],
};

// ─────────────────────────────────────────────────────────────────
// Type filters config
// ─────────────────────────────────────────────────────────────────

interface FilterConfig {
  id: ToolFilter;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const TYPE_FILTERS: FilterConfig[] = [
  { id: "all", label: "All tools", icon: LayoutGrid },
  { id: "popular", label: "Most Popular", icon: Flame },
  { id: "free", label: "Free", icon: Gift },
  { id: "new", label: "New", icon: Sparkles },
  { id: "recent", label: "Recently Added", icon: Clock },
];

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

export interface CategorySidebarProps {
  category: ToolCategory;
  /** Active type filter */
  activeFilter: ToolFilter;
  /** Active sub-category */
  activeSubCategory: string | null;
  onFilterChange: (filter: ToolFilter) => void;
  onSubCategoryChange: (sub: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function CategorySidebar({
  category,
  activeFilter,
  activeSubCategory,
  onFilterChange,
  onSubCategoryChange,
}: CategorySidebarProps) {
  const subCategories = SUB_CATEGORIES[category] ?? [];

  return (
    <aside
      aria-label="Tool filters"
      className="sticky top-24 flex flex-col gap-6"
    >
      {/* ── Type filter section ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Filter by type
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Type filters">
          {TYPE_FILTERS.map(({ id, label, icon: Icon }) => {
            const isActive = activeFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFilterChange(id)}
                aria-pressed={isActive}
                aria-label={`Filter: ${label}`}
                className={clsx(
                  "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-sm font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-sidebar-item-active-text"
                    : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                )}
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-type-active"
                    className="absolute inset-0 rounded-xl bg-sidebar-item-active"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative flex items-center gap-3">
                  <Icon
                    className={clsx(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-sidebar-item-active-text" : "text-foreground-subtle"
                    )}
                    aria-hidden="true"
                  />
                  {label}
                </span>
                {isActive && (
                  <ChevronRight
                    className="relative ml-auto h-3.5 w-3.5 text-sidebar-item-active-text"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Sub-category section ── */}
      {subCategories.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
            Sub-category
          </p>
          <nav
            className="flex flex-col gap-0.5"
            aria-label="Sub-category filters"
          >
            {/* "All" option */}
            <button
              type="button"
              onClick={() => onSubCategoryChange(null)}
              aria-pressed={activeSubCategory === null}
              className={clsx(
                "relative flex w-full items-center rounded-xl px-3 py-2",
                "text-sm transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeSubCategory === null
                  ? "font-medium text-sidebar-item-active-text"
                  : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
              )}
            >
              {activeSubCategory === null && (
                <motion.span
                  layoutId="sidebar-sub-active"
                  className="absolute inset-0 rounded-xl bg-sidebar-item-active"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">All</span>
            </button>

            {subCategories.map((sub) => {
              const isActive = activeSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() =>
                    onSubCategoryChange(isActive ? null : sub)
                  }
                  aria-pressed={isActive}
                  className={clsx(
                    "relative flex w-full items-center rounded-xl px-3 py-2",
                    "text-sm transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "font-medium text-sidebar-item-active-text"
                      : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-sub-active"
                      className="absolute inset-0 rounded-xl bg-sidebar-item-active"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">{sub}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* ── Clear filters ── */}
      <AnimatePresence>
        {(activeFilter !== "all" || activeSubCategory !== null) && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            type="button"
            onClick={() => {
              onFilterChange("all");
              onSubCategoryChange(null);
            }}
            className={clsx(
              "w-full rounded-xl border border-border px-3 py-2",
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
    </aside>
  );
}
