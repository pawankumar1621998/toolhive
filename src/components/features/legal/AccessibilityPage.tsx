"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import {
  Accessibility,
  Keyboard,
  Eye,
  Volume2,
  MousePointer,
  CheckCircle,
  AlertCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const LAST_UPDATED = "April 8, 2026";

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground-muted leading-relaxed">{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="text-foreground-muted">{item}</li>
      ))}
    </ul>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-sm">{children}</div>;
}

const TOC_ITEMS = [
  { id: "our-commitment",      label: "Our Commitment"              },
  { id: "standards",           label: "Standards We Follow"         },
  { id: "keyboard-navigation", label: "Keyboard Navigation"         },
  { id: "screen-readers",      label: "Screen Reader Support"       },
  { id: "visual-design",       label: "Visual Design"               },
  { id: "motion",              label: "Reduced Motion"              },
  { id: "known-issues",        label: "Known Issues"                },
  { id: "assistive-tech",      label: "Tested With"                 },
  { id: "feedback",            label: "Feedback & Contact"          },
];

interface A11ySection {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  gradient: string;
  content: React.ReactNode;
}

// ─── Conformance badge ────────────────────────────────────────────

function ConformanceBadge({ level, status }: { level: string; status: "pass" | "partial" | "planned" }) {
  const colors = {
    pass:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    partial: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    planned: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  };
  const labels = { pass: "Meets", partial: "Partial", planned: "Planned" };
  const Icon = status === "pass" ? CheckCircle : AlertCircle;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        colors[status]
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {labels[status]} {level}
    </span>
  );
}

const SECTIONS: A11ySection[] = [
  {
    id: "our-commitment",
    title: "Our Commitment",
    icon: Accessibility,
    gradient: "from-violet-500 to-blue-500",
    content: (
      <Prose>
        <P>
          ToolHive is committed to ensuring digital accessibility for people with
          disabilities. We continuously improve the user experience for everyone
          and apply relevant accessibility standards.
        </P>
        <P>
          We believe that accessibility is not a feature — it is a fundamental
          requirement. Every tool, every page, and every interaction should be
          usable by the widest possible audience, regardless of ability or
          assistive technology.
        </P>
        <div className="flex flex-wrap gap-2 pt-1">
          <ConformanceBadge level="WCAG 2.1 A"  status="pass"    />
          <ConformanceBadge level="WCAG 2.1 AA" status="partial" />
          <ConformanceBadge level="WCAG 2.2 AA" status="planned" />
        </div>
      </Prose>
    ),
  },
  {
    id: "standards",
    title: "Standards We Follow",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-teal-400",
    content: (
      <Prose>
        <P>
          We aim to conform to the{" "}
          <a
            href="https://www.w3.org/WAI/WCAG21/quickref/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:underline"
          >
            Web Content Accessibility Guidelines (WCAG) 2.1
          </a>{" "}
          at Level AA. Our implementation is guided by:
        </P>
        <UL items={[
          "WCAG 2.1 — Perceivable, Operable, Understandable, Robust",
          "WAI-ARIA 1.2 — roles, states, and properties for dynamic content",
          "HTML5 semantic markup throughout",
          "Section 508 (US federal standard)",
          "EN 301 549 (EU standard) where applicable",
        ]} />
      </Prose>
    ),
  },
  {
    id: "keyboard-navigation",
    title: "Keyboard Navigation",
    icon: Keyboard,
    gradient: "from-orange-400 to-rose-500",
    content: (
      <Prose>
        <P>All functionality is operable without a mouse:</P>
        <UL items={[
          "Tab / Shift+Tab — navigate between interactive elements",
          "Enter / Space — activate buttons and links",
          "Arrow keys — navigate within menus, dropdowns, and carousels",
          "Escape — close modals and dismissible panels",
          "/ (slash) — focus the global search bar from any page",
        ]} />
        <P>
          Focus indicators are visible on all interactive elements. We never
          remove the default browser outline without providing a clearly visible
          custom alternative.
        </P>
      </Prose>
    ),
  },
  {
    id: "screen-readers",
    title: "Screen Reader Support",
    icon: Volume2,
    gradient: "from-sky-500 to-cyan-400",
    content: (
      <Prose>
        <P>We test with the following screen reader and browser combinations:</P>
        <UL items={[
          "NVDA + Chrome (Windows) — primary testing combination",
          "JAWS + Chrome (Windows)",
          "VoiceOver + Safari (macOS / iOS)",
          "TalkBack + Chrome (Android)",
        ]} />
        <P>
          Dynamic content changes (file upload progress, processing status, toasts)
          are announced to screen readers using{" "}
          <code className="text-xs bg-background-subtle px-1.5 py-0.5 rounded font-mono">
            aria-live
          </code>{" "}
          regions. All images and icons carry appropriate{" "}
          <code className="text-xs bg-background-subtle px-1.5 py-0.5 rounded font-mono">
            alt
          </code>{" "}
          text or are marked{" "}
          <code className="text-xs bg-background-subtle px-1.5 py-0.5 rounded font-mono">
            aria-hidden="true"
          </code>{" "}
          when decorative.
        </P>
      </Prose>
    ),
  },
  {
    id: "visual-design",
    title: "Visual Design",
    icon: Eye,
    gradient: "from-violet-500 to-blue-500",
    content: (
      <Prose>
        <P>Our visual design targets the following criteria:</P>
        <UL items={[
          "Colour contrast — body text meets WCAG AA (4.5:1 minimum ratio)",
          "Large text meets WCAG AA (3:1 minimum ratio)",
          "UI components (buttons, inputs) meet 3:1 contrast against their backgrounds",
          "Information is never conveyed by colour alone — icons and labels reinforce meaning",
          "Text can be resized up to 200% without loss of content or functionality",
          "Dark mode and light mode both meet contrast requirements",
        ]} />
      </Prose>
    ),
  },
  {
    id: "motion",
    title: "Reduced Motion",
    icon: MousePointer,
    gradient: "from-emerald-500 to-teal-400",
    content: (
      <Prose>
        <P>
          All animations and transitions respect the{" "}
          <code className="text-xs bg-background-subtle px-1.5 py-0.5 rounded font-mono">
            prefers-reduced-motion
          </code>{" "}
          media query. When this preference is enabled:
        </P>
        <UL items={[
          "Page-entry animations are skipped entirely",
          "Parallax and scroll-triggered effects are disabled",
          "Animated counters display their final value immediately",
          "Looping background animations are paused",
        ]} />
        <P>
          You can enable reduced motion in your OS settings (Windows: Settings → Accessibility → Visual effects;
          macOS: System Settings → Accessibility → Display → Reduce motion).
        </P>
      </Prose>
    ),
  },
  {
    id: "known-issues",
    title: "Known Issues",
    icon: AlertCircle,
    gradient: "from-orange-400 to-rose-500",
    content: (
      <Prose>
        <P>
          We are actively working to resolve the following known accessibility gaps:
        </P>
        <UL items={[
          "Some complex drag-and-drop file upload areas lack full keyboard-only alternatives — a fallback file picker button is always available",
          "PDF preview iframes do not yet expose a complete accessibility tree — we recommend downloading the output and using your OS PDF viewer for full screen reader support",
          "Some data visualisations (charts) currently lack text alternatives — we are adding caption summaries",
        ]} />
        <P>
          If you encounter an issue not listed here, please report it using the
          contact details below.
        </P>
      </Prose>
    ),
  },
  {
    id: "assistive-tech",
    title: "Tested With",
    icon: CheckCircle,
    gradient: "from-sky-500 to-cyan-400",
    content: (
      <Prose>
        <P>We conduct accessibility testing using:</P>
        <UL items={[
          "axe DevTools browser extension — automated WCAG scan on every release",
          "Lighthouse accessibility audit — CI gate, score must be ≥ 90",
          "Manual keyboard-only walkthroughs of all critical user flows",
          "Manual screen reader testing (NVDA, VoiceOver) on new feature releases",
          "User testing with participants who use assistive technology (quarterly)",
        ]} />
      </Prose>
    ),
  },
  {
    id: "feedback",
    title: "Feedback & Contact",
    icon: Mail,
    gradient: "from-violet-500 to-cyan-500",
    content: (
      <Prose>
        <P>
          We welcome feedback on the accessibility of ToolHive. If you experience
          barriers that prevent you from accessing any part of our service:
        </P>
        <UL items={[
          "Email: accessibility@toolhive.app",
          "Subject line: Accessibility — [brief description]",
          "We aim to respond within 2 business days",
          "Postal: ToolHive Inc., 123 Mission Street, San Francisco, CA 94105, USA",
        ]} />
        <P>
          We take all accessibility feedback seriously and will do our best to
          provide an accessible alternative or fix the issue promptly.
        </P>
      </Prose>
    ),
  },
];

