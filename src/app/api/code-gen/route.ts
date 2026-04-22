import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert AI coding assistant — like a senior software engineer who writes clean, well-structured, production-ready code.

Rules:
- Always wrap code blocks with triple backticks and the language name (e.g. \`\`\`python ... \`\`\`)
- Add brief comments for complex logic
- Write complete, runnable code — no "..." placeholders
- If the user asks in any language (Hindi, Urdu, etc.), respond in that language but keep code in English
- For multi-file projects, clearly label each file
- Prefer modern syntax and best practices for each language`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: string; content: string }>;
    };

    // Use dedicated code key, fall back to main NVIDIA key
    const key = process.env.NVIDIA_CODE_API_KEY
      ?? process.env.NVIDIA_API_KEY_2
      ?? process.env.NVIDIA_API_KEY;

    if (!key) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 });
    }

    // Try models in order — fall back if first is unavailable
    const MODELS = [
      "mistralai/magistral-small-2506",
      "nvidia/llama-3.1-nemotron-70b-instruct",
      "meta/llama-3.3-70b-instruct",
    ];

    let nvidiaRes: Response | null = null;
    let lastErr = "";

    for (const model of MODELS) {
      try {
        const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages,
            ],
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 8192,
            stream: true,
          }),
        });
        if (r.ok) { nvidiaRes = r; break; }
        lastErr = `${model}: ${r.status}`;
      } catch (e) {
        lastErr = (e as Error).message;
      }
    }

    if (!nvidiaRes) {
      return NextResponse.json({ error: `All models failed. Last: ${lastErr}` }, { status: 503 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      const reader = nvidiaRes!.body!.getReader();
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
