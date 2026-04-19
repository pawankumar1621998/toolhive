"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Image,
  Video,
  Pen,
  Zap,
  Clock,
  Heart,
  TrendingUp,
  HardDrive,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileImage,
  FileAudio,
  Repeat2,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { useDashboard } from "@/hooks/useDashboard";
import type { ActivityJob } from "@/hooks/useDashboard";

// ─────────────────────────────────────────────
// Tool → icon mapping
// ─────────────────────────────────────────────

function getToolMeta(tool: string): {
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
} {
  if (tool.startsWith("pdf"))   return { icon: FileText,  iconColor: "text-primary",   iconBg: "bg-primary/10",   label: tool.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
  if (tool.startsWith("image")) return { icon: Image,     iconColor: "text-secondary",  iconBg: "bg-secondary/10", label: tool.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
  if (tool.startsWith("video")) return { icon: Video,     iconColor: "text-warning",    iconBg: "bg-warning/10",   label: tool.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
  if (tool.startsWith("audio")) return { icon: FileAudio, iconColor: "text-success",    iconBg: "bg-success/10",   label: tool.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
  // ai-writing tools
  return { icon: Pen, iconColor: "text-accent", iconBg: "bg-accent/10", label: tool.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const MOCK_QUICK_TOOLS = [
  {
    href: "/tools/pdf/merge",
    icon: FileText,
    label: "PDF Merge",
    category: "PDF",
    uses: 34,
    color: "text-primary",
    bg: "bg-primary/10",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    href: "/tools/image/resize",
    icon: Image,
    label: "Image Resize",
    category: "Image",
    uses: 28,
    color: "text-secondary",
    bg: "bg-secondary/10",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    href: "/tools/ai-writing/rewrite",
    icon: Pen,
    label: "AI Rewrite",
    category: "AI Writing",
    uses: 21,
    color: "text-accent",
    bg: "bg-accent/10",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    href: "/tools/pdf/compress",
    icon: FileImage,
    label: "PDF Compress",
    category: "PDF",
    uses: 19,
    color: "text-primary",
    bg: "bg-primary/10",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    href: "/tools/image/convert",
    icon: Repeat2,
    label: "Image Convert",
    category: "Image",
    uses: 15,
    color: "text-secondary",
    bg: "bg-secondary/10",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    href: "/tools/ai-writing/summarize",
    icon: RefreshCw,
    label: "Summarize",
    category: "AI Writing",
    uses: 12,
    color: "text-accent",
    bg: "bg-accent/10",
    gradient: "from-accent/20 to-accent/5",
  },
];

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  subtext?: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  subtext,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="relative rounded-2xl border border-card-border bg-card p-5 overflow-hidden"
    >
      {/* Subtle background shape */}
      <div
        className={clsx(
          "absolute -top-4 -right-4 h-20 w-20 rounded-full opacity-10",
          iconBg
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-foreground tabular-nums">
            {value}
          </p>
          {subtext && (
            <p className="mt-0.5 text-xs text-foreground-subtle">{subtext}</p>
          )}
          {trend && (
            <p
              className={clsx(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? "+" : ""}{trend.value} this week
            </p>
          )}
        </div>
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg
          )}
          aria-hidden="true"
        >
          <Icon className={clsx("h-5 w-5", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Activity Feed Item
// ─────────────────────────────────────────────

function ActivityItem({ item, index }: { item: ActivityJob; index: number }) {
  const meta    = getToolMeta(item.tool);
  const Icon    = meta.icon;
  const success = item.status === "completed";

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.05 * index }}
      className="flex items-start gap-3 py-3"
    >
      <div
        className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", meta.iconBg)}
        aria-hidden="true"
      >
        <Icon className={clsx("h-4 w-4", meta.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground">{meta.label}</p>
          {success ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-label="Success" />
          ) : item.status === "failed" ? (
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" aria-label="Error" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 text-warning shrink-0 animate-spin" aria-label="Processing" />
          )}
        </div>
        <p className="text-xs text-foreground-muted truncate">
          {item.status === "failed" ? item.error || "Processing failed" : `Status: ${item.status}`}
        </p>
      </div>
      <time className="shrink-0 text-xs text-foreground-subtle">{timeAgo(item.createdAt)}</time>
    </motion.li>
  );
}

// ─────────────────────────────────────────────
// Quick Tool Card
// ─────────────────────────────────────────────

function QuickToolCard({
  tool,
  index,
}: {
  tool: (typeof MOCK_QUICK_TOOLS)[0];
  index: number;
}) {
  const { href, icon: Icon, label, category, uses, color, bg, gradient } = tool;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: 0.04 * index }}
    >
      <Link
        href={href}
        className={clsx(
          "group relative flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4",
          "hover:border-primary/25 hover:shadow-md card-lift transition-all duration-200",
          "overflow-hidden"
        )}
      >
        {/* Gradient shimmer on hover */}
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            gradient
          )}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between">
          <div
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              bg
            )}
          >
            <Icon className={clsx("h-4 w-4", color)} aria-hidden="true" />
          </div>
          <span className="text-[10px] font-medium text-foreground-subtle">
            {uses} uses
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <Badge variant="default" size="sm" className="mt-1">
            {category}
          </Badge>
        </div>

        <div
          className={clsx(
            "relative z-10 flex items-center gap-1 text-xs font-medium transition-colors duration-150",
            color,
            "opacity-0 group-hover:opacity-100"
          )}
          aria-hidden="true"
        >
          Launch tool
          <ArrowRight className="h-3 w-3" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// DashboardOverview
// ─────────────────────────────────────────────

export function DashboardOverview() {
  const { user }                    = useAuth();
  const { data, loading }           = useDashboard();

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Explorer";

  const dailyUsed    = data?.usage.daily.used    ?? 0;
  const dailyLimit   = data?.usage.daily.limit   ?? 10;
  const monthlyUsed  = data?.usage.monthly.used  ?? 0;
  const monthlyLimit = data?.usage.monthly.limit ?? 100;
  const usagePercent = Math.min(Math.round((monthlyUsed / monthlyLimit) * 100), 100);

  const stats = useMemo(
    () => [
      {
        label: "Files Today",
        value: loading ? "—" : dailyUsed,
        icon: Zap,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        subtext: `of ${dailyLimit} daily limit`,
        delay: 0.05,
      },
      {
        label: "Total Files",
        value: loading ? "—" : (data?.stats.totalFiles ?? 0),
        icon: FileText,
        iconColor: "text-secondary",
        iconBg: "bg-secondary/10",
        subtext: `${data?.stats.processedFiles ?? 0} processed`,
        delay: 0.1,
      },
      {
        label: "This Month",
        value: loading ? "—" : monthlyUsed,
        icon: TrendingUp,
        iconColor: "text-accent",
        iconBg: "bg-accent/10",
        subtext: `of ${monthlyLimit} monthly limit`,
        delay: 0.15,
      },
      {
        label: "Pending Jobs",
        value: loading ? "—" : (data?.stats.pendingFiles ?? 0),
        icon: HardDrive,
        iconColor: "text-warning",
        iconBg: "bg-warning/10",
        subtext: "in queue",
        delay: 0.2,
      },
    ],
    [data, loading, dailyUsed, dailyLimit, monthlyUsed, monthlyLimit]
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ── Welcome Banner ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 sm:p-8"
      >
        {/* Background mesh */}
        <div
          className="absolute inset-0 bg-gradient-brand-radial opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {greeting},{" "}
              <span className="text-gradient">{firstName}</span>!
            </h1>
            <p className="mt-1.5 text-sm text-foreground-muted max-w-md">
              You&apos;ve processed{" "}
              <strong className="text-foreground">
                {loading ? "..." : `${dailyUsed} file${dailyUsed !== 1 ? "s" : ""}`}
              </strong>{" "}
              today. Keep up the great work.
            </p>
          </div>
          <div
            className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg"
            aria-hidden="true"
          >
            <Zap className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Usage progress bar */}
        <div className="relative z-10 mt-6 rounded-xl bg-background-subtle border border-border p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground-muted font-medium">Monthly usage</span>
            <span className="font-semibold text-foreground tabular-nums">
              {monthlyUsed}{" "}
              <span className="font-normal text-foreground-muted">
                / {monthlyLimit} files
              </span>
            </span>
          </div>
          <div
            className="h-2.5 rounded-full bg-background-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Monthly usage: ${usagePercent}%`}
          >
            <motion.div
              className={clsx(
                "h-full rounded-full",
                usagePercent >= 90
                  ? "bg-destructive"
                  : usagePercent >= 70
                  ? "bg-warning"
                  : "bg-gradient-brand"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />
          </div>
          {usagePercent >= 70 && (
            <p className="mt-2 text-xs text-success font-medium">
              All tools are free — unlimited access
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Stats Grid ─────────────────────────── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Your stats
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* ── Quick Access + Activity (2-col on lg) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Quick Access Tools — 3 cols */}
        <section className="lg:col-span-3" aria-labelledby="quick-tools-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="quick-tools-heading" className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
              Most-used tools
            </h2>
            <Link
              href="/tools"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              All tools
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MOCK_QUICK_TOOLS.map((tool, i) => (
              <QuickToolCard key={tool.href} tool={tool} index={i} />
            ))}
          </div>
        </section>

        {/* Recent Activity — 2 cols */}
        <section className="lg:col-span-2" aria-labelledby="activity-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="activity-heading" className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
              Recent activity
            </h2>
            <Link
              href="/dashboard/history"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-card-border bg-card">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
              </div>
            ) : !data?.recentActivity?.length ? (
              <div className="py-10 text-center text-sm text-foreground-muted">
                No activity yet — start using a tool!
              </div>
            ) : (
              <ul className="divide-y divide-border px-4" aria-label="Recent activity">
                {data.recentActivity.map((item, i) => (
                  <ActivityItem key={item._id} item={item} index={i} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── Quick Nav cards ─────────────────────── */}
      <section aria-labelledby="quick-nav-heading">
        <h2 id="quick-nav-heading" className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Jump to
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: "/dashboard/history",
              icon: Clock,
              label: "File History",
              desc: "View all past operations",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              href: "/dashboard/favorites",
              icon: Heart,
              label: "Favorites",
              desc: "Your saved tools",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
            },
            {
              href: "/tools",
              icon: TrendingUp,
              label: "Browse Tools",
              desc: "200+ AI tools available",
              color: "text-accent",
              bg: "bg-accent/10",
            },
          ].map(({ href, icon: Icon, label, desc, color, bg }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 * i }}
            >
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-xl border border-card-border bg-card p-4 hover:border-primary/20 hover:shadow-md card-lift transition-all"
              >
                <div
                  className={clsx(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    bg
                  )}
                  aria-hidden="true"
                >
                  <Icon className={clsx("h-5 w-5", color)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-foreground-muted">{desc}</p>
                </div>
                <ArrowRight
                  className={clsx(
                    "ml-auto h-4 w-4 shrink-0 text-foreground-subtle",
                    "opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
