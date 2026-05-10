import fetch from 'node-fetch';

const apiKeys = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
};

async function testAPI(name, testFn) {
  try {
    const result = await testFn();
    return { name, status: '✅ Working', detail: result };
  } catch (e) {
    return { name, status: '❌ Failed', detail: e.message.substring(0, 100) };
  }
}

async function main() {
  console.log('\n🔍 Testing all API keys...\n');

  const tests = [
    await testAPI('GROQ_API_KEY', async () => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKeys.GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('MISTRAL_API_KEY', async () => {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKeys.MISTRAL_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral-small-latest', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('DEEPSEEK_API_KEY', async () => {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKeys.DEEPSEEK_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('GEMINI_API_KEY', async () => {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKeys.GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 5 } })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('NVIDIA_API_KEY', async () => {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKeys.NVIDIA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nvidia/llama-3.1-nemotron-nano-8b-instruct', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('NVIDIA_API_KEY_2', async () => {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.NVIDIA_API_KEY_2, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta/llama-3.3-70b-instruct', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('NVIDIA_VISION_API_KEY', async () => {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKeys.NVIDIA_VISION_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta/llama-3.2-11b-vision-instruct', messages: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('OPENROUTER_API_KEY', async () => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKeys.OPENROUTER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('ANTHROPIC_API_KEY', async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKeys.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 })
      });
      return 'Status: ' + res.status;
    }),

    await testAPI('REMOVE_BG_API_KEY', async () => {
      const res = await fetch('https://api.remove.bg/v1.0/account', {
        headers: { 'X-Api-Key': apiKeys.REMOVE_BG_API_KEY }
      });
      return 'Status: ' + res.status;
    }),
  ];

  for (const test of tests) {
    if (test.status === '✅ Working') {
      console.log(`✅ ${test.name}: ${test.status} (${test.detail})`);
    } else {
      console.log(`❌ ${test.name}: ${test.status} - ${test.detail}`);
    }
  }
}

main().catch(console.error);