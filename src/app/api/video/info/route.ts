import { NextRequest, NextResponse } from "next/server";

const RENDER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://toolhive-backend.onrender.com/api/v1").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string };
    if (!body.url?.trim()) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const res = await fetch(`${RENDER_URL}/video/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: body.url.trim() }),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "Failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
