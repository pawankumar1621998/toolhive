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

// Category gradients
const CAT_GRADIENT: Record<string, string> = {
  pdf: "from-rose-500 to-orange-400",
  image: "from-violet-600 to-purple-500",
  video: "from-blue-500 to-cyan-400",
  "ai-writing": "from-emerald-500 to-teal-400",
  audio: "from-amber-500 to-yellow-400",
  converter: "from-sky-500 to-indigo-400",
  resume: "from-indigo-500 to-purple-600",
  calculator: "from-orange-500 to-amber-400",
  generators: "from-cyan-500 to-blue-400",
  "text-writing": "from-teal-500 to-green-400",
  utilities: "from-gray-600 to-slate-500",
  device: "from-slate-600 to-zinc-500",
  finance: "from-green-600 to-emerald-500",
  productivity: "from-amber-500 to-yellow-400",
  code: "from-blue-600 to-indigo-500",
  seo: "from-violet-600 to-purple-500",
  education: "from-indigo-600 to-blue-500",
  health: "from-red-500 to-pink-500",
  travel: "from-sky-500 to-cyan-400",
  entertainment: "from-fuchsia-500 to-pink-400",
};

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
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground-muted">
      <Icon className="h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
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

export function ToolHero({ tool }: ToolHeroProps) {
  const Icon =
    (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.icon] ??
    LucideIcons.Wrench;

  const category = TOOL_CATEGORIES.find((c) => c.id === tool.category);
  const gradient = CAT_GRADIENT[tool.category] ?? "from-violet-600 to-purple-500";

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage: [
          `radial-gradient(ellipse at 0% 50%, oklch(55% 0.22 285 / 0.06) 0%, transparent 50%)`,
          `radial-gradient(ellipse at 100% 50%, oklch(58% 0.2 248 / 0.05) 0%, transparent 50%)`,
        ].join(", "),
      }} />
      <div className="absolute inset-0 -z-10 bg-background" />

      {/* Top accent line */}
      <div className={clsx("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", gradient)} />

      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-5xl">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav
          className="flex flex-wrap items-center gap-1 text-xs text-foreground-subtle mb-6"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-violet-600 transition-colors duration-200 font-medium">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href="/tools" className="hover:text-violet-600 transition-colors duration-200 font-medium">
            Tools
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <Link href={category.href} className="hover:text-violet-600 transition-colors duration-200 font-medium">
                {category.label}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-foreground font-semibold" aria-current="page">
            {tool.name}
          </span>
        </nav>

        {/* ── Identity row ────────────────────────────── */}
        <div className="flex items-start gap-5 sm:gap-7">
          {/* Icon */}
          <div
            className={clsx(
              "relative flex shrink-0 items-center justify-center rounded-2xl",
              `bg-gradient-to-br ${gradient}`,
              "shadow-xl shadow-black/15"
            )}
            aria-hidden="true"
            style={{ width: 72, height: 72 }}
          >
            <Icon className="h-8 w-8 text-white drop-shadow-sm" />
            {/* Glow ring */}
            <div
              className={clsx("absolute inset-0 rounded-2xl opacity-30", `bg-gradient-to-br ${gradient} blur-md`)}
              style={{ transform: "scale(1.25)" }}
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                {tool.name}
              </h1>
              {tool.isNew && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-600 dark:text-violet-400">
                  New
                </span>
              )}
              {tool.isPopular && !tool.isNew && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400">
                  Popular
                </span>
              )}
              {tool.isPremium ? (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  Pro
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              )}
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  Secure
                </span>
              </span>
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
  );
}

export default ToolHero;