import { NextRequest } from "next/server";

// NVIDIA Magpie TTS voices — format: Magpie-Multilingual.<LOCALE>.<Speaker>
export const NVIDIA_VOICES = [
  { id: "Magpie-Multilingual.EN-US.Aria",  lang: "en-US", label: "Aria (English US · Female)"  },
  { id: "Magpie-Multilingual.EN-US.Jason", lang: "en-US", label: "Jason (English US · Male)"   },
  { id: "Magpie-Multilingual.EN-US.Leo",   lang: "en-US", label: "Leo (English US · Male)"     },
  { id: "Magpie-Multilingual.EN-US.Sofia", lang: "en-US", label: "Sofia (English US · Female)" },
  { id: "Magpie-Multilingual.EN-US.John",  lang: "en-US", label: "John (English US · Male)"    },
  { id: "Magpie-Multilingual.DE-DE.Aria",  lang: "de-DE", label: "Aria (German · Female)"      },
  { id: "Magpie-Multilingual.FR-FR.Aria",  lang: "fr-FR", label: "Aria (French · Female)"      },
  { id: "Magpie-Multilingual.ES-US.Aria",  lang: "es-US", label: "Aria (Spanish · Female)"     },
  { id: "Magpie-Multilingual.HI-IN.Aria",  lang: "hi-IN", label: "Aria (Hindi · Female)"       },
  { id: "Magpie-Multilingual.ZH-CN.Aria",  lang: "zh-CN", label: "Aria (Chinese · Female)"     },
  { id: "Magpie-Multilingual.JA-JP.Aria",  lang: "ja-JP", label: "Aria (Japanese · Female)"    },
  { id: "Magpie-Multilingual.IT-IT.Aria",  lang: "it-IT", label: "Aria (Italian · Female)"     },
] as const;

export async function POST(req: NextRequest) {
  const { text, voice = "Magpie-Multilingual.EN-US.Aria", speed = 1.0 } = await req.json() as {
    text: string;
    voice?: string;
    speed?: number;
  };

  if (!text?.trim()) {
    return new Response("Text is required", { status: 400 });
  }
  if (text.length > 5000) {
    return new Response("Text too long (max 5000 chars)", { status: 400 });
  }

  const apiKey = process.env.NVIDIA_AUDIO_KEY || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return new Response("NVIDIA_AUDIO_KEY not configured", { status: 500 });
  }

  // Derive language code from voice name (e.g. "Magpie-Multilingual.HI-IN.Aria" → "hi-IN")
  const langMatch = voice.match(/\.([A-Z]{2}-[A-Z]{2})\./i);
  const languageCode = langMatch ? langMatch[1] : "en-US";

  // Try NVIDIA's OpenAI-compatible audio/speech endpoint first
  const body = JSON.stringify({
    model: "magpie-tts-multilingual",
    input: text.trim(),
    voice,
    speed,
    language_code: languageCode,
    response_format: "wav",
  });

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: errText || `TTS API error ${res.status}` }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const contentType = res.headers.get("Content-Type") ?? "audio/wav";
    const audio = await res.arrayBuffer();

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="speech-${Date.now()}.wav"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = (err as Error).message ?? "TTS request failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
