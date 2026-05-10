const fetch = require('node-fetch');

const API_KEYS = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  NVIDIA_API_KEY_2: process.env.NVIDIA_API_KEY_2,
  NVIDIA_VISION_API_KEY: process.env.NVIDIA_VISION_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
};

const testPrompt = "Say 'API is working' in exactly 3 words.";

async function testAPI(name, callFn) {
  const start = Date.now();
  try {
    const result = await callFn();
    const time = Date.now() - start;
    return { name, status: '✅ WORKING', response: result.substring(0, 100), time: time + 'ms' };
  } catch (e) {
    const time = Date.now() - start;
    return { name, status: '❌ FAILED', error: e.message.substring(0, 80), time: time + 'ms' };
  }
}

async function main() {
  console.log('\n🧪 Testing API Keys with Actual AI Calls\n');
  console.log('Prompt: "' + testPrompt + '"\n');
  console.log('─'.repeat(70));

  const tests = [
    await testAPI('GROQ_API_KEY', async () => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEYS.GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.choices[0].message.content;
    }),

    await testAPI('MISTRAL_API_KEY', async () => {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEYS.MISTRAL_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.choices[0].message.content;
    }),

    await testAPI('DEEPSEEK_API_KEY', async () => {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEYS.DEEPSEEK_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.choices[0].message.content;
    }),

    await testAPI('GEMINI_API_KEY', async () => {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEYS.GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testPrompt }] }],
          generationConfig: { maxOutputTokens: 20 }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.candidates[0].content.parts[0].text;
    }),

    await testAPI('NVIDIA_API_KEY', async () => {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEYS.NVIDIA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nvidia/llama-3.1-nemotron-nano-8b-instruct',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.choices[0].message.content;
    }),

    await testAPI('NVIDIA_API_KEY_2 (Llama)', async () => {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEYS.NVIDIA_API_KEY_2, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.choices[0].message.content;
    }),

    await testAPI('OPENROUTER_API_KEY', async () => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEYS.OPENROUTER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.choices[0].message.content;
    }),

    await testAPI('ANTHROPIC_API_KEY', async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEYS.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (data.error?.message || 'Unknown error'));
      return data.content[0].text;
    }),
  ];

  let working = 0;
  let failed = 0;

  for (const test of tests) {
    if (test.status === '✅ WORKING') {
      working++;
      console.log(`\n✅ ${test.name}`);
      console.log(`   Response: "${test.response}"`);
      console.log(`   Time: ${test.time}`);
    } else {
      failed++;
      console.log(`\n❌ ${test.name}`);
      console.log(`   Error: ${test.error}`);
      console.log(`   Time: ${test.time}`);
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Working: ${working}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${tests.length}\n`);
}

main().catch(console.error);