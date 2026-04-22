import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are an expert AI coding assistant — like a senior software engineer who writes clean, well-structured, production-ready code.

Rules:
- Always wrap code blocks with triple backticks and the language name (e.g. \`\`\`python ... \`\`\`)
- Add brief comments for complex logic
- Write complete, runnable code — no "..." placeholders
- If the user asks in any language (Hindi, Urdu, etc.), respond in that language but keep code in English
- For multi-file projects, clearly label each file
- Prefer modern syntax and best practices for each language`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as {
    messages: Array<{ role: string; content: string }>;
  };

  const key = process.env.NVIDIA_CODE_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "API key missing" }), { status: 500 });
  }

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/magistral-small-2506",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 40960,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ error: err }), { status: res.status });
  }

  // Stream the response directly to the client
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
