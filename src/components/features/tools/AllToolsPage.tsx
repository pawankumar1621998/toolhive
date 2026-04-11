"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Search, Zap, Star, TrendingUp, Grid3X3, List } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/config/tools";
import { Badge } from "@/components/ui/Badge";
import * as LucideIcons from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function ToolIcon({ name }: { name: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!Icon) return <Zap className="h-5 w-5" />;
  return <Icon className="h-5 w-5" />;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

// ─────────────────────────────────────────────
// Category gradient map
// ─────────────────────────────────────────────
const CAT_GRADIENT: Record<string, string> = {
  pdf:         "from-rose-500/20 to-orange-400/10",
  image:       "from-violet-500/20 to-purple-400/10",
  video:       "from-blue-500/20 to-cyan-400/10",
  "ai-writing":"from-emerald-500/20 to-teal-400/10",
  audio:       "from-amber-500/20 to-yellow-400/10",
  converter:   "from-sky-500/20 to-indigo-400/10",
};

const CAT_ICON_COLOR: Record<string, string> = {
  pdf:         "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  image:       "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  video:       "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "ai-writing":"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  audio:       "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  converter:   "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

const FILTERS = ["All", "Popular", "New", "Featured"] as const;
type Filter = (typeof FILTERS)[number];

// ─────────────────────────────────────────────
// Tool card
// ─────────────────────────────────────────────
function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  return (
    <Link
      href={`/tools/${tool.category}/${tool.slug}`}
      className={clsx(
        "group relative flex flex-col rounded-2xl border border-card-border bg-card p-5",
        "hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5",
        "transition-all duration-200 cursor-pointer overflow-hidden"
      )}
    >
      {/* Background gradient */}
      <div className={clsx("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br", CAT_GRADIENT[tool.category])} />

      <div className="relative">
        {/* Icon + badges row */}
        <div className="flex items-start justify-between mb-3">
          <div className={clsx("flex h-11 w-11 items-center justify-center rounded-xl", CAT_ICON_COLOR[tool.category] || "bg-primary/15 text-primary")}>
            <ToolIcon name={tool.icon} />
          </div>
          <div className="flex items-center gap-1.5">
            {tool.isPopular && <Badge variant="popular" size="sm">Popular</Badge>}
            {tool.isFeatured && !tool.isPopular && <Badge variant="new" size="sm">Featured</Badge>}
          </div>
        </div>

        {/* Name + description */}
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm leading-snug mb-1.5">
          {tool.name}
        </h3>
        <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-card-border/60">
          <span className="flex items-center gap-1 text-xs text-foreground-subtle">
            <TrendingUp className="h-3 w-3" />
            {formatCount(tool.usageCount ?? 0)} uses
          </span>
          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Use now →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export function AllToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    let tools = TOOLS;

    // Category filter
    if (activeCategory !== "all") {
      tools = tools.filter((t) => t.category === activeCategory);
    }

    // Type filter
    if (activeFilter === "Popular") tools = tools.filter((t) => t.isPopular);
    if (activeFilter === "Featured") tools = tools.filter((t) => t.isFeatured);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return tools;
  }, [activeCategory, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background-subtle border-b border-card-border py-14 sm:py-18">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/8 via-transparent to-transparent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="gradient" size="md" className="mb-4">
              <Grid3X3 className="mr-1.5 h-3.5 w-3.5" />
              200+ Free Tools
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              All{" "}
              <span className="bg-gradient-to-r from-brand-violet via-brand-blue to-brand-cyan bg-clip-text text-transparent">
                ToolHive
              </span>{" "}
              Tools
            </h1>
            <p className="text-lg text-foreground-muted max-w-xl mx-auto">
              Free AI-powered tools for every task. No signup required.
            </p>

            {/* Search bar */}
            <div className="relative max-w-md mx-auto mt-8">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name or type…"
                className="w-full h-12 rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-sm focus:border-primary/50 focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--tw-primary)_12%,transparent)] transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Category tabs + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-card-border bg-card text-foreground-muted hover:text-foreground"
              )}
            >
              All ({TOOLS.length})
            </button>
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-card-border bg-card text-foreground-muted hover:text-foreground"
                )}
              >
                {cat.icon} {cat.label} ({cat.toolCount})
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 sm:ml-auto shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  activeFilter === f
                    ? "bg-background-muted text-foreground border border-border-strong"
                    : "text-foreground-subtle hover:text-foreground-muted"
                )}
              >
                {f === "Popular" && <Star className="inline h-3 w-3 mr-1" />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-foreground-muted mb-6">
          Showing <span className="font-semibold text-foreground">{filteredTools.length}</span> tools
          {searchQuery && <> for &ldquo;<span className="text-primary">{searchQuery}</span>&rdquo;</>}
        </p>

        {/* Tools grid */}
        {filteredTools.length > 0 ? (
          <motion.div
            key={`${activeCategory}-${activeFilter}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-foreground-subtle mb-4" />
            <p className="text-lg font-semibold text-foreground">No tools found</p>
            <p className="text-sm text-foreground-muted mt-1">Try a different search or category.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); setActiveFilter("All"); }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
