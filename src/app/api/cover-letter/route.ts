import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function callAI(prompt: string, maxTokens = 1200): Promise<string> {
  for (const key of [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2].filter(Boolean)) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "nvidia/llama-3.1-nemotron-nano-8b-instruct", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.7, stream: false }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const out = d.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      }
    } catch { /* next */ }
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.7 }),
    });
    if (res.ok) {
      const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const out = d.choices?.[0]?.message?.content?.trim();
      if (out) return out;
    }
  } catch { /* next */ }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
  });
  const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { company, role, action, form } = await req.json() as {
      company: string; role: string; action: "insights" | "generate";
      form?: {
        fullName: string; email: string; phone: string; location: string; linkedin: string;
        currentRole: string; achievement: string; whyCompany: string; additionalNotes: string; tone: string;
      };
    };

    if (action === "insights") {
      const prompt = `You are a hiring expert who knows exactly what top companies look for in cover letters.

Give specific cover letter tips for ${company} for a ${role || "software engineering"} role.

Return ONLY valid JSON (no markdown):
{
  "tonePreference": "one sentence on preferred writing tone",
  "format": "1 page or specific format note",
  "keyPrinciples": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "mustMention": ["thing 1", "thing 2", "thing 3", "thing 4"],
  "avoid": ["mistake 1", "mistake 2", "mistake 3"],
  "openingExample": "one strong opening line example",
  "insiderTip": "one insider tip about ${company}'s hiring culture"
}`;

      const raw = await callAI(prompt, 800);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const insights = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ insights });
    }

    if (action === "generate" && form) {
      const prompt = `Write a professional cover letter for ${form.fullName || "the applicant"} applying to ${company} for a ${role || "software engineering"} position.

Details:
- Applicant: ${form.fullName}, currently: ${form.currentRole || "a professional"}
- Contact: ${form.email} | ${form.phone} | ${form.location}
- LinkedIn: ${form.linkedin || "not provided"}
- Key achievement: ${form.achievement || "not specified"}
- Why ${company}: ${form.whyCompany || "passionate about the company's mission"}
- Additional notes: ${form.additionalNotes || "none"}
- Tone: ${form.tone || "professional"}

Write a compelling, ${form.tone || "professional"} cover letter with:
1. Strong opening hook that mentions ${company} specifically
2. 2-3 body paragraphs showcasing skills and fit
3. Brief closing with call to action

Format as plain text. Use proper letter format. Do NOT use placeholder brackets like [Name] — use the actual provided information. Start directly with "Dear Hiring Team at ${company}," or similar. End with "Sincerely," and the name.`;

      const letter = await callAI(prompt, 1200);
      return NextResponse.json({ letter });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
