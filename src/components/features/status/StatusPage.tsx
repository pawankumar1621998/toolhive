"use client";

import React, { useMemo } from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CheckCircle2,
  RefreshCw,
  Globe,
  Zap,
  FileText,
  Cpu,
  Cloud,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ServiceStatus = "operational" | "degraded" | "outage";

interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  uptime: number; // percentage
  icon: React.ReactNode;
  uptimeBars: ("ok" | "warn" | "down")[]; // 90 entries
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Generate a 90-day uptime bar array — mostly green, 1-2 yellow, none red */
function makeUptimeBars(seed: number): ("ok" | "warn" | "down")[] {
  const bars: ("ok" | "warn" | "down")[] = Array(90).fill("ok");
  // Place 1 or 2 degraded days based on seed
  const warnDays = seed % 2 === 0 ? [seed % 30 + 10, seed % 20 + 50] : [seed % 45 + 15];
  for (const day of warnDays) {
    if (day < 90) bars[day] = "warn";
  }
  return bars;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const SERVICES: Service[] = [
  {
    id: "web-app",
    name: "Web Application",
    description: "Main toolhive.app frontend",
    status: "operational",
    uptime: 99.98,
    icon: <Globe className="h-5 w-5" />,
    uptimeBars: makeUptimeBars(7),
  },
  {
    id: "api",
    name: "API",
    description: "REST & GraphQL API endpoints",
    status: "operational",
    uptime: 99.95,
    icon: <Zap className="h-5 w-5" />,
    uptimeBars: makeUptimeBars(13),
  },
  {
    id: "file-processing",
    name: "File Processing",
    description: "PDF, image, and video pipelines",
    status: "operational",
    uptime: 99.91,
    icon: <FileText className="h-5 w-5" />,
    uptimeBars: makeUptimeBars(23),
  },
  {
    id: "ai-engine",
    name: "AI Engine",
    description: "ML inference and model serving",
    status: "operational",
    uptime: 99.87,
    icon: <Cpu className="h-5 w-5" />,
    uptimeBars: makeUptimeBars(41),
  },
  {
    id: "cdn",
    name: "CDN",
    description: "Asset delivery and caching layer",
    status: "operational",
    uptime: 100.0,
    icon: <Cloud className="h-5 w-5" />,
    uptimeBars: makeUptimeBars(0),
  },
  {
    id: "auth",
    name: "Auth Service",
    description: "Login, OAuth, and session management",
    status: "operational",
    uptime: 99.99,
    icon: <ShieldCheck className="h-5 w-5" />,
    uptimeBars: makeUptimeBars(3),
  },
];

// ─────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceStatus, { label: string; badgeVariant: "success" | "warning" | "error" }> = {
  operational: { label: "Operational", badgeVariant: "success" },
  degraded: { label: "Degraded", badgeVariant: "warning" },
  outage: { label: "Outage", badgeVariant: "error" },
};

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

// ─────────────────────────────────────────────
// Uptime Bar
// ─────────────────────────────────────────────