function SectionCard({
  section,
  shouldReduce,
  index,
}: {
  section: A11ySection;
  shouldReduce: boolean;
  index: number;
}) {
  const Icon = section.icon;
  return (
    <motion.div
      id={section.id}
      initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.03, ease: EASE_OUT }}
      className="border border-card-border bg-card rounded-2xl p-6 sm:p-8 scroll-mt-24"
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            `bg-gradient-to-br ${section.gradient}`,
            "shadow-md"
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug pt-0.5">
          {section.title}
        </h2>
      </div>
      {section.content}
    </motion.div>
  );
}

export function AccessibilityPage() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.08) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-20 -left-20 h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.06) 0%, transparent 70%)" }}
          />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="max-w-3xl"
          >
            <Badge variant="primary" size="md" className="mb-4">Legal</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-4">
              Accessibility
            </h1>
            <p className="text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mb-4">
              ToolHive is built for everyone. Learn about our accessibility
              standards, assistive technology support, and how to report issues.
            </p>
            <p className="text-sm text-foreground-muted">
              Last updated: <span className="font-semibold text-foreground">{LAST_UPDATED}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="pb-20 sm:pb-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-3">
                  Contents
                </p>
                <nav aria-label="Accessibility sections">
                  <ul className="space-y-1">
                    {TOC_ITEMS.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={clsx(
                            "block text-sm text-foreground-muted hover:text-foreground",
                            "py-1 px-2 rounded-lg hover:bg-background-subtle",
                            "transition-colors duration-150"
                          )}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="space-y-4">
              {SECTIONS.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  shouldReduce={shouldReduce}
                  index={index}
                />
              ))}

              {/* CTA */}
              <motion.div
                initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 p-6 sm:p-8 text-white"
              >
                <h3 className="text-lg font-bold mb-2">Found an accessibility issue?</h3>
                <p className="text-white/80 text-sm mb-4">
                  We take all reports seriously and will respond within 2 business days.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-violet-600 hover:bg-white/90 transition-colors"
                >
                  Report an Issue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
