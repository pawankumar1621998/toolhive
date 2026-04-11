"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ExternalLink, LayoutTemplate, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Industry = "All" | "Technology" | "Business" | "Creative" | "Healthcare" | "Education" | "Finance";

interface Template {
  id: string;
  name: string;
  industry: Exclude<Industry, "All">;
  atsFriendly: boolean;
  accentColor: string;
  headerColor: string;
  sidebarColor: string;
  blockColors: string[];
  description: string;
}

// ─── Templates Data ───────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  {
    id: "modern-tech",
    name: "Modern Tech",
    industry: "Technology",
    atsFriendly: true,
    accentColor: "bg-indigo-500",
    headerColor: "bg-indigo-500",
    sidebarColor: "bg-indigo-100 dark:bg-indigo-950",
    blockColors: ["bg-indigo-200 dark:bg-indigo-800", "bg-indigo-300 dark:bg-indigo-700", "bg-slate-200 dark:bg-slate-700"],
    description: "Clean layout designed for software engineers and developers.",
  },
  {
    id: "executive-pro",
    name: "Executive Pro",
    industry: "Business",
    atsFriendly: true,
    accentColor: "bg-slate-700",
    headerColor: "bg-slate-800",
    sidebarColor: "bg-slate-100 dark:bg-slate-900",
    blockColors: ["bg-slate-300 dark:bg-slate-600", "bg-slate-200 dark:bg-slate-700", "bg-slate-400 dark:bg-slate-500"],
    description: "Authoritative and polished for C-suite and senior leadership.",
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    industry: "Creative",
    atsFriendly: false,
    accentColor: "bg-violet-500",
    headerColor: "bg-gradient-to-r from-violet-500 to-purple-600",
    sidebarColor: "bg-violet-50 dark:bg-violet-950",
    blockColors: ["bg-violet-200 dark:bg-violet-800", "bg-purple-200 dark:bg-purple-800", "bg-fuchsia-200 dark:bg-fuchsia-900"],
    description: "Vibrant and expressive for designers and creatives.",
  },
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    industry: "Business",
    atsFriendly: true,
    accentColor: "bg-gray-500",
    headerColor: "bg-gray-100 dark:bg-gray-800",
    sidebarColor: "bg-gray-50 dark:bg-gray-900",
    blockColors: ["bg-gray-200 dark:bg-gray-700", "bg-gray-300 dark:bg-gray-600", "bg-gray-200 dark:bg-gray-700"],
    description: "Universal and versatile — works across all industries.",
  },
  {
    id: "healthcare-plus",
    name: "Healthcare Plus",
    industry: "Healthcare",
    atsFriendly: false,
    accentColor: "bg-teal-500",
    headerColor: "bg-teal-600",
    sidebarColor: "bg-teal-50 dark:bg-teal-950",
    blockColors: ["bg-teal-200 dark:bg-teal-800", "bg-emerald-200 dark:bg-emerald-900", "bg-teal-300 dark:bg-teal-700"],
    description: "Structured and trusted for clinical and care professionals.",
  },
  {
    id: "academic-scholar",
    name: "Academic Scholar",
    industry: "Education",
    atsFriendly: false,
    accentColor: "bg-blue-600",
    headerColor: "bg-blue-700",
    sidebarColor: "bg-blue-50 dark:bg-blue-950",
    blockColors: ["bg-blue-200 dark:bg-blue-800", "bg-sky-200 dark:bg-sky-900", "bg-blue-300 dark:bg-blue-700"],
    description: "Comprehensive CV format for researchers and academics.",
  },
  {
    id: "finance-expert",
    name: "Finance Expert",
    industry: "Finance",
    atsFriendly: true,
    accentColor: "bg-green-600",
    headerColor: "bg-green-700",
    sidebarColor: "bg-green-50 dark:bg-green-950",
    blockColors: ["bg-green-200 dark:bg-green-800", "bg-emerald-300 dark:bg-emerald-800", "bg-green-300 dark:bg-green-700"],
    description: "Precise and data-forward for banking and finance roles.",
  },
  {
    id: "startup-founder",
    name: "Startup Founder",
    industry: "Technology",
    atsFriendly: false,
    accentColor: "bg-orange-500",
    headerColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    sidebarColor: "bg-orange-50 dark:bg-orange-950",
    blockColors: ["bg-orange-200 dark:bg-orange-800", "bg-amber-200 dark:bg-amber-900", "bg-orange-300 dark:bg-orange-700"],
    description: "Bold and entrepreneurial — built for founders and innovators.",
  },
  {
    id: "sales-champion",
    name: "Sales Champion",
    industry: "Business",
    atsFriendly: true,
    accentColor: "bg-amber-500",
    headerColor: "bg-amber-600",
    sidebarColor: "bg-amber-50 dark:bg-amber-950",
    blockColors: ["bg-amber-200 dark:bg-amber-800", "bg-yellow-200 dark:bg-yellow-900", "bg-amber-300 dark:bg-amber-700"],
    description: "Results-driven layout highlighting targets and achievements.",
  },
  {
    id: "graphic-designer",
    name: "Graphic Designer",
    industry: "Creative",
    atsFriendly: false,
    accentColor: "bg-pink-500",
    headerColor: "bg-gradient-to-r from-pink-500 to-rose-500",
    sidebarColor: "bg-pink-50 dark:bg-pink-950",
    blockColors: ["bg-pink-200 dark:bg-pink-800", "bg-rose-200 dark:bg-rose-900", "bg-fuchsia-200 dark:bg-fuchsia-900"],
    description: "Eye-catching and portfolio-ready for visual artists.",
  },
  {
    id: "nurse-medical",
    name: "Nurse / Medical",
    industry: "Healthcare",
    atsFriendly: false,
    accentColor: "bg-cyan-500",
    headerColor: "bg-cyan-600",
    sidebarColor: "bg-cyan-50 dark:bg-cyan-950",
    blockColors: ["bg-cyan-200 dark:bg-cyan-800", "bg-sky-200 dark:bg-sky-900", "bg-cyan-300 dark:bg-cyan-700"],
    description: "Specialised for nursing, allied health, and medical staff.",
  },
  {
    id: "teacher-pro",
    name: "Teacher Pro",
    industry: "Education",
    atsFriendly: true,
    accentColor: "bg-purple-600",
    headerColor: "bg-purple-700",
    sidebarColor: "bg-purple-50 dark:bg-purple-950",
    blockColors: ["bg-purple-200 dark:bg-purple-800", "bg-violet-200 dark:bg-violet-900", "bg-purple-300 dark:bg-purple-700"],
    description: "Warm and professional for K-12 and higher-ed instructors.",
  },
];

