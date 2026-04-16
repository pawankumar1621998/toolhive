"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { tokenStorage } from "@/lib/api";

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      tokenStorage.setAccess(token);
      // Full page reload so AuthContext re-mounts and calls /auth/me with new token
      window.location.href = "/";
    } else {
      const msg =
        error === "google_not_configured"
          ? "Google login is not configured yet."
          : error === "facebook_not_configured"
          ? "Facebook login is not configured yet."
          : "Login failed. Please try again.";
      window.location.href = `/auth/login?oauthError=${encodeURIComponent(msg)}`;
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-foreground-muted text-sm">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground-muted text-sm">Loading…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
