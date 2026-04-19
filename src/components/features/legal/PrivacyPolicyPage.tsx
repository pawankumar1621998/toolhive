"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { Shield, Eye, Lock, Trash2, Mail, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const LAST_UPDATED = "April 8, 2026";

// ─── Section types ───────────────────────────────────────────────

interface PolicySection {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  gradient: string;
  content: React.ReactNode;
}

// ─── Table of contents ───────────────────────────────────────────

const TOC_ITEMS = [
  { id: "information-we-collect",    label: "Information We Collect"       },
  { id: "how-we-use-information",    label: "How We Use Information"        },
  { id: "data-storage-security",     label: "Data Storage & Security"       },
  { id: "data-retention",            label: "Data Retention"                },
  { id: "your-rights",               label: "Your Rights"                   },
  { id: "third-party-services",      label: "Third-Party Services"          },
  { id: "childrens-privacy",         label: "Children's Privacy"            },
  { id: "changes-to-this-policy",    label: "Changes to This Policy"        },
  { id: "contact-us",                label: "Contact Us"                    },
];

// ─── Shared prose wrapper ────────────────────────────────────────

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-section space-y-3 text-sm text-foreground-muted leading-relaxed">
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground-muted leading-relaxed">{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="text-foreground-muted">
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Sections data ───────────────────────────────────────────────

