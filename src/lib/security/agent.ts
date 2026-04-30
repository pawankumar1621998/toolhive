// CyberSecurity Agent — Auto-Fix Engine
// Maps errors → providers → fix actions → self-heal

import type { NextRequest } from "next/server";

// ─── Error patterns ───────────────────────────────────────────────────────────

export type Severity = "low" | "medium" | "high" | "critical";
export type FixStatus = "fixed" | "fallback" | "manual" | "broken";

export interface FixResult {
  toolId: string;
  status: FixStatus;
  diagnosis: string;
  action: string;
  message: string;
  fallbackTool?: string;
  retryAfter?: number; // seconds
  autoRetry?: boolean;
}

export interface ErrorContext {
  toolId: string;
  errorMessage: string;
  statusCode: number;
  provider?: string;
  timestamp: string;
}

// ─── Auto-fix strategy map ─────────────────────────────────────────────────────

const FIX_STRATEGIES: Array<{
  pattern: RegExp;
  diagnosis: string;
  actions: Array<{
    try: string; // "groq" | "gemini" | "hf" | "mock" | "retry" | "skip"
    delay?: number;
    message: string;
  }>;
  severity: Severity;
}> = [
  // Rate limit → wait + retry once
  {
    pattern: /rate.?limit|too many requests|429|429|request.*throttl/i,
    diagnosis: "API rate limit hit — provider temporarily blocking requests.",
    severity: "medium",
    actions: [
      { try: "retry", delay: 2000, message: "Retrying in 2 seconds…" },
    ],
  },
  // Auth error → flag broken, suggest API key
  {
    pattern: /401|unauthorized|invalid.*api.*key|auth.*fail|api.*key.*not|not.*configur/i,
    diagnosis: "API key is missing, expired, or invalid.",
    severity: "high",
    actions: [
      { try: "skip", message: "Check your API key in Vercel → Settings → Environment Variables." },
    ],
  },
  // 404 endpoint → switch to alternate provider
  {
    pattern: /404|not found|endpoint.*not|does not exist/i,
    diagnosis: "The API endpoint has changed or the model is no longer available.",
    severity: "critical",
    actions: [
      { try: "groq", message: "Switching to Groq Whisper…" },
    ],
  },
  // Timeout → increase timeout + retry
  {
    pattern: /timeout|timed?out|request.*timeout|took.*long|deadline|aborted/i,
    diagnosis: "Request timed out — the provider is slow or overloaded.",
    severity: "medium",
    actions: [
      { try: "retry", delay: 5000, message: "Retrying with higher timeout…" },
    ],
  },
  // Network error → retry after delay
  {
    pattern: /network|fetch.*fail|ECONNREFUSED|ENOTFOUND|DNS|connection/i,
    diagnosis: "Network error — cannot reach the external API.",
    severity: "high",
    actions: [
      { try: "retry", delay: 3000, message: "Retrying in 3 seconds…" },
    ],
  },
  // Model loading → wait for warmup
  {
    pattern: /loading|warm.*up|model.*boot|estimated.*time|currently loading/i,
    diagnosis: "AI model is loading — first request takes 10-30 seconds.",
    severity: "low",
    actions: [
      { try: "retry", delay: 15000, message: "Model warming up, retrying in 15 seconds…" },
    ],
  },
  // HF rate-limit HTML response → use Groq instead
  {
    pattern: /html.*<!doctype|unexpected.*token.*<|service.*unavailable|please.*try.*again/i,
    diagnosis: "Free tier rate-limit — the provider is blocking server IPs.",
    severity: "high",
    actions: [
      { try: "groq", message: "Switching to Groq API (not rate-limited)…" },
    ],
  },
  // Quota exceeded
  {
    pattern: /quota|monthly.*limit|daily.*limit|exceed.*limit|insufficient.*usage/i,
    diagnosis: "API usage quota exceeded for this billing period.",
    severity: "critical",
    actions: [
      { try: "skip", message: "Upgrade your API plan or switch to Groq (free tier generous)." },
    ],
  },
  // File too large
  {
    pattern: /file.*large|max.*size|25.*mb|exceed.*limit.*file/i,
    diagnosis: "The uploaded file exceeds the size limit.",
    severity: "medium",
    actions: [
      { try: "skip", message: "Reduce file size below 25 MB and try again." },
    ],
  },
  // Invalid form data
  {
    pattern: /invalid.*form|form.*data|malformed|unprocessable/i,
    diagnosis: "Invalid request data sent to the API.",
    severity: "medium",
    actions: [
      { try: "skip", message: "Refresh the page and try uploading again." },
    ],
  },
];

// ─── Fallback provider map ─────────────────────────────────────────────────────

const PROVIDER_FALLBACKS: Record<string, {
  primary: string;
  fallbacks: string[];
  fallbackRoutes: Record<string, string>;
}> = {
  "audio-transcribe": {
    primary: "groq",
    fallbacks: ["hf", "mock"],
    fallbackRoutes: {
      groq: "https://api.groq.com/openai/v1/audio/transcriptions",
      hf: "https://api-inference.huggingface.co/models/openai/whisper-small",
    },
  },
  "text-to-audio": {
    primary: "google",
    fallbacks: ["browser"],
    fallbackRoutes: {},
  },
};

