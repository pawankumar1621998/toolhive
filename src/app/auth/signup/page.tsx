import type { Metadata } from "next";
import { SignupForm } from "@/components/features/auth/SignupForm";
import { AuthShell } from "@/components/layout/AuthShell";

/**
 * Signup Page — /auth/signup
 *
 * Server component. Wraps the client-side SignupForm inside the
 * AuthShell split-screen layout.
 *
 * The SignupForm renders:
 *  - Full name, email, password, confirm password fields
 *  - Password strength meter
 *  - Terms of Service checkbox
 *  - Google + GitHub OAuth buttons (UI only)
 *  - Cross-link to /auth/login
 */
export const metadata: Metadata = {
  title: "Create Account — ToolHive",
  description:
    "Create a free ToolHive account. Access 200+ AI-powered tools. No credit card required.",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
