import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

// ─────────────────────────────────────────────
// Cobalt API  (supports 20+ platforms: YouTube, TikTok, Instagram,
// Twitter/X, Facebook, Vimeo, Reddit, Pinterest, Dailymotion, Twitch, …)
// Docs: https://cobalt.tools  |  Source: github.com/imputnet/cobalt
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
  status:   "redirect" | "tunnel" | "stream" | "picker" | "error";
  url?:     string;
  filename?: string;
  error?:   { code: string };
  picker?:  Array<{ type: string; url: string; thumb?: string }>;
}

const QUALITY_TO_COBALT: Record<string, CobaltQuality> = {
  "4k":    "2160",
  "1080p": "1080",
  "720p":  "720",
  "480p":  "480",
  "360p":  "360",
};

// ─────────────────────────────────────────────
// YouTube direct download (ytdl-core)
// ─────────────────────────────────────────────

const YTDL_FORMAT: Record<string, { quality: string; filter: "videoandaudio" | "audioonly" }> = {
  "4k":    { quality: "2160p",        filter: "videoandaudio" },
  "1080p": { quality: "1080p",        filter: "videoandaudio" },
  "720p":  { quality: "720p",         filter: "videoandaudio" },
  "480p":  { quality: "480p",         filter: "videoandaudio" },
  "360p":  { quality: "360p",         filter: "videoandaudio" },
  "mp3":   { quality: "highestaudio", filter: "audioonly"     },
  "webm":  { quality: "720p",         filter: "videoandaudio" },
};

async function downloadYouTube(url: string, quality: string): Promise<Response> {
  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim().slice(0, 80) || "video";
  const q = YTDL_FORMAT[quality] ?? YTDL_FORMAT["720p"];
  const isAudio = q.filter === "audioonly";

  let format: ytdl.videoFormat | undefined;
  if (isAudio) {
    format = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });
  } else {
    const matching = info.formats.filter(
      (f) => f.hasVideo && f.hasAudio && (f.qualityLabel === q.quality || f.quality === q.quality)
    );
    format = matching[0] ?? ytdl.chooseFormat(info.formats, { quality: "highestvideo", filter: "videoandaudio" });
  }

  if (!format?.url) throw new Error("Quality not available — try a lower setting.");

  const ext  = isAudio ? "mp3" : quality === "webm" ? "webm" : "mp4";
  const mime = isAudio ? "audio/mpeg" : quality === "webm" ? "video/webm" : "video/mp4";

  const upstream = await fetch(format.url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" },
  });
  if (!upstream.ok) throw new Error("Failed to fetch video stream.");

  return new Response(upstream.body, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${title}.${ext}"`,
      ...(upstream.headers.get("Content-Length") ? { "Content-Length": upstream.headers.get("Content-Length")! } : {}),
    },
  });
}

// ─────────────────────────────────────────────
// Cobalt download (all other platforms)
// ─────────────────────────────────────────────

async function callCobalt(instance: string, body: CobaltRequest): Promise<CobaltResponse> {
  const res = await fetch(`${instance}/`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Accept":        "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`Cobalt HTTP ${res.status}`);
  return res.json() as Promise<CobaltResponse>;
}

async function downloadViaCobalt(url: string, quality: string): Promise<Response> {
  const isAudio = quality === "mp3";
  const cobaltQuality = isAudio ? undefined : (QUALITY_TO_COBALT[quality] ?? "720");

  const body: CobaltRequest = {
    url,
    filenameStyle: "basic",
    ...(isAudio
      ? { downloadMode: "audio", audioFormat: "mp3" }
      : { videoQuality: cobaltQuality, downloadMode: "auto" }),
  };

  let data: CobaltResponse | null = null;
  let lastErr = "";

  // Try each Cobalt instance in order
  for (const instance of COBALT_INSTANCES) {
    try {
      data = await callCobalt(instance, body);
      break;
    } catch (e) {
      lastErr = String((e as Error).message);
    }
  }

  if (!data) throw new Error(`All download servers are unavailable. ${lastErr}`);

  if (data.status === "error") {
    const code = data.error?.code ?? "unknown";
    const friendly: Record<string, string> = {
      "content.too_long":           "Video is too long to download.",
      "content.video.unavailable":  "This video is unavailable.",
      "fetch.fail":                 "Could not fetch video. The URL may be private or expired.",
      "link.unsupported":           "This platform is not supported.",
      "link.invalid":               "Invalid URL.",
    };
    throw new Error(friendly[code] ?? `Download failed (${code}). Please try again.`);
  }

  if (data.status === "picker" && data.picker?.length) {
    // For picker (e.g. Instagram carousel), take the first video
    const video = data.picker.find((p) => p.type === "video") ?? data.picker[0];
    data = { status: "redirect", url: video.url, filename: "video.mp4" };
  }

  const downloadUrl = data.url;
  if (!downloadUrl) throw new Error("No download URL returned by server.");

  // Proxy the video stream through our server
  const upstream = await fetch(downloadUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" },
    signal: AbortSignal.timeout(5 * 60_000),
  });
  if (!upstream.ok) throw new Error(`Upstream fetch failed: ${upstream.status}`);

  const filename = data.filename ?? (isAudio ? "audio.mp3" : "video.mp4");
  const mime     = filename.endsWith(".mp3") ? "audio/mpeg"
                 : filename.endsWith(".webm") ? "video/webm"
                 : "video/mp4";

  return new Response(upstream.body, {
    headers: {
      "Content-Type":        mime,
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(upstream.headers.get("Content-Length") ? { "Content-Length": upstream.headers.get("Content-Length")! } : {}),
    },
  });
}

// ─────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export async function POST(req: NextRequest) {
  try {
    const { url, quality = "720p" } = await req.json() as { url?: string; quality?: string };
    if (!url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    let response: Response;

    if (isYouTube(url.trim())) {
      // Try Cobalt first (more reliable), fall back to ytdl-core
      try {
        response = await downloadViaCobalt(url.trim(), quality);
      } catch {
        response = await downloadYouTube(url.trim(), quality);
      }
    } else {
      // All other platforms: use Cobalt
      response = await downloadViaCobalt(url.trim(), quality);
    }

    return new NextResponse(response.body, {
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (err: unknown) {
    const msg = String((err as Error)?.message ?? "Download failed. Please try again.");
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
