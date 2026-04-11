import React from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ChevronRight, Clock, HardDrive, Shield, Zap, Users } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { TOOL_CATEGORIES } from "@/config/navigation";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatUsageCount(count: number): string {
  if (count >= 1_000_000)
    return `${(count / 1_000_000).toFixed(count >= 10_000_000 ? 0 : 1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return count.toString();
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground-muted">
      <Icon className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden="true" />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ToolHeroProps {
  tool: Tool;
}

// ─────────────────────────────────────────────
// ToolHero — Server Component
// ─────────────────────────────────────────────

/**
 * ToolHero — renders the top banner for individual tool pages.
 *
 * Contains:
 * - Breadcrumb: Home > Category > Tool Name
 * - Tool icon in a gradient circle
 * - Tool name + badge strip (New / Popular / Free / Pro)
 * - Description
 * - Quick-stat chips: usage count, speed, max file size, security note
 */
export function ToolHero({ tool }: ToolHeroProps) {
  const Icon =
    (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.icon] ??
    LucideIcons.Wrench;

  const category = TOOL_CATEGORIES.find((c) => c.id === tool.category);

  return (
    <div className="border-b border-border bg-background-subtle">
      {/* Optional very-subtle radial gradient to add depth */}
      <div className="bg-hero-mesh">
        <div className="container mx-auto px-4 py-8 sm:py-10 max-w-5xl">

          {/* ── Breadcrumb ─────────────────────────────── */}
          <nav
            className="flex flex-wrap items-center gap-1 text-xs text-foreground-subtle mb-6"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link
              href="/tools"
              className="hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <Link
                  href={category.href}
                  className="hover:text-foreground transition-colors"
                >
                  {category.label}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-foreground font-medium" aria-current="page">
              {tool.name}
            </span>
          </nav>

          {/* ── Identity row ────────────────────────────── */}
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Icon */}
            <div
              className={clsx(
                "flex shrink-0 items-center justify-center rounded-2xl",
                "bg-gradient-brand shadow-lg"
              )}
              aria-hidden="true"
              style={{ width: 68, height: 68 }}
            >
              <Icon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              {/* Name + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {tool.name}
                </h1>
                {tool.isNew && (
                  <Badge variant="new" size="md">
                    New
                  </Badge>
                )}
                {tool.isPopular && !tool.isNew && (
                  <Badge variant="popular" size="md">
                    Popular
                  </Badge>
                )}
                {tool.isPremium ? (
                  <Badge variant="premium" size="md">
                    Pro
                  </Badge>
                ) : (
                  <Badge variant="free" size="md">
                    Free
                  </Badge>
                )}
                <Badge variant="default" size="md">
                  <Shield
                    className="h-2.5 w-2.5 text-foreground-subtle"
                    aria-hidden="true"
                  />
                  Secure
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-sm sm:text-base text-foreground-muted max-w-2xl text-pretty leading-relaxed">
                {tool.description}
              </p>

              {/* Quick-stat chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.usageCount && tool.usageCount > 0 && (
                  <StatChip
                    icon={Users}
                    label={`Used ${formatUsageCount(tool.usageCount)}+ times`}
                  />
                )}
                {tool.estimatedTime && (
                  <StatChip icon={Zap} label={`Speed: ${tool.estimatedTime}`} />
                )}
                {tool.maxFileSizeMB > 0 && (
                  <StatChip
                    icon={HardDrive}
                    label={`Max ${tool.maxFileSizeMB}MB`}
                  />
                )}
                {tool.acceptedFileTypes.length > 0 && (
                  <StatChip
                    icon={Clock}
                    label={`Supports: ${tool.acceptedFileTypes.join(", ")}`}
                  />
                )}
                <StatChip
                  icon={Shield}
                  label="Auto-deleted after 1 hour"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolHero;
