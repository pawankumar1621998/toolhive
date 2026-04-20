import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatViews(n: number): string {
  if (!n || isNaN(n)) return null!;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B views`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be"))  return "youtube";
  if (u.includes("instagram.com"))                           return "instagram";
  if (u.includes("tiktok.com"))                              return "tiktok";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("twitter.com")  || u.includes("x.com"))    return "twitter";
  if (u.includes("pinterest.com"))                           return "pinterest";
  if (u.includes("vimeo.com"))                               return "vimeo";
  if (u.includes("dailymotion.com"))                         return "dailymotion";
  if (u.includes("twitch.tv"))                               return "twitch";
  if (u.includes("reddit.com")   || u.includes("v.redd.it"))return "reddit";
  return "other";
}

// ─────────────────────────────────────────────
// Platform-specific info fetchers
// ─────────────────────────────────────────────

interface VideoInfo {
  title: string;
  author: string;
  duration: string;
  views: string | null;
  platform: string;
  thumbnail: string | null;
}

async function getYouTubeInfo(url: string): Promise<VideoInfo> {
  const info = await ytdl.getInfo(url);
  const d = info.videoDetails;
  return {
    title:     d.title,
    author:    d.author?.name ?? "Unknown",
    duration:  formatDuration(parseInt(d.lengthSeconds, 10)),
    views:     d.viewCount ? formatViews(parseInt(d.viewCount, 10)) : null,
    platform:  "youtube",
    thumbnail: d.thumbnails?.at(-1)?.url ?? null,
  };
}

async function getOembedInfo(oembedUrl: string, platform: string): Promise<VideoInfo> {
  const res  = await fetch(oembedUrl, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`oEmbed fetch failed: ${res.status}`);
  const data = await res.json() as Record<string, unknown>;
  return {
    title:     String(data.title   ?? data.author_name ?? "Video"),
    author:    String(data.author_name ?? "Unknown"),
    duration:  data.duration ? formatDuration(Number(data.duration)) : "—",
    views:     null,
    platform,
    thumbnail: (data.thumbnail_url as string) ?? null,
  };
}

async function getVimeoInfo(url: string): Promise<VideoInfo> {
  const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (!id) throw new Error("Invalid Vimeo URL");
  return getOembedInfo(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`, "vimeo");
}

async function getDailymotionInfo(url: string): Promise<VideoInfo> {
  return getOembedInfo(`https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(url)}&format=json`, "dailymotion");
}

async function getTikTokInfo(url: string): Promise<VideoInfo> {
  return getOembedInfo(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, "tiktok");
}

async function getRedditInfo(url: string): Promise<VideoInfo> {
  const jsonUrl = url.replace(/\/$/, "") + ".json";
  const res = await fetch(jsonUrl, {
    headers: { "User-Agent": "toolhive-bot/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error("Reddit API error");
  const data = await res.json() as unknown[];
  const post = (data[0] as { data?: { children?: Array<{ data?: Record<string, unknown> }> } })
    ?.data?.children?.[0]?.data;
  if (!post) throw new Error("Could not parse Reddit post");
  const media = (post.media as { reddit_video?: { fallback_url?: string; duration?: number } } | null);
  return {
    title:     String(post.title ?? "Reddit Video"),
    author:    String(post.author ?? "Unknown"),
    duration:  media?.reddit_video?.duration ? formatDuration(media.reddit_video.duration) : "—",
    views:     post.score ? `${post.score} upvotes` : null,
    platform:  "reddit",
    thumbnail: (post.thumbnail as string) && (post.thumbnail as string) !== "self" ? (post.thumbnail as string) : null,
  };
}

async function getTwitterInfo(url: string): Promise<VideoInfo> {
  return getOembedInfo(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`, "twitter");
}

async function getPinterestInfo(url: string): Promise<VideoInfo> {
  return getOembedInfo(`https://www.pinterest.com/oembed/?url=${encodeURIComponent(url)}`, "pinterest");
}

async function getGenericInfo(url: string, platform: string): Promise<VideoInfo> {
  // Scrape og: meta tags from the page
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
    signal: AbortSignal.timeout(15_000),
  });
  const html = await res.text();
  const get = (prop: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"))?.[1];
  return {
    title:     get("og:title") ?? get("twitter:title") ?? "Video",
    author:    get("og:site_name") ?? platform,
    duration:  "—",
    views:     null,
    platform,
    thumbnail: get("og:image") ?? get("twitter:image") ?? null,
  };
}

// ─────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url?: string };
    if (!url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const platform = detectPlatform(url.trim());
    let info: VideoInfo;

    switch (platform) {
      case "youtube":
        try {
          info = await getYouTubeInfo(url.trim());
        } catch {
          info = await getOembedInfo(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url.trim())}&format=json`,
            "youtube"
          );
        }
        break;
      case "vimeo":
        info = await getVimeoInfo(url.trim());
        break;
      case "dailymotion":
        info = await getDailymotionInfo(url.trim());
        break;
      case "tiktok":
        info = await getTikTokInfo(url.trim());
        break;
      case "reddit":
        info = await getRedditInfo(url.trim());
        break;
      case "twitter":
        info = await getTwitterInfo(url.trim());
        break;
      case "pinterest":
        info = await getPinterestInfo(url.trim());
        break;
      default:
        // Instagram, Facebook, Twitch, others — try og: tags
        info = await getGenericInfo(url.trim(), platform);
    }

    return NextResponse.json({ success: true, data: info });
  } catch (err: unknown) {
    const msg = String((err as Error)?.message ?? "Failed to fetch video info");
    const friendly =
      msg.toLowerCase().includes("private")       ? "This video is private or unavailable." :
      msg.toLowerCase().includes("age")            ? "This video is age-restricted." :
      msg.toLowerCase().includes("not a youtube")  ? "Invalid URL. Please check the link." :
      msg.toLowerCase().includes("unavailable")    ? "This video is unavailable." :
      "Could not fetch video info. Please check the URL and try again.";
    return NextResponse.json({ success: false, message: friendly }, { status: 500 });
  }
}
