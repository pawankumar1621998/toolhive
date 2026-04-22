import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Stream from NVIDIA (primary) → Groq (fallback) → Gemini (fallback, non-streaming)
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json() as { prompt: string };
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    // 1. Try NVIDIA streaming (any key available)
    const nvidiaKey =
      process.env.NVIDIA_CODE_API_KEY ??
      process.env.NVIDIA_API_KEY_2 ??
      process.env.NVIDIA_API_KEY;

    if (nvidiaKey) {
      for (const model of [
        "nvidia/llama-3.1-nemotron-70b-instruct",
        "openai/gpt-oss-120b",
        "meta/llama-3.3-70b-instruct",
      ]) {
        try {
          const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvidiaKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 4096,
              stream: true,
            }),
          });
          if (res.ok && res.body) return streamResponse(res.body);
        } catch {}
      }
    }

    // 2. Try Groq streaming
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
            stream: true,
          }),
        });
        if (res.ok && res.body) return streamResponse(res.body);
      } catch {}
    }

    // 3. Fallback: Gemini non-streaming → fake-stream word by word
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          return fakeStream(text);
        }
      } catch {}
    }

    return NextResponse.json({ error: "All providers failed" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

function streamResponse(body: ReadableStream<Uint8Array>) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  (async () => {
    const reader = body.getReader();
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
}

// Simulate streaming for non-streaming providers
function fakeStream(text: string) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: word } }] })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
