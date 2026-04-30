import { NextRequest, NextResponse } from "next/server";
import { autoFix, logSecurityEvent } from "@/lib/security/agent";

// POST /api/agent/auto-fix
// Body: { toolId, errorMessage, statusCode, provider? }
// Returns: FixResult + auto-applies the fix if retryable

export async function POST(req: NextRequest) {
  let body: { toolId?: string; errorMessage?: string; statusCode?: number; provider?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { toolId = "unknown", errorMessage = "", statusCode = 500, provider } = body;

  logSecurityEvent({
    type: "error",
    toolId,
    error: errorMessage,
  });

  const fix = await autoFix({ toolId, errorMessage, statusCode, provider, timestamp: new Date().toISOString() });

  if (fix.status === "fixed" || fix.status === "fallback") {
    logSecurityEvent({
      type: "fix_applied",
      toolId,
      fixApplied: fix.action,
      error: errorMessage,
    });
  }

  return NextResponse.json({
    ...fix,
    retryAvailable: fix.autoRetry === true,
  });
}

// GET /api/agent/auto-fix
// Returns available fix strategies for dashboard display
export async function GET() {
  return NextResponse.json({
    strategies: [
      { name: "rate_limit", severity: "medium", action: "auto-retry after 2s" },
      { name: "timeout", severity: "medium", action: "auto-retry with higher timeout" },
      { name: "network_error", severity: "high", action: "auto-retry after 3s" },
      { name: "auth_error", severity: "high", action: "flag broken + show API key setup" },
      { name: "huggingface_rate_limit", severity: "high", action: "switch to Groq Whisper" },
      { name: "model_loading", severity: "low", action: "auto-retry after 15s warmup" },
    ],
    providerFallbacks: {
      "audio-transcribe": ["Groq Whisper (primary)", "HuggingFace Whisper (free)", "Live Mic (browser)"],
      "text-to-audio": ["Google Translate TTS", "Browser TTS (Web Speech API)"],
    },
  });
}