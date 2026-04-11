"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  FileText,
  Image,
  Video,
  Pen,
  FileAudio,
  Repeat2,
  ArrowRight,
  Wrench,
  Search,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteItem } from "@/types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Image,
  Video,
  Pen,
  FileAudio,
  Repeat2,
};

const CATEGORY_STYLE: Record<
  string,
  { badgeVariant: "primary" | "secondary" | "accent" | "success" | "default"; label: string; iconText: string; iconBg: string }
> = {
  pdf: { badgeVariant: "primary", label: "PDF", iconText: "text-primary", iconBg: "bg-primary/10" },
  image: { badgeVariant: "secondary", label: "Image", iconText: "text-secondary", iconBg: "bg-secondary/10" },
  video: { badgeVariant: "default", label: "Video", iconText: "text-warning", iconBg: "bg-warning/10" },
  "ai-writing": { badgeVariant: "accent", label: "AI Writing", iconText: "text-accent", iconBg: "bg-accent/10" },
  audio: { badgeVariant: "success", label: "Audio", iconText: "text-success", iconBg: "bg-success/10" },
  converter: { badgeVariant: "default", label: "Converter", iconText: "text-foreground-muted", iconBg: "bg-background-muted" },
};

// ─────────────────────────────────────────────
// FavoriteCard
// ─────────────────────────────────────────────

interface FavoriteCardProps {
  item: FavoriteItem;
  onUnfavorite: (id: string) => void;
  index: number;
}

function FavoriteCard({ item, onUnfavorite, index }: FavoriteCardProps) {
  const { id, tool } = item;
  const [isRemoving, setIsRemoving] = useState(false);
  const Icon = ICON_MAP[tool.icon] ?? Wrench;
  const style = CATEGORY_STYLE[tool.category] ?? CATEGORY_STYLE.converter;

  const handleUnfavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsRemoving(true);
      // Small delay for exit animation
      setTimeout(() => onUnfavorite(id), 250);
    },
    [id, onUnfavorite]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.92 : 1 }}
      transition={{ duration: 0.2, delay: isRemoving ? 0 : index * 0.05 }}
      className={clsx(
        "group relative flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5",
        "hover:border-primary/20 hover:shadow-md card-lift transition-all duration-200 overflow-hidden"
      )}
      role="listitem"
    >
      {/* Subtle gradient on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        aria-hidden="true"
      />

      {/* Unfavorite button */}
      <button
        onClick={handleUnfavorite}
        className={clsx(
          "absolute top-3.5 right-3.5 z-10",
          "flex h-7 w-7 items-center justify-center rounded-full",
          "text-rose-500 hover:text-rose-600",
          "bg-rose-500/10 hover:bg-rose-500/20",
          "transition-all duration-150",
          "opacity-60 group-hover:opacity-100"
        )}
        aria-label={`Remove ${tool.name} from favorites`}
        title="Remove from favorites"
      >
        <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      </button>

      {/* Icon + category */}
      <div className="relative z-10 flex items-start gap-3">
        <div
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            style.iconBg
          )}
          aria-hidden="true"
        >
          <Icon className={clsx("h-5 w-5", style.iconText)} />
        </div>
        <div className="pt-0.5">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {tool.name}
          </p>
          <Badge variant={style.badgeVariant} size="sm" className="mt-1">
            {style.label}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 text-xs text-foreground-muted leading-relaxed line-clamp-2 flex-1">
        {tool.description}
      </p>

      {/* CTA */}
      <Link
        href={`/tools/${tool.category}/${tool.slug}`}
        className={clsx(
          "relative z-10 flex items-center justify-between",
          "rounded-xl border border-border bg-background-subtle px-4 py-2.5",
          "text-sm font-medium text-foreground",
          "hover:bg-primary hover:text-primary-foreground hover:border-primary",
          "transition-all duration-200 group/btn"
        )}
      >
        <span>Use Now</span>
        <ArrowRight
          className="h-4 w-4 text-foreground-muted group-hover/btn:text-primary-foreground transition-colors"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
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
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background-muted mb-4">
        <Heart
          className="h-8 w-8 text-foreground-muted"
          aria-hidden="true"
        />
        {/* Subtle pulse */}
        <div
          className="absolute inset-0 rounded-2xl bg-rose-500/10 animate-pulse"
          aria-hidden="true"
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        {isFiltered ? "No matches found" : "No favorites yet"}
      </p>
      <p className="mt-1 text-sm text-foreground-muted text-center max-w-xs px-4">
        {isFiltered
          ? "Try a different search term"
          : "Click the heart icon on any tool page to save it here for quick access"}
      </p>
      {!isFiltered && (
        <Link
          href="/tools"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors"
        >
          Browse tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// FavoritesPage
// ─────────────────────────────────────────────

export function FavoritesPage() {
  const { items: favorites, loading, removeFavorite } = useFavorites();
  const [query, setQuery] = useState("");

  const handleUnfavorite = useCallback((id: string) => {
    removeFavorite(id);
  }, [removeFavorite]);

  const filtered = query.trim()
    ? favorites.filter(
        (f) =>
          f.tool.name.toLowerCase().includes(query.toLowerCase()) ||
          f.tool.description.toLowerCase().includes(query.toLowerCase()) ||
          CATEGORY_STYLE[f.tool.category]?.label
            .toLowerCase()
            .includes(query.toLowerCase())
      )
    : favorites;

  const isFiltered = query.trim() !== "";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Favorite tools</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {favorites.length > 0
              ? `${favorites.length} saved tool${favorites.length !== 1 ? "s" : ""} — click any card to launch`
              : "Tools you save will appear here"}
          </p>
        </div>
        {favorites.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {favorites.length}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <Input
          placeholder="Search favorites..."
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
          label="Search favorites"
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl border border-card-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState isFiltered={isFiltered} />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Favorite tools"
        >
          <AnimatePresence>
            {filtered.map((item, i) => (
              <FavoriteCard
                key={item.id}
                item={item}
                onUnfavorite={handleUnfavorite}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Browse more CTA */}
      {favorites.length > 0 && !isFiltered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center pt-2"
        >
          <Link
            href="/tools"
            className="flex items-center gap-2 text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            Discover more tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
