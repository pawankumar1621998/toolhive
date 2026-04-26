import { NextRequest, NextResponse } from "next/server";

// OpenAI Whisper via Hugging Face Inference API
// Uses res.text() → JSON.parse() so HTML error pages never crash the route

export async function POST(req: NextRequest) {
  // ── Parse form data ────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });
  }

  // ── Convert to bytes ───────────────────────────────────────────────────────
  let audioBuffer: ArrayBuffer;
  try {
    audioBuffer = await file.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read audio file" }, { status: 400 });
  }

  // ── Call HuggingFace Whisper ───────────────────────────────────────────────
  const hfToken = process.env.HF_TOKEN;
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/octet-stream",
  };
  if (hfToken) reqHeaders["Authorization"] = `Bearer ${hfToken}`;

  let hfRes: Response;
  try {
    hfRes = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-small",
      {
        method: "POST",
        headers: reqHeaders,
        body: audioBuffer,
        signal: AbortSignal.timeout(120_000),
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `Network error: ${(err as Error).message ?? "request failed"}` },
      { status: 502 }
    );
  }

  // ── Parse response safely (never call .json() directly — HF can return HTML) ─
  const rawText = await hfRes.text();

  let data: { text?: string; error?: string; estimated_time?: number };
  try {
    data = JSON.parse(rawText) as typeof data;
  } catch {
    // HuggingFace returned HTML (rate-limit page, maintenance, etc.)
    if (rawText.includes("<!DOCTYPE") || rawText.includes("<html")) {
      return NextResponse.json(
        { error: "Transcription service is temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Unexpected response from transcription service." },
      { status: 502 }
    );
  }

  // ── Handle model-loading state ─────────────────────────────────────────────
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
