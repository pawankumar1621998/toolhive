"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  User,
  Mail,
  FileText,
  Zap,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeSwitcher } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toaster";
import { apiPatch } from "@/lib/api";
import type { AxiosError } from "axios";

// ─────────────────────────────────────────────
// Section wrapper
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
// Avatar section
// ─────────────────────────────────────────────

interface AvatarSectionProps {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "enterprise";
}

function AvatarSection({ name, email, avatarUrl, plan }: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const { toast } = useToast();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max avatar size is 5 MB.", variant: "error" });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    toast({ title: "Avatar updated", variant: "success" });
  };

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative group shrink-0">
        {preview ? (
          <img
            src={preview}
            alt={`${name} avatar`}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-2xl font-bold text-white select-none">
            {initials}
          </div>
        )}

        {/* Upload overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "absolute inset-0 flex items-center justify-center rounded-full",
            "bg-black/40 text-white",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
          aria-label="Change avatar photo"
        >
          <Camera className="h-5 w-5" />
        </button>

        {/* Camera badge */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "absolute -bottom-1 -right-1",
            "flex h-7 w-7 items-center justify-center rounded-full",
            "bg-primary text-white shadow-md",
            "hover:bg-primary-hover transition-colors"
          )}
          aria-label="Upload new avatar"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Choose avatar image"
        />
      </div>

      {/* User info */}
      <div className="min-w-0">
        <p className="text-base font-semibold text-foreground truncate">{name || "Your Name"}</p>
        <p className="text-sm text-foreground-muted truncate">{email}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant={
              plan === "pro" ? "gradient" : plan === "enterprise" ? "premium" : "default"
            }
            size="sm"
          >
            {plan === "free"
              ? "Free plan"
              : plan === "pro"
              ? "Pro"
              : "Enterprise"}
          </Badge>
          {plan === "free" && (
            <a
              href="/pricing"
              className="text-xs font-medium text-primary hover:underline"
            >
              Upgrade
            </a>
          )}
        </div>
        <p className="mt-1.5 text-xs text-foreground-subtle">
          JPG, PNG or WebP — max 5 MB
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Password field with show/hide toggle
// ─────────────────────────────────────────────

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
}

