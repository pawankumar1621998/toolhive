"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Heart } from "lucide-react";
import { clsx } from "clsx";
import { ThemeSwitcher } from "@/components/ui/ThemeToggle";
import Link from "next/link";

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────

function SectionCard({
  id,
  title,
  description,
  children,
  delay = 0,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-card-border bg-card p-6 space-y-5"
    >
      <div>
        <h2
          id={`${id}-heading`}
          className="text-base font-semibold text-foreground"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// ProfilePage
// ─────────────────────────────────────────────

export function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manage your preferences
        </p>
      </motion.div>

      {/* Guest banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className={clsx(
          "relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6",
          "flex items-start gap-4"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-md">
          <Zap className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            You&apos;re using ToolHive as a guest
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            All 200+ tools are completely free — no account needed.
            Your favorites are saved locally in your browser.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <Heart className="h-3 w-3 fill-current" />
              Free forever
            </span>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <SectionCard
        id="appearance"
        title="Appearance"
        description="Choose your preferred color theme"
        delay={0.1}
      >
        <ThemeSwitcher />
      </SectionCard>

      {/* Quick links */}
      <SectionCard
        id="quick-links"
        title="Quick Links"
        description="Jump to useful pages"
        delay={0.15}
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Browse Tools",    href: "/tools"      },
            { label: "PDF Tools",       href: "/tools/pdf"  },
            { label: "Image Tools",     href: "/tools/image" },
            { label: "AI Writing",      href: "/tools/ai-writing" },
            { label: "Favorites",       href: "/dashboard/favorites" },
            { label: "About ToolHive",  href: "/about"      },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center rounded-xl border border-border bg-background-subtle px-4 py-3",
                "text-sm font-medium text-foreground-muted",
                "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                "transition-all duration-150"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
