import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

// ─────────────────────────────────────────────
// Cobalt API — returns a direct download URL (no proxying through Vercel)
// ─────────────────────────────────────────────

const COBALT_INSTANCES = [
  "https://cobalt.api.timelessnesses.me",
  "https://cobalt.otomir23.me",
  "https://api.cobalt.tools",
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

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

// ─────────────────────────────────────────────
// Route — returns { downloadUrl, filename } so the browser downloads directly.
// No video bytes flow through Vercel (avoids 4.5 MB limit / 10 s timeout).
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url, quality = "720p" } = await req.json() as { url?: string; quality?: string };
    if (!url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const isAudio = quality === "mp3";
    const cobaltQuality = isAudio ? undefined : (QUALITY_TO_COBALT[quality] ?? "720") as CobaltQuality;

    const cobaltBody: CobaltRequest = {
      url: url.trim(),
      filenameStyle: "basic",
      ...(isAudio
        ? { downloadMode: "audio", audioFormat: "mp3" }
        : { videoQuality: cobaltQuality, downloadMode: "auto" }),
    };

    // 1. Try Cobalt instances
    let cobaltData: CobaltResponse | null = null;
    for (const instance of COBALT_INSTANCES) {
      try {
        cobaltData = await callCobalt(instance, cobaltBody);
        if (cobaltData.status !== "error") break;
      } catch { /* try next */ }
    }

    if (cobaltData && cobaltData.status !== "error") {
      // picker = carousel (e.g. Instagram) — take first video
      if (cobaltData.status === "picker" && cobaltData.picker?.length) {
        const item = cobaltData.picker.find((p) => p.type === "video") ?? cobaltData.picker[0];
        cobaltData = { status: "redirect", url: item.url, filename: "video.mp4" };
      }

      if (cobaltData.url) {
        return NextResponse.json({
          success:     true,
          downloadUrl: cobaltData.url,
          filename:    cobaltData.filename ?? (isAudio ? "audio.mp3" : "video.mp4"),
        });
      }
    }

    // 2. YouTube fallback via ytdl-core
    if (isYouTube(url.trim())) {
      const info = await ytdl.getInfo(url.trim());
      const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim().slice(0, 80) || "video";

      let format: ytdl.videoFormat | undefined;
      if (isAudio) {
        format = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });
      } else {
        // prefer combined video+audio formats to avoid needing ffmpeg merge
        const combined = info.formats.filter(
          (f) => f.hasVideo && f.hasAudio
        ).sort((a, b) => (parseInt(b.height?.toString() ?? "0") - parseInt(a.height?.toString() ?? "0")));
        format = combined[0] ?? ytdl.chooseFormat(info.formats, { quality: "highestvideo&audio" });
      }

      if (format?.url) {
        const ext = isAudio ? "mp3" : "mp4";
        return NextResponse.json({
          success:     true,
          downloadUrl: format.url,
          filename:    `${title}.${ext}`,
        });
      }
    }

    // 3. Nothing worked
    const errCode = cobaltData?.error?.code ?? "unknown";
    const friendly: Record<string, string> = {
      "content.too_long":          "Video is too long to download.",
      "content.video.unavailable": "This video is unavailable.",
      "fetch.fail":                "Could not reach the video. It may be private or expired.",
      "link.unsupported":          "This platform is not supported for download.",
      "link.invalid":              "Invalid URL.",
    };
    return NextResponse.json(
      { success: false, message: friendly[errCode] ?? "Download failed. Please try another quality or platform." },
      { status: 400 }
    );

  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Download failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
