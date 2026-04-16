"use client";

/**
 * SignupForm — Client Component
 *
 * Features:
 *  - Full name, email, password, confirm password fields with left icons
 *  - Password strength meter: Weak / Fair / Good / Strong / Very Strong
 *    Five colored segments that fill progressively
 *  - Show/hide toggle applies to both password fields simultaneously
 *  - Terms of Service + Privacy Policy checkbox (required)
 *  - Gradient "Create Account" button with loading state
 *  - "or continue with" divider + Google / GitHub OAuth buttons (UI only)
 *  - API error banner
 *  - Cross-link to /auth/login
 *
 * Validation:
 *  - Name: required + min 2 chars
 *  - Email: required + format regex
 *  - Password: required + min 8 chars (strength meter is cosmetic only — no min score required)
 *  - Confirm password: must match password
 *  - Terms: must be checked
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toaster";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormFields | "terms", string>>;

// ─────────────────────────────────────────────
// Password strength
// ─────────────────────────────────────────────

interface StrengthResult {
  score: number; // 0–5
  label: string;
  /** Tailwind background-color class for filled segments */
  segmentColor: string;
  /** Tailwind text-color class for the label */
  textColor: string;
}

function getPasswordStrength(pwd: string): StrengthResult {
  if (!pwd) return { score: 0, label: "", segmentColor: "", textColor: "" };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map: Record<
    number,
    { label: string; segmentColor: string; textColor: string }
  > = {
    0: { label: "", segmentColor: "", textColor: "" },
    1: {
      label: "Weak",
      segmentColor: "bg-destructive",
      textColor: "text-destructive",
    },
    2: {
      label: "Fair",
      segmentColor: "bg-warning",
      textColor: "text-warning",
    },
    3: {
      label: "Good",
      segmentColor: "bg-yellow-400",
      textColor: "text-yellow-500",
    },
    4: {
      label: "Strong",
      segmentColor: "bg-success",
      textColor: "text-success",
    },
    5: {
      label: "Very strong",
      segmentColor: "bg-success",
      textColor: "text-success",
    },
  };

  return { score, ...map[score] };
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

function validateFields(
  fields: FormFields,
  agreed: boolean
): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Full name is required";
  } else if (fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

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

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!agreed) {
    errors.terms = "You must accept the Terms of Service to continue";
  }

  return errors;
}

function validateSingleField(
  name: keyof FormFields,
  fields: FormFields,
  agreed: boolean
): string | undefined {
  return validateFields(fields, agreed)[name];
}

// ─────────────────────────────────────────────
// OAuth button (shared pattern with LoginForm)
// ─────────────────────────────────────────────

function OAuthButton({
  provider,
  icon,
}: {
  provider: string;
  icon: React.ReactNode;
}) {
  const handleClick = () => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const path = provider.toLowerCase() === "google" ? "auth/google" : "auth/facebook";
    window.location.href = `${apiUrl}/${path}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-border",
        "bg-background px-4 py-2.5 text-sm font-medium text-foreground",
        "transition-all duration-150 hover:bg-background-subtle hover:border-border-strong",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:scale-[0.98]"
      )}
      aria-label={`Continue with ${provider}`}
    >
      {icon}
      <span>{provider}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Password strength meter
// ─────────────────────────────────────────────

function StrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <motion.div
      className="space-y-1.5 pt-1"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Segment bar */}
      <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={5}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={clsx(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= strength.score ? strength.segmentColor : "bg-background-muted"
            )}
          />
        ))}
      </div>
      {/* Label */}
      {strength.label && (
        <p className={clsx("text-xs font-medium", strength.textColor)}>
          {strength.label}
        </p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SignupForm
// ─────────────────────────────────────────────

export function SignupForm() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const key = name as keyof FormFields;
      setFields((prev) => {
        const next = { ...prev, [key]: value };
        if (submitted) {
          const fieldError = validateSingleField(key, next, agreed);
          setErrors((prev) => ({ ...prev, [key]: fieldError }));
          // Also re-validate confirmPassword if password changed
          if (key === "password" && next.confirmPassword) {
            const confirmError = validateSingleField("confirmPassword", next, agreed);
            setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
          }
        }
        return next;
      });
      setApiError(null);
    },
    [submitted, agreed]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const key = e.target.name as keyof FormFields;
      const fieldError = validateSingleField(key, fields, agreed);
      setErrors((prev) => ({ ...prev, [key]: fieldError }));
    },
    [fields, agreed]
  );

  const handleTermsChange = useCallback(
    (checked: boolean) => {
      setAgreed(checked);
      if (submitted) {
        setErrors((prev) => ({
          ...prev,
          terms: checked ? undefined : "You must accept the Terms of Service to continue",
        }));
      }
    },
    [submitted]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);

      const validationErrors = validateFields(fields, agreed);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});
      setApiError(null);

      try {
        await signup({
          name: fields.name.trim(),
          email: fields.email.trim(),
          password: fields.password,
          confirmPassword: fields.confirmPassword,
        });
        router.replace("/dashboard");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setApiError(message);
        toast({ title: "Signup failed", description: message, variant: "error" });
      }
    },
    [fields, agreed, signup, router, toast]
  );

  // ── Render ───────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          Free forever. No credit card required.
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
        {/* Full name */}
        <Input
          label="Full name"
          type="text"
          name="name"
          id="signup-name"
          value={fields.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Jane Smith"
          autoComplete="name"
          error={errors.name}
          disabled={isLoading}
          required
          leftElement={<User className="h-4 w-4" />}
          inputSize="lg"
        />

        {/* Email */}
        <Input
          label="Email address"
          type="email"
          name="email"
          id="signup-email"
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

        {/* Password + strength meter */}
        <div className="space-y-0">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            id="signup-password"
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
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
          <AnimatePresence>
            {fields.password.length > 0 && (
              <StrengthMeter password={fields.password} />
            )}
          </AnimatePresence>
        </div>

        {/* Confirm password */}
        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          id="signup-confirm-password"
          value={fields.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={isLoading}
          required
          leftElement={<Lock className="h-4 w-4" />}
          inputSize="lg"
        />

        {/* Terms checkbox */}
        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <div className="relative mt-0.5 flex shrink-0 items-center">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => handleTermsChange(e.target.checked)}
                className={clsx(
                  "h-4 w-4 rounded border appearance-none bg-background transition-colors cursor-pointer",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors.terms
                    ? "border-destructive checked:bg-destructive"
                    : "border-border checked:bg-primary checked:border-primary"
                )}
                aria-describedby={errors.terms ? "terms-error" : undefined}
                aria-invalid={!!errors.terms}
              />
              {agreed && (
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
            <span className="text-sm text-foreground-muted leading-relaxed group-hover:text-foreground transition-colors">
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
                tabIndex={0}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
                tabIndex={0}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p
              id="terms-error"
              className="text-xs text-destructive pl-7"
              role="alert"
            >
              {errors.terms}
            </p>
          )}
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
          Create account
        </Button>
      </form>

      {/* OAuth divider */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-foreground-subtle uppercase tracking-wider">
          or continue with
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* OAuth buttons */}
      <div className="flex gap-3">
        <OAuthButton
          provider="Google"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          }
        />
        <OAuthButton
          provider="Facebook"
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          }
        />
      </div>

      {/* Sign in link */}
      <p className="text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
