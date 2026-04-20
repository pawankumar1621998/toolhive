import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────
// Cobalt API — tries to get a direct CDN URL (fast, no proxying)
// Falls back to Render backend (yt-dlp streaming) if Cobalt fails.
// ─────────────────────────────────────────────

const RENDER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

const COBALT_INSTANCES = [
  "https://api.cobalt.tools",
  "https://cobalt.api.timelessnesses.me",
  "https://cobalt.otomir23.me",
];

type CobaltQuality = "144" | "240" | "360" | "480" | "720" | "1080" | "1440" | "2160";

interface CobaltRequest {
  url: string;
  videoQuality?: CobaltQuality;
  audioFormat?: "best" | "mp3" | "ogg" | "wav" | "opus";
  downloadMode?: "auto" | "audio" | "mute";
  filenameStyle?: "classic" | "pretty" | "basic" | "nerdy";
}

interface CobaltResponse {
  status:    "redirect" | "tunnel" | "stream" | "picker" | "error";
  url?:      string;
  filename?: string;
  error?:    { code: string };
  picker?:   Array<{ type: string; url: string; thumb?: string }>;
}

const QUALITY_TO_COBALT: Record<string, CobaltQuality> = {
  "4k":    "2160",
  "1080p": "1080",
  "720p":  "720",
  "480p":  "480",
  "360p":  "360",
};

async function callCobalt(instance: string, body: CobaltRequest): Promise<CobaltResponse> {
  const res = await fetch(`${instance}/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body:    JSON.stringify(body),
    signal:  AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`Cobalt HTTP ${res.status}`);
  return res.json() as Promise<CobaltResponse>;
}

// ─────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url, quality = "720p" } = await req.json() as { url?: string; quality?: string };
    if (!url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const cleanUrl = url.trim();
    const isAudio  = quality === "mp3";
    const cobaltQuality = isAudio ? undefined : (QUALITY_TO_COBALT[quality] ?? "720") as CobaltQuality;

    const cobaltBody: CobaltRequest = {
      url: cleanUrl,
      filenameStyle: "basic",
      ...(isAudio
        ? { downloadMode: "audio", audioFormat: "mp3" }
        : { videoQuality: cobaltQuality, downloadMode: "auto" }),
    };

    // ── 1. Try Cobalt instances (fast CDN URL) ──
    for (const instance of COBALT_INSTANCES) {
      try {
        const data = await callCobalt(instance, cobaltBody);
        if (data.status === "error") continue;

        // picker = carousel (e.g. Instagram) — take first video item
        let finalData = data;
        if (data.status === "picker" && data.picker?.length) {
          const item = data.picker.find((p) => p.type === "video") ?? data.picker[0];
          finalData = { status: "redirect", url: item.url, filename: "video.mp4" };
        }

        if (finalData.url) {
          return NextResponse.json({
            success:     true,
            downloadUrl: finalData.url,
            filename:    finalData.filename ?? (isAudio ? "audio.mp3" : "video.mp4"),
          });
        }
      } catch {
        // try next instance
      }
    }

    // ── 2. Fallback: Render backend GET URL (yt-dlp streams directly to browser) ──
    const backendUrl =
      `${RENDER_URL}/video/download` +
      `?url=${encodeURIComponent(cleanUrl)}` +
      `&quality=${encodeURIComponent(quality)}`;

    return NextResponse.json({
      success:     true,
      downloadUrl: backendUrl,
      filename:    isAudio ? "audio.mp3" : "video.mp4",
    });

  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Download failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
