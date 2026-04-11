"use client";

/**
 * ForgotPasswordForm — Client Component
 *
 * Two distinct states managed with Framer Motion AnimatePresence:
 *
 * State 1 — "input":
 *   Email field + "Send Reset Link" button.
 *   On-blur and on-submit validation.
 *   API error banner if the request fails.
 *
 * State 2 — "sent":
 *   Animated success circle + checkmark icon.
 *   "Check your email" heading.
 *   Displays the submitted email address.
 *   "Resend email" button (resets to state 1).
 *   "Back to login" link.
 *
 * Transitions:
 *   Smooth cross-fade + vertical slide between the two states.
 *   The success checkmark draws in with a SVG stroke-dashoffset animation.
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type FormState = "input" | "loading" | "sent";

// ─────────────────────────────────────────────
// Animated success checkmark
// ─────────────────────────────────────────────

function SuccessIcon() {
  return (
    <motion.div
      className="relative mx-auto flex h-20 w-20 items-center justify-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-success/15"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* Inner circle */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success/15 border border-success/30">
        {/* SVG checkmark with stroke animation */}
        <svg
          viewBox="0 0 36 36"
          className="h-9 w-9"
          fill="none"
          aria-hidden="true"
        >
          {/* Circle */}
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            stroke="currentColor"
            strokeWidth="2"
            className="text-success"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          />
          {/* Checkmark */}
          <motion.path
            d="M11 18l5 5 9-9"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.65, ease: "easeOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Sent confirmation panel
// ─────────────────────────────────────────────

interface SentPanelProps {
  email: string;
  onResend: () => void;
}

function SentPanel({ email, onResend }: SentPanelProps) {
  return (
    <motion.div
      key="sent"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 text-center"
    >
      <SuccessIcon />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          We sent a password reset link to{" "}
          <span className="font-semibold text-foreground break-all">{email}</span>.
          Check your spam or junk folder if you don&apos;t see it within a few minutes.
        </p>
      </div>

      {/* Resend + Back */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onResend}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-background-subtle hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Resend email
        </button>

        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Input panel
// ─────────────────────────────────────────────

interface InputPanelProps {
  onSuccess: (email: string) => void;
}

function InputPanel({ onSuccess }: InputPanelProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email address";
    return undefined;
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEmail(val);
      setApiError(null);
      if (touched) {
        setEmailError(validateEmail(val));
      }
    },
    [touched]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setEmailError(validateEmail(email));
  }, [email]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);
      const err = validateEmail(email);
      if (err) {
        setEmailError(err);
        return;
      }
      setEmailError(undefined);
      setApiError(null);
      setIsLoading(true);

      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? "Request failed");
        }
        onSuccess(email.trim());
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to send reset link. Please try again.";
        setApiError(message);
        toast({
          title: "Request failed",
          description: message,
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email, onSuccess, toast]
  );

  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted leading-relaxed">
          Enter the email address linked to your account and we&apos;ll send you
          a password reset link.
        </p>
      </div>

      {/* API error banner */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3">
              <AlertCircle
                className="h-4 w-4 text-destructive shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-sm text-destructive leading-snug">{apiError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          id="forgot-email"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailError}
          disabled={isLoading}
          required
          leftElement={<Mail className="h-4 w-4" />}
          inputSize="lg"
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="mt-2 shadow-lg"
        >
          Send reset link
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ForgotPasswordForm
// ─────────────────────────────────────────────

export function ForgotPasswordForm() {
  const [formState, setFormState] = useState<FormState>("input");
  const [submittedEmail, setSubmittedEmail] = useState("");

  function handleSuccess(email: string) {
    setSubmittedEmail(email);
    setFormState("sent");
  }

  function handleResend() {
    setFormState("input");
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {formState === "sent" ? (
          <SentPanel
            key="sent"
            email={submittedEmail}
            onResend={handleResend}
          />
        ) : (
          <InputPanel key="input" onSuccess={handleSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}
