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

const STEP_GRADIENTS = [
  "from-violet-600 to-purple-500",
  "from-blue-600 to-cyan-500",
  "from-emerald-600 to-teal-500",
];

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
  const gradient = STEP_GRADIENTS[(step - 1) % STEP_GRADIENTS.length];

  return (
    <li className="flex gap-4">
      {/* Step badge */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div
          className={clsx(
            "relative flex h-10 w-10 items-center justify-center rounded-xl",
            `bg-gradient-to-br ${gradient}`,
            "shadow-lg shadow-black/10"
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-white" />
          {/* Glow */}
          <div
            className={clsx("absolute inset-0 rounded-xl opacity-40", `bg-gradient-to-br ${gradient} blur-md`)}
            style={{ transform: "scale(1.3)" }}
          />
        </div>
        {/* Connector line */}
        <div className="flex-1 w-px bg-gradient-to-b from-border to-transparent" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-bold text-foreground">{title}</p>
        </div>
        <p className="text-sm text-foreground-muted leading-relaxed">{description}</p>
      </div>
    </li>
  );
}

function FormatChip({ ext }: { ext: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-3.5 py-2">
      <CheckCircle2
        className="h-4 w-4 text-emerald-500 shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm font-mono font-semibold text-foreground uppercase">{ext}</span>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  return (
    <details className={clsx(
      "group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden",
      "transition-all duration-200",
      "hover:border-violet-500/20 hover:shadow-md hover:shadow-black/5"
    )}>
      <summary
        className={clsx(
          "flex cursor-pointer select-none items-center justify-between",
          "px-5 py-4 text-sm font-semibold text-foreground",
          "hover:bg-background-subtle/50 transition-colors duration-150",
          "list-none [&::-webkit-details-marker]:hidden"
        )}
      >
        <span className="flex items-center gap-2.5 pr-4">
          <HelpCircle
            className="h-4 w-4 shrink-0 text-violet-500"
            aria-hidden="true"
          />
          {question}
        </span>
        <span
          className="ml-4 shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-background-muted text-sm font-bold text-foreground-muted leading-none transition-all duration-200 group-open:bg-violet-500 group-open:text-white group-open:rotate-180"
          aria-hidden="true"
        >
          ‣
        </span>
      </summary>
      <div className="px-5 pb-5 pt-1">
        <p className="text-sm text-foreground-muted leading-relaxed pl-6">
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
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-violet-500/20">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <h2
            id="how-it-works-heading"
            className="text-xl lg:text-2xl font-bold text-foreground tracking-tight"
          >
            How to use {tool.name}
          </h2>
        </div>
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
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <h2
              id="formats-heading"
              className="text-xl lg:text-2xl font-bold text-foreground tracking-tight"
            >
              Supported formats
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tool.acceptedFileTypes.map((ext) => (
              <FormatChip key={ext} ext={ext} />
            ))}
          </div>
          {tool.maxFileSizeMB > 0 && (
            <p className="mt-4 text-sm text-foreground-muted">
              Maximum file size:{" "}
              <span className="font-bold text-foreground">
                {tool.maxFileSizeMB} MB
              </span>
              {tool.maxFiles > 1 && (
                <>
                  {" "}&middot; Up to{" "}
                  <span className="font-bold text-foreground">
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
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <h2
            id="faq-heading"
            className="text-xl lg:text-2xl font-bold text-foreground tracking-tight"
          >
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-2.5">
          {faqItems.map(({ question, answer }, i) => (
            <FaqItem key={`${question}-${i}`} question={question} answer={answer} index={i} />
          ))}
        </div>
      </section>

      {/* ── Security note ────────────────────────────────── */}
      <section
        className={clsx(
          "rounded-2xl overflow-hidden",
          "border border-violet-500/20 bg-gradient-to-br",
          "from-violet-500/[0.04] to-purple-500/[0.04]",
          "backdrop-blur-md p-6 lg:p-8"
        )}
        aria-labelledby="security-heading"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-xl shadow-violet-500/30"
          >
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2
              id="security-heading"
              className="text-base lg:text-lg font-bold text-foreground mb-1.5"
            >
              Your privacy is our priority
            </h2>
            <p className="text-sm lg:text-base text-foreground-muted leading-relaxed max-w-2xl">
              All files are transferred over{" "}
              <strong className="font-bold text-foreground">
                TLS 1.3 encrypted connections
              </strong>{" "}
              and processed in isolated environments. Files are{" "}
              <strong className="font-bold text-foreground">
                automatically deleted within 1 hour
              </strong>{" "}
              — we never store, share, or train AI models on your data.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { icon: Shield, label: "TLS 1.3 encrypted" },
                { icon: Server, label: "EU / US servers" },
                { icon: Lock, label: "GDPR compliant" },
                { icon: CheckCircle2, label: "No account needed" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted rounded-full px-3 py-1.5 bg-card/80 backdrop-blur-sm border border-border/50"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
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