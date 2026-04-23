import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function POST(req: NextRequest) {
  try {
    const { url, quality = "720p" } = await req.json() as { url?: string; quality?: string };
    if (!url?.trim()) return NextResponse.json({ success: false, message: "URL required" }, { status: 400 });
    const urlTrimmed = url.trim();

    // ── YouTube ──────────────────────────────────────────────────────────────
    if (/youtube\.com|youtu\.be/i.test(urlTrimmed)) {
      const info = await ytdl.getInfo(urlTrimmed, {
        requestOptions: { headers: { "User-Agent": UA } },
      });

      if (quality === "mp3") {
        const fmt = ytdl.chooseFormat(info.formats, { quality: "lowestaudio", filter: "audioonly" });
        return NextResponse.json({ success: true, downloadUrl: fmt.url, filename: "audio.mp3" });
      }

      const resMap: Record<string, string> = { "4k": "2160", "1080p": "1080", "720p": "720", "480p": "480", "360p": "360" };
      const target = resMap[quality] ?? "720";

      // Prefer combined (video+audio) formats at target resolution
      let fmts = ytdl.filterFormats(info.formats, "videoandaudio")
        .filter(f => f.qualityLabel?.startsWith(target));

      // Fallback: any combined format
      if (!fmts.length) fmts = ytdl.filterFormats(info.formats, "videoandaudio");

      // Final fallback: highest quality anything
      const fmt = fmts[0] ?? ytdl.chooseFormat(info.formats, { quality: "highest" });
      return NextResponse.json({ success: true, downloadUrl: fmt.url, filename: "video.mp4" });
    }

    // ── TikTok (via tikwm.com — free, no watermark) ──────────────────────────
    if (/tiktok\.com/i.test(urlTrimmed)) {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(urlTrimmed)}`, {
        signal: AbortSignal.timeout(15_000),
      });
      const data = await res.json() as {
        code: number; msg?: string;
        data?: { play: string; hdplay?: string; title: string };
      };
      if (data.code !== 0 || !data.data) throw new Error(data.msg ?? "TikTok fetch failed");
      const dlUrl = data.data.hdplay || data.data.play;
      return NextResponse.json({ success: true, downloadUrl: dlUrl, filename: "tiktok.mp4" });
    }

    // ── Instagram ─────────────────────────────────────────────────────────────
    if (/instagram\.com/i.test(urlTrimmed)) {
      // Instagram blocks server-side access — provide guidance
      return NextResponse.json({
        success: false,
        message: "Instagram videos require login. Use a browser extension like 'Video DownloadHelper' for private content, or right-click the video and choose 'Save Video As' for public posts.",
        guidance: true,
      }, { status: 422 });
    }

    // ── Twitter / X ───────────────────────────────────────────────────────────
    if (/twitter\.com|x\.com/i.test(urlTrimmed)) {
      // Use twitsave-compatible API
      const tweetId = urlTrimmed.match(/status\/(\d+)/)?.[1];
      if (!tweetId) throw new Error("Could not parse tweet ID from URL");

      const apiUrl = `https://twitsave.com/info?url=${encodeURIComponent(urlTrimmed)}`;
      const tRes = await fetch(apiUrl, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(15_000),
      });

      if (!tRes.ok) throw new Error("Twitter video fetch failed");

      // Return the proxy URL for the client to use
      return NextResponse.json({
        success: true,
        downloadUrl: `https://twitsave.com/download?url=${encodeURIComponent(urlTrimmed)}`,
        filename: "twitter_video.mp4",
      });
    }

    // ── Facebook ──────────────────────────────────────────────────────────────
    if (/facebook\.com|fb\.watch/i.test(urlTrimmed)) {
      return NextResponse.json({
        success: false,
        message: "Facebook videos cannot be downloaded automatically. Right-click the video while it plays and choose 'Save Video As', or use a browser extension like 'Video DownloadHelper'.",
        guidance: true,
      }, { status: 422 });
    }

    // ── Vimeo ─────────────────────────────────────────────────────────────────
    if (/vimeo\.com/i.test(urlTrimmed)) {
      const videoId = urlTrimmed.match(/vimeo\.com\/(\d+)/)?.[1];
      if (!videoId) throw new Error("Invalid Vimeo URL");

      const configRes = await fetch(
        `https://player.vimeo.com/video/${videoId}/config`,
        { headers: { "User-Agent": UA, "Referer": "https://vimeo.com/" }, signal: AbortSignal.timeout(15_000) }
      );
      if (!configRes.ok) throw new Error("Vimeo config fetch failed");

      const config = await configRes.json() as {
        request?: { files?: { progressive?: Array<{ url: string; quality: string }> } };
      };
      const files = config.request?.files?.progressive ?? [];
      files.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

      const target = quality === "mp3" ? null : quality;
      const chosen = target
        ? files.find(f => f.quality === target) ?? files[0]
        : files[0];

      if (!chosen) throw new Error("No downloadable Vimeo format found");
      return NextResponse.json({ success: true, downloadUrl: chosen.url, filename: "vimeo_video.mp4" });
    }

    return NextResponse.json({ success: false, message: "Unsupported platform" }, { status: 400 });
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Download failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
