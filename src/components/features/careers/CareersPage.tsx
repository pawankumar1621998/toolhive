"use client";

import React from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Globe2,
  DollarSign,
  TrendingUp,
  Umbrella,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentClass: string;
}

interface JobListing {
  id: string;
  title: string;
  department: string;
  departmentVariant: "primary" | "info" | "warning" | "success";
  location: string;
  type: string;
  description: string;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const BENEFITS: Benefit[] = [
  {
    icon: <Globe2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />,
    title: "Remote First",
    description:
      "Work from anywhere in the world. We're a fully distributed team across 12 time zones.",
    accentClass: "bg-violet-500/10",
  },
  {
    icon: <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    title: "Competitive Pay",
    description:
      "Top-of-market salaries benchmarked quarterly. We believe great work deserves great compensation.",
    accentClass: "bg-emerald-500/10",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
    title: "Equity",
    description:
      "Meaningful equity packages so every team member shares in the company's growth and success.",
    accentClass: "bg-cyan-500/10",
  },
  {
    icon: <Umbrella className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
    title: "Unlimited PTO",
    description:
      "Take the time you need to recharge. We trust our people and encourage real rest.",
    accentClass: "bg-rose-500/10",
  },
];

const JOBS: JobListing[] = [
  {
    id: "1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    departmentVariant: "primary",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description:
      "Build and scale the core ToolHive platform. You'll work across the Next.js frontend and Node.js/Python backend, shipping features used by millions of users every day.",
  },
  {
    id: "2",
    title: "ML/AI Research Engineer",
    department: "AI & Research",
    departmentVariant: "info",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description:
      "Design and deploy state-of-the-art computer vision and NLP models that power ToolHive's AI tools. You'll own the full pipeline from research to production.",
  },
  {
    id: "3",
    title: "Product Designer",
    department: "Design",
    departmentVariant: "warning",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description:
      "Shape the experience for 2M+ users. You'll collaborate closely with engineering and product to create interfaces that are both beautiful and immediately useful.",
  },
  {
    id: "4",
    title: "Developer Advocate",
    department: "Growth",
    departmentVariant: "success",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description:
      "Champion ToolHive in the developer community. You'll create content, manage integrations, and be the bridge between our API users and the product team.",
  },
];

// ─────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// ─────────────────────────────────────────────
// Benefit Card
// ─────────────────────────────────────────────

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <motion.div
      variants={fadeUpVariant}
      className={clsx(
        "flex flex-col gap-4 rounded-xl border border-card-border bg-card p-6",
        "hover:shadow-md hover:border-border-strong transition-all duration-200"
      )}
    >
      <div
        className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          benefit.accentClass
        )}
        aria-hidden="true"
      >
        {benefit.icon}
      </div>
      <div>
        <h3 className="font-bold text-foreground mb-1.5">{benefit.title}</h3>
        <p className="text-sm text-foreground-muted leading-relaxed">{benefit.description}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Job Card
// ─────────────────────────────────────────────

function JobCard({ job }: { job: JobListing }) {
  return (
    <motion.div
      variants={fadeUpVariant}
      className={clsx(
        "flex flex-col sm:flex-row sm:items-center gap-5 rounded-xl border border-card-border bg-card p-6",
        "hover:shadow-md hover:border-border-strong transition-all duration-200"
      )}
    >
      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="text-base font-bold text-foreground">{job.title}</h3>
          <Badge variant={job.departmentVariant} size="sm">{job.department}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {job.type}
          </span>
        </div>

        <p className="text-sm text-foreground-muted leading-relaxed">{job.description}</p>
      </div>

      {/* CTA */}
      <div className="shrink-0">
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => {
            // Link to apply — placeholder
          }}
        >
          Apply Now
        </Button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// CareersPage
// ─────────────────────────────────────────────

export function CareersPage() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-background-subtle border-b border-card-border py-20 sm:py-24 lg:py-28">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-20 left-1/4 h-[420px] w-[420px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.09) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 right-1/3 h-[320px] w-[320px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.07) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUpVariant}>
              <Badge variant="primary" size="md">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                We&apos;re hiring
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUpVariant}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]"
            >
              Join Our{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                Team
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpVariant}
              className="max-w-xl text-lg text-foreground-muted leading-relaxed text-pretty"
            >
              We&apos;re on a mission to put powerful AI tools in the hands of
              everyone — for free. If you&apos;re passionate about building
              products that genuinely help people, you&apos;ll fit right in.
            </motion.p>

            {/* Mission stats */}
            <motion.div
              variants={fadeUpVariant}
              className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-2"
            >
              {[
                { value: "28", label: "Team members" },
                { value: "12", label: "Countries" },
                { value: "2M+", label: "Users served" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                    {value}
                  </p>
                  <p className="text-sm text-foreground-muted mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14 lg:py-20 space-y-20">
        {/* ── Benefits ───────────────────────────── */}
        <section aria-labelledby="benefits-heading">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="text-center mb-10"
          >
            <h2 id="benefits-heading" className="text-3xl font-bold text-foreground mb-3">
              Why ToolHive?
            </h2>
            <p className="text-foreground-muted max-w-lg mx-auto">
              We take care of our people so they can do the best work of their lives.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {BENEFITS.map((b) => (
              <BenefitCard key={b.title} benefit={b} />
            ))}
          </motion.div>
        </section>

        {/* ── Open Positions ─────────────────────── */}
        <section aria-labelledby="positions-heading">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mb-8"
          >
            <h2 id="positions-heading" className="text-3xl font-bold text-foreground mb-2">
              Open Positions
            </h2>
            <p className="text-foreground-muted">
              All roles are fully remote and open to candidates worldwide.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {JOBS.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </motion.div>
        </section>

        {/* ── Fallback CTA ───────────────────────── */}
        <motion.section
          initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          aria-labelledby="open-cta-heading"
          className={clsx(
            "rounded-2xl border border-primary/20 p-8 sm:p-10 text-center",
            "bg-gradient-to-br from-violet-500/8 to-cyan-500/8"
          )}
        >
          <h2 id="open-cta-heading" className="text-2xl font-bold text-foreground mb-3">
            No open roles that fit?
          </h2>
          <p className="text-foreground-muted mb-6 max-w-md mx-auto">
            We always want to hear from exceptional people. Drop us a line and
            tell us how you&apos;d contribute to ToolHive.
          </p>
          <Button
            variant="gradient"
            size="lg"
            leftIcon={<Mail className="h-4 w-4" />}
            onClick={() => {
              window.location.href = "mailto:careers@toolhive.app?subject=General%20Application";
            }}
          >
            Email Us
          </Button>
          <p className="mt-4 text-xs text-foreground-subtle">
            careers@toolhive.app — we read every email.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
