"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenStorage } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      tokenStorage.setAccess(token);
      router.replace("/");
    } else {
      const msg = error === "google_not_configured"
        ? "Google login is not configured yet."
        : error === "facebook_not_configured"
        ? "Facebook login is not configured yet."
        : "Login failed. Please try again.";
      router.replace(`/auth/login?oauthError=${encodeURIComponent(msg)}`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-foreground-muted text-sm">Signing you in…</p>
    </div>
  );
}
