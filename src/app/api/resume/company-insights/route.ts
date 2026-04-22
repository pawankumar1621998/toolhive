import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function callAI(prompt: string): Promise<string> {
  // NVIDIA first
  for (const key of [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2].filter(Boolean)) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "nvidia/llama-3.1-nemotron-nano-8b-instruct", messages: [{ role: "user", content: prompt }], max_tokens: 1024, temperature: 0.6, stream: false }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const out = d.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      }
    } catch { /* next */ }
  }
  // Groq fallback
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 1024, temperature: 0.6 }),
    });
    if (res.ok) {
      const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const out = d.choices?.[0]?.message?.content?.trim();
      if (out) return out;
    }
  } catch { /* next */ }
  // Gemini fallback
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1024 } }),
  });
  const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { company, role, action, resumeData } = await req.json() as {
      company: string;
      role: string;
      action: "insights" | "optimize";
      resumeData?: Record<string, unknown>;
    };

    if (action === "insights") {
      const prompt = `You are a senior recruiter and resume expert with deep knowledge of hiring at top companies.

Provide detailed, specific insights about what makes resumes get SELECTED at ${company} for a ${role || "software engineering"} role.

Return ONLY valid JSON (no markdown, no explanation):
{
  "pageLength": "1 page" or "2 pages",
  "format": "brief description of preferred layout (e.g. clean single-column, two-column with sidebar)",
  "bulletStyle": "how to write bullet points (e.g. STAR format, PAR format, XYZ formula)",
  "keyPrinciples": ["3-4 core values ${company} looks for in resumes"],
  "mustHaveKeywords": ["8-10 keywords/skills that appear in selected resumes at ${company}"],
  "mustHaveSections": ["sections that are required or strongly preferred at ${company}"],
  "avoid": ["3-4 things that get resumes rejected at ${company}"],
  "bulletExample": {
    "bad": "one example of a weak bullet point",
    "good": "same bullet rewritten the way ${company} likes it"
  },
  "insiderTip": "one specific insider tip from someone who has seen ${company} resumes get selected",
  "atsScore": "how strict is ${company} ATS scanning (Low/Medium/High)",
  "hiringVolume": "how competitive is hiring at ${company}"
}`;

      const raw = await callAI(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid AI response");
      const insights = JSON.parse(match[0]);
      return NextResponse.json({ insights });
    }

    if (action === "optimize") {
      const prompt = `You are a professional resume writer who specializes in writing resumes that get selected at ${company}.

The candidate is applying for: ${role || "a software engineering role"} at ${company}.

Their current resume data:
${JSON.stringify(resumeData, null, 2)}

Rewrite and optimize this resume specifically for ${company}. Apply ${company}'s preferred:
- Bullet point style and format
- Keywords and terminology used internally at ${company}
- Quantification and impact metrics
- Cultural alignment language

Return ONLY valid JSON:
{
  "summary": "optimized 2-3 sentence professional summary tailored for ${company}",
  "workExperience": [
    {
      "id": "same id as input",
      "description": "rewritten bullet points optimized for ${company} (newline separated, start each with •)"
    }
  ],
  "skills": {
    "technical": ["optimized technical skills list with ${company}-relevant skills added"],
    "soft": ["optimized soft skills aligned with ${company} values"]
  },
  "optimizationNotes": ["3-4 specific changes made and why they help at ${company}"]
}`;

      const raw = await callAI(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid AI response");
      const optimized = JSON.parse(match[0]);
      return NextResponse.json({ optimized });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
