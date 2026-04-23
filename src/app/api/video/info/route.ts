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
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
        },
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
    }

    // ── TikTok ───────────────────────────────────────────────────────────────
    if (/tiktok\.com/i.test(url)) {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(15_000),
      });
      const data = await res.json() as {
        code: number; msg?: string;
        data?: { title: string; author: { nickname: string }; duration: number; cover: string };
      };
      if (data.code !== 0 || !data.data) throw new Error(data.msg ?? "TikTok fetch failed");
      return NextResponse.json({
        success: true,
        data: {
          title: data.data.title || "TikTok Video",
          author: data.data.author.nickname,
          duration: fmtDuration(data.data.duration),
          views: null,
          platform: "TikTok",
          thumbnail: data.data.cover,
        },
      });
    }

    // ── Instagram ────────────────────────────────────────────────────────────
    if (/instagram\.com/i.test(url)) {
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
