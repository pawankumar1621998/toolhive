const Tesseract = require('tesseract.js');
const path = require('path');

const imagePath = 'C:/Users/M.K COMPUTERS/Pictures/Screenshots/Screenshot 2026-05-15 234841.png';

async function extractText() {
  console.log('Starting OCR extraction...');

  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: m => console.log(m.status, m.progress)
  });

  console.log('\n--- Extracted Text ---\n');
  console.log(result.data.text);

  console.log('\n--- Confidence ---');
  console.log(result.data.confidence);
}

extractText().catch(console.error);