import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtViews(v: string): string {
  const n = parseInt(v, 10);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string };
    const url = body.url?.trim() ?? "";
    if (!url) return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });

    // ── YouTube ──────────────────────────────────────────────────────────────
    if (/youtube\.com|youtu\.be/i.test(url)) {
      // Use Cobalt API for YouTube info
      const bodyStr = JSON.stringify({ url, downloadMode: "video", videoQuality: "720", filenameStyle: "basic" });
      const cobaltInstances = ["https://api.cobalt.tools/", "https://co.wuk.sh/", "https://cobalt.uli.rocks/"];

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
            const data = await res.json() as { status: string; url?: string; filename?: string };
            if (data.status === "tunnel" || data.status === "redirect") {
              // Got a download URL — extract thumbnail from known YouTube pattern
              const vidId = url.match(/(?:v=|shorts\/)([a-zA-Z0-9_-]{11})/)?.[1] || "";
              return NextResponse.json({
                success: true,
                data: {
                  title: data.filename?.replace(/\.[^.]+$/, "") || "YouTube Video",
                  author: "YouTube",
                  duration: "Unknown",
                  views: null,
                  platform: "YouTube",
                  thumbnail: vidId ? `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg` : null,
                },
              });
            }
          }
        } catch { /* try next */ }
      }

      // Fallback: try ytdl-core
      try {
        const ytdl = await import("@distube/ytdl-core");
        const info = await ytdl.getInfo(url, {
          requestOptions: { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } },
        });
        const d = info.videoDetails;
        const thumb = d.thumbnails[d.thumbnails.length - 1]?.url ?? null;
        return NextResponse.json({
          success: true,
          data: {
            title: d.title,
            author: d.author.name,
            duration: fmtDuration(parseInt(d.lengthSeconds, 10)),
            views: d.viewCount ? fmtViews(d.viewCount) : null,
            platform: "YouTube",
            thumbnail: thumb,
          },
        });
      } catch {
        return NextResponse.json({ success: true, data: { title: "YouTube Video", author: "YouTube", duration: "Unknown", views: null, platform: "YouTube", thumbnail: null } });
      }
    }

    // ── TikTok ───────────────────────────────────────────────────────────────
    if (/tiktok\.com/i.test(url)) {
      // Resolve short URLs first
      let videoUrl = url;
      if (/vm\.|vt\./i.test(url)) {
        try {
          const headRes = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            signal: AbortSignal.timeout(8_000),
          });
          videoUrl = headRes.url;
        } catch {
          // use original URL
        }
      }
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, {
        signal: AbortSignal.timeout(15_000),
      });
      const data = await res.json() as {
        code: number; msg?: string;
        data?: { title?: string; author?: { nickname?: string }; duration: number; cover: string; author_id?: string };
      };
      if (data.code !== 0 || !data.data) {
        // Fallback: return minimal info if API fails
        return NextResponse.json({
          success: true,
          data: {
            title: "TikTok Video",
            author: "TikTok",
            duration: "Unknown",
            views: null,
            platform: "TikTok",
            thumbnail: null,
          },
        });
      }
      return NextResponse.json({
        success: true,
        data: {
          title: data.data.title || "TikTok Video",
          author: data.data.author?.nickname || data.data.author_id || "TikTok",
          duration: fmtDuration(data.data.duration),
          views: null,
          platform: "TikTok",
          thumbnail: data.data.cover,
        },
      });
    }

    // ── Instagram ────────────────────────────────────────────────────────────
    if (/instagram\.com/i.test(url)) {
      // Try TikWM API for Instagram info
      try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
          signal: AbortSignal.timeout(15_000),
        });
        const data = await res.json() as {
          code: number; msg?: string;
          data?: { title?: string; author?: string; duration: number; cover: string; author_id?: string };
        };
        if (data.code === 0 && data.data) {
          return NextResponse.json({
            success: true,
            data: {
              title: data.data.title || "Instagram Video",
              author: data.data.author || data.data.author_id || "Instagram",
              duration: fmtDuration(data.data.duration),
              views: null,
              platform: "Instagram",
              thumbnail: data.data.cover,
            },
          });
        }
      } catch { /* continue */ }

      // Try embed scraping
      try {
        const shortcodeMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
        if (shortcodeMatch) {
          const embedRes = await fetch(
            `https://www.instagram.com/p/${shortcodeMatch[1]}/embed/captioned/`,
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
            const thumbMatch = html.match(/"og_image"\s*:\s*"([^"]+)"/) || html.match(/<meta property="og:image"[^>]*content="([^"]+)"/);
            const titleMatch = html.match(/"og_title"\s*:\s*"([^"]+)"/);
            if (thumbMatch || titleMatch) {
              return NextResponse.json({
                success: true,
                data: {
                  title: titleMatch ? titleMatch[1] : "Instagram Video",
                  author: "Instagram",
                  duration: "Unknown",
                  views: null,
                  platform: "Instagram",
                  thumbnail: thumbMatch ? thumbMatch[1].replace(/\\u0026/g, "&") : null,
                },
              });
            }
          }
        }
      } catch { /* continue */ }

      // Fallback: minimal info
      return NextResponse.json({
        success: true,
        data: {
          title: "Instagram Video",
          author: "Instagram",
          duration: "Unknown",
          views: null,
          platform: "Instagram",
          thumbnail: null,
        },
      });
    }

    // ── Twitter / X ──────────────────────────────────────────────────────────
    if (/twitter\.com|x\.com/i.test(url)) {
      return NextResponse.json({
        success: true,
        data: {
          title: "Twitter / X Video",
          author: "Twitter",
          duration: "Unknown",
          views: null,
          platform: "Twitter",
          thumbnail: null,
        },
      });
    }

    // ── Facebook ─────────────────────────────────────────────────────────────
    if (/facebook\.com|fb\.watch/i.test(url)) {
      // Try RapidURL for Facebook info
      try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
          signal: AbortSignal.timeout(15_000),
        });
        const data = await res.json() as {
          code: number; msg?: string;
          data?: { title?: string; author?: string; duration: number; cover: string };
        };
        if (data.code === 0 && data.data) {
          return NextResponse.json({
            success: true,
            data: {
              title: data.data.title || "Facebook Video",
              author: data.data.author || "Facebook",
              duration: fmtDuration(data.data.duration),
              views: null,
              platform: "Facebook",
              thumbnail: data.data.cover,
            },
          });
        }
      } catch { /* continue */ }

      return NextResponse.json({
        success: true,
        data: {
          title: "Facebook Video",
          author: "Facebook",
          duration: "Unknown",
          views: null,
          platform: "Facebook",
          thumbnail: null,
        },
      });
    }

    // ── Vimeo (oEmbed) ───────────────────────────────────────────────────────
    if (/vimeo\.com/i.test(url)) {
      try {
        const oembed = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
          { signal: AbortSignal.timeout(10_000) }
        );
        const d = await oembed.json() as { title?: string; author_name?: string; thumbnail_url?: string; duration?: number };
        return NextResponse.json({
          success: true,
          data: {
            title: d.title ?? "Vimeo Video",
            author: d.author_name ?? "Vimeo",
            duration: d.duration ? fmtDuration(d.duration) : "Unknown",
            views: null,
            platform: "Vimeo",
            thumbnail: d.thumbnail_url ?? null,
          },
        });
      } catch {
        return NextResponse.json({
          success: true,
          data: { title: "Vimeo Video", author: "Vimeo", duration: "Unknown", views: null, platform: "Vimeo", thumbnail: null },
        });
      }
    }

    return NextResponse.json({ success: false, message: "Unsupported platform" }, { status: 400 });
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Failed to fetch video info";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
