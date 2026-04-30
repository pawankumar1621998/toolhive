import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, SECURITY_HEADERS, logSecurityEvent } from "@/lib/security/agent";

// ─── Route config ─────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/api/:path*",
  ],
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip") ?? "unknown";

  // ── Rate limiting (100 req/min per IP) ────────────────────────────────────
  const { allowed, remaining, resetIn } = checkRateLimit(ip, 100, 60_000);

  if (!allowed) {
    logSecurityEvent({ type: "rate_limit", ip, error: "Rate limit exceeded" });
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(resetIn) } }
    );
  }

  // ── Request body size limit (10 MB for API routes) ─────────────────────────
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
    logSecurityEvent({ type: "validation_fail", ip, error: "Body too large" });
    return NextResponse.json(
      { error: "Request too large. Maximum size is 10 MB." },
      { status: 413 }
    );
  }

  // ── Security headers ───────────────────────────────────────────────────────
  const res = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }

  // ── Add rate limit headers ─────────────────────────────────────────────────
  res.headers.set("X-RateLimit-Limit", "100");
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  res.headers.set("X-RateLimit-Reset", String(resetIn));

  return res;
}