const FILTER_TABS: Industry[] = ["All", "Technology", "Business", "Creative", "Healthcare", "Education", "Finance"];

// ─── Resume Mockup ────────────────────────────────────────────────────────────

function ResumeMockup({ template }: { template: Template }) {
  return (
    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-border flex flex-col shadow-sm">
      {/* Header band */}
      <div className={clsx("h-[22%] w-full flex flex-col justify-end px-3 pb-2", template.headerColor)}>
        <div className="h-2.5 w-3/5 rounded bg-white/40 mb-1" />
        <div className="h-1.5 w-2/5 rounded bg-white/25" />
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={clsx("w-[30%] flex flex-col gap-2 p-2", template.sidebarColor)}>
          <div className={clsx("h-1 w-4/5 rounded", template.blockColors[0])} />
          <div className={clsx("h-1 w-3/5 rounded", template.blockColors[1])} />
          <div className="mt-1 flex flex-col gap-1.5">
            {[65, 80, 55, 70].map((w, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={clsx("h-1 rounded flex-1", template.blockColors[i % 3])} style={{ maxWidth: `${w}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className={clsx("h-0.5 w-full rounded", template.blockColors[2])} />
            <div className={clsx("h-0.5 w-4/5 rounded", template.blockColors[0])} />
            <div className={clsx("h-0.5 w-3/5 rounded", template.blockColors[1])} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-background p-2 flex flex-col gap-2">
          {/* Section 1 */}
          <div>
            <div className={clsx("h-0.5 w-full mb-1.5", template.accentColor)} />
            <div className="h-1 w-4/5 rounded bg-foreground/20 mb-1" />
            <div className="h-0.5 w-full rounded bg-foreground/10 mb-0.5" />
            <div className="h-0.5 w-11/12 rounded bg-foreground/10" />
          </div>

          {/* Section 2 */}
          <div>
            <div className={clsx("h-0.5 w-full mb-1.5", template.accentColor)} />
            <div className="h-1 w-3/5 rounded bg-foreground/20 mb-1" />
            <div className="h-0.5 w-full rounded bg-foreground/10 mb-0.5" />
            <div className="h-0.5 w-10/12 rounded bg-foreground/10 mb-0.5" />
            <div className="h-0.5 w-9/12 rounded bg-foreground/10" />
          </div>

          {/* Section 3 */}
          <div>
            <div className={clsx("h-0.5 w-full mb-1.5", template.accentColor)} />
            <div className="flex flex-wrap gap-1">
              {[40, 55, 35, 50, 45].map((w, i) => (
                <div
                  key={i}
                  className={clsx("h-2 rounded-full", template.blockColors[i % 3])}
                  style={{ width: `${w}%`, maxWidth: "45%" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: Template;
  onUse: (template: Template) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="border border-card-border bg-card rounded-2xl overflow-hidden flex flex-col group hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-300"
    >
      {/* Mockup area */}
      <div className="p-4 pb-3 bg-background-subtle">
        <ResumeMockup template={template} />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight">{template.name}</h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="default" size="sm">
              {template.industry}
            </Badge>
            {template.atsFriendly && (
              <Badge variant="success" size="sm" dot>
                ATS Friendly
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-foreground-muted leading-relaxed flex-1">
          {template.description}
        </p>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
          onClick={() => onUse(template)}
          className="group-hover:border-indigo-500/40 group-hover:text-indigo-500 transition-colors"
        >
          Use Template
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function UseTemplateModal({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="border border-card-border bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <LayoutTemplate className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-semibold text-foreground">{template.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-foreground-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-background-subtle"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-w-[200px] mx-auto w-full">
            <ResumeMockup template={template} />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
            <p className="text-sm text-foreground">
              Redirecting to Resume Builder with the{" "}
              <span className="font-semibold text-indigo-500">{template.name}</span> template applied…
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
              onClick={() => {
                alert(`Redirecting to Resume Builder with "${template.name}" template…`);
                onClose();
              }}
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResumeTemplates() {
  const [activeFilter, setActiveFilter] = useState<Industry>("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered =
    activeFilter === "All"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.industry === activeFilter);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <LayoutTemplate className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Resume Templates</h1>
          <Badge variant="default" size="sm">
            {TEMPLATES.length} templates
          </Badge>
        </div>
        <p className="text-sm text-foreground-muted">
          Choose a professionally designed template and customise it in the Resume Builder.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const count =
            tab === "All" ? TEMPLATES.length : TEMPLATES.filter((t) => t.industry === tab).length;
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-background-subtle text-foreground-muted border border-border hover:border-indigo-500/30 hover:text-foreground"
              )}
            >
              {tab}
              <span
                className={clsx(
                  "inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-background text-foreground-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ATS note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 self-start">
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        <p className="text-xs text-foreground-muted">
          <span className="font-medium text-green-500">ATS Friendly</span> templates are optimised to
          pass Applicant Tracking Systems.
        </p>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={(t) => setSelectedTemplate(t)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LayoutTemplate className="h-10 w-10 text-foreground-muted/30 mb-3" />
          <p className="text-sm text-foreground-muted">No templates found for this filter.</p>
        </div>
      )}

      {/* Modal */}
      {selectedTemplate && (
        <UseTemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
