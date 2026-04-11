import React from "react";
import {
  Upload,
  Settings,
  Download,
  CheckCircle2,
  Shield,
  Lock,
  Server,
  HelpCircle,
} from "lucide-react";
import { clsx } from "clsx";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Default content
// ─────────────────────────────────────────────

// Per-category step copy so each tool category gets relevant instructions
const CATEGORY_STEPS: Record<string, ReturnType<typeof DEFAULT_FILE_STEPS>> = {
  "ai-writing": [
    { icon: Upload,   title: "Enter your text or details",   description: "Type or paste your text, or fill in the form fields. No file upload needed — everything works in the browser." },
    { icon: Settings, title: "Choose your options",          description: "Select tone, language, style, or any other settings that apply. Then click the Generate button." },
    { icon: Download, title: "Copy or download the result",  description: "Your AI-generated content appears instantly. Copy it to your clipboard or download as a text file." },
  ],
  resume: [
    { icon: Upload,   title: "Fill in your details or upload",    description: "Enter your information step-by-step, or upload an existing resume (PDF/DOCX) for analysis and improvement." },
    { icon: Settings, title: "Customise and generate",           description: "Choose templates, tones, or options relevant to the tool, then click to process." },
    { icon: Download, title: "Download or copy your result",     description: "Download your resume as PDF, copy generated text, or export your cover letter — ready to use immediately." },
  ],
  converter: [
    { icon: Upload,   title: "Paste or type your input",     description: "Enter your text, JSON, or data directly into the input field. No file upload required — everything runs instantly in your browser." },
    { icon: Settings, title: "Choose conversion options",    description: "Select formatting style, encoding mode, or any relevant settings, then click the action button." },
    { icon: Download, title: "Copy or download the result",  description: "Your converted output is ready immediately. Copy it to clipboard or download as a file." },
  ],
};

function DEFAULT_FILE_STEPS(tool: Tool) {
  return [
    {
      icon: Upload,
      title: "Upload your file",
      description: `Drag and drop or browse to select your file. Accepts ${
        tool.acceptedFileTypes.length ? tool.acceptedFileTypes.join(", ") : "any supported file"
      }. Up to ${tool.maxFiles > 1 ? `${tool.maxFiles} files` : "1 file"} at a time.`,
    },
    {
      icon: Settings,
      title: "Configure options",
      description: `Adjust any settings for ${tool.name}, then click the button to start processing. It happens instantly in the cloud.`,
    },
    {
      icon: Download,
      title: "Download the result",
      description:
        "Your processed file is ready immediately. Click Download — the file is available for 1 hour.",
    },
  ];
}

const DEFAULT_STEPS = (tool: Tool) =>
  CATEGORY_STEPS[tool.category] ?? DEFAULT_FILE_STEPS(tool);

const DEFAULT_FAQ = [
  {
    question: "Is this tool completely free?",
    answer:
      "Yes — this tool is free with no account required. Free users get up to 50 MB per file. Premium users unlock higher limits and batch processing.",
  },
  {
    question: "Are my files stored after processing?",
    answer:
      "No. All uploaded files and processed outputs are automatically deleted from our servers within 1 hour of processing. We never store, sell, or share your data.",
  },
  {
    question: "How secure is my data?",
    answer:
      "All file transfers use TLS 1.3 encryption. Files are processed in isolated sandboxes and immediately discarded. We are GDPR-compliant and do not use your files for any purpose beyond processing.",
  },
  {
    question: "What happens if processing fails?",
    answer:
      "If processing fails, no data is retained and you are not charged. Simply re-upload your file and try again. If the problem persists, contact our support team.",
  },
  {
    question: "Can I use this on mobile?",
    answer:
      "Yes! ToolHive is fully responsive and works on any modern device — phone, tablet, or desktop. All features are touch-friendly.",
  },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      {/* Step badge */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
          aria-hidden="true"
        >
          <span className="text-sm font-bold text-primary">{step}</span>
        </div>
        {/* Connector line (not after last item — handled via parent) */}
        <div className="flex-1 w-px bg-border" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="font-semibold text-foreground">{title}</p>
        </div>
        <p className="text-sm text-foreground-muted leading-relaxed">{description}</p>
      </div>
    </li>
  );
}

