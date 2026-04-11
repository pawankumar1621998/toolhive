import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { getToolsByCategory } from "@/config/tools";
import type { ToolCategory } from "@/types";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface RelatedToolsProps {
  category: ToolCategory;
  currentToolId: string;
}

// ─────────────────────────────────────────────
// RelatedTools — Server Component (cached)
// ─────────────────────────────────────────────

/**
 * RelatedTools — horizontal scroll strip of other tools in the same category.
 *
 * Wrapped in "use cache" for Next.js 14 partial-prerendering.
 * Parent should wrap in <Suspense> to enable streaming.
 */
export async function RelatedTools({
  category,
  currentToolId,
}: RelatedToolsProps) {
  "use cache";

  const tools = getToolsByCategory(category)
    .filter((t) => t.id !== currentToolId)
    .slice(0, 8);

  if (tools.length === 0) return null;

  return (
    <section
      className="mt-12 pb-16"
      aria-labelledby="related-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          id="related-heading"
          className="text-xl font-bold text-foreground"
        >
          More tools you might like
        </h2>
        <Link
          href={`/tools/${category}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        role="list"
        aria-label="Related tools"
      >
        {tools.map((tool) => {
          const Icon =
            (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[
              tool.icon
            ] ?? LucideIcons.Wrench;
          const href = `/tools/${tool.category}/${tool.slug}`;

          return (
            <Link
              key={tool.id}
              href={href}
              role="listitem"
              className={clsx(
                "group flex shrink-0 flex-col gap-3 rounded-xl border border-card-border bg-card p-4",
                "w-44 sm:w-52",
                "hover:border-primary/25 hover:shadow-md card-lift",
                "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              {/* Icon + badge row */}
              <div className="flex items-start justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors"
                  aria-hidden="true"
                >
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                {tool.isNew && (
                  <Badge variant="new" size="sm">
                    New
                  </Badge>
                )}
                {tool.isPremium && !tool.isNew && (
                  <Badge variant="premium" size="sm">
                    Pro
                  </Badge>
                )}
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {tool.name}
                </p>
                <p className="mt-1 text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>

              {/* Arrow hint */}
              <div className="flex items-center gap-1 text-xs text-foreground-subtle group-hover:text-primary transition-colors">
                <span>Use tool</span>
                <ArrowRight
                  className="h-3 w-3 translate-x-0 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedTools;
