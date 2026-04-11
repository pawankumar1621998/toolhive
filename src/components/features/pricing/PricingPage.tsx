"use client";

import React, { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Check,
  Minus,
  ChevronDown,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ─────────────────────────────────────────────
// Animation constants
// ─────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: EASE_OUT },
  }),
};

// ─────────────────────────────────────────────
// Plan data
// ─────────────────────────────────────────────

interface PlanFeature {
  label: string;
  included: boolean | string;
}

interface Plan {
  id: string;
  name: string;
  badge: "free" | "popular" | "premium";
  badgeLabel: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  cta: string;
  ctaHref: string;
  ctaVariant: "outline" | "gradient" | "primary";
  highlight: boolean;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    badge: "free",
    badgeLabel: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Everything you need to get started — no credit card required.",
    cta: "Get Started Free",
    ctaHref: "/tools",
    ctaVariant: "outline",
    highlight: false,
    features: [
      { label: "20 tool uses per day", included: true },
      { label: "50 MB max file size", included: true },
      { label: "200+ tools available", included: true },
      { label: "No login required", included: true },
      { label: "Community support", included: true },
      { label: "Priority processing", included: false },
      { label: "2 GB file uploads", included: false },
      { label: "API access", included: false },
      { label: "SSO / Team management", included: false },
      { label: "SLA & dedicated support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "popular",
    badgeLabel: "Most Popular",
    monthlyPrice: 9,
    annualPrice: 7.2,
    description: "Unlimited power for professionals and creators who need more.",
    cta: "Start Pro Trial",
    ctaHref: "/auth/signup?plan=pro",
    ctaVariant: "gradient",
    highlight: true,
    features: [
      { label: "Unlimited tool uses", included: true },
      { label: "2 GB max file size", included: true },
      { label: "200+ tools available", included: true },
      { label: "No login required", included: true },
      { label: "Priority email support", included: true },
      { label: "Priority processing", included: true },
      { label: "2 GB file uploads", included: true },
      { label: "API access", included: false },
      { label: "SSO / Team management", included: false },
      { label: "SLA & dedicated support", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "premium",
    badgeLabel: "Enterprise",
    monthlyPrice: 29,
    annualPrice: 23.2,
    description: "Full-featured suite for teams and businesses with custom needs.",
    cta: "Contact Sales",
    ctaHref: "/contact?plan=enterprise",
    ctaVariant: "primary",
    highlight: false,
    features: [
      { label: "Unlimited tool uses", included: true },
      { label: "10 GB max file size", included: true },
      { label: "200+ tools available", included: true },
      { label: "No login required", included: true },
      { label: "Dedicated support", included: true },
      { label: "Priority processing", included: true },
      { label: "10 GB file uploads", included: true },
      { label: "API access", included: true },
      { label: "SSO / Team management", included: true },
      { label: "SLA & dedicated support", included: true },
    ],
  },
];

// ─────────────────────────────────────────────
// Comparison table data
// ─────────────────────────────────────────────

interface CompareGroup {
  category: string;
  rows: {
    feature: string;
    free: string | boolean;
    pro: string | boolean;
    enterprise: string | boolean;
  }[];
}

const COMPARISON: CompareGroup[] = [
  {
    category: "Usage",
    rows: [
      { feature: "Daily tool uses", free: "20 / day", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Max file size", free: "50 MB", pro: "2 GB", enterprise: "10 GB" },
      { feature: "Batch processing", free: false, pro: true, enterprise: true },
      { feature: "Priority queue", free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Tools",
    rows: [
      { feature: "Access to 200+ tools", free: true, pro: true, enterprise: true },
      { feature: "PDF tools", free: true, pro: true, enterprise: true },
      { feature: "Image tools", free: true, pro: true, enterprise: true },
      {
        feature: "AI-powered tools",
        free: "Limited",
        pro: "Full access",
        enterprise: "Full access",
      },
    ],
  },
  {
    category: "Integrations",
    rows: [
      { feature: "REST API access", free: false, pro: false, enterprise: true },
      { feature: "Webhook support", free: false, pro: false, enterprise: true },
      { feature: "Custom integrations", free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Security & Admin",
    rows: [
      { feature: "SSO (SAML / OIDC)", free: false, pro: false, enterprise: true },
      { feature: "Team management", free: false, pro: false, enterprise: true },
      { feature: "Audit logs", free: false, pro: false, enterprise: true },
      { feature: "99.9% uptime SLA", free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    rows: [
      { feature: "Community support", free: true, pro: true, enterprise: true },
      { feature: "Email support", free: false, pro: true, enterprise: true },
      { feature: "Dedicated account manager", free: false, pro: false, enterprise: true },
      { feature: "Phone / video support", free: false, pro: false, enterprise: true },
    ],
  },
];

// ─────────────────────────────────────────────
// FAQ data
// ─────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Yes! Every new Pro account gets a 7-day free trial with no credit card required. You can upgrade, downgrade, or cancel at any time during or after the trial.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Absolutely. You can cancel from your account settings with one click. Your plan stays active until the end of the billing period — no penalties or hidden fees.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied for any reason, contact our support team within 30 days of your first payment and we'll issue a full refund.",
  },
  {
    question: "What happens if I exceed my daily limit on the Free plan?",
    answer:
      "Once you hit your daily limit, you'll be prompted to upgrade to Pro or wait until midnight UTC when your usage resets. Your files and work are never deleted — you just need to wait or upgrade.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "With annual billing you pay for 12 months upfront and receive a 20% discount versus month-to-month pricing. You'll receive a receipt immediately and a reminder 30 days before renewal.",
  },
  {
    question: "Do you offer discounts for students, nonprofits, or open-source projects?",
    answer:
      "Yes! We offer 50% off Pro for verified students and qualifying nonprofits, and free Pro licenses for active open-source maintainers. Reach out to our team at support@toolhive.app with proof of eligibility.",
  },
];

// ─────────────────────────────────────────────
// Social proof avatar data
// ─────────────────────────────────────────────

const AVATAR_USERS = [
  { name: "Sarah K.", role: "Designer", initials: "SK", gradient: "from-violet-500 to-purple-600" },
  { name: "Mike R.", role: "Developer", initials: "MR", gradient: "from-blue-500 to-cyan-500" },
  { name: "Priya M.", role: "Marketer", initials: "PM", gradient: "from-emerald-500 to-teal-500" },
  { name: "James L.", role: "Founder", initials: "JL", gradient: "from-orange-400 to-rose-500" },
  { name: "Chen W.", role: "Engineer", initials: "CW", gradient: "from-sky-400 to-blue-500" },
];

// ─────────────────────────────────────────────
// Billing toggle
// ─────────────────────────────────────────────

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-center gap-3"
      role="group"
      aria-label="Billing period"
    >
      <button
        type="button"
        onClick={() => onChange(false)}
        className={clsx(
          "text-sm font-medium transition-colors duration-200",
          !annual
            ? "text-foreground"
            : "text-foreground-muted hover:text-foreground"
        )}
        aria-pressed={!annual}
      >
        Monthly
      </button>

      {/* Toggle pill */}
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Toggle annual billing"
        onClick={() => onChange(!annual)}
        className={clsx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
          "border-2 border-transparent transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          annual ? "bg-primary" : "bg-background-muted"
        )}
      >
        <span className="sr-only">Toggle annual billing</span>
        <motion.span
          className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md"
          animate={{ x: annual ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() => onChange(true)}
        className={clsx(
          "flex items-center gap-1.5 text-sm font-medium transition-colors duration-200",
          annual ? "text-foreground" : "text-foreground-muted hover:text-foreground"
        )}
        aria-pressed={annual}
      >
        Annual
        <span
          className={clsx(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            "bg-success/12 text-success border border-success/25"
          )}
        >
          Save 20%
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Animated price display
// ─────────────────────────────────────────────

function PriceDisplay({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const isFree = plan.monthlyPrice === 0;

  return (
    <div
      className="flex items-end gap-1"
      aria-label={
        isFree
          ? "Free forever"
          : `$${price.toFixed(price % 1 === 0 ? 0 : 2)} per month`
      }
    >
      {isFree ? (
        <span className="text-4xl font-extrabold text-foreground leading-none">
          Free
        </span>
      ) : (
        <>
          <span className="text-lg font-semibold text-foreground-muted self-start mt-1">
            $
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={annual ? "annual" : "monthly"}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="text-4xl font-extrabold text-foreground leading-none tabular-nums"
            >
              {price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm text-foreground-muted mb-0.5">/mo</span>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Feature row inside a plan card
// ─────────────────────────────────────────────

function FeatureItem({
  feature,
  highlight,
}: {
  feature: PlanFeature;
  highlight: boolean;
}) {
  const included = feature.included !== false;

  return (
    <li className="flex items-start gap-2.5">
      <span
        className={clsx(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
          included
            ? highlight
              ? "bg-primary/15 text-primary"
              : "bg-success/12 text-success"
            : "bg-background-muted text-foreground-subtle"
        )}
        aria-hidden="true"
      >
        {included ? (
          <Check className="h-2.5 w-2.5 stroke-[2.5]" />
        ) : (
          <Minus className="h-2.5 w-2.5" />
        )}
      </span>
      <span
        className={clsx(
          "text-sm leading-snug",
          included
            ? "text-foreground-muted"
            : "text-foreground-subtle line-through"
        )}
      >
        {typeof feature.included === "string" ? feature.included : feature.label}
      </span>
    </li>
  );
}

// ─────────────────────────────────────────────
// Plan card
// ─────────────────────────────────────────────

function PlanCard({
  plan,
  annual,
  index,
  shouldReduce,
}: {
  plan: Plan;
  annual: boolean;
  index: number;
  shouldReduce: boolean;
}) {
  const annualSaving =
    plan.monthlyPrice > 0
      ? Math.round((plan.monthlyPrice - plan.annualPrice) * 12)
      : 0;

  return (
    <motion.div
      custom={index}
      variants={shouldReduce ? undefined : cardVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        "relative flex flex-col rounded-2xl p-6 sm:p-8",
        "border transition-all duration-300",
        plan.highlight
          ? [
              "border-primary/40 bg-card",
              "ring-1 ring-primary/20",
              "shadow-[0_8px_32px_color-mix(in_oklch,var(--color-primary)_12%,transparent)]",
              "hover:shadow-[0_12px_40px_color-mix(in_oklch,var(--color-primary)_18%,transparent)]",
              "hover:-translate-y-1",
            ]
          : [
              "border-card-border bg-card",
              "shadow-md hover:shadow-lg hover:-translate-y-0.5",
            ]
      )}
    >
      {/* Top accent line for highlighted card */}
      {plan.highlight && (
        <div
          className="absolute -top-px inset-x-0 h-0.5 rounded-t-2xl bg-gradient-brand"
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
        </div>
        <Badge variant={plan.badge} size="sm">
          {plan.badgeLabel}
        </Badge>
      </div>

      {/* Price */}
      <div className="mb-1">
        <PriceDisplay plan={plan} annual={annual} />
      </div>

      {/* Annual saving callout — reserved height to prevent layout shift */}
      <div className="h-5 mb-4">
        {annual && annualSaving > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-success font-medium"
          >
            Save ${annualSaving}/year vs monthly
          </motion.p>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-foreground-muted leading-relaxed mb-6">
        {plan.description}
      </p>

      {/* CTA */}
      <Button
        variant={plan.ctaVariant}
        fullWidth
        size="lg"
        className="mb-6"
        asChild
      >
        <Link href={plan.ctaHref}>
          {plan.cta}
          {plan.highlight && (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
        </Link>
      </Button>

      {/* Divider */}
      <div className="border-t border-card-border mb-5" aria-hidden="true" />

      {/* Features */}
      <ul
        className="flex flex-col gap-3 flex-1"
        aria-label={`${plan.name} plan features`}
      >
        {plan.features.map((f) => (
          <FeatureItem key={f.label} feature={f} highlight={plan.highlight} />
        ))}
      </ul>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Comparison table cell
// ─────────────────────────────────────────────

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-success/12 text-success"
        aria-label="Included"
      >
        <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
      </span>
    ) : (
      <span
        className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-background-muted text-foreground-subtle"
        aria-label="Not included"
      >
        <Minus className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="text-sm text-foreground-muted font-medium">{value}</span>
  );
}

// ─────────────────────────────────────────────
// Comparison table
// ─────────────────────────────────────────────

function ComparisonTable({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-2xl border border-card-border",
        !expanded && "max-h-[480px] overflow-hidden"
      )}
      role="region"
      aria-label="Feature comparison table"
    >
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-card-border bg-background-subtle">
            <th
              scope="col"
              className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted w-[40%]"
            >
              Feature
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted"
            >
              Free
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary bg-primary/[0.04]"
            >
              Pro
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted"
            >
              Enterprise
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((group) => (
            <React.Fragment key={group.category}>
              {/* Category header row */}
              <tr className="border-t border-card-border bg-background-subtle/60">
                <td
                  colSpan={4}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground-muted"
                >
                  {group.category}
                </td>
              </tr>
              {/* Feature rows */}
              {group.rows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-t border-card-border/60 transition-colors hover:bg-background-subtle/40"
                >
                  <td className="px-5 py-3.5 text-sm text-foreground">
                    {row.feature}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <ComparisonCell value={row.free} />
                  </td>
                  <td className="px-5 py-3.5 text-center bg-primary/[0.025]">
                    <ComparisonCell value={row.pro} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <ComparisonCell value={row.enterprise} />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// FAQ accordion item
// ─────────────────────────────────────────────

function FaqAccordionItem({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-card-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          "flex w-full items-center justify-between gap-4",
          "py-4 px-0 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
          "transition-colors duration-150 hover:text-primary"
        )}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground leading-snug">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="shrink-0 text-foreground-muted"
          aria-hidden="true"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-foreground-muted leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Social proof section
// ─────────────────────────────────────────────

const SOCIAL_STATS = [
  {
    icon: Users,
    value: "2M+",
    label: "Active users",
    gradient: "from-violet-500 to-blue-500",
  },
  {
    icon: TrendingUp,
    value: "50M+",
    label: "Files processed",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    value: "200+",
    label: "Free tools",
    gradient: "from-orange-400 to-rose-500",
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Uptime",
    gradient: "from-sky-400 to-cyan-500",
  },
];

function SocialProofSection({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20"
      aria-labelledby="social-proof-heading"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-background-subtle -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse at 20% 50%, oklch(55% 0.22 285 / 0.06) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 50%, oklch(62% 0.18 195 / 0.05) 0%, transparent 60%)",
          ].join(", "),
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-brand opacity-15"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-brand opacity-15"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mb-10"
        >
          <h2
            id="social-proof-heading"
            className="text-2xl sm:text-3xl font-bold text-foreground"
          >
            Trusted by teams worldwide
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Numbers that speak for themselves
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {SOCIAL_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: EASE_OUT }}
                className={clsx(
                  "flex flex-col items-center gap-3 rounded-2xl p-5 sm:p-6",
                  "border border-card-border bg-card shadow-sm",
                  "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                )}
              >
                <div
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    `bg-gradient-to-br ${stat.gradient}`,
                    "shadow-md"
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-gradient leading-none tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground-muted">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Avatar stack + rating */}
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
          className="flex flex-col items-center gap-4"
        >
          {/* Stacked avatars */}
          <div className="flex items-center" aria-label="Happy users">
            {AVATAR_USERS.map((user, i) => (
              <div
                key={user.name}
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "border-2 border-background text-white text-xs font-bold",
                  `bg-gradient-to-br ${user.gradient}`,
                  i > 0 && "-ml-2"
                )}
                title={`${user.name} — ${user.role}`}
                aria-label={`${user.name}, ${user.role}`}
              >
                {user.initials}
              </div>
            ))}
            <div
              className={clsx(
                "flex h-9 w-9 -ml-2 items-center justify-center rounded-full",
                "border-2 border-background bg-background-muted",
                "text-xs font-bold text-foreground-muted"
              )}
              aria-label="And over 1 million more users"
            >
              +1M
            </div>
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
            ))}
          </div>

          <p className="text-sm text-foreground-muted text-center max-w-sm">
            <span className="font-semibold text-foreground">4.9 / 5</span> from
            over{" "}
            <span className="font-semibold text-foreground">12,000+ reviews</span>{" "}
            on Product Hunt, G2, and Capterra.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Hero background orbs
// ─────────────────────────────────────────────

function HeroBackground({ shouldReduce }: { shouldReduce: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-background" />
      <motion.div
        className="absolute -top-32 -left-24 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(55% 0.22 285 / 0.1) 0%, transparent 70%)",
        }}
        animate={
          shouldReduce
            ? { scale: 1, opacity: 0.7 }
            : {
                scale: [1, 1.08, 1] as number[],
                opacity: [0.7, 1, 0.7] as number[],
              }
        }
        transition={{
          duration: 8,
          repeat: shouldReduce ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -top-16 right-0 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(62% 0.18 195 / 0.08) 0%, transparent 70%)",
        }}
        animate={
          shouldReduce
            ? { scale: 1, opacity: 0.6 }
            : {
                scale: [1, 1.1, 1] as number[],
                opacity: [0.6, 0.9, 0.6] as number[],
              }
        }
        transition={{
          duration: 10,
          repeat: shouldReduce ? 0 : Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PricingPage
// ─────────────────────────────────────────────

/**
 * PricingPage — Client Component
 *
 * Full pricing page with:
 * - Animated hero heading with gradient on "Transparent"
 * - Monthly / annual billing toggle (20% annual discount)
 * - 3 plan cards (Free, Pro, Enterprise) with staggered Framer Motion entrance
 * - Feature comparison table with mobile collapse / expand
 * - FAQ accordion (6 questions)
 * - Social proof section with stats and avatar stack
 * - Bottom CTA banner with brand gradient
 */
export function PricingPage() {
  const shouldReduce = useReducedMotion() ?? false;
  const [annual, setAnnual] = useState(false);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function toggleFaq(i: number) {
    setOpenFaq((prev) => (prev === i ? null : i));
  }

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16"
        aria-labelledby="pricing-heading"
      >
        <HeroBackground shouldReduce={shouldReduce} />

        <div className="container mx-auto px-4">
          <motion.div
            variants={shouldReduce ? undefined : containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center gap-5"
          >
            {/* Eyebrow */}
            <motion.div variants={shouldReduce ? undefined : fadeUpVariant}>
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full",
                  "border border-primary/25 bg-primary/8 px-4 py-1.5",
                  "text-xs font-semibold text-primary"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Simple, transparent pricing
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              id="pricing-heading"
              variants={shouldReduce ? undefined : fadeUpVariant}
              className={clsx(
                "max-w-3xl text-balance",
                "text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl",
                "text-foreground leading-[1.08]"
              )}
            >
              Simple,{" "}
              <span className="text-gradient">Transparent</span>{" "}
              Pricing
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={shouldReduce ? undefined : fadeUpVariant}
              className="max-w-lg text-pretty text-base sm:text-lg text-foreground-muted leading-relaxed"
            >
              Start free, scale when you&apos;re ready. No hidden fees, no lock-in —
              cancel or change plans any time.
            </motion.p>

            {/* Billing toggle */}
            <motion.div variants={shouldReduce ? undefined : fadeUpVariant}>
              <BillingToggle annual={annual} onChange={setAnnual} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Plan cards ────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12" aria-label="Pricing plans">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                annual={annual}
                index={i}
                shouldReduce={shouldReduce}
              />
            ))}
          </div>

          {/* Fine print */}
          <p className="mt-6 text-center text-xs text-foreground-subtle">
            All prices in USD. Taxes may apply.{" "}
            <Link
              href="/terms"
              className="underline hover:text-foreground-muted transition-colors"
            >
              Terms of Service
            </Link>{" "}
            &middot;{" "}
            <Link
              href="/privacy"
              className="underline hover:text-foreground-muted transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>

      {/* ── Feature comparison table ──────────────────────────────── */}
      <section
        className="py-12 sm:py-16"
        aria-labelledby="comparison-heading"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="text-center mb-8"
          >
            <h2
              id="comparison-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Compare all features
            </h2>
            <p className="mt-2 text-sm text-foreground-muted">
              See exactly what&apos;s included in each plan
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
          >
            <ComparisonTable expanded={tableExpanded} />

            {/* Expand / collapse */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setTableExpanded((v) => !v)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2",
                  "text-sm font-medium text-foreground-muted",
                  "border border-card-border bg-card hover:bg-background-subtle",
                  "transition-all duration-200 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                aria-expanded={tableExpanded}
                aria-controls="comparison-table"
              >
                <motion.span
                  animate={{ rotate: tableExpanded ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                  aria-hidden="true"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
                {tableExpanded ? "Show less" : "Show full comparison"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────────────── */}
      <SocialProofSection shouldReduce={shouldReduce} />

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="text-center mb-10"
          >
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-foreground-muted">
              Can&apos;t find the answer you&apos;re looking for?{" "}
              <Link
                href="/contact"
                className="text-primary underline underline-offset-4 hover:no-underline transition-all"
              >
                Reach out to us
              </Link>
              .
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="rounded-2xl border border-card-border bg-card divide-y divide-card-border px-6"
          >
            {FAQS.map((item, i) => (
              <FaqAccordionItem
                key={item.question}
                item={item}
                open={openFaq === i}
                onToggle={() => toggleFaq(i)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className={clsx(
              "relative overflow-hidden rounded-3xl px-8 py-12 sm:py-16 text-center",
              "bg-gradient-brand max-w-4xl mx-auto"
            )}
          >
            {/* Decorative orbs */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/8 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-balance leading-tight">
                Ready to get started?
              </h2>
              <p className="max-w-md text-white/80 text-base sm:text-lg leading-relaxed">
                Join over 2 million professionals who save hours every week with
                ToolHive&apos;s AI-powered tools.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/tools"
                  className={clsx(
                    "inline-flex items-center justify-center gap-2 rounded-xl",
                    "bg-white px-7 py-3.5",
                    "text-sm font-bold text-primary",
                    "shadow-xl hover:bg-white/90 hover:shadow-2xl",
                    "transition-all duration-200 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  )}
                >
                  Try for Free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/auth/signup?plan=pro"
                  className={clsx(
                    "inline-flex items-center justify-center gap-2 rounded-xl",
                    "border border-white/40 bg-white/10 px-7 py-3.5",
                    "text-sm font-semibold text-white",
                    "hover:bg-white/20 hover:border-white/60 backdrop-blur-sm",
                    "transition-all duration-200 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  )}
                >
                  Start Pro Trial
                </Link>
              </div>

              <p className="text-xs text-white/55">
                No credit card required &middot; Cancel anytime &middot; 30-day
                money-back guarantee
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
