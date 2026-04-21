import { NextRequest, NextResponse } from "next/server";

const RENDER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const { url, quality = "720p" } = await req.json() as { url?: string; quality?: string };
    if (!url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const isAudio = quality === "mp3";
    const downloadUrl =
      `${RENDER_URL}/video/download` +
      `?url=${encodeURIComponent(url.trim())}` +
      `&quality=${encodeURIComponent(quality)}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      filename: isAudio ? "audio.mp3" : "video.mp4",
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
