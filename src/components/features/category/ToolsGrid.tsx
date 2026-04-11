"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Users, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { getToolsByCategory } from "@/config/tools";
import type { Tool, ToolCategory } from "@/types";

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
// Format usage count
// ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─────────────────────────────────────────────────────────────────
// ToolCard
// ─────────────────────────────────────────────────────────────────

interface ToolCardProps {
  tool: Tool;
  index: number;
}

function ToolCard({ tool, index }: ToolCardProps) {
  const [hovered, setHovered] = useState(false);

  const Icon =
    (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.icon] ??
    LucideIcons.Wrench;

  const href = `/tools/${tool.category}/${tool.slug}`;
  const gradient = CATEGORY_GRADIENT[tool.category] ?? "from-violet-500 to-blue-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link
        href={href}
        role="listitem"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "group relative flex flex-col gap-4 rounded-2xl border bg-card p-5",
          "transition-all duration-200 overflow-hidden",
          hovered
            ? "border-primary/25 shadow-lg -translate-y-0.5"
            : "border-card-border shadow-sm hover:shadow-md"
        )}
        aria-label={`Use ${tool.name}`}
      >
        {/* Gradient border shimmer on hover */}
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200",
            "bg-gradient-to-br",
            gradient,
            hovered && "opacity-[0.06]"
          )}
        />

        {/* Top row: icon + badges */}
        <div className="flex items-start justify-between gap-2">
          {/* Gradient icon circle */}
          <div
            aria-hidden="true"
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              `bg-gradient-to-br ${gradient}`,
              "shadow-sm transition-transform duration-200",
              hovered && "scale-105"
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          {/* Badges row */}
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
            {tool.isPopular && !tool.isNew && (
              <Badge variant="popular" size="sm">Popular</Badge>
            )}
          </div>
        </div>

        {/* Tool name + description */}
        <div className="flex-1 space-y-1">
          <p
            className={clsx(
              "text-sm font-semibold transition-colors duration-150",
              hovered ? "text-primary" : "text-foreground"
            )}
          >
            {tool.name}
          </p>
          <p className="text-xs leading-relaxed text-foreground-muted line-clamp-2">
            {tool.shortDescription}
          </p>
        </div>

        {/* Footer: stats + CTA */}
        <div className="flex items-center justify-between">
          {/* Usage count */}
          {tool.usageCount ? (
            <span className="flex items-center gap-1 text-xs text-foreground-subtle">
              <Users className="h-3 w-3" aria-hidden="true" />
              {formatCount(tool.usageCount)} uses
            </span>
          ) : tool.estimatedTime ? (
            <span className="flex items-center gap-1 text-xs text-foreground-subtle">
              <Zap className="h-3 w-3" aria-hidden="true" />
              {tool.estimatedTime}
            </span>
          ) : (
            <span />
          )}

          {/* "Use Now" CTA — appears on hover */}
          <span
            aria-hidden="true"
            className={clsx(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1",
              "text-xs font-medium transition-all duration-200",
              hovered
                ? `bg-gradient-to-r ${gradient} text-white shadow-sm translate-x-0 opacity-100`
                : "opacity-0 translate-x-1 bg-transparent text-primary"
            )}
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
// Empty state
// ─────────────────────────────────────────────────────────────────

function EmptyState({ category }: { category: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-muted">
        <LucideIcons.PackageOpen className="h-6 w-6 text-foreground-subtle" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          No tools found in this category
        </p>
        <p className="mt-1 text-xs text-foreground-muted">
          Check back soon — more {category} tools are on the way.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ToolsGrid props & component
// ─────────────────────────────────────────────────────────────────

export type ToolFilter =
  | "all"
  | "popular"
  | "free"
  | "new"
  | "recent";

interface ToolsGridProps {
  category: ToolCategory;
  /** Active type filter from the sidebar */
  filter?: ToolFilter;
  /** Active sub-category filter (e.g. "Compress") */
  subCategory?: string | null;
  /** Override tool list (e.g. from search results) */
  tools?: Tool[];
  /** Highlight a search query within tool names */
  searchQuery?: string;
}

export function ToolsGrid({
  category,
  filter = "all",
  subCategory = null,
  tools: toolsProp,
  searchQuery,
}: ToolsGridProps) {
  // Use provided tools or load from config
  const allTools = toolsProp ?? getToolsByCategory(category);

  // Apply type filter
  let filtered = allTools;
  if (filter === "popular") {
    filtered = allTools.filter((t) => t.isPopular);
  } else if (filter === "free") {
    filtered = allTools.filter((t) => !t.isPremium);
  } else if (filter === "new") {
    filtered = allTools.filter((t) => t.isNew);
  }

  // Apply sub-category filter (tag-based matching)
  if (subCategory) {
    const sub = subCategory.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.tags.some((tag) => tag.toLowerCase().includes(sub)) ||
        t.name.toLowerCase().includes(sub) ||
        t.shortDescription.toLowerCase().includes(sub)
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      role="list"
      aria-label={`${category} tools`}
    >
      {filtered.length === 0 ? (
        <EmptyState category={category} />
      ) : (
        filtered.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))
      )}
    </div>
  );
}
