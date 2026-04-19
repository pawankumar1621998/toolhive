"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Download,
  Trash2,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

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
          className={clsx("text-base font-semibold text-foreground")}
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
// Toggle row
// ─────────────────────────────────────────────

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={clsx(
        "flex items-start justify-between gap-4 rounded-xl border p-4 cursor-pointer",
        "transition-colors duration-150",
        checked ? "border-primary/20 bg-primary/5" : "border-border bg-background-muted/40"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-foreground-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative shrink-0 mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={clsx(
            "h-5 w-9 rounded-full border-2 transition-all duration-200",
            checked ? "bg-primary border-primary" : "bg-background-muted border-border"
          )}
          aria-hidden="true"
        >
          <div
            className={clsx(
              "h-3.5 w-3.5 rounded-full bg-white shadow-sm",
              "absolute top-[3px] transition-transform duration-200",
              checked ? "translate-x-[18px]" : "translate-x-[2px]"
            )}
          />
        </div>
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────
// Section 1: Notifications
// ─────────────────────────────────────────────

function NotificationsSection() {
  const [emailNewFeatures,   setEmailNewFeatures]   = useState(true);
  const [emailUsageReports,  setEmailUsageReports]  = useState(false);
  const [pushNotifications,  setPushNotifications]  = useState(false);
  const { toast } = useToast();

  const handlePushToggle = (checked: boolean) => {
    setPushNotifications(checked);
    if (checked) {
      toast({
        title: "Push notifications enabled",
        description: "You'll receive browser notifications for important updates.",
        variant: "success",
      });
    }
  };

  return (
    <SectionCard
      id="notifications"
      title="Notifications"
      description="Choose what updates you want to hear about"
      delay={0}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Email notifications
        </p>
        <ToggleRow
          id="email-new-features"
          label="New tools & updates"
          description="Be the first to know about new tools and improvements"
          checked={emailNewFeatures}
          onChange={setEmailNewFeatures}
        />
        <ToggleRow
          id="email-usage-reports"
          label="Tips & tricks"
          description="Occasional tips on how to get the most from ToolHive"
          checked={emailUsageReports}
          onChange={setEmailUsageReports}
        />
      </div>

      <div className="space-y-3 pt-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Browser notifications
        </p>
        <ToggleRow
          id="push-notifications"
          label="Push notifications"
          description="Receive real-time notifications in your browser"
          checked={pushNotifications}
          onChange={handlePushToggle}
        />
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────
// Section 2: Privacy & Data
// ─────────────────────────────────────────────

function PrivacySection() {
  const { toast } = useToast();
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleDownloadData = () => {
    toast({
      title: "Nothing to export",
      description: "No account data is stored — all tools work without sign-in.",
      variant: "info",
    });
  };

  const handleClearFavorites = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    setClearConfirm(false);
    try {
      localStorage.removeItem("th_favorites");
      toast({
        title: "Favorites cleared",
        description: "Your saved favorites have been removed from this browser.",
        variant: "success",
      });
    } catch {
      toast({ title: "Failed to clear favorites.", variant: "error" });
    }
  };

  return (
    <SectionCard
      id="privacy"
      title="Privacy & Data"
      description="ToolHive stores nothing on our servers — only your browser's localStorage is used"
      delay={0.05}
    >
      <div className="space-y-3">
        {/* Download data */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Export my data</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                No server data stored — ToolHive is 100% privacy-friendly
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={handleDownloadData}
          >
            Export
          </Button>
        </div>

        {/* Clear favorites */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <Trash2 className="h-4 w-4 text-warning" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Clear saved favorites</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                Remove all favorited tools stored in this browser
              </p>
            </div>
          </div>
          {clearConfirm ? (
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-foreground-muted whitespace-nowrap">Are you sure?</span>
              <Button variant="destructive" size="sm" onClick={handleClearFavorites}>
                Yes, clear
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setClearConfirm(false)}
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleClearFavorites}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border/60 bg-background-muted/30 px-4 py-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-foreground-muted leading-relaxed">
          <span className="font-medium text-foreground">Your privacy: </span>
          ToolHive never stores your files on our servers longer than needed for processing.
          Favorites and preferences are stored only in your browser&apos;s localStorage.
        </p>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────
// SettingsPage
// ─────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manage your notifications and privacy preferences
        </p>
      </motion.div>

      <NotificationsSection />
      <PrivacySection />
    </div>
  );
}
