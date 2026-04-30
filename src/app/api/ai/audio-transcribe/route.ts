import { NextRequest, NextResponse } from "next/server";

// ─── CyberSecurity Agent — Audio Transcription with Auto-Fix ──────────────────
// Primary: Groq Whisper | Fallback: HuggingFace | Safe Fallback: Live Mic notice

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const HF_URL   = "https://api-inference.huggingface.co/models/openai/whisper-small";

// ─── Safe JSON parse ───────────────────────────────────────────────────────────

function safeJsonParse(raw: string): { text?: string; error?: string; estimated_time?: number } | null {
  try { return JSON.parse(raw); }
  catch {
    if (raw.includes("<!DOCTYPE") || raw.includes("<html")) return null; // rate-limit HTML
    return null;
  }
}

// ─── Groq (primary, never rate-limits on free tier) ───────────────────────────

async function transcribeGroq(file: File, key: string): Promise<NextResponse> {
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("model", "whisper-large-v3-turbo");

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body,
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err: unknown) {
    // Network error — try HF as fallback
    console.error("[audio-transcribe] Groq network error:", (err as Error).message);
    return transcribeHF(file, "groq_failed");
  }

  const raw = await res.text();
  const data = safeJsonParse(raw);

  if (!res.ok || (data && data.error)) {
    if (!data) return NextResponse.json({ error: "Unexpected response from Groq" }, { status: 502 });
    const msg = typeof data.error === "object"
      ? (data.error as { message?: string }).message ?? `Groq error ${res.status}`
      : (data.error as string) ?? `Groq error ${res.status}`;

    // Transient errors → try HF fallback
    if (res.status === 429 || res.status === 503 || res.status === 502) {
      console.warn("[audio-transcribe] Groq unavailable (503/429), switching to HF...");
      return transcribeHF(file, "groq_unavailable");
    }

    return NextResponse.json({ error: msg }, { status: res.status >= 400 ? res.status : 502 });
  }

  return NextResponse.json({ text: data?.text ?? "" });
}

// ─── HuggingFace (secondary, may rate-limit on Vercel) ────────────────────────

async function transcribeHF(file: File, reason?: string): Promise<NextResponse> {
  if (reason) console.warn(`[audio-transcribe] Falling back to HF: ${reason}`);

  let audioBuffer: ArrayBuffer;
  try {
    audioBuffer = await file.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read audio file. Please try a different file." }, { status: 400 });
  }

  const hfToken = process.env.HF_TOKEN;
  const headers: Record<string, string> = { "Content-Type": "application/octet-stream" };
  if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

  let hfRes: Response;
  try {
    hfRes = await fetch(HF_URL, {
      method: "POST",
      headers,
      body: audioBuffer,
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err: unknown) {
    console.error("[audio-transcribe] HF network error:", (err as Error).message);
    return NextResponse.json({
      error: "SERVICE_DEGRADED",
      suggestion: "Both server transcription services are unavailable. Use the Live Mic tab for instant, free transcription that works entirely in your browser.",
      fixAvailable: true,
    }, { status: 503 });
  }

  const rawText = await hfRes.text();
  const data = safeJsonParse(rawText);

  if (!data) {
    // HF returned HTML (rate-limit / maintenance)
    console.error("[audio-transcribe] HF returned HTML (rate-limit or maintenance)");
    return NextResponse.json({
      error: "NEEDS_API_KEY",
      suggestion: "The free transcription service is rate-limited. Add a free Groq API key for reliable, unlimited transcription.",
      fixUrl: "https://console.groq.com",
    }, { status: 503 });
  }

  if (!hfRes.ok || data.error) {
    const errLower = (data.error ?? "").toLowerCase();
    if (errLower.includes("loading") || errLower.includes("currently loading")) {
      const wait = Math.ceil(data.estimated_time ?? 30);
      return NextResponse.json({
        error: `Model is warming up — please wait ${wait}s and try again.`,
        retryAfter: wait,
        fixAvailable: true,
      }, { status: 503 });
    }
    return NextResponse.json({
      error: data.error ?? `Transcription failed (${hfRes.status})`,
    }, { status: hfRes.status >= 400 ? hfRes.status : 502 });
  }

  return NextResponse.json({ text: data.text ?? "" });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data. Please refresh and try again." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
  if (file.size > 25 * 1024 * 1024)
    return NextResponse.json({ error: "File too large (max 25 MB). Please compress the audio and try again." }, { status: 400 });

  // Always try Groq first if available (most reliable)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) return transcribeGroq(file, groqKey);

  // No Groq key → try HuggingFace
  return transcribeHF(file, "no_groq_key");
}