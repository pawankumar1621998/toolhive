import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { AuthShell } from "@/components/layout/AuthShell";

/**
 * Login Page — /auth/login
 *
 * Server component (no "use client"). Wraps the client-side LoginForm
 * inside the AuthShell split-screen layout.
 *
 * The AuthShell handles:
 *  - Left panel: brand gradient, animated tool cards, feature bullets
 *  - Right panel: centered form card
 *  - Mobile: single-column layout with logo header
 */
export const metadata: Metadata = {
  title: "Sign In — ToolHive",
  description:
    "Sign in to your ToolHive account and access 200+ AI-powered tools for free.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
