import { NextRequest } from "next/server";

// Allowed upstream domains — prevents open-proxy abuse
const ALLOWED = [
  /googlevideo\.com/i,
  /ytimg\.com/i,
  /tikwm\.com/i,
  /tiktokcdn\.com/i,
  /vimeocdn\.com/i,
  /vimeo\.com/i,
  /fbcdn\.net/i,
  /twimg\.com/i,
  /cdninstagram\.com/i,
];

function allowed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED.some(re => re.test(hostname));
  } catch { return false; }
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw) return new Response("Missing ?u param", { status: 400 });

  let upstreamUrl: string;
  try { upstreamUrl = decodeURIComponent(raw); } catch { return new Response("Bad URL encoding", { status: 400 }); }

  if (!allowed(upstreamUrl)) {
    return new Response("Domain not allowed", { status: 403 });
  }

  const fetchHeaders: Record<string, string> = { "User-Agent": UA };
  const range = req.headers.get("range");
  if (range) fetchHeaders["Range"] = range;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: fetchHeaders,
      signal: AbortSignal.timeout(30_000),
    });

    const resHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    };

    for (const h of ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"]) {
      const v = upstream.headers.get(h);
      if (v) resHeaders[h] = v;
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    return new Response((err as Error).message ?? "Proxy error", { status: 502 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
    },
  });
}