// ─── Mock responses for broken services ────────────────────────────────────────

const MOCK_RESPONSES: Record<string, { text?: string; error?: string }> = {
  "audio-transcribe": {
    error: "TRANSCRIPTION_UNAVAILABLE: Server transcription is currently unavailable. Please use the Live Mic tab for instant, free transcription that works without any API."
  },
  "text-to-audio": {
    error: "TTS_UNAVAILABLE: Server TTS is down. Use Browser TTS (free, no setup) from the AI Voice tab."
  },
};

// ─── Main auto-fix function ────────────────────────────────────────────────────

export async function autoFix(ctx: ErrorContext): Promise<FixResult> {
  const { toolId, errorMessage, statusCode } = ctx;

  // Find matching strategy
  let strategy = FIX_STRATEGIES.find((s) => s.pattern.test(errorMessage));
  if (!strategy) {
    // Unknown error — use Groq as fallback for AI tools
    if (["audio-transcribe", "text-to-audio", "smart-resume"].includes(toolId)) {
      strategy = FIX_STRATEGIES[FIX_STRATEGIES.length - 3]; // network fallback
    } else {
      return {
        toolId,
        status: "manual",
        diagnosis: "Unknown error occurred.",
        action: "none",
        message: errorMessage || "An unexpected error occurred. Try refreshing and trying again.",
        retryAfter: 60,
      };
    }
  }

  // Apply first available action
  const action = strategy!.actions[0];

  if (action.try === "retry") {
    return {
      toolId,
      status: "fixed",
      diagnosis: strategy!.diagnosis,
      action: "retry",
      message: action.message,
      autoRetry: true,
      retryAfter: action.delay ? Math.ceil(action.delay / 1000) : 5,
    };
  }

  if (action.try === "groq" || action.try === "hf") {
    // Mark that next call should use this provider
    return {
      toolId,
      status: "fallback",
      diagnosis: strategy!.diagnosis,
      action: `switch_to_${action.try}`,
      message: action.message,
      fallbackTool: action.try === "groq" ? "Groq Whisper" : "HuggingFace Whisper",
    };
  }

  // skip / manual
  const mock = MOCK_RESPONSES[toolId];
  return {
    toolId,
    status: "manual",
    diagnosis: strategy!.diagnosis,
    action: "no_fix_available",
    message: mock?.error ?? errorMessage,
  };
}

// ─── Rate limit store (in-memory, per-process) ─────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit = 100, windowMs = 60_000): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  entry.count++;
  if (entry.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}

// ─── Security headers ──────────────────────────────────────────────────────────

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://integrate.api.nvidia.com https://api-inference.huggingface.co https://api.mistral.ai https://api.deepseek.com https://api.anthropic.com https://api.remove.bg https://translate.google.com https://*.vercel.app;",
};

// ─── Safe error response ───────────────────────────────────────────────────────

export function safeErrorResponse(message: string, status = 500) {
  // Never leak internal details like API keys, file paths, or stack traces
  const publicMessages: Record<string, string> = {
    "processing_failed": "Processing failed. Please try again in a few moments.",
    "invalid_request": "Invalid request. Please refresh and try again.",
    "rate_limited": "Too many requests. Please wait a moment.",
    "service_unavailable": "Service temporarily unavailable. Please try again.",
    "unauthorized": "Authentication failed. Please check your API configuration.",
    "timeout": "Request timed out. The service is slow — please try again.",
    "unknown": "An unexpected error occurred. Our team has been notified.",
  };

  const normalized = message.toLowerCase();
  let publicMsg = publicMessages.unknown;

  for (const [key, value] of Object.entries(publicMessages)) {
    if (normalized.includes(key.replace("_", " ")) || normalized.includes(key)) {
      publicMsg = value;
      break;
    }
  }

  // Check for internal info leak patterns
  if (/api[_-]?key|nvidia|token|bearer|secret|password|path\//i.test(message)) {
    publicMsg = publicMessages.processing_failed;
  }

  return { message: publicMsg, status };
}

// ─── Log security event ─────────────────────────────────────────────────────────

export function logSecurityEvent(event: {
  type: "rate_limit" | "auth_error" | "validation_fail" | "error" | "fix_applied";
  ip?: string;
  toolId?: string;
  error?: string;
  fixApplied?: string;
  timestamp?: string;
}) {
  const entry = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };

  // In production, send to a log aggregator (Vercel logs, Sentry, etc.)
  if (process.env.NODE_ENV === "development") {
    const prefix = entry.type === "fix_applied" ? "🛡️ AGENT" : entry.type === "rate_limit" ? "🚫 RATE" : "⚠️ ERROR";
    console.log(`[${prefix}]`, JSON.stringify(entry));
  }

  return entry;
}