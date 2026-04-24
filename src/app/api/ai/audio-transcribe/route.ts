import { NextRequest, NextResponse } from "next/server";

// NVIDIA Parakeet ASR — English speech-to-text via OpenAI-compatible endpoint
export async function POST(req: NextRequest) {
  const apiKey = process.env.NVIDIA_AUDIO_KEY || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NVIDIA_AUDIO_KEY not configured" }, { status: 500 });
  }

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

  // Max 25 MB
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });
  }

  // Forward to NVIDIA Parakeet via OpenAI-compatible transcriptions endpoint
  const upstream = new FormData();
  upstream.append("file", file, file.name);
  upstream.append("model", "nvidia/parakeet-tdt-0.6b-v2");

  const language = (formData.get("language") as string) || "en";
  upstream.append("language", language);

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: errText || `Transcription API error ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json() as { text?: string; error?: string };
    return NextResponse.json({ text: data.text ?? "", segments: [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Transcription failed" },
      { status: 502 }
    );
  }
}
