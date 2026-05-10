import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

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
        temperature: 0.7,
        top_p: 1,
        max_tokens: 4096,
        chat_template_kwargs: { enable_thinking: true, clear_thinking: false },
      }),
      signal: (() => { const ac = new AbortController(); setTimeout(() => ac.abort(), 240000); return ac.signal; })(),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json() as {
      choices?: Array<{
        message?: {
          content?: string;
          reasoning_content?: string;
        };
      }>;
    };

    // Return both reasoning and final content
    return NextResponse.json({
      reasoning: data.choices?.[0]?.message?.reasoning_content ?? "",
      content: data.choices?.[0]?.message?.content ?? "",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}