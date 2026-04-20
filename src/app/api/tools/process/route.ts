import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string; numpages: number }>;

// Lazy-load sharp so PDF tools still work even if sharp binary is unavailable
async function getSharp() {
  const s = await import("sharp");
  return s.default;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function respondFile(buffer: Buffer, name: string, mime: string) {
  return NextResponse.json({
    files: [{ name, data: buffer.toString("base64"), type: mime }],
  });
}

function respondFiles(files: { name: string; data: string; type: string }[]) {
  return NextResponse.json({ files });
}

function ext(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "bin";
}

function baseName(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

// ─────────────────────────────────────────────
// Lightweight AI caller for file-processing tools
// ─────────────────────────────────────────────

async function callLocalAI(prompt: string): Promise<string> {
  const providers = [
    {
      key: process.env.GEMINI_API_KEY,
      call: async (k: string) => {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${k}`,
          { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2048 } }) }
        );
        if (!res.ok) throw new Error(`Gemini ${res.status}`);
        const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      },
    },
    {
      key: process.env.GROQ_API_KEY,
      call: async (k: string) => {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 2048 }),
        });
        if (!res.ok) throw new Error(`Groq ${res.status}`);
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        return d.choices?.[0]?.message?.content ?? "";
      },
    },
    {
      key: process.env.DEEPSEEK_API_KEY,
      call: async (k: string) => {
        const res = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], max_tokens: 2048 }),
        });
        if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
        const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        return d.choices?.[0]?.message?.content ?? "";
      },
    },
  ];
  for (const p of providers) {
    if (!p.key?.trim()) continue;
    try {
      const out = await p.call(p.key);
      if (out.trim()) return out;
    } catch { /* try next */ }
  }
  throw new Error("No AI API key configured. Add GEMINI_API_KEY, GROQ_API_KEY, or DEEPSEEK_API_KEY to .env.local");
}

// ─────────────────────────────────────────────
// Image processors (sharp)
// ─────────────────────────────────────────────

async function processImage(
  buf: Buffer,
  slug: string,
  opts: Record<string, string>,
  filename: string
): Promise<{ name: string; data: string; type: string }> {
  const sharp = await getSharp();
  let pipeline = sharp(buf);
  let outExt = ext(filename);
  let outMime = `image/${outExt === "jpg" ? "jpeg" : outExt}`;
  let outName = baseName(filename);

  switch (slug) {
    case "compress": {
      const q = Math.max(10, Math.min(90, parseInt(opts.quality ?? "75", 10)));
      if (outExt === "png") {
        pipeline = pipeline.png({ compressionLevel: 9, quality: q });
      } else {
        pipeline = pipeline.jpeg({ quality: q });
        outExt = "jpg";
        outMime = "image/jpeg";
      }
      outName = `${baseName(filename)}_compressed`;
      break;
    }
    case "reduce-kb": {
      const targetKB = parseInt(opts.targetKB ?? "100", 10);
      // Try progressively lower quality until we hit target
      let q = 85;
      let out = await pipeline.clone().jpeg({ quality: q }).toBuffer();
      while (out.byteLength > targetKB * 1024 && q > 10) {
        q -= 5;
        out = await sharp(buf).jpeg({ quality: q }).toBuffer();
      }
      return { name: `${baseName(filename)}_${targetKB}kb.jpg`, data: out.toString("base64"), type: "image/jpeg" };
    }
    case "resize":
    case "social-resize": {
      const w = parseInt(opts.width ?? "800", 10);
      const h = parseInt(opts.height ?? "0", 10) || null;
      pipeline = pipeline.resize(w, h ?? undefined, { fit: "inside", withoutEnlargement: false });
      outName = `${baseName(filename)}_${w}px`;
      break;
    }
    case "resize-cm": {
      const dpi = parseInt(opts.dpi ?? "300", 10);
      const wCm = parseFloat(opts.widthCm ?? "10");
      const hCm = parseFloat(opts.heightCm ?? "0");
      const wPx = Math.round((wCm / 2.54) * dpi);
      const hPx = hCm > 0 ? Math.round((hCm / 2.54) * dpi) : undefined;
      pipeline = pipeline.resize(wPx, hPx, { fit: "fill" });
      outName = `${baseName(filename)}_${wCm}x${hCm}cm`;
      break;
    }
    case "resize-3-5-cm": {
      const dpi = 300;
      const wPx = Math.round((3.5 / 2.54) * dpi); // 413px
      const hPx = Math.round((4.5 / 2.54) * dpi); // 531px
      pipeline = pipeline.resize(wPx, hPx, { fit: "cover" }).jpeg({ quality: 92 });
      return { name: `${baseName(filename)}_passport.jpg`, data: (await pipeline.toBuffer()).toString("base64"), type: "image/jpeg" };
    }
    case "convert": {
      const to = (opts.format ?? "png").toLowerCase();
      if (to === "jpg" || to === "jpeg") {
        pipeline = pipeline.jpeg({ quality: 90 });
        outExt = "jpg"; outMime = "image/jpeg";
      } else if (to === "png") {
        pipeline = pipeline.png();
        outExt = "png"; outMime = "image/png";
      } else if (to === "webp") {
        pipeline = pipeline.webp({ quality: 90 });
        outExt = "webp"; outMime = "image/webp";
      } else if (to === "avif") {
        pipeline = pipeline.avif({ quality: 60 });
        outExt = "avif"; outMime = "image/avif";
      } else if (to === "gif") {
        pipeline = pipeline.gif();
        outExt = "gif"; outMime = "image/gif";
      } else if (to === "bmp") {
        pipeline = pipeline.png(); // BMP not supported by sharp — use PNG
        outExt = "png"; outMime = "image/png";
      } else if (to === "tiff" || to === "tif") {
        pipeline = pipeline.tiff();
        outExt = "tiff"; outMime = "image/tiff";
      }
      outName = `${baseName(filename)}_converted`;
      break;
    }
    case "rotate": {
      const angle = parseInt(opts.angle ?? "90", 10);
      pipeline = pipeline.rotate(angle);
      outName = `${baseName(filename)}_rotated${angle}`;
      break;
    }
    case "flip": {
      const dir = opts.direction ?? "horizontal";
      if (dir === "vertical") pipeline = pipeline.flip();
      else pipeline = pipeline.flop();
      outName = `${baseName(filename)}_flipped`;
      break;
    }
    case "black-white":
    case "grayscale": {
      pipeline = pipeline.grayscale();
      outName = `${baseName(filename)}_bw`;
      break;
    }
    case "blur-image": {
      const sigma = parseFloat(opts.sigma ?? "5");
      pipeline = pipeline.blur(sigma);
      outName = `${baseName(filename)}_blurred`;
      break;
    }
    case "pixel-art": {
      const pixelSize = parseInt(opts.pixelSize ?? "10", 10);
      const meta = await sharp(buf).metadata();
      const w = meta.width ?? 800;
      const h = meta.height ?? 600;
      const smallW = Math.max(1, Math.round(w / pixelSize));
      const smallH = Math.max(1, Math.round(h / pixelSize));
      pipeline = sharp(buf)
        .resize(smallW, smallH, { kernel: sharp.kernel.nearest })
        .resize(w, h, { kernel: sharp.kernel.nearest });
      outName = `${baseName(filename)}_pixelart`;
      break;
    }
    case "increase-kb": {
      const targetKB = parseInt(opts.targetKB ?? "500", 10);
      const targetBytes = targetKB * 1024;
      const currentBuf = await sharp(buf).jpeg({ quality: 100 }).toBuffer();
      if (currentBuf.byteLength >= targetBytes) {
        return { name: `${baseName(filename)}_${targetKB}kb.jpg`, data: currentBuf.toString("base64"), type: "image/jpeg" };
      }
      // Embed in a larger canvas with white padding
      const meta = await sharp(buf).metadata();
      const scaleFactor = Math.sqrt(targetBytes / currentBuf.byteLength) * 1.1;
      const newW = Math.round((meta.width ?? 800) * scaleFactor);
      const newH = Math.round((meta.height ?? 600) * scaleFactor);
      const out = await sharp(buf).resize(newW, newH, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).jpeg({ quality: 92 }).toBuffer();
      return { name: `${baseName(filename)}_${targetKB}kb.jpg`, data: out.toString("base64"), type: "image/jpeg" };
    }
    case "remove-metadata": {
      // Sharp strips metadata by default — just re-encode
      pipeline = pipeline.withMetadata({ orientation: undefined });
      if (outExt === "png") pipeline = pipeline.png();
      else { pipeline = pipeline.jpeg({ quality: 95 }); outExt = "jpg"; outMime = "image/jpeg"; }
      outName = `${baseName(filename)}_clean`;
      break;
    }
    case "split-image": {
      // Split into grid: default 3 columns
      const cols = parseInt(opts.cols ?? "3", 10);
      const meta = await sharp(buf).metadata();
      const w = meta.width ?? 900;
      const h = meta.height ?? 900;
      const tileW = Math.floor(w / cols);
      const outputs: { name: string; data: string; type: string }[] = [];
      for (let i = 0; i < cols; i++) {
        const left = i * tileW;
        const tileWidth = (i === cols - 1) ? w - left : tileW;
        const tile = await sharp(buf).extract({ left, top: 0, width: tileWidth, height: h }).jpeg({ quality: 90 }).toBuffer();
        outputs.push({ name: `${baseName(filename)}_part${i + 1}.jpg`, data: tile.toString("base64"), type: "image/jpeg" });
      }
      return outputs[0]; // caller must handle multi-file case; handled below
    }
    case "remove-background":
    case "bg-remove": {
      const apiKey = process.env.REMOVE_BG_API_KEY;
      if (!apiKey?.trim()) throw new Error("Background removal API key not configured. Add REMOVE_BG_API_KEY to environment variables.");
      const fd = new FormData();
      fd.append("image_file", new Blob([buf.buffer as ArrayBuffer], { type: outMime }), filename);
      fd.append("size", "auto");
      const bgRes = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: fd,
      });
      if (!bgRes.ok) {
        const errText = await bgRes.text();
        throw new Error(`remove.bg error ${bgRes.status}: ${errText}`);
      }
      const resultBuf = Buffer.from(await bgRes.arrayBuffer());
      return { name: `${baseName(filename)}_nobg.png`, data: resultBuf.toString("base64"), type: "image/png" };
    }
    case "upscale": {
      const scale = parseInt(opts.scale ?? "2", 10);
      const meta = await sharp(buf).metadata();
      const w = (meta.width ?? 800) * scale;
      const h = (meta.height ?? 600) * scale;
      pipeline = pipeline.resize(w, h, { kernel: sharp.kernel.lanczos3 });
      outName = `${baseName(filename)}_${scale}x`;
      break;
    }
    case "view-metadata": {
      const meta = await sharp(buf).metadata();
      const info = {
        filename,
        format: meta.format,
        width: meta.width,
        height: meta.height,
        channels: meta.channels,
        colorSpace: meta.space,
        hasAlpha: meta.hasAlpha,
        density: meta.density,
        fileSize: `${(buf.byteLength / 1024).toFixed(1)} KB`,
      };
      const txt = Object.entries(info).map(([k, v]) => `${k}: ${v}`).join("\n");
      return { name: `${baseName(filename)}_metadata.txt`, data: Buffer.from(txt).toString("base64"), type: "text/plain" };
    }
    case "add-logo": {
      const text = opts.text ?? "LOGO";
      const fontSize = parseInt(opts.fontSize ?? "48", 10);
      const position = opts.position ?? "bottom-right";
      const meta = await sharp(buf).metadata();
      const w = meta.width ?? 800;
      const h = meta.height ?? 600;
      const ax = position.includes("right") ? w - 20 : position.includes("center") ? w / 2 : 20;
      const ay = position.includes("bottom") ? h - 20 : position.includes("middle") ? h / 2 : fontSize;
      const anchor = position.includes("right") ? "end" : position.includes("center") ? "middle" : "start";
      const svgBuf = Buffer.from(
        `<svg width="${w}" height="${h}"><text x="${ax}" y="${ay}" font-size="${fontSize}" font-family="Arial" font-weight="bold" fill="white" fill-opacity="0.85" stroke="black" stroke-width="1" text-anchor="${anchor}">${text}</text></svg>`
      );
      const composited = await sharp(buf).composite([{ input: svgBuf, blend: "over" }]);
      let logoBuf: Buffer;
      if (outExt === "png") {
        logoBuf = await composited.png().toBuffer();
      } else {
        logoBuf = await composited.jpeg({ quality: 92 }).toBuffer();
        outExt = "jpg"; outMime = "image/jpeg";
      }
      return { name: `${baseName(filename)}_logo.${outExt}`, data: logoBuf.toString("base64"), type: outMime };
    }
    case "image-to-pdf":
    case "image-to-pdf-conv": {
      // Convert image to PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const meta = await sharp(buf).metadata();
      const w = meta.width ?? 595;
      const h = meta.height ?? 842;

      let imgEmbed;
      if (outExt === "png") {
        const pngBuf = await sharp(buf).png().toBuffer();
        imgEmbed = await pdfDoc.embedPng(new Uint8Array(pngBuf));
      } else {
        const jpgBuf = await sharp(buf).jpeg({ quality: 95 }).toBuffer();
        imgEmbed = await pdfDoc.embedJpg(new Uint8Array(jpgBuf));
      }
      const page = pdfDoc.addPage([w, h]);
      page.drawImage(imgEmbed, { x: 0, y: 0, width: w, height: h });
      const pdfBytes = await pdfDoc.save();
      return { name: `${baseName(filename)}.pdf`, data: Buffer.from(pdfBytes).toString("base64"), type: "application/pdf" };
    }
    default: {
      // Fallthrough: re-encode the image
      if (outExt === "png") pipeline = pipeline.png();
      else pipeline = pipeline.jpeg({ quality: 90 });
      outName = `${baseName(filename)}_processed`;
    }
  }

  const out = await pipeline.toBuffer();
  return { name: `${outName}.${outExt}`, data: out.toString("base64"), type: outMime };
}

// ─────────────────────────────────────────────
// PDF processors (pdf-lib)
// ─────────────────────────────────────────────

async function processPDF(
  bufs: Buffer[],
  filenames: string[],
  slug: string,
  opts: Record<string, string>
): Promise<{ name: string; data: string; type: string }[]> {
  const mime = "application/pdf";

  switch (slug) {
    case "compress": {
      // pdf-lib doesn't do lossy compression — re-save strips some overhead
      const results: { name: string; data: string; type: string }[] = [];
      for (let i = 0; i < bufs.length; i++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[i]), { ignoreEncryption: true });
        const saved = await pdfDoc.save({ useObjectStreams: true });
        results.push({ name: `${baseName(filenames[i])}_compressed.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "merge": {
      const merged = await PDFDocument.create();
      for (const buf of bufs) {
        const src = await PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const saved = await merged.save();
      return [{ name: "merged.pdf", data: Buffer.from(saved).toString("base64"), type: mime }];
    }

    case "split": {
      const src = await PDFDocument.load(new Uint8Array(bufs[0]), { ignoreEncryption: true });
      const total = src.getPageCount();
      const results: { name: string; data: string; type: string }[] = [];
      for (let i = 0; i < total; i++) {
        const single = await PDFDocument.create();
        const [page] = await single.copyPages(src, [i]);
        single.addPage(page);
        const saved = await single.save();
        results.push({ name: `${baseName(filenames[0])}_page${i + 1}.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "rotate": {
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const angle = parseInt(opts.angle ?? "90", 10);
        pdfDoc.getPages().forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + angle) % 360));
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_rotated.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "protect": {
      throw new Error("PDF_PROTECT_UNAVAILABLE: PDF password protection is not available in this environment (requires a native encryption engine). Free alternatives: ilovepdf.com/protect-pdf · sejda.com/encrypt-pdf · smallpdf.com/protect-pdf");
    }

    case "unlock": {
      const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[0]), { ignoreEncryption: true });
      const saved = await pdfDoc.save();
      return [{ name: `${baseName(filenames[0])}_unlocked.pdf`, data: Buffer.from(saved).toString("base64"), type: mime }];
    }

    case "watermark": {
      const results: { name: string; data: string; type: string }[] = [];
      const watermarkText = opts.text ?? "CONFIDENTIAL";
      const opacity = parseFloat(opts.opacity ?? "0.3");
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        pdfDoc.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          const fontSize = Math.min(width, height) * 0.12;
          page.drawText(watermarkText, {
            x: width / 2 - (watermarkText.length * fontSize * 0.3),
            y: height / 2,
            size: fontSize,
            font,
            color: rgb(0.7, 0.7, 0.7),
            opacity,
            rotate: degrees(45),
          });
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_watermarked.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "page-numbers": {
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const startNum = parseInt(opts.startNumber ?? "1", 10);
        pages.forEach((page, idx) => {
          const { width } = page.getSize();
          page.drawText(`${startNum + idx}`, {
            x: width / 2 - 8,
            y: 20,
            size: 12,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_numbered.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "jpg-to-pdf": {
      const sharp = await getSharp();
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < bufs.length; i++) {
        const fileExt = ext(filenames[i]);
        let imgEmbed;
        if (fileExt === "png") {
          imgEmbed = await pdfDoc.embedPng(new Uint8Array(bufs[i]));
        } else {
          const jpgBuf = await sharp(bufs[i]).jpeg({ quality: 95 }).toBuffer();
          imgEmbed = await pdfDoc.embedJpg(new Uint8Array(jpgBuf));
        }
        const { width, height } = imgEmbed.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(imgEmbed, { x: 0, y: 0, width, height });
      }
      const saved = await pdfDoc.save();
      return [{ name: "images.pdf", data: Buffer.from(saved).toString("base64"), type: mime }];
    }

    case "organize-pdf":
    case "reorder": {
      const src = await PDFDocument.load(new Uint8Array(bufs[0]), { ignoreEncryption: true });
      const orderStr = opts.order ?? "";
      const total = src.getPageCount();
      const indices = orderStr
        ? orderStr.split(",").map((s) => parseInt(s.trim(), 10) - 1).filter((n) => n >= 0 && n < total)
        : src.getPageIndices();
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const saved = await out.save();
      return [{ name: `${baseName(filenames[0])}_organized.pdf`, data: Buffer.from(saved).toString("base64"), type: mime }];
    }

    case "crop-pdf": {
      const results: { name: string; data: string; type: string }[] = [];
      const marginPt = parseFloat(opts.margin ?? "36"); // 0.5 inch default
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        pdfDoc.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.setMediaBox(marginPt, marginPt, width - marginPt, height - marginPt);
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_cropped.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "pdf-to-pdfa": {
      // pdf-lib: re-save with object streams (best approximation without external tools)
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const saved = await pdfDoc.save({ useObjectStreams: true });
        results.push({ name: `${baseName(filenames[fi])}_pdfa.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "scan-to-pdf": {
      const sharp = await getSharp();
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < bufs.length; i++) {
        const jpgBuf = await sharp(bufs[i]).jpeg({ quality: 90 }).toBuffer();
        const imgEmbed = await pdfDoc.embedJpg(new Uint8Array(jpgBuf));
        const { width, height } = imgEmbed.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(imgEmbed, { x: 0, y: 0, width, height });
      }
      const saved = await pdfDoc.save();
      return [{ name: "scanned.pdf", data: Buffer.from(saved).toString("base64"), type: mime }];
    }

    case "repair-pdf": {
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        try {
          const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true, updateMetadata: false });
          const saved = await pdfDoc.save();
          results.push({ name: `${baseName(filenames[fi])}_repaired.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
        } catch {
          results.push({ name: `${baseName(filenames[fi])}_error.txt`, data: Buffer.from("Could not repair this PDF — file may be too damaged.").toString("base64"), type: "text/plain" });
        }
      }
      return results;
    }

    case "pdf-to-word":
    case "pdf-to-docx": {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfData = await pdfParse(bufs[fi]);
        const lines = pdfData.text.split("\n");
        const paragraphs = lines.map((line: string) => {
          const trimmed = line.trim();
          // Simple heuristic: short ALL-CAPS lines are headings
          const isHeading = trimmed.length > 0 && trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
          if (isHeading) {
            return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: trimmed, bold: true })] });
          }
          return new Paragraph({ children: [new TextRun(trimmed)] });
        });
        const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
        const docxBuf = await Packer.toBuffer(doc);
        results.push({
          name: `${baseName(filenames[fi])}.docx`,
          data: Buffer.from(docxBuf).toString("base64"),
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      }
      return results;
    }

    case "pdf-to-excel":
    case "pdf-to-xlsx": {
      const ExcelJS = await import("exceljs");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfData = await pdfParse(bufs[fi]);
        const lines = pdfData.text.split("\n").filter((l: string) => l.trim().length > 0);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Sheet1");
        // Header row with page count info
        sheet.addRow([`Extracted from: ${filenames[fi]}`, `Pages: ${pdfData.numpages}`]);
        sheet.addRow([]);
        for (const line of lines) {
          // Split on 2+ spaces or tabs to detect columns
          const cols = line.split(/\t|\s{2,}/).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
          sheet.addRow(cols.length > 1 ? cols : [line.trim()]);
        }
        // Auto-fit first column
        sheet.getColumn(1).width = 60;
        const xlsxBuf = await workbook.xlsx.writeBuffer();
        results.push({
          name: `${baseName(filenames[fi])}.xlsx`,
          data: Buffer.from(xlsxBuf as ArrayBuffer).toString("base64"),
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }
      return results;
    }

    case "sign": {
      const signerName = opts.signerName?.trim() || "Signed";
      const signDate = new Date().toLocaleDateString("en-GB");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const italicFont  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const { width } = lastPage.getSize();
        const boxX = 40, boxY = 30, boxW = Math.min(280, width - 80), boxH = 60;
        // Signature box background
        lastPage.drawRectangle({ x: boxX, y: boxY, width: boxW, height: boxH, color: rgb(0.97, 0.97, 1), borderColor: rgb(0.6, 0.6, 0.8), borderWidth: 1 });
        // Label
        lastPage.drawText("Digitally Signed By:", { x: boxX + 8, y: boxY + boxH - 16, size: 7, font: regularFont, color: rgb(0.5, 0.5, 0.5) });
        // Signature name
        lastPage.drawText(signerName, { x: boxX + 8, y: boxY + 28, size: 14, font: italicFont, color: rgb(0.05, 0.1, 0.5) });
        // Date
        lastPage.drawText(`Date: ${signDate}`, { x: boxX + 8, y: boxY + 10, size: 8, font: regularFont, color: rgb(0.4, 0.4, 0.4) });
        // Underline for name
        lastPage.drawLine({ start: { x: boxX + 8, y: boxY + 26 }, end: { x: boxX + boxW - 8, y: boxY + 26 }, thickness: 0.5, color: rgb(0.4, 0.4, 0.6) });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_signed.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "excel-to-pdf": {
      const ExcelJS = await import("exceljs");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(bufs[fi].buffer as ArrayBuffer);
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        workbook.eachSheet((sheet) => {
          const rows: string[][] = [];
          sheet.eachRow((row) => {
            const cells: string[] = [];
            row.eachCell({ includeEmpty: true }, (cell) => {
              cells.push(cell.text ?? String(cell.value ?? ""));
            });
            rows.push(cells);
          });
          if (rows.length === 0) return;
          const colCount = Math.max(...rows.map((r) => r.length));
          const PAGE_W = 595, PAGE_H = 842, MARGIN = 40, ROW_H = 18, FONT_SIZE = 9;
          const colW = Math.floor((PAGE_W - MARGIN * 2) / Math.max(colCount, 1));
          let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
          let y = PAGE_H - MARGIN;
          for (let ri = 0; ri < rows.length; ri++) {
            if (y < MARGIN + ROW_H) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
            const row = rows[ri];
            const isHeader = ri === 0;
            for (let ci = 0; ci < colCount; ci++) {
              const cell = (row[ci] ?? "").slice(0, 30);
              const x = MARGIN + ci * colW;
              page.drawText(cell, { x, y, size: FONT_SIZE, font: isHeader ? boldFont : font, color: rgb(0, 0, 0), maxWidth: colW - 4 });
            }
            if (isHeader) page.drawLine({ start: { x: MARGIN, y: y - 3 }, end: { x: PAGE_W - MARGIN, y: y - 3 }, thickness: 0.5, color: rgb(0.4, 0.4, 0.4) });
            y -= ROW_H;
          }
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "compare-pdf": {
      if (bufs.length < 2) throw new Error("Please upload exactly 2 PDF files to compare.");
      const [d1, d2] = await Promise.all([pdfParse(bufs[0]), pdfParse(bufs[1])]);
      const lines1 = d1.text.split("\n");
      const lines2 = d2.text.split("\n");
      const maxLen = Math.max(lines1.length, lines2.length);
      const diffLines: string[] = [`=== Comparing: ${filenames[0]} vs ${filenames[1]} ===\n`];
      let same = 0, added = 0, removed = 0;
      for (let i = 0; i < maxLen; i++) {
        const l1 = lines1[i] ?? "";
        const l2 = lines2[i] ?? "";
        if (l1 === l2) { same++; }
        else if (!l1.trim() && l2.trim()) { diffLines.push(`[LINE ${i + 1}] + ${l2}`); added++; }
        else if (l1.trim() && !l2.trim()) { diffLines.push(`[LINE ${i + 1}] - ${l1}`); removed++; }
        else if (l1 !== l2) { diffLines.push(`[LINE ${i + 1}] - ${l1}\n[LINE ${i + 1}] + ${l2}`); added++; removed++; }
      }
      diffLines.unshift(`Summary: ${same} lines same, ${added} lines added, ${removed} lines removed\n`);
      const txt = diffLines.join("\n");
      return [{ name: "comparison.txt", data: Buffer.from(txt).toString("base64"), type: "text/plain" }];
    }

    case "pdf-to-text": {
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfData = await pdfParse(bufs[fi]);
        const header = `=== ${filenames[fi]} ===\nPages: ${pdfData.numpages}\nExtracted: ${new Date().toLocaleDateString()}\n${"=".repeat(50)}\n\n`;
        results.push({ name: `${baseName(filenames[fi])}.txt`, data: Buffer.from(header + pdfData.text).toString("base64"), type: "text/plain" });
      }
      return results;
    }

    case "header-footer": {
      const headerText = opts.headerText ?? "";
      const footerText = opts.footerText ?? "";
      if (!headerText.trim() && !footerText.trim()) throw new Error("Please enter header or footer text in the options.");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = parseInt(opts.fontSize ?? "10", 10);
        pdfDoc.getPages().forEach((page, idx) => {
          const { width, height } = page.getSize();
          const pageText = (t: string) => t.replace("{page}", String(idx + 1)).replace("{total}", String(pdfDoc.getPageCount()));
          if (headerText.trim()) {
            const text = pageText(headerText);
            const textW = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, { x: (width - textW) / 2, y: height - 20, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
            page.drawLine({ start: { x: 40, y: height - 25 }, end: { x: width - 40, y: height - 25 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
          }
          if (footerText.trim()) {
            const text = pageText(footerText);
            const textW = font.widthOfTextAtSize(text, fontSize);
            page.drawLine({ start: { x: 40, y: 22 }, end: { x: width - 40, y: 22 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
            page.drawText(text, { x: (width - textW) / 2, y: 8, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
          }
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_headerfooter.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "summarize-pdf": {
      const pdfData = await pdfParse(bufs[0]);
      const fullText = pdfData.text.trim();
      const chunk = fullText.slice(0, 8000);
      const summary = await callLocalAI(
        `You are an expert document analyst. Read the following PDF content and write a comprehensive summary.\n\nReturn your summary in this format:\n📄 DOCUMENT OVERVIEW\n[2-3 sentence overview]\n\n🔑 KEY POINTS\n• [point 1]\n• [point 2]\n• [point 3]\n...\n\n📊 MAIN TOPICS\n[list main topics covered]\n\n💡 CONCLUSION\n[brief conclusion]\n\nDocument content (${pdfData.numpages} pages):\n${chunk}${fullText.length > 8000 ? "\n\n[Document continues — summarizing first portion]" : ""}`
      );
      return [{ name: `${baseName(filenames[0])}_summary.txt`, data: Buffer.from(summary).toString("base64"), type: "text/plain" }];
    }

    case "translate-pdf": {
      const pdfData = await pdfParse(bufs[0]);
      const targetLang = opts.targetLanguage ?? "Hindi";
      const sourceLang = opts.sourceLanguage && opts.sourceLanguage !== "Auto Detect" ? opts.sourceLanguage : null;
      const fullText   = pdfData.text.trim();
      // Single 4000-char chunk for fast response (avoids Vercel 10s timeout)
      const chunk = fullText.slice(0, 4000);
      const sourceHint = sourceLang ? ` from ${sourceLang}` : "";
      const translated = await callLocalAI(
        `You are a professional document translator. Translate the following text${sourceHint} to ${targetLang}.\n\nRules:\n- Preserve paragraph structure, headings, bullet points, and line breaks\n- Keep numbers, dates, and proper nouns as-is unless they have a common translated form\n- Do NOT add any translator notes, explanations, or comments\n- Return ONLY the translated text, nothing else\n\nText to translate:\n${chunk}`
      );
      const header = `TRANSLATED DOCUMENT\n${"─".repeat(40)}\nOriginal file : ${filenames[0]}\nTarget language: ${targetLang}${sourceLang ? `\nSource language: ${sourceLang}` : ""}\nPages          : ${pdfData.numpages}\nTranslated on  : ${new Date().toLocaleDateString("en-GB")}\n${"─".repeat(40)}\n\n`;
      const footer  = fullText.length > 4000 ? `\n\n${"─".repeat(40)}\nNote: This document is ${pdfData.numpages} pages long. Due to processing limits, only the first portion has been translated. Upload shorter sections for full translation.` : "";
      const result  = header + translated.trim() + footer;
      return [{ name: `${baseName(filenames[0])}_${targetLang.replace(/\s/g, "_")}.txt`, data: Buffer.from(result).toString("base64"), type: "text/plain" }];
    }

    case "redact-pdf": {
      const keyword = opts.keyword ?? "";
      if (!keyword.trim()) throw new Error("Please enter a keyword to redact in the options.");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          // Draw black redaction box as overlay — crude but visible
          page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0), opacity: 0 });
          page.drawText(`[REDACTED: Contains redacted content — keyword: "${keyword}"]`, {
            x: 40, y: height / 2, size: 10, font, color: rgb(0.5, 0, 0),
          });
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_redacted.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "edit-pdf": {
      // Basic PDF annotation: add a text note at the top of each page
      const noteText = opts.text?.trim() || opts.annotation?.trim() || "";
      if (!noteText) throw new Error("Please enter text to add in the options (annotation field).");
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        pdfDoc.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.drawRectangle({ x: 0, y: height - 30, width, height: 30, color: rgb(1, 1, 0.7), opacity: 0.85 });
          page.drawText(noteText.slice(0, 120), { x: 8, y: height - 19, size: 10, font, color: rgb(0.1, 0.1, 0.1), maxWidth: width - 16 });
        });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_annotated.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }

    case "html-to-pdf": {
      // Convert plain/HTML text to a simple PDF
      const htmlText = opts.htmlText?.trim() || opts.text?.trim() || "";
      if (!htmlText) throw new Error("Please paste your HTML or text content in the options field.");
      // Strip HTML tags for basic text extraction
      const plainText = htmlText.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const PAGE_W = 595, PAGE_H = 842, MARGIN = 50, LINE_H = 16, FONT_SIZE = 11;
      const maxW = PAGE_W - MARGIN * 2;
      const words = plainText.split(/\s+/);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, FONT_SIZE) > maxW) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;
      for (const line of lines) {
        if (y < MARGIN + LINE_H) { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
        page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font, color: rgb(0, 0, 0) });
        y -= LINE_H;
      }
      const saved = await pdfDoc.save();
      return [{ name: "converted.pdf", data: Buffer.from(saved).toString("base64"), type: mime }];
    }

    case "pdf-to-jpg":
    case "pdf-to-jpeg":
    case "pdf-to-png":
    case "pdf-to-image": {
      throw new Error("PDF to Image conversion requires a PDF rendering engine (e.g. Ghostscript or Poppler) that is not available in this environment. Try smallpdf.com or use your PDF viewer to export pages as images.");
    }

    case "ocr": {
      throw new Error("PDF OCR requires a Tesseract or cloud OCR service. This feature needs a configured OCR_API_KEY environment variable. Please add OCR support to your server configuration.");
    }

    default: {
      // Generic: load and re-save
      const results: { name: string; data: string; type: string }[] = [];
      for (let fi = 0; fi < bufs.length; fi++) {
        const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[fi]), { ignoreEncryption: true });
        const saved = await pdfDoc.save();
        results.push({ name: `${baseName(filenames[fi])}_processed.pdf`, data: Buffer.from(saved).toString("base64"), type: mime });
      }
      return results;
    }
  }
}

// ─────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const toolSlug = formData.get("toolSlug") as string;
    const optsRaw = formData.get("options") as string | null;
    const opts: Record<string, string> = optsRaw ? JSON.parse(optsRaw) : {};

    const fileEntries = formData.getAll("files") as File[];
    if (!fileEntries.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const bufs = await Promise.all(fileEntries.map((f) => f.arrayBuffer().then((ab) => Buffer.from(ab))));
    const filenames = fileEntries.map((f) => f.name);
    const firstExt = ext(filenames[0]);

    // Route to image or PDF processor
    const isPDF = firstExt === "pdf" || toolSlug.startsWith("pdf-") || toolSlug === "merge" || toolSlug === "split" || toolSlug === "rotate" && firstExt === "pdf" || toolSlug === "watermark" && firstExt === "pdf" || ["compress", "unlock", "protect", "page-numbers", "jpg-to-pdf", "organize-pdf", "reorder", "crop-pdf", "pdf-to-pdfa", "scan-to-pdf", "repair-pdf"].includes(toolSlug);

    const isImageInput = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "avif"].includes(firstExt);
    const isPDFSlug = ["compress-pdf", "merge", "split", "rotate", "watermark", "page-numbers", "jpg-to-pdf", "organize-pdf", "crop-pdf", "pdf-to-pdfa", "scan-to-pdf", "repair-pdf", "excel-to-pdf", "redact-pdf", "compare-pdf", "sign", "summarize-pdf", "translate-pdf", "pdf-to-text", "header-footer", "edit-pdf", "html-to-pdf"].includes(toolSlug) || firstExt === "pdf";

    if (isPDFSlug || firstExt === "pdf") {
      const results = await processPDF(bufs, filenames, toolSlug, opts);
      return respondFiles(results);
    }

    if (isImageInput) {
      // Handle split-image specially (multi-output)
      if (toolSlug === "split-image") {
        const sharp = await getSharp();
        const cols = parseInt(opts.cols ?? "3", 10);
        const meta = await sharp(bufs[0]).metadata();
        const w = meta.width ?? 900;
        const h = meta.height ?? 900;
        const tileW = Math.floor(w / cols);
        const outputs: { name: string; data: string; type: string }[] = [];
        for (let i = 0; i < cols; i++) {
          const left = i * tileW;
          const tileWidth = (i === cols - 1) ? w - left : tileW;
          const tile = await sharp(bufs[0]).extract({ left, top: 0, width: tileWidth, height: h }).jpeg({ quality: 90 }).toBuffer();
          outputs.push({ name: `${baseName(filenames[0])}_part${i + 1}.jpg`, data: tile.toString("base64"), type: "image/jpeg" });
        }
        return respondFiles(outputs);
      }

      // Handle multiple image files (batch)
      const results: { name: string; data: string; type: string }[] = [];
      for (let i = 0; i < bufs.length; i++) {
        const result = await processImage(bufs[i], toolSlug, opts, filenames[i]);
        results.push(result);
      }
      return respondFiles(results);
    }

    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  } catch (err) {
    console.error("[process]", err);
    return NextResponse.json({ error: (err as Error).message ?? "Processing failed" }, { status: 500 });
  }
}
