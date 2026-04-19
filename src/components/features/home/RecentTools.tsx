"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";

// Stored in localStorage under this key
const STORAGE_KEY = "toolhive-recent-tools";

interface RecentToolEntry {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
  usedAt: number; // timestamp
}

/**
 * RecentTools — Client Component
 *
 * Reads recent tool usage from localStorage (written by ToolWorkspace).
 * Renders a horizontal scroll row of recently used tools.
 * Hidden if no history exists.
 */
export function RecentTools() {
  const [recent, setRecent] = useState<RecentToolEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentToolEntry[] = JSON.parse(stored);
        setRecent(parsed.slice(0, 6));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  if (!mounted || recent.length === 0) return null;

  return (
    <section
      className="container mx-auto px-4 py-8"
      aria-labelledby="recent-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="recent-heading"
          className="flex items-center gap-2 text-base font-semibold text-foreground"
        >
          <Clock className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
          Recently used
        </h2>
        <Link
          href="/dashboard/history"
          className="text-xs text-foreground-muted hover:text-primary transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, flex wrap on desktop */}
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        role="list"
      >
        {recent.map((tool) => {
          const Icon =
            (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.icon] ??
            LucideIcons.Wrench;
          const href = `/tools/${tool.category}/${tool.slug}`;

          return (
            <Link
              key={`${tool.id}-${tool.usedAt}`}
              href={href}
              role="listitem"
              className={clsx(
                "flex items-center gap-2 shrink-0",
                "rounded-lg border border-border bg-card px-3 py-2.5",
                "text-sm font-medium text-foreground",
                "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                "transition-all duration-150"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />
              {tool.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Export helper for ToolWorkspace to write history
// ─────────────────────────────────────────────

export function recordRecentTool(tool: Omit<RecentToolEntry, "usedAt">) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: RecentToolEntry[] = stored ? JSON.parse(stored) : [];
    // Remove duplicate if same tool used before
    const filtered = existing.filter((t) => t.id !== tool.id);
    const updated = [{ ...tool, usedAt: Date.now() }, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}
