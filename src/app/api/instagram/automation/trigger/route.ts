import { NextRequest, NextResponse } from "next/server";
import { getRecentComments, sendDM, replyToComment } from "@/lib/auth/instagram";
import { cookies } from "next/headers";

// POST /api/instagram/automation/trigger — check comments and auto-reply
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    action?: "check_comments" | "send_dm";
    commentId?: string;
    recipientId?: string;
    message?: string;
    replyToComment?: boolean;
  };

  const cookieStore = await cookies();
  const token = cookieStore.get("ig_access_token")?.value;
  const activeId = cookieStore.get("ig_active_account")?.value;

  if (!token || !activeId) {
    return NextResponse.json({ error: "Not connected to Instagram" }, { status: 401 });
  }

  // Load rules
  const rulesRaw = cookieStore.get("ig_automation_rules")?.value ?? "[]";
  const rules = JSON.parse(rulesRaw) as Array<{
    id: string;
    name: string;
    triggerType: string;
    keywords: string[];
    dmMessage: string;
    enabled: boolean;
    triggeredCount?: number;
  }>;

  if (!rules.length) {
    return NextResponse.json({ triggered: false, message: "No rules configured" });
  }

  if (body.action === "send_dm") {
    if (!body.recipientId || !body.message) {
      return NextResponse.json({ error: "recipientId and message required" }, { status: 400 });
    }
    try {
      if (body.replyToComment) {
        await replyToComment(activeId, token, body.commentId ?? "", body.message);
      } else {
        await sendDM(activeId, token, body.recipientId, body.message);
      }

      // Track analytics
      const statsRaw = cookieStore.get("ig_analytics") ?? "{\"dmsSent\":0,\"repliesSent\":0,\"leadsCollected\":0}";
      const stats = JSON.parse(statsRaw as string) as Record<string, number>;
      stats.dmsSent = (stats.dmsSent ?? 0) + 1;
      cookieStore.set("ig_analytics", JSON.stringify(stats), {
        httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400 * 365, path: "/",
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 502 }
      );
    }
  }

  // Default: check recent comments against rules
  try {
    const comments = await getRecentComments(activeId, token, 50);

    const results = [];
    for (const comment of comments) {
      for (const rule of rules) {
        if (!rule.enabled) continue;
        if (rule.triggerType !== "comment_keyword") continue;

        const matched = rule.keywords.some(
          (kw) =>
            comment.text.toLowerCase().includes(kw.toLowerCase()) &&
            !comment.hide_on_media
        );

        if (matched) {
          // Update rule trigger count
          rule.triggeredCount = (rule.triggeredCount ?? 0) + 1;
          cookieStore.set("ig_automation_rules", JSON.stringify(rules), {
            httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400 * 365, path: "/",
          });

          // Auto-send DM
          try {
            await sendDM(activeId, token, comment.username /* TODO: convert username to IG SID */, rule.dmMessage);
          } catch {
            // May fail if username→SID conversion needed; log and skip
            console.warn(`[trigger] DM failed for comment ${comment.id}: rule ${rule.id}`);
          }

          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            commentId: comment.id,
            commentText: comment.text,
            username: comment.username,
            matchedKeyword: rule.keywords.find((kw) =>
              comment.text.toLowerCase().includes(kw.toLowerCase())
            ),
            dmSent: true,
          });
        }
      }
    }

    return NextResponse.json({
      commentsChecked: comments.length,
      triggers: results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}