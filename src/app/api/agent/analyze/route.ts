import { NextRequest, NextResponse } from "next/server";

// ─── Tool context ──────────────────────────────────────────────────────────────

const TOOL_MAP: Record<string, { name: string; category: string; apiRoute: string; fallback?: string | null }> = {
  "text-to-audio":     { name: "Text to Audio",     category: "AI",        apiRoute: "/api/ai/nvidia-tts",         fallback: "Browser TTS (Web Speech API)" },
  "audio-transcriber": { name: "Audio Transcriber",  category: "AI",        apiRoute: "/api/ai/audio-transcribe",   fallback: "Live Mic (browser SpeechRecognition)" },
  "smart-resume":      { name: "Smart Resume",       category: "Resume",    apiRoute: "/api/resume/ai",             fallback: null },
  "cover-letter":      { name: "Cover Letter",       category: "Resume",    apiRoute: "/api/cover-letter",          fallback: null },
  "image-bg-remove":   { name: "BG Remover",         category: "Image",    apiRoute: "/api/tools/process",          fallback: "remove.bg" },
  "youtube-downloader":{ name: "YouTube Downloader", category: "Video",    apiRoute: "/api/video/stream",           fallback: null },
};

const ERROR_PATTERN_MAP: Array<{
  pattern: RegExp;
  diagnosis: string;
  fix: string;
  autoFixable: boolean;
  severity: "low" | "medium" | "high" | "critical";
}> = [
  {
    pattern: /rate.?limit|too many requests|429/i,
    diagnosis: "API rate limit exceeded — the provider is blocking requests temporarily.",
    fix: "Wait 30-60 seconds and retry, or use a different provider.",
    autoFixable: true,
    severity: "medium",
  },
  {
    pattern: /401|unauthorized|invalid.*api.*key|authentication/i,
    diagnosis: "API key is invalid, expired, or missing. Check environment variables.",
    fix: "Verify the API key in Vercel → Settings → Environment Variables. Get a fresh key from the provider dashboard.",
    autoFixable: false,
    severity: "high",
  },
  {
    pattern: /404|not found|endpoint.*not.*exist/i,
    diagnosis: "The API endpoint URL is wrong or the model/resource no longer exists.",
    fix: "Check if the provider changed their API endpoint. Update the route to use correct URL.",
    autoFixable: false,
    severity: "critical",
  },
  {
    pattern: /timeout|timed?out|request.*timeout|took.*long/i,
    diagnosis: "The external API is slow or unresponsive. Could be a network issue or overloaded server.",
    fix: "Retry in a few seconds. If persistent, the provider may be experiencing an outage.",
    autoFixable: true,
    severity: "medium",
  },
  {
    pattern: /network.*error|fetch.*failed|ECONNREFUSED|ENOTFOUND/i,
    diagnosis: "Cannot reach the external API server. Possible DNS, network, or server outage.",
    fix: "Check your internet connection. If problem persists, the external API may be down.",
    autoFixable: false,
    severity: "high",
  },
  {
    pattern: /model.*loading|loading.*model|warm.*up|estimated.*time/i,
    diagnosis: "The AI model is loading on the server. First request typically takes 10-30 seconds.",
    fix: "Wait for the model to load (usually 10-30s) then retry. The next request will be faster.",
    autoFixable: false,
    severity: "low",
  },
  {
    pattern: /html.*<!doctype|unexpected.*token.*<|service.*unavailable.*html/i,
    diagnosis: "The API returned an HTML error page instead of JSON — usually a provider-side rate limit or maintenance page.",
    fix: "Switch to an alternative provider or wait a few minutes. Consider adding a fallback API key.",
    autoFixable: true,
    severity: "high",
  },
  {
    pattern: /quota.*exceeded|monthly.*limit|daily.*limit|exceed.*limit/i,
    diagnosis: "API usage quota exceeded. You've hit your free/paid tier limit.",
    fix: "Upgrade your API plan or wait for quota reset. Check provider dashboard for usage stats.",
    autoFixable: false,
    severity: "critical",
  },
];

// ─── Pattern match ────────────────────────────────────────────────────────────

function analyzeError(errorMessage: string): {
  diagnosis: string;
  fix: string;
  autoFixable: boolean;
  severity: "low" | "medium" | "high" | "critical";
} {
  for (const entry of ERROR_PATTERN_MAP) {
    if (entry.pattern.test(errorMessage)) {
      return { diagnosis: entry.diagnosis, fix: entry.fix, autoFixable: entry.autoFixable, severity: entry.severity };
    }
  }
  return {
    diagnosis: "Unknown error occurred. Check server logs for details.",
    fix: "Try again in a few seconds. If problem persists, check Vercel deployment logs.",
    autoFixable: false,
    severity: "medium",
  };
}

// ─── AI enhancement ────────────────────────────────────────────────────────────

async function getAIInsight(toolId: string, errorMessage: string, diagnosis: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return "";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content: `You are ToolHive's debugging assistant. Given a tool failure, provide a concise (1-2 sentence) plain-English explanation of what likely went wrong and what to do. Be direct, no markdown. Example: "The HuggingFace free tier is rate-limiting Vercel IPs. Add a GROQ_API_KEY for reliable transcription."`,
          },
          {
            role: "user",
            content: `Tool: ${toolId}\nError: ${errorMessage}\nInitial diagnosis: ${diagnosis}\n\nProvide your insight:`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return "";
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { toolId, errorMessage, toolContext } = (await req.json()) as {
    toolId?: string;
    errorMessage?: string;
    toolContext?: string;
  };

  const rawInput = errorMessage ?? toolId ?? "Unknown error";
  const analysis = analyzeError(rawInput);
  const aiInsight = await getAIInsight(toolId ?? "unknown", rawInput, analysis.diagnosis);

  const tool = toolId ? TOOL_MAP[toolId] : null;
  const fallback = tool?.fallback ?? null;

  const suggestion = aiInsight || analysis.fix;

  return NextResponse.json({
    toolId: toolId ?? "unknown",
    toolName: tool?.name ?? toolId ?? "Unknown Tool",
    errorMessage: rawInput,
    diagnosis: analysis.diagnosis,
    suggestion,
    severity: analysis.severity,
    autoFixable: analysis.autoFixable,
    fallback: fallback ? {
      name: fallback,
      instruction: `Switch to "${fallback}" — it works without external API calls.`,
    } : null,
    aiInsight,
    timestamp: new Date().toISOString(),
  });
}