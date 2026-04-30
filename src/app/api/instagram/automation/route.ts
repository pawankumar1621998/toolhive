import { NextRequest, NextResponse } from "next/server";
import { getRecentComments, getRecentMedia, sendDM, replyToComment } from "@/lib/auth/instagram";
import { cookies } from "next/headers";

// Helper: get active IG account
async function getActiveAccount(): Promise<{ token: string; id: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ig_access_token")?.value;
  const activeId = cookieStore.get("ig_active_account")?.value;
  const accountsRaw = cookieStore.get("ig_accounts")?.value;

  if (!token) return null;
  if (activeId) return { token, id: activeId };

  // Fallback to first account
  if (accountsRaw) {
    const accounts = JSON.parse(accountsRaw) as Array<{ id: string }>;
    return { token, id: accounts[0]?.id ?? "" };
  }
  return null;
}

// GET /api/instagram/automation — get all automation rules
export async function GET() {
  const account = await getActiveAccount();
  if (!account) return NextResponse.json({ error: "Not connected" }, { status: 401 });

  // Read rules from cookie (in production use a database)
  const cookieStore = await cookies();
  const rulesRaw = cookieStore.get("ig_automation_rules")?.value ?? "[]";
  const rules = JSON.parse(rulesRaw);

  return NextResponse.json({ rules });
}

// POST /api/instagram/automation — create a new rule
export async function POST(req: NextRequest) {
  const account = await getActiveAccount();
  if (!account) return NextResponse.json({ error: "Not connected" }, { status: 401 });

  const body = (await req.json()) as {
    name: string;
    triggerType: "comment_keyword" | "dm_keyword" | "story_reply";
    keywords: string[];
    dmMessage: string;
    enabled?: boolean;
    conditions?: {
      newFollowersOnly?: boolean;
      specificPosts?: string[];
    };
  };

  if (!body.name || !body.dmMessage || body.keywords.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newRule = {
    id: `rule_${Date.now()}`,
    createdAt: new Date().toISOString(),
    triggeredCount: 0,
    lastTriggered: null,
    ...body,
    enabled: body.enabled ?? true,
  };

  const cookieStore = await cookies();
  const rulesRaw = cookieStore.get("ig_automation_rules")?.value ?? "[]";
  const rules = JSON.parse(rulesRaw);
  rules.push(newRule);
  cookieStore.set("ig_automation_rules", JSON.stringify(rules), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 86400 * 365,
    path: "/",
  });

  return NextResponse.json({ rule: newRule });
}

// PUT /api/instagram/automation?id= — update a rule
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ruleId = searchParams.get("id");

  const body = (await req.json()) as Partial<{
    name: string;
    keywords: string[];
    dmMessage: string;
    enabled: boolean;
    conditions: object;
  }>;

  const cookieStore = await cookies();
  const rulesRaw = cookieStore.get("ig_automation_rules")?.value ?? "[]";
  const rules = JSON.parse(rulesRaw) as Array<{ id: string }>;
  const idx = rules.findIndex((r) => r.id === ruleId);
  if (idx === -1) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  rules[idx] = { ...rules[idx], ...body };
  cookieStore.set("ig_automation_rules", JSON.stringify(rules), {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400 * 365, path: "/",
  });

  return NextResponse.json({ rule: rules[idx] });
}

// DELETE /api/instagram/automation?id= — delete a rule
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ruleId = searchParams.get("id");

  const cookieStore = await cookies();
  const rulesRaw = cookieStore.get("ig_automation_rules")?.value ?? "[]";
  const rules = JSON.parse(rulesRaw) as Array<{ id: string }>;
  const filtered = rules.filter((r) => r.id !== ruleId);
  cookieStore.set("ig_automation_rules", JSON.stringify(filtered), {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400 * 365, path: "/",
  });

  return NextResponse.json({ deleted: true });
}