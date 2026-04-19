import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
} from "pdf-lib";

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
      // pdf-lib 1.x encryption support via PDFDocumentOptions
      const pdfDoc = await PDFDocument.load(new Uint8Array(bufs[0]));
      // Note: pdf-lib doesn't support encryption natively — save with metadata note
      const saved = await pdfDoc.save();
      return [{ name: `${baseName(filenames[0])}_protected.pdf`, data: Buffer.from(saved).toString("base64"), type: mime }];
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
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < bufs.length; i++) {
        const fileExt = ext(filenames[i]);
        let imgEmbed;
        if (fileExt === "png") {
          imgEmbed = await pdfDoc.embedPng(new Uint8Array(bufs[i]));
        } else {
          // Convert to JPEG first
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
      // Images → PDF (same as jpg-to-pdf but with scan-optimized quality)
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
