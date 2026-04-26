import { NextRequest, NextResponse } from "next/server";

// Primary:  Groq Whisper (free, fast, reliable — needs GROQ_API_KEY env var)
// Fallback: HuggingFace Whisper (free but rate-limits Vercel IPs without HF_TOKEN)

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const HF_URL   = "https://api-inference.huggingface.co/models/openai/whisper-small";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  if (file.size > 25 * 1024 * 1024)
    return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) return transcribeGroq(file, groqKey);
  return transcribeHF(file);
}

// ── Groq (primary) ─────────────────────────────────────────────────────────────

async function transcribeGroq(file: File, key: string) {
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
    return NextResponse.json(
      { error: `Network error: ${(err as Error).message ?? "request failed"}` },
      { status: 502 }
    );
  }

  const raw = await res.text();
  let data: { text?: string; error?: { message?: string } | string };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    return NextResponse.json({ error: "Unexpected response from Groq" }, { status: 502 });
  }

  if (!res.ok) {
    const msg =
      typeof data.error === "object"
        ? (data.error as { message?: string }).message ?? `Groq error ${res.status}`
        : (data.error as string) ?? `Groq error ${res.status}`;
    return NextResponse.json({ error: msg }, { status: res.status >= 400 ? res.status : 502 });
  }

  return NextResponse.json({ text: data.text ?? "" });
}

// ── HuggingFace (fallback) ──────────────────────────────────────────────────────

async function transcribeHF(file: File) {
  let audioBuffer: ArrayBuffer;
  try {
    audioBuffer = await file.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read audio file" }, { status: 400 });
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
    return NextResponse.json(
      { error: `Network error: ${(err as Error).message ?? "request failed"}` },
      { status: 502 }
    );
  }

  const rawText = await hfRes.text();
  let data: { text?: string; error?: string; estimated_time?: number };
  try {
    data = JSON.parse(rawText) as typeof data;
  } catch {
    if (rawText.includes("<!DOCTYPE") || rawText.includes("<html")) {
      // HuggingFace rate-limiting Vercel IPs — signal the client to show setup instructions
      return NextResponse.json({ error: "NEEDS_API_KEY" }, { status: 503 });
    }
    return NextResponse.json({ error: "Unexpected response from transcription service." }, { status: 502 });
  }

  if (!hfRes.ok || data.error) {
    const errLower = (data.error ?? "").toLowerCase();
    if (errLower.includes("loading") || errLower.includes("currently loading")) {
      const wait = Math.ceil(data.estimated_time ?? 30);
      return NextResponse.json(
        { error: `Model is warming up — please wait ${wait}s and try again.` },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: data.error ?? `Transcription failed (${hfRes.status})` },
      { status: hfRes.status >= 400 ? hfRes.status : 502 }
    );
  }

  return NextResponse.json({ text: data.text ?? "" });
}
