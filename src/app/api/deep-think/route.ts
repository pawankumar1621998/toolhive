import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: string; content: string }>;
    };

    const key =
      process.env.NVIDIA_THINKING_API_KEY ??
      process.env.NVIDIA_API_KEY;

    if (!key) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "z-ai/glm-5.1",
        messages,
        temperature: 1,
        top_p: 1,
        max_tokens: 16384,
        chat_template_kwargs: { enable_thinking: true, clear_thinking: false },
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    (async () => {
      const reader = res.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
