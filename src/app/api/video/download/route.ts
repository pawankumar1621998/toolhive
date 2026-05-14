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
      // Use Cobalt API for YouTube (works on serverless, no yt-dlp needed)
      const qMap: Record<string, string> = { "4k": "2160", "1080p": "1080", "720p": "720", "480p": "480", "360p": "360", "mp3": "audio" };

      const bodyStr = JSON.stringify({
        url: urlTrimmed,
        downloadMode: quality === "mp3" ? "audio" : "video",
        videoQuality: qMap[quality] || "720",
        audioFormat: quality === "mp3" ? "mp3" : undefined,
        filenameStyle: "basic",
      });

      // Try Cobalt instances in parallel
      const cobaltInstances = [
        "https://api.cobalt.tools/",
        "https://cobalt.uli.rocks/",
      ];

      let result: { url: string; filename: string } | null = null;
      for (const instance of cobaltInstances) {
        try {
          const res = await fetch(instance, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Origin": "https://cobalt.tools",
              "Referer": "https://cobalt.tools/",
            },
            body: bodyStr,
            signal: AbortSignal.timeout(12_000),
          });
          if (res.ok) {
            const data = await res.json() as { status: string; url?: string; filename?: string; picker?: Array<{ url: string }> };
            if (data.status === "tunnel" || data.status === "redirect") {
              result = { url: data.url!, filename: data.filename || "video.mp4" };
              break;
            }
            if (data.status === "picker" && data.picker?.[0]?.url) {
              result = { url: data.picker[0].url, filename: data.filename || "video.mp4" };
              break;
            }
          }
        } catch { /* try next instance */ }
      }

      if (!result) {
        throw new Error("YouTube download is temporarily unavailable. For best results, use a browser extension like 'Video DownloadHelper' or copy the video URL directly from YouTube.");
      }

      return NextResponse.json({ success: true, downloadUrl: result.url, filename: result.filename });
    }

    // ── TikTok (via tikwm.com — free, no watermark) ──────────────────────────
    if (/tiktok\.com/i.test(urlTrimmed)) {
      // Resolve short URLs first (vm.tiktok.com, vt.tiktok.com)
      let videoUrl = urlTrimmed;
      try {
        const headRes = await fetch(urlTrimmed, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(8_000),
        });
        if (headRes.url && headRes.url !== urlTrimmed) {
          videoUrl = headRes.url;
        }
      } catch {
        // use original URL
      }

      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, {
        signal: AbortSignal.timeout(15_000),
      });
      const data = await res.json() as {
        code: number; msg?: string;
        data?: { play: string; hdplay?: string; title?: string; duration?: number; cover?: string };
      };
      if (data.code !== 0 || !data.data) {
        throw new Error(data.msg ?? "TikTok video not found. Make sure the video is public.");
      }
      const dlUrl = data.data.hdplay || data.data.play;
      return NextResponse.json({
        success: true,
        downloadUrl: dlUrl,
        filename: `${(data.data.title || "tiktok").slice(0, 30)}.mp4`,
      });
    }

    // ── Instagram ─────────────────────────────────────────────────────────────
    if (/instagram\.com/i.test(urlTrimmed)) {
      // Try oEmbed API (no auth needed for public posts)
      try {
        const oembedRes = await fetch(
          `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(urlTrimmed)}&maxwidth=480&output=json`,
          { signal: AbortSignal.timeout(10_000) }
        );
        if (oembedRes.ok) {
          const oembed = await oembedRes.json() as { thumbnail_url?: string; title?: string; author_name?: string };
          if (oembed.thumbnail_url) {
            // oEmbed doesn't give video URL directly
            // Try to extract video from the thumbnail URL domain
          }
        }
      } catch { /* continue */ }

      // Try TikWM API for Instagram
      try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(urlTrimmed)}&hd=1`, {
          signal: AbortSignal.timeout(15_000),
        });
        const data = await res.json() as {
          code: number; msg?: string;
          data?: { play: string; hdplay?: string; title?: string; duration?: number; cover?: string };
        };
        if (data.code === 0 && data.data) {
          const dlUrl = data.data.hdplay || data.data.play;
          return NextResponse.json({
            success: true,
            downloadUrl: dlUrl,
            filename: `${(data.data.title || "instagram_video").slice(0, 30)}.mp4`,
          });
        }
      } catch { /* continue */ }

      // Try embed scrape
      try {
        const shortcodeMatch = urlTrimmed.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
        if (shortcodeMatch) {
          const shortcode = shortcodeMatch[1];
          const embedRes = await fetch(
            `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
                "Accept": "text/html",
              },
              signal: AbortSignal.timeout(10_000),
            }
          );
          if (embedRes.ok) {
            const html = await embedRes.text();
            const match = html.match(/"video_url"\s*:\s*"([^"]+)"/);
            if (match) {
              const videoUrl = match[1].replace(/\\u0026/g, "&");
              return NextResponse.json({
                success: true,
                downloadUrl: videoUrl,
                filename: `instagram_${shortcode}.mp4`,
              });
            }
          }
        }
      } catch { /* continue */ }

      return NextResponse.json({
        success: false,
        message: "Instagram video download is not available for this video. Make sure the account is public, or use a browser extension like 'Video DownloadHelper' for more options.",
        guidance: true,
      }, { status: 422 });
    }

    // ── Twitter / X ───────────────────────────────────────────────────────────
    if (/twitter\.com|x\.com/i.test(urlTrimmed)) {
      // Try snaptik alternative API (no auth needed)
      const snapRes = await fetch(
        `https://www.snaptik.app/abc?url=${encodeURIComponent(urlTrimmed)}`,
        {
          headers: {
            "User-Agent": UA,
            "Accept": "application/json",
          },
          signal: AbortSignal.timeout(15_000),
        },
      ).catch(() => null);

      // Try rapidapi alternative
      const tweetId = urlTrimmed.match(/status\/(\d+)/)?.[1];
      if (!tweetId) throw new Error("Could not parse tweet ID from URL");

      // Try noembed as fallback
      try {
        const oembed = await fetch(
          `https://publish.twitter.com/oembed?url=${encodeURIComponent(urlTrimmed)}`,
          { signal: AbortSignal.timeout(10_000) }
        );
        if (oembed.ok) {
          const oembedData = await oembed.json() as { html?: string };
          if (oembedData.html?.includes("video")) {
            // Video tweet found
          }
        }
      } catch { /* ignore */ }

      // Return guidance — Twitter video extraction requires browser extension
      return NextResponse.json({
        success: false,
        message: "Twitter/X videos cannot be downloaded automatically. Right-click the video and choose 'Save Video As', or use a browser extension like 'Video DownloadHelper' or 'Twitter Video Downloader'.",
        guidance: true,
      }, { status: 422 });
    }

    // ── Facebook ──────────────────────────────────────────────────────────────
    if (/facebook\.com|fb\.watch/i.test(urlTrimmed)) {
      // Try RapidURL or similar free API
      try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(urlTrimmed)}`, {
          signal: AbortSignal.timeout(15_000),
        });
        const data = await res.json() as {
          code: number; msg?: string;
          data?: { play: string; hdplay?: string; title?: string };
        };
        if (data.code === 0 && data.data) {
          const dlUrl = data.data.hdplay || data.data.play;
          return NextResponse.json({
            success: true,
            downloadUrl: dlUrl,
            filename: `${(data.data.title || "facebook_video").slice(0, 30)}.mp4`,
          });
        }
      } catch { /* continue */ }

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
