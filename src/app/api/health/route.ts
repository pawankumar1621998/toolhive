import { NextResponse } from "next/server";

async function testGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "hi" }] }], generationConfig: { maxOutputTokens: 5 } }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testMistral() {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testDeepSeek() {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistralai/mistral-7b-instruct", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testNvidiaText() {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testNvidiaVision() {
  const key = process.env.NVIDIA_VISION_API_KEY;
  if (!key) return { status: "missing" };
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "meta/llama-3.2-11b-vision-instruct", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

async function testRemoveBg() {
  const key = process.env.REMOVE_BG_API_KEY;
  if (!key) return { status: "missing" };
  // Just check credits endpoint — no image needed
  try {
    const res = await fetch("https://api.remove.bg/v1.0/account", {
      headers: { "X-Api-Key": key },
      signal: AbortSignal.timeout(8000),
    });
    return { status: res.ok ? "ok" : "error", code: res.status };
  } catch (e) { return { status: "error", error: (e as Error).message }; }
}

export async function GET() {
  const [groq, gemini, mistral, deepseek, openrouter, nvidiaText, nvidiaVision, removeBg] = await Promise.all([
    testGroq(),
    testGemini(),
    testMistral(),
    testDeepSeek(),
    testOpenRouter(),
    testNvidiaText(),
    testNvidiaVision(),
    testRemoveBg(),
  ]);

  const results = {
    groq,
    gemini,
    mistral,
    deepseek,
    openrouter,
    nvidia_text: nvidiaText,
    nvidia_vision: nvidiaVision,
    remove_bg: removeBg,
  };

  const allOk = Object.values(results).every((r) => r.status === "ok");
  const okCount = Object.values(results).filter((r) => r.status === "ok").length;

  return NextResponse.json({
    summary: `${okCount}/${Object.keys(results).length} keys working`,
    all_ok: allOk,
    keys: results,
    checked_at: new Date().toISOString(),
  });
}