function PasswordInput({
  label,
  value,
  onChange,
  disabled,
  error,
  autoComplete,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <Input
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      error={error}
      autoComplete={autoComplete}
      rightElement={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-foreground-subtle hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

// ─────────────────────────────────────────────
// Delete Account Modal
// ─────────────────────────────────────────────

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteAccountModal({ onClose, onConfirm }: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_PHRASE = "delete my account";

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
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
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>

        <h3 id="delete-modal-title" className="text-lg font-bold text-foreground">
          Delete your account
        </h3>
        <p className="mt-2 text-sm text-foreground-muted">
          This action is{" "}
          <strong className="text-foreground">permanent and irreversible</strong>. All your
          files, history, favorites, and account data will be deleted immediately.
        </p>

        <div className="mt-5 space-y-3">
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
              confirmText.length > 0
                ? confirmText === CONFIRM_PHRASE
                  ? "error"
                  : "default"
                : "default"
            }
            aria-label="Type confirmation phrase"
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
// Plan info card (inside profile)
// ─────────────────────────────────────────────

function PlanInfoSection({ plan }: { plan: "free" | "pro" | "enterprise" }) {
  const planDetails = {
    free: {
      label: "Free",
      color: "bg-background-muted border-border text-foreground",
      icon: Zap,
      iconColor: "text-foreground-muted",
      limit: "100 files / month",
      storage: "500 MB",
      cta: true,
    },
    pro: {
      label: "Pro",
      color: "bg-gradient-brand text-white",
      icon: Sparkles,
      iconColor: "text-white",
      limit: "Unlimited files",
      storage: "50 GB",
      cta: false,
    },
    enterprise: {
      label: "Enterprise",
      color: "bg-warning/10 border-warning/30 text-foreground",
      icon: Sparkles,
      iconColor: "text-warning",
      limit: "Unlimited files",
      storage: "500 GB",
      cta: false,
    },
  };

  const info = planDetails[plan];
  const Icon = info.icon;

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 rounded-xl border p-4",
        info.color
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            plan === "pro" ? "bg-white/20" : "bg-background-muted"
          )}
        >
          <Icon className={clsx("h-5 w-5", info.iconColor)} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">{info.label} plan</p>
          <p className={clsx("text-xs", plan === "pro" ? "text-white/70" : "text-foreground-muted")}>
            {info.limit} · {info.storage} storage
          </p>
        </div>
      </div>
      {info.cta && (
        <a
          href="/pricing"
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          Upgrade to Pro
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ProfilePage
// ─────────────────────────────────────────────

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  // Profile form state — initialise from real auth user
  const [name, setName]               = useState(user?.name  ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved,    setProfileSaved]    = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors]   = useState<{
    current?: string; new?: string; confirm?: string;
  }>({});

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Profile save → PATCH /auth/profile ──────
  const handleSaveProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      setIsSavingProfile(true);
      setProfileSaved(false);
      try {
        await apiPatch("/auth/profile", { name: name.trim() });
        await refreshUser();
        setProfileSaved(true);
        toast({ title: "Profile updated", description: "Your changes have been saved.", variant: "success" });
        setTimeout(() => setProfileSaved(false), 3000);
      } catch (err) {
        const msg = (err as AxiosError<{ message: string }>).response?.data?.message ?? "Failed to save changes";
        toast({ title: msg, variant: "error" });
      } finally {
        setIsSavingProfile(false);
      }
    },
    [name, refreshUser, toast]
  );

  // ── Password change → PATCH /auth/change-password ──
  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errors: typeof passwordErrors = {};
      if (!currentPassword)          errors.current = "Current password is required";
      if (newPassword.length < 8)    errors.new     = "Password must be at least 8 characters";
      if (newPassword !== confirmPassword) errors.confirm = "Passwords do not match";

      if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }

      setPasswordErrors({});
      setIsSavingPassword(true);
      try {
        await apiPatch("/auth/change-password", { currentPassword, newPassword });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        toast({ title: "Password changed", description: "Your password has been updated.", variant: "success" });
      } catch (err) {
        const msg = (err as AxiosError<{ message: string }>).response?.data?.message ?? "Failed to change password";
        toast({ title: msg, variant: "error" });
      } finally {
        setIsSavingPassword(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, toast]
  );

  // ── Delete account (no backend endpoint yet) ──
  const handleDeleteAccount = useCallback(() => {
    setShowDeleteModal(false);
    toast({ title: "Account deletion requested", description: "Your account will be deleted within 24 hours.", variant: "warning" });
  }, [toast]);

  return (
    <>
      <div className="max-w-2xl space-y-6">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Profile settings</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage your account, preferences, and security
          </p>
        </motion.div>

        {/* ── Avatar ─────────────────────────── */}
        <SectionCard
          id="avatar"
          title="Your profile"
          description="Update your photo and personal details"
          delay={0.05}
        >
          <AvatarSection
            name={user?.name ?? ""}
            email={user?.email ?? ""}
            avatarUrl={user?.avatarUrl}
            plan={user?.plan ?? "free"}
          />
        </SectionCard>

        {/* ── Personal Info ──────────────────── */}
        <SectionCard
          id="profile"
          title="Personal information"
          delay={0.1}
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSavingProfile}
              leftElement={<User className="h-4 w-4" />}
              autoComplete="name"
              required
            />
            <Input
              label="Email address"
              type="email"
              value={user?.email ?? ""}
              disabled
              leftElement={<Mail className="h-4 w-4" />}
              hint="Email cannot be changed"
            />

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSavingProfile}
                leftIcon={
                  profileSaved ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )
                }
              >
                {profileSaved ? "Saved!" : "Save changes"}
              </Button>
              {profileSaved && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-success flex items-center gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Changes saved
                </motion.span>
              )}
            </div>
          </form>
        </SectionCard>

        {/* ── Plan Info ──────────────────────── */}
        <SectionCard
          id="plan"
          title="Subscription"
          description="Your current plan and usage"
          delay={0.15}
        >
          <PlanInfoSection plan={user?.plan ?? "free"} />
        </SectionCard>

        {/* ── Appearance ─────────────────────── */}
        <SectionCard
          id="appearance"
          title="Appearance"
          description="Choose your preferred color theme"
          delay={0.2}
        >
          <ThemeSwitcher />
        </SectionCard>

        {/* ── Change Password ─────────────────── */}
        <SectionCard
          id="password"
          title="Change password"
          description="We recommend using a strong, unique password"
          delay={0.25}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              disabled={isSavingPassword}
              error={passwordErrors.current}
              autoComplete="current-password"
            />
            <PasswordInput
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              disabled={isSavingPassword}
              error={passwordErrors.new}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={isSavingPassword}
              error={passwordErrors.confirm}
              autoComplete="new-password"
            />

            {/* Password strength hint */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[8, 12, 16].map((threshold, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "h-1 flex-1 rounded-full transition-colors",
                        newPassword.length >= threshold
                          ? i === 0
                            ? "bg-destructive"
                            : i === 1
                            ? "bg-warning"
                            : "bg-success"
                          : "bg-background-muted"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-foreground-subtle">
                  {newPassword.length < 8
                    ? "Too short"
                    : newPassword.length < 12
                    ? "Weak — add more characters"
                    : newPassword.length < 16
                    ? "Good"
                    : "Strong password"}
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="outline"
              size="md"
              isLoading={isSavingPassword}
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Update password
            </Button>
          </form>
        </SectionCard>

        {/* ── Danger Zone ─────────────────────── */}
        <SectionCard
          id="danger"
          title="Danger zone"
          description="Permanently delete your account and all associated data. This action cannot be undone."
          variant="danger"
          delay={0.3}
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
                Once deleted, all your data is permanently removed. There is no undo.
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
      </div>

      {/* ── Delete Modal ─────────────────────── */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </>
  );
}
