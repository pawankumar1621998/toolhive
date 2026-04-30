"use client";

import React, { useEffect, useState, useCallback } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Server, Bot, Zap, ExternalLink, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Provider {
  key: string;
  label: string;
  status: "ok" | "error" | "missing";
  latencyMs?: number;
  error?: string;
  checkedAt: string;
}

interface ToolHealth {
  toolId: string;
  toolName: string;
  category: string;
  status: "ok" | "degraded" | "down";
  error?: string;
  checkedAt: string;
}

interface HealthData {
  checkedAt: string;
  nextCheckIn: number;
  providers: Provider[];
  tools: ToolHealth[];
  summary: string;
  criticalIssues: string[];
  degradedCount: number;
  downCount: number;
}

function StatusBadge({ status }: { status: Provider["status"] }) {
  if (status === "ok") return (
    <Badge variant="success" size="md" dot>Operational</Badge>
  );
  if (status === "missing") return (
    <Badge variant="default" size="md" dot>Not Configured</Badge>
  );
  return <Badge variant="error" size="md" dot>Down</Badge>;
}

function ToolStatusBadge({ status }: { status: ToolHealth["status"] }) {
  if (status === "ok") return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" /> OK
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
      <XCircle className="h-3.5 w-3.5" /> Down
    </span>
  );
}

function LatencyPill({ ms }: { ms?: number }) {
  if (!ms) return null;
  const cls = ms < 600 ? "text-emerald-600 dark:text-emerald-400" : ms < 1500 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return <span className={clsx("text-xs font-mono tabular-nums", cls)}>{ms}ms</span>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: i * 0.06 } }),
};

export function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsChecking(true);
    setLastError(null);
    try {
      const res = await fetch("/api/agent/health", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as HealthData;
      setHealth(data);
    } catch (e) {
      setLastError((e as Error).message);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 5 * 60_000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  const okProviders = health?.providers.filter((p) => p.status === "ok") ?? [];
  const errorProviders = health?.providers.filter((p) => p.status === "error") ?? [];
  const allProviders = health?.providers ?? [];
  const hasIssues = errorProviders.length > 0 || (health?.downCount ?? 0) > 0;

  const overallBanner = hasIssues
    ? { text: "Issues Detected", sub: `${errorProviders.length} provider(s) down · ${health?.downCount ?? 0} tool(s) affected`, bannerCls: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400", icon: <AlertTriangle className="h-8 w-8" /> }
    : { text: "All Systems Operational", sub: "All AI providers and tools are running normally", bannerCls: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400", icon: <CheckCircle2 className="h-8 w-8" /> };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background-subtle border-b border-card-border py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
            <Badge variant="default" size="md" className="mb-4">
              <Activity className="h-3.5 w-3.5 mr-1" />
              AI Agent Monitor
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">ToolHive Status</h1>
            <p className="text-foreground-muted text-sm">Real-time health of all AI providers and tools</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">

        {/* Banner */}
        {health && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className={clsx("flex items-center gap-4 rounded-2xl border p-5 sm:p-6", overallBanner.bannerCls)}
            role="status"
          >
            {overallBanner.icon}
            <div className="flex-1">
              <p className="text-base sm:text-lg font-bold leading-tight">{overallBanner.text}</p>
              <p className="text-sm opacity-80 mt-0.5">{overallBanner.sub}</p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={isChecking}
              className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-black/30 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white dark:hover:bg-black/40 disabled:opacity-50 transition-all shadow-sm shrink-0"
            >
              <RefreshCw className={clsx("h-4 w-4", isChecking && "animate-spin")} />
              {isChecking ? "Checking…" : "Refresh"}
            </button>
          </motion.div>
        )}

        {/* Error */}
        {lastError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-foreground">Health check failed: {lastError}</p>
          </motion.div>
        )}

        {/* Critical Issues */}
        {health && health.criticalIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5"
          >
            <p className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Active Issues ({health.criticalIssues.length})
            </p>
            <ul className="space-y-2">
              {health.criticalIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground-muted bg-white/50 dark:bg-black/20 rounded-xl p-3">
                  <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  {issue}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all">
                <Zap className="h-3.5 w-3.5" /> Fix with Groq API <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs text-foreground-subtle">Free key · unlimited requests</p>
            </div>
          </motion.div>
        )}

        {/* AI Providers */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-card-border bg-card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Server className="h-4 w-4 text-foreground-muted" />
            <h2 className="text-sm font-semibold text-foreground">AI Providers</h2>
            <span className="ml-auto text-xs text-foreground-subtle tabular-nums">
              {okProviders.length}/{allProviders.length} operational
            </span>
          </div>
          <div className="divide-y divide-border">
            {allProviders.map((p, i) => (
              <motion.div key={p.key} custom={i} variants={fadeUp}
                className="px-5 py-3.5 flex items-center gap-3 hover:bg-background-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  {p.error && <p className="text-xs text-red-500 mt-0.5 truncate max-w-xs">{p.error}</p>}
                  {!p.error && p.status === "missing" && (
                    <p className="text-xs text-foreground-subtle">No API key configured</p>
                  )}
                </div>
                <StatusBadge status={p.status} />
                <LatencyPill ms={p.latencyMs} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tool Health */}
        {health && health.tools.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-card-border bg-card overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Bot className="h-4 w-4 text-foreground-muted" />
              <h2 className="text-sm font-semibold text-foreground">Tool Status</h2>
              <span className="ml-auto text-xs text-foreground-subtle">
                {health.tools.filter((t) => t.status === "ok").length}/{health.tools.length} healthy
              </span>
            </div>
            <div className="divide-y divide-border">
              {health.tools.map((t, i) => (
                <motion.div key={t.toolId} custom={i} variants={fadeUp}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-background-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{t.toolName}</p>
                      <span className="rounded-md bg-background-muted text-[10px] text-foreground-subtle px-1.5 py-0.5">{t.category}</span>
                    </div>
                    {t.error && <p className="text-xs text-red-500 mt-0.5">{t.error}</p>}
                  </div>
                  <ToolStatusBadge status={t.status} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        {health && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-foreground-subtle text-center pb-4 flex items-center justify-center gap-1.5">
            <Clock className="h-3 w-3" />
            Last checked: {formatTime(health.checkedAt)} · Auto-refresh every 5 min ·{" "}
            <a href="/chat" className="text-primary hover:underline underline-offset-2">Ask AI Assistant</a>
          </motion.p>
        )}
      </div>
    </div>
  );
}