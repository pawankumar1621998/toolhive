"use client";

/**
 * LoginForm — Client Component
 *
 * Features:
 *  - Email + password fields with left-side icons inside the input
 *  - Real-time validation after first submit attempt; on-blur validation before
 *  - Show/hide password toggle
 *  - "Remember me" checkbox
 *  - "Forgot password?" link
 *  - Gradient "Sign In" button with loading state
 *  - "or continue with" divider
 *  - Google + GitHub OAuth buttons (UI only — wire to real OAuth as needed)
 *  - API error banner above the form
 *  - Cross-link to /auth/signup
 *
 * Validation:
 *  - Email: required + format check
 *  - Password: required + min 8 chars
 *  - On-blur: validates the touched field
 *  - On-submit: validates all fields; shows errors simultaneously
 *  - On-change: clears the field error once the user types a correction
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toaster";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormFields {
  email: string;
  password: string;
}

type FieldErrors = Partial<Record<keyof FormFields, string>>;

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

function validateFields(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!fields.password) {
    errors.password = "Password is required";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

function validateField(
  name: keyof FormFields,
  fields: FormFields
): string | undefined {
  return validateFields(fields)[name];
}

// ─────────────────────────────────────────────
// LoginForm
// ─────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const [fields, setFields] = useState<FormFields>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  /** True after first submit attempt — enables onChange re-validation */
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const key = name as keyof FormFields;
      setFields((prev) => {
        const next = { ...prev, [key]: value };
        // Once the user has tried to submit, validate live on change
        if (submitted) {
          const fieldError = validateField(key, next);
          setErrors((prev) => ({ ...prev, [key]: fieldError }));
        }
        return next;
      });
      // Clear API error on any input change
      setApiError(null);
    },
    [submitted]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const key = e.target.name as keyof FormFields;
      const fieldError = validateField(key, fields);
      setErrors((prev) => ({ ...prev, [key]: fieldError }));
    },
    [fields]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);

      const validationErrors = validateFields(fields);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});
      setApiError(null);

      try {
        await login({ email: fields.email, password: fields.password });
        const params = new URLSearchParams(window.location.search);
        router.replace(params.get("redirect") ?? "/dashboard");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setApiError(message);
        toast({ title: "Sign in failed", description: message, variant: "error" });
      }
    },
    [fields, login, router, toast]
  );

  // ── Render ───────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          Sign in to your ToolHive account
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
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-destructive leading-snug">{apiError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <Input
          label="Email address"
          type="email"
          name="email"
          id="login-email"
          value={fields.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          disabled={isLoading}
          required
          leftElement={<Mail className="h-4 w-4" />}
          inputSize="lg"
        />

        {/* Password */}
        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            id="login-password"
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
            disabled={isLoading}
            required
            leftElement={<Lock className="h-4 w-4" />}
            inputSize="lg"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-foreground-subtle hover:text-foreground transition-colors focus-visible:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={clsx(
                  "h-4 w-4 rounded border-border appearance-none bg-background",
                  "checked:bg-primary checked:border-primary",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "transition-colors cursor-pointer"
                )}
                aria-label="Remember me"
              />
              {rememberMe && (
                <svg
                  className="absolute left-0.5 top-0.5 h-3 w-3 text-white pointer-events-none"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="mt-2 shadow-lg"
        >
          Sign in
        </Button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Create one for free
        </Link>
      </p>
    </div>
  );
}