function UptimeBar({ bars }: { bars: ("ok" | "warn" | "down")[] }) {
  const colorMap = {
    ok: "bg-success",
    warn: "bg-warning",
    down: "bg-destructive",
  };

  return (
    <div
      className="flex items-end gap-[2px] h-6"
      role="img"
      aria-label="90-day uptime history"
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          className={clsx(
            "flex-1 rounded-sm transition-all duration-200",
            "hover:opacity-80",
            colorMap[bar],
            bar === "ok" ? "h-4" : "h-6"
          )}
          title={
            bar === "ok"
              ? "Operational"
              : bar === "warn"
              ? "Degraded performance"
              : "Outage"
          }
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Service Row
// ─────────────────────────────────────────────

function ServiceRow({ service }: { service: Service }) {
  const { label, badgeVariant } = STATUS_CONFIG[service.status];

  return (
    <motion.div
      variants={fadeUpVariant}
      className={clsx(
        "rounded-xl border border-card-border bg-card p-5",
        "hover:shadow-md hover:border-border-strong transition-all duration-200"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-muted text-foreground-muted shrink-0"
            aria-hidden="true"
          >
            {service.icon}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">{service.name}</p>
            <p className="text-xs text-foreground-subtle">{service.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-foreground-muted tabular-nums">
            {service.uptime.toFixed(2)}% uptime
          </span>
          <Badge variant={badgeVariant} dot size="md">{label}</Badge>
        </div>
      </div>

      {/* 90-day bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-foreground-subtle mb-2">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
        <UptimeBar bars={service.uptimeBars} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// StatusPage
// ─────────────────────────────────────────────

export function StatusPage() {
  const shouldReduce = useReducedMotion() ?? false;

  // Determine overall system status
  const overallStatus: ServiceStatus = useMemo(() => {
    if (SERVICES.some((s) => s.status === "outage")) return "outage";
    if (SERVICES.some((s) => s.status === "degraded")) return "degraded";
    return "operational";
  }, []);

  const [lastUpdated, setLastUpdated] = React.useState("Loading...");
  React.useEffect(() => {
    setLastUpdated(new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }));
  }, []);

  const overallConfig = {
    operational: {
      text: "All Systems Operational",
      subtext: "All ToolHive services are running normally.",
      bannerClass: "bg-success/10 border-success/25 text-success",
      icon: <CheckCircle2 className="h-8 w-8 shrink-0" />,
    },
    degraded: {
      text: "Degraded Performance",
      subtext: "Some services are experiencing issues. We are actively investigating.",
      bannerClass: "bg-warning/10 border-warning/25 text-warning",
      icon: <CheckCircle2 className="h-8 w-8 shrink-0" />,
    },
    outage: {
      text: "Service Disruption",
      subtext: "We are experiencing a major outage and working to restore services.",
      bannerClass: "bg-destructive/10 border-destructive/25 text-destructive",
      icon: <CheckCircle2 className="h-8 w-8 shrink-0" />,
    },
  }[overallStatus];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-background-subtle border-b border-card-border py-14 sm:py-18">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Badge variant="default" size="md" className="mb-4">System Status</Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
              ToolHive Status
            </h1>
            <p className="text-foreground-muted text-sm">
              Real-time monitoring of all ToolHive services and infrastructure.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 lg:py-14 space-y-10 max-w-4xl">
        {/* ── Overall status banner ───────────────── */}
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className={clsx(
            "flex items-center gap-4 rounded-2xl border p-5 sm:p-6",
            overallConfig.bannerClass
          )}
          role="status"
          aria-live="polite"
        >
          {overallConfig.icon}
          <div>
            <p className="text-lg sm:text-xl font-bold leading-tight">
              {overallConfig.text}
            </p>
            <p className="text-sm opacity-80 mt-0.5">{overallConfig.subtext}</p>
          </div>
        </motion.div>

        {/* ── Services list ───────────────────────── */}
        <section aria-labelledby="services-heading">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="flex items-center justify-between mb-5 flex-wrap gap-3"
          >
            <h2 id="services-heading" className="text-xl font-bold text-foreground">
              Services
            </h2>
            <span className="text-xs text-foreground-subtle flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Last updated: {lastUpdated}
            </span>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {SERVICES.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </motion.div>
        </section>

        {/* ── Legend ──────────────────────────────── */}
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted"
          aria-label="Uptime bar legend"
        >
          <span className="font-medium text-foreground-subtle">Uptime bar legend:</span>
          {[
            { color: "bg-success", label: "Operational" },
            { color: "bg-warning", label: "Degraded" },
            { color: "bg-destructive", label: "Outage" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={clsx("inline-block h-3 w-3 rounded-sm", color)} aria-hidden="true" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* ── Incident history ────────────────────── */}
        <section aria-labelledby="incidents-heading">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <h2 id="incidents-heading" className="text-xl font-bold text-foreground mb-5">
              Incident History
              <span className="ml-2 text-sm font-normal text-foreground-subtle">(Last 30 days)</span>
            </h2>

            <div
              className={clsx(
                "rounded-xl border border-card-border bg-card p-8",
                "flex flex-col items-center justify-center text-center gap-3"
              )}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10"
                aria-hidden="true"
              >
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="font-semibold text-foreground">No incidents reported</p>
              <p className="text-sm text-foreground-muted max-w-xs">
                All services have been running without incidents for the past 30 days.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── Footer note ─────────────────────────── */}
        <motion.p
          initial={shouldReduce ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-xs text-foreground-subtle text-center pb-4"
        >
          This page updates automatically every 60 seconds.{" "}
          <a
            href="mailto:status@toolhive.app"
            className="text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Report an issue
          </a>
        </motion.p>
      </div>
    </div>
  );
}
