import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

async function callAI(prompt: string): Promise<string> {
  for (const key of [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2].filter(Boolean)) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nvidia/llama-3.1-nemotron-nano-8b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000, temperature: 0.4, stream: false,
        }),
        signal: AbortSignal.timeout(25000),
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
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000, temperature: 0.4,
      }),
    });
    if (res.ok) {
      const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const out = d.choices?.[0]?.message?.content?.trim();
      if (out) return out;
    }
  } catch { /* next */ }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2000 } }),
  });
  const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { documentType, documentText } = await req.json() as { documentType: string; documentText: string };

    if (!documentText || documentText.trim().length < 50) {
      return NextResponse.json({ error: "Document text is too short. Please paste the full document." }, { status: 400 });
    }

    const truncated = documentText.slice(0, 6000);

    const prompt = `You are an expert legal analyst. Analyze this ${documentType} document and provide a comprehensive breakdown in simple, plain language that a non-lawyer can understand.

DOCUMENT:
"""
${truncated}
"""

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "summary": "2-3 sentence plain English summary of what this document is about and its main purpose",
  "riskScore": 65,
  "riskLevel": "Medium",
  "riskExplanation": "one sentence explaining the risk level",
  "rights": [
    "Right 1: plain language explanation",
    "Right 2: plain language explanation",
    "Right 3: plain language explanation"
  ],
  "obligations": [
    "Obligation 1: what you must do",
    "Obligation 2: what you must do",
    "Obligation 3: what you must do"
  ],
  "redFlags": [
    { "clause": "short clause title", "explanation": "why this is concerning in plain language", "severity": "High" },
    { "clause": "short clause title", "explanation": "why this is concerning", "severity": "Medium" }
  ],
  "financialTerms": [
    "Financial term 1: amount/percentage and what it means",
    "Financial term 2: penalty/fee description"
  ],
  "importantDates": [
    "Date/deadline 1 and what happens",
    "Date/deadline 2 and what happens"
  ],
  "questionsToAsk": [
    "Question 1 to ask before signing",
    "Question 2 to ask",
    "Question 3 to ask",
    "Question 4 to ask"
  ],
  "actionItems": [
    "Action 1: specific thing to do or check",
    "Action 2: specific thing to do or check",
    "Action 3: specific thing to do or check"
  ],
  "verdict": "one sentence overall verdict — should you sign as-is, negotiate, or avoid?"
}

riskScore must be 0-100. riskLevel must be "Low", "Medium", or "High". severity in redFlags must be "Low", "Medium", or "High".`;

    const raw = await callAI(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
