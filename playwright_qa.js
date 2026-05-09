const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:3000';
const TIMEOUT = 20000;

// Build Chrome path dynamically to avoid backslash escaping issues
const CHROME_PATH = require('path').join(
  process.env.LOCALAPPDATA || 'C:\\Users\\M.K COMPUTERS\\AppData\\Local',
  'ms-playwright',
  'chromium-1217',
  'chrome-win64',
  'chrome.exe'
);

const pages = [
  { name: '/tools', url: '/tools' },
  { name: '/tools/pdf', url: '/tools/pdf' },
  { name: '/tools/image', url: '/tools/image' },
  { name: '/tools/calculator', url: '/tools/calculator' },
  { name: '/tools/ai-writing', url: '/tools/ai-writing' },
];

const tools = [
  { name: 'img-compress', url: '/tools/image/img-compress' },
  { name: 'resize', url: '/tools/image/resize' },
  { name: 'age', url: '/tools/calculator/age' },
  { name: 'bmi', url: '/tools/calculator/bmi' },
  { name: 'password-generator', url: '/tools/generators/password-generator' },
  { name: 'qr-code', url: '/tools/generators/qr-code' },
];

async function runTests() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });

  const results = {
    pages: [],
    tools: [],
    consoleErrors: [],
  };

  // Test pages
  console.log('\n=== Testing Pages ===\n');
  for (const page of pages) {
    const ctx = await context.newPage();
    const errors = [];
    ctx.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    ctx.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

    try {
      const response = await ctx.goto(BASE_URL + page.url, { timeout: 20000 });
      const status = response ? response.status() : 0;

      const title = await ctx.title().catch(() => '');
      const bodyText = await ctx.evaluate(() => document.body ? document.body.innerText.substring(0, 200) : '').catch(() => '');

      const result = {
        name: page.name,
        status,
        loaded: status === 200,
        title,
        bodySnippet: bodyText,
        errors,
      };
      results.pages.push(result);

      const statusStr = status === 200 ? 'OK' : status === 404 ? '404' : status;
      console.log(`[${statusStr}] ${page.name}${errors.length ? ' - ' + errors.length + ' error(s)' : ''}`);
      if (errors.length) {
        errors.forEach(e => {
          console.log(`  ERROR: ${e.substring(0, 150)}`);
          results.consoleErrors.push({ page: page.name, error: e });
        });
      }
    } catch (e) {
      results.pages.push({ name: page.name, loaded: false, error: e.message, errors });
      console.log(`[FAIL] ${page.name} - ${e.message}`);
      errors.forEach(e => results.consoleErrors.push({ page: page.name, error: e }));
    }
    await ctx.close();
  }

  // Test tools
  console.log('\n=== Testing Tools ===\n');
  for (const tool of tools) {
    const ctx = await context.newPage();
    const errors = [];
    ctx.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    ctx.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

    try {
      const response = await ctx.goto(BASE_URL + tool.url, { timeout: 20000 });
      const status = response ? response.status() : 0;

      // Check for key elements
      const elements = await ctx.evaluate(() => {
        const checks = {};
        checks.hasH1 = !!document.querySelector('h1');
        checks.hasForm = !!document.querySelector('form');
        checks.hasInput = !!document.querySelector('input, textarea');
        checks.hasButton = !!document.querySelector('button');
        checks.h1Text = document.querySelector('h1') ? document.querySelector('h1').innerText.substring(0, 80) : '';
        return checks;
      }).catch(() => ({}));

      // Try filling in forms
      let formFilled = false;
      let formSubmitted = false;

      try {
        // Fill first input if exists
        const input = await ctx.$('input[type="text"], input[type="number"], input[type="email"], textarea');
        if (input) {
          await input.fill('test');
          formFilled = true;
        }

        // Check for submit button and click it
        const submitBtn = await ctx.$('button[type="submit"]');
        if (submitBtn) {
          await submitBtn.click();
          await ctx.waitForTimeout;
          formSubmitted = true;
        }
      } catch (e) {
        // Form interaction failed
      }

      const result = {
        name: tool.name,
        status,
        loaded: status === 200,
        elements,
        errors,
        formFilled,
        formSubmitted,
      };
      results.tools.push(result);

      const statusStr = status === 200 ? 'OK' : status === 404 ? '404' : status;
      const formStatus = formSubmitted ? 'SUBMITTED' : formFilled ? 'FILLED' : '';
      console.log(`[${statusStr}] ${tool.name} ${formStatus}${errors.length ? ' - ' + errors.length + ' error(s)' : ''}`);
      if (errors.length) {
        errors.forEach(e => {
          console.log(`  ERROR: ${e.substring(0, 150)}`);
          results.consoleErrors.push({ page: tool.name, error: e });
        });
      }
    } catch (e) {
      results.tools.push({ name: tool.name, loaded: false, error: e.message, errors });
      console.log(`[FAIL] ${tool.name} - ${e.message}`);
      errors.forEach(e => results.consoleErrors.push({ page: tool.name, error: e }));
    }
    await ctx.close();
  }

  await browser.close();

  // Print summary
  console.log('\n\n');
  console.log('========================================');
  console.log('         QA TEST RESULTS               ');
  console.log('========================================\n');

  console.log('### Page Load Tests\n');
  for (const r of results.pages) {
    const statusStr = r.loaded ? `HTTP ${r.status}` : 'FAILED';
    console.log(`- ${r.name}: ${statusStr}`);
  }

  console.log('\n### Working Pages\n');
  for (const r of results.pages.filter(p => p.loaded)) {
    console.log(`- ${r.name} - "${r.title}"`);
  }

  console.log('\n### Broken Pages\n');
  for (const r of results.pages.filter(p => !p.loaded)) {
    console.log(`- ${r.name}: ${r.error || 'HTTP ' + r.status}`);
  }

  console.log('\n### Tool Functionality\n');
  for (const r of results.tools) {
    const status = r.loaded ? 'LOADED' : 'BROKEN';
    const formStatus = r.formSubmitted ? 'Form submitted successfully' : r.formFilled ? 'Form filled' : 'No form interaction';
    console.log(`- ${r.name}: ${status} - ${formStatus}`);
  }

  console.log('\n### Console Errors\n');
  if (results.consoleErrors.length === 0) {
    console.log('No console errors detected.');
  } else {
    for (const e of results.consoleErrors) {
      console.log(`- [${e.page}] ${e.error.substring(0, 200)}`);
    }
  }

  console.log('\n### Recommendations\n');
  const broken = results.pages.filter(p => !p.loaded).map(p => p.name);
  const errorPages = [...new Set(results.consoleErrors.map(e => e.page))];
  if (broken.length) {
    console.log('- Fix broken pages: ' + broken.join(', '));
  }
  if (errorPages.length) {
    console.log('- Investigate errors on: ' + errorPages.join(', '));
  }
  if (!broken.length && !errorPages.length) {
    console.log('- All pages loaded successfully with no console errors.');
  }

  console.log('\n========================================\n');
}

runTests().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});