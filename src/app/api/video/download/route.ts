import { NextRequest, NextResponse } from "next/server";

// Skip Cobalt (returns wrong content) — always proxy through Render backend
// which uses yt-dlp and downloads exactly the requested URL.

const RENDER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const { url, quality = "720p" } = await req.json() as { url?: string; quality?: string };
    if (!url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const cleanUrl = url.trim();
    const isAudio  = quality === "mp3";

    // Return the Render backend stream URL directly.
    // Backend sends Content-Disposition: attachment headers immediately (<1s),
    // then pipes yt-dlp stdout in real-time — browser stays on current page.
    const downloadUrl =
      `${RENDER_URL}/video/download` +
      `?url=${encodeURIComponent(cleanUrl)}` +
      `&quality=${encodeURIComponent(quality)}`;

    return NextResponse.json({
      success:     true,
      downloadUrl,
      filename:    isAudio ? "audio.mp3" : "video.mp4",
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
