import { NextRequest } from "next/server";

// Google Translate TTS — free, no API key, returns MP3 audio
// Splits long text into ≤185-char chunks and concatenates MP3 buffers

const LANG_MAP: Record<string, string> = {
  en: "en", "en-US": "en", "en-GB": "en",
  hi: "hi", fr: "fr", de: "de",
  es: "es", it: "it", pt: "pt",
  ja: "ja", ko: "ko", "zh-CN": "zh-CN",
  ar: "ar", ru: "ru", nl: "nl", tr: "tr",
};

function splitTextToChunks(text: string, maxLen = 180): string[] {
  const chunks: string[] = [];
  // Split by sentence boundaries first
  const parts = text.replace(/([.!?।])\s+/g, "$1\x00").split("\x00");

  let current = "";
  for (const part of parts) {
    if (!part.trim()) continue;
    if (part.length > maxLen) {
      // Long sentence — split at words
      for (const word of part.split(" ")) {
        if ((current + " " + word).trim().length <= maxLen) {
          current = (current + " " + word).trim();
        } else {
          if (current) chunks.push(current);
          current = word.substring(0, maxLen);
        }
      }
    } else if ((current + " " + part).trim().length <= maxLen) {
      current = (current + " " + part).trim();
    } else {
      if (current) chunks.push(current);
      current = part;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 0);
}

export async function POST(req: NextRequest) {
  const { text, voice = "en" } = (await req.json()) as {
    text: string;
    voice?: string;
  };

  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "Text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (text.length > 1000) {
    return new Response(
      JSON.stringify({ error: "Text too long — max 1000 characters for AI Voice. Use Browser TTS for longer text." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const lang = LANG_MAP[voice] ?? "en";
  const chunks = splitTextToChunks(text.trim(), 180);
  const audioBuffers: ArrayBuffer[] = [];

  try {
    for (const chunk of chunks) {
      const url =
        `https://translate.google.com/translate_tts` +
        `?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob&ttsspeed=1`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
          Accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: `TTS service error (${res.status}). Try Browser TTS instead.` }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      audioBuffers.push(await res.arrayBuffer());
    }

    // Concatenate all MP3 chunks
    const totalLength = audioBuffers.reduce((s, b) => s + b.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Response(combined.buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="speech-${Date.now()}.mp3"`,
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
