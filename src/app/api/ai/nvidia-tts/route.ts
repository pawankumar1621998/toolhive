import { NextRequest } from "next/server";

// StreamElements TTS — free, no API key, returns MP3 audio
// Replaces NVIDIA Magpie TTS which was gRPC-only (not HTTP REST)

export const STREAM_VOICES = [
  { id: "Brian",    label: "Brian — English UK · Male"        },
  { id: "Amy",      label: "Amy — English UK · Female"        },
  { id: "Emma",     label: "Emma — English UK · Female"       },
  { id: "Joanna",   label: "Joanna — English US · Female"     },
  { id: "Joey",     label: "Joey — English US · Male"         },
  { id: "Matthew",  label: "Matthew — English US · Male"      },
  { id: "Salli",    label: "Salli — English US · Female"      },
  { id: "Kendra",   label: "Kendra — English US · Female"     },
  { id: "Justin",   label: "Justin — English US · Male"       },
  { id: "Nicole",   label: "Nicole — Australian · Female"     },
  { id: "Russell",  label: "Russell — Australian · Male"      },
  { id: "Conchita", label: "Conchita — Spanish · Female"      },
  { id: "Celine",   label: "Céline — French · Female"         },
  { id: "Marlene",  label: "Marlene — German · Female"        },
  { id: "Carla",    label: "Carla — Italian · Female"         },
] as const;

export async function POST(req: NextRequest) {
  const { text, voice = "Brian" } = await req.json() as {
    text: string;
    voice?: string;
  };

  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "Text is required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }
  if (text.length > 3000) {
    return new Response(JSON.stringify({ error: "Text too long (max 3000 chars)" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL("https://api.streamelements.com/kappa/v2/speech");
  url.searchParams.set("voice", voice);
  url.searchParams.set("text", text.trim());

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ToolHive/1.0)",
        Accept: "audio/mpeg,audio/*",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `TTS service error (${res.status})` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
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
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
}
