import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function callNvidia(prompt: string): Promise<string> {
  const key = process.env.NVIDIA_API_KEY ?? process.env.NVIDIA_API_KEY_2;
  if (!key) throw new Error("No NVIDIA key");
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nvidia/llama-3.1-nemotron-nano-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0.7,
      stream: false,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}`);
  const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return d.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("No Groq key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return d.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No Gemini key");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 512 } }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function getAI(prompt: string): Promise<string> {
  for (const fn of [callNvidia, callGroq, callGemini]) {
    try {
      const out = await fn(prompt);
      if (out) return out;
    } catch { /* try next */ }
  }
  throw new Error("All AI providers failed");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: "bullets" | "summary";
      position?: string;
      company?: string;
      existing?: string;
      name?: string;
      jobTitle?: string;
      experience?: string;
      skills?: string;
    };

    let prompt = "";

    if (body.type === "bullets") {
      prompt = `You are a professional resume writer. Generate 3–4 strong resume bullet points for the following work experience.

Position: ${body.position || "Unknown"}
Company: ${body.company || "Unknown"}
${body.existing ? `Existing description (improve if provided): ${body.existing}` : ""}

Rules:
- Start each bullet with a strong action verb (Developed, Led, Increased, Managed, etc.)
- Include quantifiable achievements where possible (%, $, numbers)
- Keep each bullet under 15 words
- Return ONLY the bullet points, one per line, starting with •
- No extra text, no explanations`;
    } else {
      prompt = `You are a professional resume writer. Write a concise, powerful professional summary for a resume.

Name: ${body.name || ""}
Job Title: ${body.jobTitle || "Professional"}
Experience: ${body.experience || ""}
Key Skills: ${body.skills || ""}

Rules:
- Write 2–3 sentences maximum
- Start with years of experience or expertise level
- Mention key skills and value you bring
- Sound human and confident, not generic
- Return ONLY the summary text, no labels or headings`;
    }

    const result = await getAI(prompt);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