const SECTIONS: PolicySection[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    icon: Eye,
    gradient: "from-violet-500 to-blue-500",
    content: (
      <Prose>
        <P>
          ToolHive is designed with a minimal-data philosophy. We collect only
          what is strictly necessary to provide our services.
        </P>
        <p className="font-semibold text-foreground">Information you provide:</p>
        <UL
          items={[
            "Email address and password when you create an account (optional — most tools work without an account)",
            "Profile information you voluntarily add (name, avatar)",
            "Messages you send via our contact form",
          ]}
        />
        <p className="font-semibold text-foreground">Information collected automatically:</p>
        <UL
          items={[
            "Basic analytics: page views, feature usage (anonymised)",
            "Technical data: browser type, OS, referring URL",
            "IP address (used only for abuse prevention, not linked to your identity)",
          ]}
        />
        <P>
          Files you upload for processing are <strong className="text-foreground">never</strong> read,
          stored, or analysed beyond what is required to complete the requested operation.
        </P>
      </Prose>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    icon: Shield,
    gradient: "from-emerald-500 to-teal-400",
    content: (
      <Prose>
        <P>We use the information we collect to:</P>
        <UL
          items={[
            "Provide, maintain, and improve our tools and services",
            "Authenticate your account and keep it secure",
            "Respond to support requests and feedback",
            "Detect and prevent fraud, abuse, or security incidents",
            "Send transactional emails (password reset, account alerts) — never marketing without consent",
            "Analyse aggregate, anonymised usage patterns to guide product decisions",
          ]}
        />
        <P>
          We do <strong className="text-foreground">not</strong> sell, rent, or trade your personal
          information to third parties. We do not use your data to train AI models.
        </P>
      </Prose>
    ),
  },
  {
    id: "data-storage-security",
    title: "Data Storage & Security",
    icon: Lock,
    gradient: "from-orange-400 to-rose-500",
    content: (
      <Prose>
        <P>
          All data in transit is encrypted using TLS 1.3. Account credentials are
          hashed using bcrypt with a work factor of 12. We store account data in
          SOC 2 Type II certified infrastructure.
        </P>
        <p className="font-semibold text-foreground">File processing:</p>
        <UL
          items={[
            "Files are processed in isolated, ephemeral compute environments",
            "No file content is written to persistent storage",
            "Processed output is held in memory and transferred directly to you",
            "All temporary data is purged immediately after the operation completes",
          ]}
        />
        <P>
          Despite our best efforts, no transmission over the internet is 100% secure.
          If you suspect a security issue, please contact us at{" "}
          <a href="mailto:security@toolhive.app" className="text-violet-500 hover:underline">
            security@toolhive.app
          </a>.
        </P>
      </Prose>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    icon: Trash2,
    gradient: "from-sky-500 to-cyan-400",
    content: (
      <Prose>
        <P>We retain data for only as long as necessary:</P>
        <UL
          items={[
            "Uploaded files: deleted immediately after processing (never persisted)",
            "Account data: retained while your account is active",
            "Activity logs: 90-day rolling window, then automatically purged",
            "Support correspondence: 2 years from last interaction",
            "Anonymised analytics: indefinitely (not linked to any individual)",
          ]}
        />
        <P>
          You can delete your account at any time from{" "}
          <Link href="/dashboard/settings" className="text-violet-500 hover:underline">
            Dashboard → Settings
          </Link>
          . Deletion is permanent and processed within 30 days.
        </P>
      </Prose>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    icon: Shield,
    gradient: "from-violet-500 to-blue-500",
    content: (
      <Prose>
        <P>
          Depending on your location, you may have the following rights regarding your
          personal data:
        </P>
        <UL
          items={[
            "Access — request a copy of the data we hold about you",
            "Rectification — correct inaccurate or incomplete data",
            "Erasure — request deletion of your personal data",
            "Portability — receive your data in a structured, machine-readable format",
            "Restriction — ask us to limit how we process your data",
            "Objection — object to processing based on legitimate interests",
            "Withdraw consent — opt out of any processing based on your consent",
          ]}
        />
        <P>
          To exercise any of these rights, email{" "}
          <a href="mailto:privacy@toolhive.app" className="text-violet-500 hover:underline">
            privacy@toolhive.app
          </a>
          . We will respond within 30 days. EU/UK residents may also lodge a complaint
          with their local supervisory authority.
        </P>
      </Prose>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    icon: Eye,
    gradient: "from-emerald-500 to-teal-400",
    content: (
      <Prose>
        <P>
          We use a small number of vetted third-party processors, each bound by
          data-processing agreements aligned with GDPR:
        </P>
        <UL
          items={[
            "Cloud infrastructure provider — compute and storage (EU/US regions)",
            "Email delivery provider — transactional emails only",
            "Error monitoring service — stack traces with PII stripped",
            "Analytics (self-hosted) — no data leaves our infrastructure",
          ]}
        />
        <P>
          We do not embed third-party advertising networks, social tracking pixels,
          or any technology that shares your behaviour with companies outside
          ToolHive&apos;s data-processing chain.
        </P>
      </Prose>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    icon: Shield,
    gradient: "from-orange-400 to-rose-500",
    content: (
      <Prose>
        <P>
          ToolHive is not directed at children under the age of 13 (or 16 where
          applicable under local law). We do not knowingly collect personal information
          from children. If you believe a child has provided us with personal data,
          please contact us immediately at{" "}
          <a href="mailto:privacy@toolhive.app" className="text-violet-500 hover:underline">
            privacy@toolhive.app
          </a>{" "}
          and we will delete it promptly.
        </P>
      </Prose>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to This Policy",
    icon: Eye,
    gradient: "from-sky-500 to-cyan-400",
    content: (
      <Prose>
        <P>
          We may update this Privacy Policy from time to time. When we make material
          changes, we will notify registered users by email and update the
          &ldquo;Last updated&rdquo; date at the top of this page. Continued use of
          ToolHive after changes take effect constitutes acceptance of the revised policy.
        </P>
        <P>
          We encourage you to review this page periodically to stay informed.
        </P>
      </Prose>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    icon: Mail,
    gradient: "from-violet-500 to-cyan-500",
    content: (
      <Prose>
        <P>For any privacy-related questions or requests, please reach out:</P>
        <UL
          items={[
            "Email: privacy@toolhive.app",
            "Data Protection Officer: dpo@toolhive.app",
            "Postal: ToolHive Inc., 123 Mission Street, San Francisco, CA 94105, USA",
          ]}
        />
        <P>We aim to respond to all privacy enquiries within 5 business days.</P>
      </Prose>
    ),
  },
];

// ─── PolicySectionCard ────────────────────────────────────────────

function PolicySectionCard({
  section,
  shouldReduce,
  index,
}: {
  section: PolicySection;
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
      transition={{ duration: 0.5, delay: index * 0.04, ease: EASE_OUT }}
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

// ─── Main component ───────────────────────────────────────────────

export function PrivacyPolicyPage() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.08) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(62% 0.18 195 / 0.06) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="max-w-3xl"
          >
            <Badge variant="primary" size="md" className="mb-4">
              Legal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-4">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mb-4">
              We believe your data belongs to you. This policy explains exactly what we
              collect, why, and how you can control it.
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
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-3">
                  Contents
                </p>
                <nav aria-label="Policy sections">
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

            {/* Sections */}
            <div className="space-y-4">
              {SECTIONS.map((section, index) => (
                <PolicySectionCard
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
                <h3 className="text-lg font-bold mb-2">Still have questions?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Our team is happy to answer any privacy-related questions you have.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-violet-600 hover:bg-white/90 transition-colors"
                >
                  Contact Us
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
