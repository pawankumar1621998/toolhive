"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Download,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  GitFork,
  Globe,
  AlertTriangle,
  X,
  Check,
  Link2,
  BarChart2,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";
import { useAuth } from "@/context/AuthContext";
import { apiDelete } from "@/lib/api";

// ─────────────────────────────────────────────
// Section wrapper (same pattern as ProfilePage)
// ─────────────────────────────────────────────

interface SectionCardProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: "default" | "danger";
  delay?: number;
}

function SectionCard({
  id,
  title,
  description,
  children,
  variant = "default",
  delay = 0,
}: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      aria-labelledby={`${id}-heading`}
      className={clsx(
        "rounded-2xl border p-6 space-y-5",
        variant === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-card-border bg-card"
      )}
    >
      <div>
        <h2
          id={`${id}-heading`}
          className={clsx(
            "text-base font-semibold",
            variant === "danger" ? "text-destructive" : "text-foreground"
          )}
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

interface ToggleRowProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
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
      {/* Custom checkbox toggle */}
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
            checked
              ? "bg-primary border-primary"
              : "bg-background-muted border-border"
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
  const [emailNewFeatures, setEmailNewFeatures] = useState(true);
  const [emailUsageReports, setEmailUsageReports] = useState(true);
  const [emailSecurityAlerts, setEmailSecurityAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
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
          label="New features & updates"
          description="Be the first to know about new tools and improvements"
          checked={emailNewFeatures}
          onChange={setEmailNewFeatures}
        />
        <ToggleRow
          id="email-usage-reports"
          label="Weekly usage reports"
          description="Receive a summary of your file processing activity"
          checked={emailUsageReports}
          onChange={setEmailUsageReports}
        />
        <ToggleRow
          id="email-security-alerts"
          label="Security alerts"
          description="Get notified about sign-ins and account changes"
          checked={emailSecurityAlerts}
          onChange={setEmailSecurityAlerts}
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
  const [isClearing, setIsClearing] = useState(false);

  const handleDownloadData = () => {
    toast({
      title: "Export requested",
      description: "Your data export is being prepared. You'll receive an email when it's ready.",
      variant: "info",
    });
  };

  const handleClearHistory = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    setIsClearing(true);
    setClearConfirm(false);
    try {
      await apiDelete("/files/all");
      toast({
        title: "History cleared",
        description: "Your processing history has been permanently deleted.",
        variant: "success",
      });
    } catch {
      toast({ title: "Failed to clear history. Please try again.", variant: "error" });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <SectionCard
      id="privacy"
      title="Privacy & Data"
      description="Control how your data is stored and used"
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
              <p className="text-sm font-medium text-foreground">Download my data</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                Export a copy of all your files and account information
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

        {/* Clear processing history */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <Trash2 className="h-4 w-4 text-warning" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Clear processing history</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                Remove all records of previously processed files
              </p>
            </div>
          </div>
          {clearConfirm ? (
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-foreground-muted whitespace-nowrap">Are you sure?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
              >
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
              onClick={handleClearHistory}
              isLoading={isClearing}
              loadingText="Clearing…"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Data retention info */}
      <div className="rounded-lg border border-border/60 bg-background-muted/30 px-4 py-3">
        <p className="text-xs text-foreground-muted leading-relaxed">
          <span className="font-medium text-foreground">Data retention: </span>
          Processed files are automatically deleted after 30 days on the Free plan and 90 days on Pro.
          Account data is retained for 60 days after deletion to allow recovery.
        </p>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────
// Section 3: API Access
// ─────────────────────────────────────────────

const MOCK_API_KEY = "th_sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
const MASKED_KEY   = "th_••••••••••••••••••••••••••";

function ApiAccessSection() {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentKey, setCurrentKey] = useState(MOCK_API_KEY);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentKey);
      toast({ title: "API key copied", variant: "success" });
    } catch {
      toast({ title: "Failed to copy", variant: "error" });
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRevealed(false);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    // Generate a mock new key
    const newKey = "th_sk_live_" + Math.random().toString(36).slice(2, 34);
    setCurrentKey(newKey);
    setIsRegenerating(false);
    toast({
      title: "API key regenerated",
      description: "Your old key has been invalidated. Update any integrations.",
      variant: "warning",
    });
  };

  return (
    <SectionCard
      id="api"
      title="API Access"
      description="Use your API key to integrate ToolHive into your applications"
      delay={0.1}
    >
      {/* Key display */}
      <div className="rounded-xl border border-border bg-background-muted/40 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <code className="text-sm font-mono text-foreground truncate">
              {revealed ? currentKey : MASKED_KEY}
            </code>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setRevealed((r) => !r)}
              aria-label={revealed ? "Hide API key" : "Reveal API key"}
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              aria-label="Copy API key"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Usage bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground-muted flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
              API usage this month
            </span>
            <span className="text-xs font-medium text-foreground">
              0 <span className="text-foreground-subtle">/ 1,000 requests</span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/50"
              style={{ width: "0%" }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        isLoading={isRegenerating}
        loadingText="Regenerating…"
        leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        onClick={handleRegenerate}
      >
        Regenerate key
      </Button>

      <p className="text-xs text-foreground-subtle">
        Keep your API key secret. Do not commit it to version control or share it publicly.
        Regenerating creates a new key and immediately invalidates the old one.
      </p>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────
// Section 4: Connected Accounts
// ─────────────────────────────────────────────

interface ConnectedAccount {
  id: "google" | "github";
  label: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
}

function ConnectedAccountRow({
  account,
  onConnect,
  onDisconnect,
}: {
  account: ConnectedAccount;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background-muted/40 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          {account.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{account.label}</p>
            <Badge
              variant={account.connected ? "success" : "muted"}
              size="sm"
              dot
            >
              {account.connected ? "Connected" : "Not connected"}
            </Badge>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5 truncate">
            {account.description}
          </p>
        </div>
      </div>
      {account.connected ? (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => onDisconnect(account.id)}
        >
          Disconnect
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          leftIcon={<Link2 className="h-3.5 w-3.5" />}
          onClick={() => onConnect(account.id)}
        >
          Connect
        </Button>
      )}
    </div>
  );
}

function ConnectedAccountsSection() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: "google",
      label: "Google",
      description: "Sign in with your Google account",
      icon: (
        <Globe className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
      ),
      connected: false,
    },
    {
      id: "github",
      label: "GitHub",
      description: "Access repositories and use GitHub authentication",
      icon: (
        <GitFork className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
      ),
      connected: false,
    },
  ]);

  const handleConnect = useCallback(
    (id: string) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, connected: true } : a))
      );
      const name = accounts.find((a) => a.id === id)?.label ?? id;
      toast({
        title: `${name} connected`,
        description: `Your ${name} account has been linked successfully.`,
        variant: "success",
      });
    },
    [accounts, toast]
  );

  const handleDisconnect = useCallback(
    (id: string) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, connected: false } : a))
      );
      const name = accounts.find((a) => a.id === id)?.label ?? id;
      toast({
        title: `${name} disconnected`,
        variant: "default",
      });
    },
    [accounts, toast]
  );

  return (
    <SectionCard
      id="connected-accounts"
      title="Connected Accounts"
      description="Link third-party accounts for faster sign-in and integrations"
      delay={0.15}
    >
      <div className="space-y-3">
        {accounts.map((account) => (
          <ConnectedAccountRow
            key={account.id}
            account={account}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>
      <p className="text-xs text-foreground-subtle">
        Connecting an account allows you to sign in without a password and enables
        platform-specific integrations. You can disconnect at any time.
      </p>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────
// Delete Account Modal
// ─────────────────────────────────────────────

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteAccountModal({ onClose, onConfirm }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_PHRASE = "DELETE";

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal,50)] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-foreground-subtle hover:text-foreground hover:bg-background-muted transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>

        <h3
          id="delete-account-modal-title"
          className="text-lg font-bold text-foreground"
        >
          Delete your account
        </h3>
        <p className="mt-2 text-sm text-foreground-muted">
          This action is{" "}
          <strong className="text-foreground">permanent and irreversible</strong>.
          All your files, history, API keys, and account data will be deleted immediately.
        </p>

        <ul className="mt-3 space-y-1.5 text-sm text-foreground-muted">
          {[
            "All processed files and history",
            "Your API key and integrations",
            "Saved favorites and preferences",
            "Subscription and billing data",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <X className="h-3.5 w-3.5 text-destructive shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2">
          <p className="text-sm text-foreground-muted">
            Type{" "}
            <code className="rounded bg-background-muted px-1.5 py-0.5 text-xs font-mono text-destructive">
              {CONFIRM_PHRASE}
            </code>{" "}
            to confirm:
          </p>
          <Input
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            variant={
              confirmText.length > 0 && confirmText !== CONFIRM_PHRASE
                ? "error"
                : "default"
            }
            aria-label="Type DELETE to confirm account deletion"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            className="flex-1"
            disabled={confirmText !== CONFIRM_PHRASE}
            onClick={onConfirm}
          >
            Delete account
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section 5: Danger Zone
// ─────────────────────────────────────────────

function DangerZoneSection() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    setShowDeleteModal(false);
    try {
      await apiDelete("/auth/account");
      await logout();
      // Redirect to homepage after deletion
      window.location.href = "/";
    } catch {
      toast({
        title: "Failed to delete account",
        description: "Please try again or contact support.",
        variant: "error",
      });
    }
  }, [logout, toast]);

  return (
    <>
      <SectionCard
        id="danger"
        title="Danger Zone"
        description="Irreversible actions that permanently affect your account and data."
        variant="danger"
        delay={0.2}
      >
        <div className="flex items-start gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10"
            aria-hidden="true"
          >
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="text-xs text-foreground-muted mt-0.5">
              Permanently delete your ToolHive account and all associated data.
              This action cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </SectionCard>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// SettingsPage
// ─────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manage your notifications, privacy, API access, and account settings
        </p>
      </motion.div>

      {/* Sections — each animates with its own staggered delay */}
      <NotificationsSection />
      <PrivacySection />
      <ApiAccessSection />
      <ConnectedAccountsSection />
      <DangerZoneSection />
    </div>
  );
}
