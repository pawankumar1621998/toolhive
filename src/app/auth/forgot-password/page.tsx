import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { AuthShell } from "@/components/layout/AuthShell";

/**
 * Forgot Password Page — /auth/forgot-password
 *
 * Server component. Wraps the client-side ForgotPasswordForm inside the
 * AuthShell split-screen layout.
 *
 * The ForgotPasswordForm manages two internal states:
 *  State 1 — "input": email field + "Send Reset Link" button
 *  State 2 — "sent":  animated success checkmark, confirmation message,
 *                     resend link, and back-to-login link
 *
 * Framer Motion AnimatePresence handles the cross-fade transition
 * between these two states.
 */
export const metadata: Metadata = {
  title: "Reset Password — ToolHive",
  description:
    "Request a password reset link for your ToolHive account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
