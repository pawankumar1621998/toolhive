"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { Cookie, Settings, ToggleLeft, Info, RefreshCw, Mail, ArrowRight } from "lucide-react";
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
  { id: "what-are-cookies",    label: "What Are Cookies?"           },
  { id: "cookies-we-use",      label: "Cookies We Use"              },
  { id: "strictly-necessary",  label: "Strictly Necessary"          },
  { id: "analytics-cookies",   label: "Analytics Cookies"           },
  { id: "preference-cookies",  label: "Preference Cookies"          },
  { id: "managing-cookies",    label: "Managing Your Cookies"       },
  { id: "third-party-cookies", label: "Third-Party Cookies"         },
  { id: "updates",             label: "Updates to This Policy"      },
  { id: "contact",             label: "Contact"                     },
];

interface CookieSection {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  gradient: string;
  content: React.ReactNode;
}

// ─── Cookie type table ────────────────────────────────────────────

interface CookieRow {
  name: string;
  purpose: string;
  duration: string;
}

function CookieTable({ rows }: { rows: CookieRow[] }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm border-collapse min-w-[420px]">
        <thead>
          <tr className="border-b border-card-border">
            <th className="text-left py-2 px-3 font-semibold text-foreground">Name</th>
            <th className="text-left py-2 px-3 font-semibold text-foreground">Purpose</th>
            <th className="text-left py-2 px-3 font-semibold text-foreground">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={clsx("border-b border-card-border", i % 2 === 0 ? "" : "bg-background-subtle/50")}>
              <td className="py-2 px-3 font-mono text-xs text-foreground">{row.name}</td>
              <td className="py-2 px-3 text-foreground-muted">{row.purpose}</td>
              <td className="py-2 px-3 text-foreground-muted whitespace-nowrap">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: CookieSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies?",
    icon: Cookie,
    gradient: "from-orange-400 to-rose-500",
    content: (
      <Prose>
        <P>
          Cookies are small text files placed on your device when you visit a website.
          They are widely used to make websites work efficiently and to provide information
          to site owners.
        </P>
        <P>
          Similar technologies include local storage, session storage, and pixel tags.
          When we refer to &ldquo;cookies&rdquo; in this policy, we mean all such technologies
          unless stated otherwise.
        </P>
      </Prose>
    ),
  },
  {
    id: "cookies-we-use",
    title: "Cookies We Use",
    icon: Info,
    gradient: "from-violet-500 to-blue-500",
    content: (
      <Prose>
        <P>
          ToolHive uses a minimal set of cookies. We do not use advertising cookies or
          cross-site tracking. The cookies we use fall into three categories:
        </P>
        <UL items={[
          "Strictly necessary — essential for the site to function",
          "Analytics — anonymised usage metrics (opt-out available)",
          "Preference — remember your settings (theme, language)",
        ]} />
      </Prose>
    ),
  },
  {
    id: "strictly-necessary",
    title: "Strictly Necessary Cookies",
    icon: Cookie,
    gradient: "from-emerald-500 to-teal-400",
    content: (
      <Prose>
        <P>
          These cookies are required for the website to operate and cannot be disabled.
          They are usually set in response to actions you take, such as logging in or
          setting your cookie preferences.
        </P>
        <CookieTable rows={[
          { name: "th_session",     purpose: "Authenticates your logged-in session",        duration: "Session"   },
          { name: "th_csrf",        purpose: "Prevents cross-site request forgery attacks",  duration: "Session"   },
          { name: "th_cookie_pref", purpose: "Stores your cookie consent preferences",       duration: "1 year"    },
        ]} />
      </Prose>
    ),
  },
  {
    id: "analytics-cookies",
    title: "Analytics Cookies",
    icon: Settings,
    gradient: "from-sky-500 to-cyan-400",
    content: (
      <Prose>
        <P>
          We use self-hosted analytics to understand how visitors use ToolHive.
          All data is anonymised — no IP addresses are stored and no data is shared
          with third parties.
        </P>
        <CookieTable rows={[
          { name: "th_analytics",   purpose: "Anonymous page-view and feature-usage tracking", duration: "13 months" },
          { name: "th_session_id",  purpose: "Groups page views into a single anonymous visit", duration: "30 minutes" },
        ]} />
        <P>
          You can opt out of analytics cookies at any time via the cookie banner or
          in{" "}
          <Link href="/dashboard/settings" className="text-violet-500 hover:underline">
            Dashboard → Settings
          </Link>
          .
        </P>
      </Prose>
    ),
  },
  {
    id: "preference-cookies",
    title: "Preference Cookies",
    icon: ToggleLeft,
    gradient: "from-violet-500 to-blue-500",
    content: (
      <Prose>
        <P>
          These cookies remember choices you make to improve your experience. Disabling
          them may mean certain preferences are not saved between visits.
        </P>
        <CookieTable rows={[
          { name: "th_theme",     purpose: "Remembers your dark/light mode preference",   duration: "1 year"  },
          { name: "th_lang",      purpose: "Remembers your preferred language",            duration: "1 year"  },
          { name: "th_sidebar",   purpose: "Remembers dashboard sidebar collapsed state",  duration: "6 months"},
        ]} />
      </Prose>
    ),
  },
  {
    id: "managing-cookies",
    title: "Managing Your Cookies",
    icon: Settings,
    gradient: "from-orange-400 to-rose-500",
    content: (
      <Prose>
        <P>You can control cookies in several ways:</P>
        <UL items={[
          "Cookie banner — shown on first visit; change preferences any time via the footer link",
          "Browser settings — most browsers let you block or delete cookies",
          "Dashboard Settings — logged-in users can toggle analytics from the Privacy section",
        ]} />
        <P>
          Note that blocking strictly necessary cookies will prevent you from logging in
          and using account features. It does not affect tool usage for guests.
        </P>
        <P>
          Browser-specific instructions:{" "}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:underline"
          >
            Chrome
          </a>
          {" · "}
          <a
            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:underline"
          >
            Firefox
          </a>
          {" · "}
          <a
            href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:underline"
          >
            Safari
          </a>
        </P>
      </Prose>
    ),
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    icon: Cookie,
    gradient: "from-sky-500 to-cyan-400",
    content: (
      <Prose>
        <P>
          ToolHive does not embed third-party advertising networks, social media
          widgets, or tracking pixels that place cookies on your device without
          your knowledge.
        </P>
        <P>
          If you follow external links from our website, those third-party sites
          may set their own cookies. We have no control over this and recommend
          reviewing their respective cookie policies.
        </P>
      </Prose>
    ),
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    icon: RefreshCw,
    gradient: "from-emerald-500 to-teal-400",
    content: (
      <Prose>
        <P>
          We may update this Cookie Policy to reflect changes in the cookies we use
          or for other operational, legal, or regulatory reasons. We will notify you
          of material changes by updating the &ldquo;Last updated&rdquo; date and, where
          appropriate, showing you a new consent notice.
        </P>
      </Prose>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    icon: Mail,
    gradient: "from-violet-500 to-cyan-500",
    content: (
      <Prose>
        <P>Questions about our use of cookies? Contact us at:</P>
        <UL items={[
          "Email: privacy@toolhive.app",
          "Postal: ToolHive Inc., 123 Mission Street, San Francisco, CA 94105, USA",
        ]} />
      </Prose>
    ),
  },
];

function SectionCard({
  section,
  shouldReduce,
  index,
}: {
  section: CookieSection;
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

export function CookiePolicyPage() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(55% 0.22 285 / 0.07) 0%, transparent 70%)" }}
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
              Cookie Policy
            </h1>
            <p className="text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mb-4">
              We use a minimal set of cookies. Here&apos;s exactly what they are,
              why we use them, and how to control them.
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
                <nav aria-label="Cookie policy sections">
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
                <h3 className="text-lg font-bold mb-2">Questions about cookies?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Reach out and we&apos;ll explain anything in plain language.
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
