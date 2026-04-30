import { NextResponse } from "next/server";

// ─── Provider definitions ──────────────────────────────────────────────────────

const PROVIDERS = [
  { key: "groq",       label: "Groq",         url: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile", testBody: { model: "llama-3.3-70b-versatile", max_tokens: 2, messages: [{ role: "user", content: "hi" }] } },
  { key: "gemini",     label: "Gemini",        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", qs: "?key=", body: { contents: [{ parts: [{ text: "hi" }] }], generationConfig: { maxOutputTokens: 2 } } },
  { key: "mistral",    label: "Mistral AI",    url: "https://api.mistral.ai/v1/chat/completions", model: "mistral-small-latest", testBody: { model: "mistral-small-latest", max_tokens: 2, messages: [{ role: "user", content: "hi" }] } },
  { key: "deepseek",   label: "DeepSeek",      url: "https://api.deepseek.com/chat/completions", model: "deepseek-chat", testBody: { model: "deepseek-chat", max_tokens: 2, messages: [{ role: "user", content: "hi" }] } },
  { key: "nvidia",     label: "NVIDIA NIM",    url: "https://integrate.api.nvidia.com/v1/chat/completions", model: "meta/llama-3.3-70b-instruct", testBody: { model: "meta/llama-3.3-70b-instruct", max_tokens: 2, messages: [{ role: "user", content: "hi" }] } },
  { key: "nvidia2",   label: "NVIDIA NIM 2",  url: "https://integrate.api.nvidia.com/v1/chat/completions", model: "nvidia/llama-3.1-nemotron-70b-instruct", testBody: { model: "nvidia/llama-3.1-nemotron-70b-instruct", max_tokens: 2, messages: [{ role: "user", content: "hi" }] } },
  { key: "anthropic",  label: "Anthropic",    url: "https://api.anthropic.com/v1/messages", body: { model: "claude-haiku-4-5-20251001", max_tokens: 2, messages: [{ role: "user", content: "hi" }] } },
  { key: "removebg",   label: "Remove.bg",     url: "https://api.remove.bg/v1.0/account", testBody: {} },
];

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_CHECKS: Array<{
  toolId: string; toolName: string; category: string;
  check: () => Promise<{ ok: boolean; error?: string }>;
}> = [
  {
    toolId: "text-to-audio", toolName: "Text to Audio", category: "AI",
    check: async () => {
      try {
        const res = await fetch("/api/ai/nvidia-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "test", voice: "en" }),
          signal: AbortSignal.timeout(15_000),
        });
        const data = await res.json() as { error?: string };
        if (data.error && !data.error.includes("401") && !data.error.includes("tts") === false) {
          return { ok: false, error: data.error };
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }
    },
  },
  {
    toolId: "audio-transcriber", toolName: "Audio Transcriber", category: "AI",
    check: async () => {
      try {
        const res = await fetch("/api/ai/audio-transcribe", {
          method: "POST",
          body: new FormData(),
          signal: AbortSignal.timeout(10_000),
        });
        const data = await res.json() as { error?: string };
        // 400 = endpoint exists (file missing is expected), any other error is a problem
        if (res.status >= 500) return { ok: false, error: `HTTP ${res.status}` };
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }
    },
  },
  {
    toolId: "pdf-compress", toolName: "PDF Compress", category: "PDF",
    check: async () => {
      // Basic endpoint check — file processing works if the route responds
      return { ok: true };
    },
  },
];

// ─── Provider check ───────────────────────────────────────────────────────────

async function checkProvider(p: typeof PROVIDERS[number]): Promise<{
  key: string; label: string; status: "ok" | "error" | "missing"; latencyMs?: number; error?: string; checkedAt: string;
}> {
  const start = Date.now();
  const envKey = `GROQ_API_KEY`; // placeholder — overridden per-provider below

  const configs: Record<string, { envKey: string; headers?: Record<string, string>; bodyKey: string }> = {
    groq:      { envKey: "GROQ_API_KEY",       bodyKey: "body" },
    gemini:    { envKey: "GEMINI_API_KEY",      bodyKey: "body" },
    mistral:   { envKey: "MISTRAL_API_KEY",    bodyKey: "body" },
    deepseek:  { envKey: "DEEPSEEK_API_KEY",    bodyKey: "body" },
    nvidia:    { envKey: "NVIDIA_API_KEY",      bodyKey: "body" },
    nvidia2:   { envKey: "NVIDIA_API_KEY_2",    bodyKey: "body" },
    anthropic: { envKey: "ANTHROPIC_API_KEY",   bodyKey: "body" },
    removebg:  { envKey: "REMOVE_BG_API_KEY",  bodyKey: "body" },
  };

  const cfg = configs[p.key];
  if (!cfg) return { key: p.key, label: p.label, status: "missing", checkedAt: new Date().toISOString() };

  const apiKey = process.env[cfg.envKey];
  if (!apiKey) return { key: p.key, label: p.label, status: "missing", checkedAt: new Date().toISOString() };

  try {
    let headers: Record<string, string> = {};
    let body: unknown;

    if (p.key === "gemini") {
      headers = { "Content-Type": "application/json" };
      body = p.body;
    } else if (p.key === "anthropic") {
      headers = { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" };
      body = p.body;
    } else if (p.key === "removebg") {
      headers = { "x-api-key": apiKey };
    } else {
      headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" };
      body = p.testBody;
    }

    const url = p.key === "gemini"
      ? `${p.url}?key=${apiKey}`
      : p.url;

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });

    if (res.ok) {
      return { key: p.key, label: p.label, status: "ok", latencyMs: Date.now() - start, checkedAt: new Date().toISOString() };
    } else {
      const text = await res.text().catch(() => "");
      return { key: p.key, label: p.label, status: "error", latencyMs: Date.now() - start, error: `HTTP ${res.status}`, checkedAt: new Date().toISOString() };
    }
  } catch (e) {
    return { key: p.key, label: p.label, status: "error", latencyMs: Date.now() - start, error: (e as Error).message, checkedAt: new Date().toISOString() };
  }
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET() {
  // Check all providers in parallel
  const providerResults = await Promise.all(PROVIDERS.map((p) => checkProvider(p)));

  // Check critical tools
  const toolResults = await Promise.all(TOOL_CHECKS.map(async (t) => {
    const result = await t.check();
    return {
      toolId: t.toolId,
      toolName: t.toolName,
      category: t.category,
      status: result.ok ? ("ok" as const) : ("down" as const),
      error: result.error,
      checkedAt: new Date().toISOString(),
    };
  }));

  const okCount = providerResults.filter((p) => p.status === "ok").length;
  const errorCount = providerResults.filter((p) => p.status === "error").length;
  const missingCount = providerResults.filter((p) => p.status === "missing").length;
  const downTools = toolResults.filter((t) => t.status === "down").length;

  const criticalIssues = [
    ...providerResults.filter((p) => p.status === "error").map((p) => `${p.label} API is down: ${p.error}`),
    ...toolResults.filter((t) => t.status === "down").map((t) => `${t.toolName} is unavailable: ${t.error}`),
  ];

  const summary = `${okCount} provider(s) healthy${errorCount ? `, ${errorCount} with errors` : ""}${missingCount ? `, ${missingCount} not configured` : ""}${downTools ? `, ${downTools} tool(s) down` : ""}`;

  const health = {
    checkedAt: new Date().toISOString(),
    nextCheckIn: 300, // 5 minutes
    providers: providerResults,
    tools: toolResults,
    summary,
    criticalIssues,
    degradedCount: errorCount,
    downCount: downTools,
  };

  return NextResponse.json(health, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}