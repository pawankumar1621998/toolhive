const fs = require('fs');

async function runTests() {
  const test1Buf = fs.readFileSync('public/test1.pdf');
  const test2Buf = fs.readFileSync('public/test2.pdf');

  const tests = [
    { name: 'compress', slug: 'compress', opts: { quality: '75' }, files: [['test1.pdf', test1Buf]] },
    { name: 'split', slug: 'split', opts: {}, files: [['test1.pdf', test1Buf]] },
    { name: 'rotate', slug: 'rotate', opts: { angle: '90' }, files: [['test1.pdf', test1Buf]] },
    { name: 'unlock', slug: 'unlock', opts: {}, files: [['test1.pdf', test1Buf]] },
    { name: 'sign', slug: 'sign', opts: { signerName: 'QA Tester' }, files: [['test1.pdf', test1Buf]] },
    { name: 'watermark', slug: 'watermark', opts: { text: 'TEST WATERMARK', opacity: '30' }, files: [['test1.pdf', test1Buf]] },
    { name: 'page-numbers', slug: 'page-numbers', opts: { startNumber: '1' }, files: [['test1.pdf', test1Buf]] },
    { name: 'protect', slug: 'protect', opts: { password: 'test123' }, files: [['test1.pdf', test1Buf]], expectFail: true },
    { name: 'pdf-to-jpg', slug: 'pdf-to-jpg', opts: {}, files: [['test1.pdf', test1Buf]], expectFail: true },
    { name: 'header-footer', slug: 'header-footer', opts: { headerText: 'Test Header', footerText: 'Page {page}' }, files: [['test1.pdf', test1Buf]] },
    { name: 'repair-pdf', slug: 'repair-pdf', opts: {}, files: [['test1.pdf', test1Buf]] },
    { name: 'pdf-to-pdfa', slug: 'pdf-to-pdfa', opts: {}, files: [['test1.pdf', test1Buf]] },
    { name: 'crop-pdf', slug: 'crop-pdf', opts: { margin: '36' }, files: [['test1.pdf', test1Buf]] },
    { name: 'compare-pdf', slug: 'compare-pdf', opts: {}, files: [['test1.pdf', test1Buf], ['test2.pdf', test2Buf]] },
    { name: 'organize-pdf', slug: 'organize-pdf', opts: {}, files: [['test1.pdf', test1Buf]] },
    { name: 'edit-pdf', slug: 'edit-pdf', opts: { text: 'Test annotation' }, files: [['test1.pdf', test1Buf]] },
    { name: 'redact-pdf', slug: 'redact-pdf', opts: { keyword: 'Test' }, files: [['test1.pdf', test1Buf]] },
  ];

  for (const t of tests) {
    try {
      const fd = new FormData();
      fd.append('toolSlug', t.slug);
      fd.append('options', JSON.stringify(t.opts));
      for (const [fname, buf] of t.files) {
        fd.append('files', new Blob([buf]), fname);
      }
      const res = await fetch('http://localhost:3001/api/tools/process', { method: 'POST', body: fd });
      const d = await res.json();
      if (d.error) {
        if (t.expectFail) {
          console.log(t.name + ': EXPECTED_FAIL - ' + d.error.substring(0, 100));
        } else {
          console.log(t.name + ': FAIL - ' + d.error.substring(0, 100));
        }
      } else {
        const outName = d.files.length + ' file(s)';
        console.log(t.name + ': PASS - ' + outName);
        if (d.files[0] && d.files[0].data) {
          const ext = d.files[0].name.split('.').pop();
          const safeName = 'public/qa_' + t.name + '_result.' + ext;
          try {
            fs.writeFileSync(safeName, Buffer.from(d.files[0].data, 'base64'));
          } catch(e) {}
        }
      }
    } catch(e) {
      console.log(t.name + ': ERROR - ' + e.message);
    }
    // Rate limit: wait between requests
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('=== PDF tests done ===');
}
runTests().catch(e => console.log('FATAL:', e.message));
