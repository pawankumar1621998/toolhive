const { chromium } = require('playwright');
const fs = require('fs');

async function runTest() {
  console.log('Starting test at', new Date().toISOString());

  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  console.log('Browser launched');

  const context = await browser.newContext();
  const page = await context.newPage();
  console.log('Page created, URL:', page.url());

  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text().substring(0, 200)}`);
  });
  page.on('pageerror', err => consoleLogs.push(`[pageerror] ${err.message.substring(0, 200)}`));

  const pages = [
    '/tools',
    '/tools/pdf',
    '/tools/image',
    '/tools/calculator',
    '/tools/ai-writing'
  ];

  const results = [];

  for (const path of pages) {
    console.log(`\nTesting: http://127.0.0.1:3000${path}`);
    try {
      const response = await page.goto(`http://127.0.0.1:3000${path}`, {
        timeout: 20000,
        waitUntil: 'load'
      });
      console.log(`  Response status: ${response ? response.status() : 'null'}`);
      console.log(`  Current URL: ${page.url()}`);
      console.log(`  Title: ${await page.title()}`);

      const bodyHTML = await page.evaluate(() => document.body ? document.body.innerHTML.substring(0, 500) : 'NO BODY');
      console.log(`  Body snippet: ${bodyHTML.substring(0, 200)}`);

      results.push({ path, status: response ? response.status() : 0, success: true });
    } catch (e) {
      console.log(`  Error: ${e.message.substring(0, 300)}`);
      console.log(`  Current URL: ${page.url()}`);
      results.push({ path, error: e.message.substring(0, 200), success: false });
    }
  }

  // Test tool pages
  const tools = [
    '/tools/image/img-compress',
    '/tools/image/resize',
    '/tools/calculator/age',
    '/tools/calculator/bmi',
    '/tools/generators/password-generator',
    '/tools/generators/qr-code'
  ];

  for (const path of tools) {
    console.log(`\nTesting tool: http://127.0.0.1:3000${path}`);
    try {
      const response = await page.goto(`http://127.0.0.1:3000${path}`, {
        timeout: 20000,
        waitUntil: 'load'
      });
      console.log(`  Response status: ${response ? response.status() : 'null'}`);
      console.log(`  Current URL: ${page.url()}`);
      console.log(`  Title: ${await page.title()}`);

      results.push({ path, status: response ? response.status() : 0, success: true });
    } catch (e) {
      console.log(`  Error: ${e.message.substring(0, 300)}`);
      console.log(`  Current URL: ${page.url()}`);
      results.push({ path, error: e.message.substring(0, 200), success: false });
    }
  }

  await browser.close();

  // Output summary
  console.log('\n\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nConsole logs:', consoleLogs.slice(0, 20));
}

runTest().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});