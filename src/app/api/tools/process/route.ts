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
      throw new Error("PDF password protection requires an encryption library (e.g. qpdf) that is not available in this environment. Please use Adobe Acrobat or a PDF encryption service to add password protection.");
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
    const isPDFSlug = ["compress-pdf", "merge", "split", "rotate", "watermark", "protect", "unlock", "page-numbers", "jpg-to-pdf", "organize-pdf", "crop-pdf", "pdf-to-pdfa", "scan-to-pdf", "repair-pdf", "excel-to-pdf", "redact-pdf", "compare-pdf"].includes(toolSlug) || firstExt === "pdf";

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
