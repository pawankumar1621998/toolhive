import { NextRequest, NextResponse } from "next/server";

// Hugging Face Whisper — free speech-to-text, no key needed for basic use
// Supports MP3, WAV, M4A, OGG, FLAC, WebM up to 25 MB

export async function POST(req: NextRequest) {
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

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const hfToken = process.env.HF_TOKEN;

  const headers: Record<string, string> = {
    "Content-Type": "application/octet-stream",
  };
  if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-small",
      {
        method: "POST",
        headers,
        body: fileBuffer,
        signal: AbortSignal.timeout(120_000),
      }
    );

    const data = (await res.json()) as {
      text?: string;
      error?: string;
      estimated_time?: number;
    };

    if (!res.ok || data.error) {
      const errLower = (data.error ?? "").toLowerCase();
      if (errLower.includes("loading") || errLower.includes("currently loading")) {
        const wait = Math.ceil(data.estimated_time ?? 30);
        return NextResponse.json(
          {
            error: `AI model is warming up — please wait ${wait} seconds and try again.`,
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: data.error ?? `Transcription failed (${res.status})` },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    return NextResponse.json({ text: data.text ?? "", segments: [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Transcription failed" },
      { status: 502 }
    );
  }
}