function FormatChip({ ext }: { ext: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background-subtle px-3 py-1.5">
      <CheckCircle2
        className="h-3.5 w-3.5 text-success shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm font-mono font-medium text-foreground">{ext}</span>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-xl border border-border bg-card overflow-hidden">
      <summary
        className={clsx(
          "flex cursor-pointer select-none items-center justify-between",
          "px-5 py-4 text-sm font-medium text-foreground",
          "hover:bg-background-subtle transition-colors duration-150",
          "list-none [&::-webkit-details-marker]:hidden"
        )}
      >
        <span className="flex items-center gap-2.5">
          <HelpCircle
            className="h-4 w-4 shrink-0 text-primary/60 group-open:text-primary transition-colors"
            aria-hidden="true"
          />
          {question}
        </span>
        <span
          className="ml-4 shrink-0 text-lg font-light text-foreground-muted leading-none transition-transform duration-200 group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-4 pt-0">
        <p className="text-sm text-foreground-muted leading-relaxed pl-6.5">
          {answer}
        </p>
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ToolInfoPanelProps {
  tool: Tool;
}

// ─────────────────────────────────────────────
// ToolInfoPanel — Server Component
// ─────────────────────────────────────────────

/**
 * ToolInfoPanel — informational section below the workspace.
 *
 * Sections:
 * 1. "How to use" — numbered steps with icons
 * 2. Supported formats — chip grid
 * 3. FAQ accordion — uses native <details>/<summary> (no JS)
 * 4. Security note — trust signal
 */
export function ToolInfoPanel({ tool }: ToolInfoPanelProps) {
  const steps =
    tool.howItWorks?.map((s, i) => ({
      step: i + 1,
      icon: [Upload, Settings, Download][i] ?? Download,
      title: s.title,
      description: s.description,
    })) ??
    DEFAULT_STEPS(tool).map((s, i) => ({ step: i + 1, ...s }));

  const faqItems = [
    ...(tool.faq ?? []).map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    ...DEFAULT_FAQ,
  ];

  return (
    <div className="mt-12 space-y-12">

      {/* ── How to use ───────────────────────────────────── */}
      <section aria-labelledby="how-it-works-heading">
        <h2
          id="how-it-works-heading"
          className="text-xl font-bold text-foreground mb-6"
        >
          How to use {tool.name}
        </h2>
        <ol
          className="relative space-y-0"
          role="list"
          aria-label={`Steps to use ${tool.name}`}
        >
          {steps.map(({ step, icon, title, description }) => (
            <StepCard
              key={step}
              step={step}
              icon={icon}
              title={title}
              description={description}
            />
          ))}
        </ol>
      </section>

      {/* ── Supported formats ────────────────────────────── */}
      {tool.acceptedFileTypes.length > 0 && (
        <section aria-labelledby="formats-heading">
          <h2
            id="formats-heading"
            className="text-xl font-bold text-foreground mb-4"
          >
            Supported formats
          </h2>
          <div className="flex flex-wrap gap-2">
            {tool.acceptedFileTypes.map((ext) => (
              <FormatChip key={ext} ext={ext} />
            ))}
          </div>
          {tool.maxFileSizeMB > 0 && (
            <p className="mt-3 text-sm text-foreground-muted">
              Maximum file size:{" "}
              <span className="font-semibold text-foreground">
                {tool.maxFileSizeMB} MB
              </span>
              {tool.maxFiles > 1 && (
                <>
                  {" "}
                  &middot; Up to{" "}
                  <span className="font-semibold text-foreground">
                    {tool.maxFiles} files
                  </span>{" "}
                  at once
                </>
              )}
            </p>
          )}
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-xl font-bold text-foreground mb-4"
        >
          Frequently asked questions
        </h2>
        <div className="space-y-2.5">
          {faqItems.map(({ question, answer }) => (
            <FaqItem key={question} question={question} answer={answer} />
          ))}
        </div>
      </section>

      {/* ── Security note ────────────────────────────────── */}
      <section
        className="rounded-2xl border border-border bg-background-subtle p-6"
        aria-labelledby="security-heading"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
            aria-hidden="true"
          >
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2
              id="security-heading"
              className="text-base font-bold text-foreground mb-1"
            >
              Your privacy is our priority
            </h2>
            <p className="text-sm text-foreground-muted leading-relaxed max-w-2xl">
              All files are transferred over{" "}
              <strong className="font-semibold text-foreground">
                TLS 1.3 encrypted connections
              </strong>{" "}
              and processed in isolated environments. Files are{" "}
              <strong className="font-semibold text-foreground">
                automatically deleted within 1 hour
              </strong>{" "}
              — we never store, share, or train AI models on your data.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { icon: Shield, label: "TLS 1.3 encrypted" },
                { icon: Server, label: "EU / US servers" },
                { icon: Lock, label: "GDPR compliant" },
                { icon: CheckCircle2, label: "No account needed" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs text-foreground-muted"
                >
                  <Icon
                    className="h-3.5 w-3.5 text-success"
                    aria-hidden="true"
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ToolInfoPanel;
