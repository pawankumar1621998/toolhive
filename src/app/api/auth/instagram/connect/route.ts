import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig, getInstagramAuthUrl } from "@/lib/auth/instagram";
import { cookies } from "next/headers";

// GET /api/auth/instagram/connect — returns OAuth URL or disconnects
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "disconnect") {
    const cookieStore = await cookies();
    cookieStore.delete("ig_access_token");
    cookieStore.delete("ig_accounts");
    cookieStore.delete("ig_active_account");
    return NextResponse.json({ disconnected: true });
  }

  // Return auth URL for frontend to redirect to
  const authUrl = getInstagramAuthUrl();
  return NextResponse.json({ authUrl });
}

// POST /api/auth/instagram/connect — select active account
export async function POST(req: NextRequest) {
  const { accountId } = (await req.json()) as { accountId?: string };

  const cookieStore = await cookies();
  const accountsRaw = cookieStore.get("ig_accounts")?.value;
  if (!accountsRaw) return NextResponse.json({ error: "No accounts connected" }, { status: 401 });

  const accounts = JSON.parse(accountsRaw) as Array<{ id: string }>;
  const selected = accounts.find((a) => a.id === accountId);
  if (!selected) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  cookieStore.set("ig_active_account", accountId ?? accounts[0]?.id ?? "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400 * 30,
    path: "/",
  });

  return NextResponse.json({ success: true, activeAccount: selected });
}

// GET /api/auth/instagram/connect — get connection status
export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ig_access_token")?.value;
  const activeAccount = cookieStore.get("ig_active_account")?.value;
  const accountsRaw = cookieStore.get("ig_accounts")?.value;

  if (!token) {
    return NextResponse.json({ connected: false, accounts: [] });
  }

  const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
  return NextResponse.json({
    connected: true,
    token: token,
    activeAccount: activeAccount ?? accounts[0]?.id ?? null,
    accounts,
  });
}