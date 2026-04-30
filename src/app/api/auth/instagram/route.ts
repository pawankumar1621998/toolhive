import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getInstagramAccounts } from "@/lib/auth/instagram";
import { cookies } from "next/headers";

// GET /api/auth/instagram/callback
// Handles OAuth redirect from Instagram/Meta

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/instagram-automation?error=${encodeURIComponent(errorReason ?? error ?? "auth_failed")}`,
        req.url
      )
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get Instagram accounts
    const accounts = await getInstagramAccounts(tokenData.access_token);

    if (accounts.length === 0) {
      return NextResponse.redirect(
        new URL(
          `/instagram-automation?error=no_business_account`,
          req.url
        )
      );
    }

    // Store in HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set("ig_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in ?? 3600,
      path: "/",
    });
    cookieStore.set("ig_accounts", JSON.stringify(accounts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in ?? 3600,
      path: "/",
    });

    return NextResponse.redirect(
      new URL("/instagram-automation?connected=true", req.url)
    );
  } catch (err) {
    console.error("[instagram-oauth]", err);
    return NextResponse.redirect(
      new URL(
        `/instagram-automation?error=${encodeURIComponent((err as Error).message)}`,
        req.url
      )
    );
  }
}