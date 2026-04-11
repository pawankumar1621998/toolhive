"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { clsx } from "clsx";
import {
  Upload,
  Undo2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  RefreshCw,
  Plus,
  Sparkles,
  Trash2,
  Circle,
  Square,
  Loader2,
  ImageIcon,
  XCircle,
  Pen,
  Eraser,
  Crop,
  SlidersHorizontal,
  Palette,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CanvasImageEditorProps {
  tool: Tool;
  editorMode:
    | "brush-remove"
    | "brush-blur"
    | "filter-bw"
    | "flip-rotate"
    | "add-border"
    | "round-image"
    | "combine"
    | "profile-photo"
    | "ai-process"
    | "draw"
    | "adjust"
    | "color-filter"
    | "crop";
}

type DrawTool = "pen" | "eraser";

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ColorFilterPreset {
  id: string;
  label: string;
  css: string;
}

type Phase = "upload" | "editor";

interface BrushStroke {
  x: number;
  y: number;
  radius: number;
  /** canvas-space coordinates (accounting for zoom/offset) */
  canvasX: number;
  canvasY: number;
}

type BlurSubMode = "blur" | "pixelate";

interface CombineImage {
  id: string;
  file: File;
  url: string;
}

type CombineLayout = "side-by-side" | "grid-2x2" | "vertical";
type ProfilePlatform = "linkedin" | "instagram" | "twitter" | "custom";
type ProfileShape = "circle" | "square";
type RoundShape = "circle" | "rounded";
type BorderStyle = "solid" | "double" | "shadow";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PROFILE_SIZES: Record<ProfilePlatform, { w: number; h: number; label: string }> = {
  linkedin:  { w: 400,  h: 400,  label: "LinkedIn (400×400)" },
  instagram: { w: 320,  h: 320,  label: "Instagram (320×320)" },
  twitter:   { w: 400,  h: 400,  label: "Twitter / X (400×400)" },
  custom:    { w: 512,  h: 512,  label: "Custom (512×512)" },
};

const COLOR_FILTERS: ColorFilterPreset[] = [
  { id: "normal",   label: "Normal",   css: "none" },
  { id: "vivid",    label: "Vivid",    css: "saturate(1.9) contrast(1.1)" },
  { id: "warm",     label: "Warm",     css: "sepia(0.35) saturate(1.5) brightness(1.05)" },
  { id: "cool",     label: "Cool",     css: "hue-rotate(25deg) saturate(1.25) brightness(1.02)" },
  { id: "vintage",  label: "Vintage",  css: "sepia(0.55) contrast(1.1) brightness(0.9) saturate(0.8)" },
  { id: "dramatic", label: "Dramatic", css: "contrast(1.45) saturate(1.35) brightness(0.85)" },
  { id: "fade",     label: "Fade",     css: "contrast(0.8) brightness(1.15) saturate(0.65)" },
  { id: "bw",       label: "B&W",      css: "grayscale(1)" },
  { id: "matte",    label: "Matte",    css: "contrast(0.9) brightness(1.1) saturate(0.75) sepia(0.15)" },
];

// ─────────────────────────────────────────────
// Pure Helpers
// ─────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function validateFile(
  file: File,
  acceptedFileTypes: string[],
  maxFileSizeMB: number
): string | null {
  if (maxFileSizeMB > 0 && file.size > maxFileSizeMB * 1_048_576) {
    return `File exceeds maximum size of ${maxFileSizeMB} MB`;
  }
  if (acceptedFileTypes.length > 0) {
    const ok = acceptedFileTypes.some((t) => {
      if (t.endsWith("/*")) return file.type.startsWith(t.replace("/*", "/"));
      if (t.startsWith(".")) return file.name.toLowerCase().endsWith(t.toLowerCase());
      return file.type === t;
    });
    if (!ok) {
      return `File type not accepted. Allowed: ${acceptedFileTypes.join(", ")}`;
    }
  }
  return null;
}

function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.92
): void {
  const dataUrl = format === "image/png"
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL(format, quality);
  const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
  // Replace the file extension in the filename
  const finalName = filename.replace(/\.[^.]+$/, "") + "." + ext;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─────────────────────────────────────────────
// Canvas Operations
// ─────────────────────────────────────────────

function applyBlackAndWhite(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brightness = 100,
  contrast = 100
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const b = brightness / 100;
  const c = contrast / 100;
  for (let i = 0; i < d.length; i += 4) {
    let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Apply brightness
    gray = gray * b;
    // Apply contrast around midpoint 128
    gray = (gray - 128) * c + 128;
    const v = Math.max(0, Math.min(255, gray));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Simple inpainting: for each masked pixel, sample the surrounding
 * ring of non-masked pixels and average their colors. Multiple passes
 * fill from the edges inward.
 */
function applyInpaint(
  ctx: CanvasRenderingContext2D,
  maskCtx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const maskData = maskCtx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);

  const PASSES = 8;
  const RADIUS = 6;

  for (let pass = 0; pass < PASSES; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        // alpha channel of mask indicates this pixel should be filled
        if (maskData.data[idx + 3] < 128) continue;

        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -RADIUS; dy <= RADIUS; dy++) {
          for (let dx = -RADIUS; dx <= RADIUS; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const ni = (ny * w + nx) * 4;
            if (maskData.data[ni + 3] >= 128) continue; // skip other masked pixels
            r += src[ni];
            g += src[ni + 1];
            b += src[ni + 2];
            count++;
          }
        }
        if (count > 0) {
          imageData.data[idx]     = r / count;
          imageData.data[idx + 1] = g / count;
          imageData.data[idx + 2] = b / count;
        }
      }
    }
    // Update src for next pass so filled pixels propagate
    src.set(imageData.data);
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply box blur to masked pixels.
 */
function applyBlurToMask(
  ctx: CanvasRenderingContext2D,
  maskCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  blurRadius: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const maskData = maskCtx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);

  const r = Math.max(1, Math.floor(blurRadius));
  const passes = 3;

  let working = new Uint8ClampedArray(src);

  for (let pass = 0; pass < passes; pass++) {
    const next = new Uint8ClampedArray(working);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (maskData.data[idx + 3] < 128) continue;
        let rr = 0, g = 0, b = 0, count = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const ni = (ny * w + nx) * 4;
            rr += working[ni]; g += working[ni + 1]; b += working[ni + 2];
            count++;
          }
        }
        if (count > 0) {
          next[idx]     = rr / count;
          next[idx + 1] = g / count;
          next[idx + 2] = b / count;
        }
      }
    }
    working = next;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (maskData.data[idx + 3] < 128) continue;
      imageData.data[idx]     = working[idx];
      imageData.data[idx + 1] = working[idx + 1];
      imageData.data[idx + 2] = working[idx + 2];
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Pixelate masked area with block size `pixelSize`.
 */
function applyPixelateToMask(
  ctx: CanvasRenderingContext2D,
  maskCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pixelSize: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const maskData = maskCtx.getImageData(0, 0, w, h);
  const ps = Math.max(2, pixelSize);

  for (let y = 0; y < h; y += ps) {
    for (let x = 0; x < w; x += ps) {
      let r = 0, g = 0, b = 0, count = 0;
      let hasMasked = false;

      for (let dy = 0; dy < ps && y + dy < h; dy++) {
        for (let dx = 0; dx < ps && x + dx < w; dx++) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          if (maskData.data[idx + 3] >= 128) hasMasked = true;
          r += imageData.data[idx];
          g += imageData.data[idx + 1];
          b += imageData.data[idx + 2];
          count++;
        }
      }
      if (!hasMasked) continue;
      const avgR = r / count, avgG = g / count, avgB = b / count;
      for (let dy = 0; dy < ps && y + dy < h; dy++) {
        for (let dx = 0; dx < ps && x + dx < w; dx++) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          if (maskData.data[idx + 3] < 128) continue;
          imageData.data[idx]     = avgR;
          imageData.data[idx + 1] = avgG;
          imageData.data[idx + 2] = avgB;
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyRoundClip(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shape: RoundShape,
  radius: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const r = Math.min(cx, cy);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let inside: boolean;
      if (shape === "circle") {
        const dx = x - cx, dy = y - cy;
        inside = dx * dx + dy * dy <= r * r;
      } else {
        // rounded rectangle
        const rr = radius;
        const left = rr, right = w - rr, top = rr, bottom = h - rr;
        if (x >= left && x <= right && y >= 0 && y <= h) { inside = true; }
        else if (y >= top && y <= bottom && x >= 0 && x <= w) { inside = true; }
        else {
          // corner circles
          const corners = [[rr, rr], [w - rr, rr], [rr, h - rr], [w - rr, h - rr]];
          inside = corners.some(([cx2, cy2]) => {
            const dx = x - cx2, dy = y - cy2;
            return dx * dx + dy * dy <= rr * rr;
          });
        }
      }
      if (!inside) imageData.data[idx + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Toolbar button wrapper with consistent styling */
function ToolbarBtn({
  onClick,
  active,
  className,
  disabled,
  title,
  children,
}: {
  onClick?: () => void;
  active?: boolean;
  className?: string;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
          : "border border-border bg-background text-foreground hover:bg-background-subtle",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Labeled slider control */
function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm text-foreground-muted whitespace-nowrap">
        {label}: <span className="font-semibold text-foreground">{value}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 accent-blue-500 cursor-pointer"
        aria-label={`${label} ${value}${unit}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

/**
 * CanvasImageEditor — interactive canvas-based image editor.
 *
 * Supports multiple edit modes: brush-remove, brush-blur, filter-bw,
 * flip-rotate, add-border, round-image, combine, profile-photo, ai-process.
 */
export function CanvasImageEditor({ tool, editorMode }: CanvasImageEditorProps) {
  // ── Phase state ──────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("upload");

  // ── Upload ───────────────────────────────────────────────────
  const [isDragOver, setIsDragOver]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // ── Source image ─────────────────────────────────────────────
  const [sourceFile, setSourceFile]       = useState<File | null>(null);
  const [sourceUrl, setSourceUrl]         = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 });

  // ── Canvas refs ──────────────────────────────────────────────
  /** Main editable canvas */
  const mainCanvasRef    = useRef<HTMLCanvasElement>(null);
  /** Overlay canvas: brush cursor + stroke preview */
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  /** Off-screen mask for brush strokes */
  const maskCanvasRef    = useRef<HTMLCanvasElement>(null);

  // ── Brush state ──────────────────────────────────────────────
  const [brushSize, setBrushSize]         = useState(30);
  const [brushStrokes, setBrushStrokes]   = useState<BrushStroke[]>([]);
  const isDrawingRef = useRef(false);
  const lastStrokeRef = useRef<{ x: number; y: number } | null>(null);

  // ── Zoom ─────────────────────────────────────────────────────
  const [zoomActive, setZoomActive] = useState(false);

  // ── B&W filter controls ──────────────────────────────────────
  const [bwBrightness, setBwBrightness] = useState(100);
  const [bwContrast, setBwContrast]     = useState(100);

  // ── Blur/pixelate ────────────────────────────────────────────
  const blurSubMode: BlurSubMode =
    tool.slug?.includes("pixelate") ? "pixelate" : "blur";
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [pixelSize, setPixelSize]         = useState(16);

  // ── Flip/rotate ──────────────────────────────────────────────
  // We accumulate transforms by re-drawing the canvas
  const transformHistoryRef = useRef<ImageData[]>([]);

  // ── Border ───────────────────────────────────────────────────
  const [borderWidth, setBorderWidth]   = useState(10);
  const [borderColor, setBorderColor]   = useState("#000000");
  const [borderStyle, setBorderStyle]   = useState<BorderStyle>("solid");

  // ── Round image ──────────────────────────────────────────────
  const [roundShape, setRoundShape]     = useState<RoundShape>("circle");
  const [roundRadius, setRoundRadius]   = useState(40);

  // ── Combine ──────────────────────────────────────────────────
  const [combineImages, setCombineImages] = useState<CombineImage[]>([]);
  const [combineLayout, setCombineLayout] = useState<CombineLayout>("side-by-side");
  const [combineSpacing, setCombineSpacing] = useState(8);
  const combineInputRef = useRef<HTMLInputElement>(null);

  // ── Profile photo ────────────────────────────────────────────
  const [profilePlatform, setProfilePlatform] = useState<ProfilePlatform>("linkedin");
  const [profileShape, setProfileShape]       = useState<ProfileShape>("circle");

  // ── AI process ───────────────────────────────────────────────
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress]     = useState(0);

  // ── Download format / quality ────────────────────────────────
  const [dlFormat, setDlFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [dlQuality, setDlQuality] = useState(92);

  // ── Result / error ───────────────────────────────────────────
  const [isDone, setIsDone]         = useState(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Draw on image ─────────────────────────────────────────────
  const [drawTool, setDrawTool]     = useState<DrawTool>("pen");
  const [drawColor, setDrawColor]   = useState("#e53e3e");
  const [drawSize, setDrawSize]     = useState(8);
  const drawHistoryRef              = useRef<ImageData[]>([]);
  const isDrawingOnCanvasRef        = useRef(false);
  const drawLastRef                 = useRef<{ x: number; y: number } | null>(null);

  // ── Adjust image ──────────────────────────────────────────────
  const [adjBrightness, setAdjBrightness] = useState(100);
  const [adjContrast, setAdjContrast]     = useState(100);
  const [adjSaturation, setAdjSaturation] = useState(100);

  // ── Color filter ──────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState("normal");

  // ── Crop ──────────────────────────────────────────────────────
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const cropDragRef = useRef<{
    type: "move" | "tl" | "tr" | "bl" | "br";
    startX: number;
    startY: number;
    startBox: CropBox;
  } | null>(null);

  // ─── Cleanup source URL ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  // ─── Cleanup combine image URLs ──────────────────────────────
  useEffect(() => {
    return () => {
      combineImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [combineImages]);

  // ─────────────────────────────────────────────
  // Image loading
  // ─────────────────────────────────────────────

  const loadImageToCanvas = useCallback((url: string) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });

      // Sync overlay + mask canvases
      const overlay = overlayCanvasRef.current;
      if (overlay) { overlay.width = img.naturalWidth; overlay.height = img.naturalHeight; }
      const mask = maskCanvasRef.current;
      if (mask) { mask.width = img.naturalWidth; mask.height = img.naturalHeight; }

      // Seed transform history
      transformHistoryRef.current = [ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)];

      // If combine mode, add this as first image
      if (editorMode === "combine" && sourceFile) {
        setCombineImages([{ id: "initial", file: sourceFile, url }]);
      }
    };
    img.src = url;
  }, [editorMode, sourceFile]);

  useEffect(() => {
    if (sourceUrl && phase === "editor") {
      loadImageToCanvas(sourceUrl);
    }
  }, [sourceUrl, phase, loadImageToCanvas]);

  // ─────────────────────────────────────────────
  // File selection
  // ─────────────────────────────────────────────

  const handleFileSelected = useCallback(
    (file: File) => {
      const err = validateFile(file, tool.acceptedFileTypes, tool.maxFileSizeMB);
      if (err) { setUploadError(err); return; }
      setUploadError(null);
      setSourceFile(file);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
      setBrushStrokes([]);
      setIsDone(false);
      setErrorMsg(null);
      setPhase("editor");
    },
    [tool.acceptedFileTypes, tool.maxFileSizeMB, sourceUrl]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelected(file);
    },
    [handleFileSelected]
  );

  // ─────────────────────────────────────────────
  // Brush drawing (brush-remove / brush-blur)
  // ─────────────────────────────────────────────

  /** Convert event coordinates (screen-space on overlay canvas) to canvas-space */
  const toCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent): { cx: number; cy: number } => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return { cx: 0, cy: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top)  * scaleY;
      return { cx, cy };
    },
    []
  );

  const isBrushMode = editorMode === "brush-remove" || editorMode === "brush-blur";

  /** Color of the brush overlay */
  const brushColor = editorMode === "brush-remove"
    ? "rgba(255, 80, 40, 0.45)"
    : "rgba(30, 160, 255, 0.45)";

  /** Paint a brush circle on the overlay canvas */
  const paintOverlayCircle = useCallback(
    (cx: number, cy: number, r: number, clear = false) => {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext("2d");
      if (!ctx) return;
      if (clear) {
        ctx.clearRect(cx - r - 2, cy - r - 2, r * 2 + 4, r * 2 + 4);
        return;
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = brushColor;
      ctx.fill();
    },
    [brushColor]
  );

  /** Paint a brush circle on the mask canvas (for processing) */
  const paintMaskCircle = useCallback((cx: number, cy: number, r: number) => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,0,0,1)";
    ctx.fill();
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isBrushMode) return;
      isDrawingRef.current = true;
      const { cx, cy } = toCanvasCoords(e);
      lastStrokeRef.current = { x: cx, y: cy };
      paintOverlayCircle(cx, cy, brushSize / 2);
      paintMaskCircle(cx, cy, brushSize / 2);
      setBrushStrokes((prev) => [...prev, { x: e.clientX, y: e.clientY, radius: brushSize / 2, canvasX: cx, canvasY: cy }]);
    },
    [isBrushMode, toCanvasCoords, brushSize, paintOverlayCircle, paintMaskCircle]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isBrushMode) return;
      const { cx, cy } = toCanvasCoords(e);

      // Draw cursor ring on overlay (always)
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext("2d");
        if (ctx) {
          // Clear and redraw strokes + cursor each frame would be too heavy;
          // instead keep painted strokes and just draw cursor ring on top.
          // We use a separate approach: we draw cursor by temporarily drawing + restoring
          // This is lightweight since we're only drawing a circle outline.
          // (Stroke marks accumulate and persist.)
        }
      }

      if (!isDrawingRef.current) return;
      const last = lastStrokeRef.current;
      if (!last) return;
      // Interpolate between last and current for smooth strokes
      const dist = Math.hypot(cx - last.x, cy - last.y);
      const steps = Math.max(1, Math.ceil(dist / (brushSize / 4)));
      for (let i = 0; i <= steps; i++) {
        const t   = i / steps;
        const ix  = last.x  + (cx  - last.x)  * t;
        const iy  = last.y  + (cy  - last.y)  * t;
        paintOverlayCircle(ix, iy, brushSize / 2);
        paintMaskCircle(ix, iy, brushSize / 2);
      }
      lastStrokeRef.current = { x: cx, y: cy };
      setBrushStrokes((prev) => [...prev, { x: e.clientX, y: e.clientY, radius: brushSize / 2, canvasX: cx, canvasY: cy }]);
    },
    [isBrushMode, toCanvasCoords, brushSize, paintOverlayCircle, paintMaskCircle]
  );

  const onMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastStrokeRef.current = null;
  }, []);

  const onMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    lastStrokeRef.current = null;
  }, []);

  // ─────────────────────────────────────────────
  // Brush: Undo
  // ─────────────────────────────────────────────

  const handleUndoBrush = useCallback(() => {
    if (brushStrokes.length === 0) return;
    // Remove last stroke from array and redraw overlay mask from scratch
    const next = brushStrokes.slice(0, -1);
    setBrushStrokes(next);

    // Clear both overlay and mask, redraw from remaining strokes
    const overlay = overlayCanvasRef.current;
    const mask    = maskCanvasRef.current;
    if (!overlay || !mask) return;
    const overlayCtx = overlay.getContext("2d");
    const maskCtx    = mask.getContext("2d");
    if (!overlayCtx || !maskCtx) return;

    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    maskCtx.clearRect(0, 0, mask.width, mask.height);

    next.forEach(({ canvasX, canvasY, radius }) => {
      overlayCtx.beginPath();
      overlayCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      overlayCtx.fillStyle = brushColor;
      overlayCtx.fill();

      maskCtx.beginPath();
      maskCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      maskCtx.fillStyle = "rgba(255,0,0,1)";
      maskCtx.fill();
    });
  }, [brushStrokes, brushColor]);

  const handleClearMask = useCallback(() => {
    setBrushStrokes([]);
    const overlay = overlayCanvasRef.current;
    const mask    = maskCanvasRef.current;
    if (overlay) overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
    if (mask)    mask.getContext("2d")?.clearRect(0, 0, mask.width, mask.height);
  }, []);

  // ─────────────────────────────────────────────
  // brush-remove: Remove action
  // ─────────────────────────────────────────────

  const handleRemove = useCallback(() => {
    const canvas = mainCanvasRef.current;
    const mask   = maskCanvasRef.current;
    if (!canvas || !mask) return;
    const ctx     = canvas.getContext("2d");
    const maskCtx = mask.getContext("2d");
    if (!ctx || !maskCtx) return;
    if (brushStrokes.length === 0) { setErrorMsg("Paint over the area to remove first."); return; }
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      applyInpaint(ctx, maskCtx, canvas.width, canvas.height);
      // Clear mask and overlay after processing
      handleClearMask();
      setIsDone(true);
      setIsProcessing(false);
    }, 50);
  }, [brushStrokes, handleClearMask]);

  // ─────────────────────────────────────────────
  // brush-blur: Apply blur / pixelate
  // ─────────────────────────────────────────────

  const handleApplyBlur = useCallback(() => {
    const canvas = mainCanvasRef.current;
    const mask   = maskCanvasRef.current;
    if (!canvas || !mask) return;
    const ctx     = canvas.getContext("2d");
    const maskCtx = mask.getContext("2d");
    if (!ctx || !maskCtx) return;
    if (brushStrokes.length === 0) { setErrorMsg("Paint over the area to blur first."); return; }
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      if (blurSubMode === "pixelate") {
        applyPixelateToMask(ctx, maskCtx, canvas.width, canvas.height, pixelSize);
      } else {
        applyBlurToMask(ctx, maskCtx, canvas.width, canvas.height, blurIntensity);
      }
      handleClearMask();
      setIsDone(true);
      setIsProcessing(false);
    }, 50);
  }, [brushStrokes, blurSubMode, blurIntensity, pixelSize, handleClearMask]);

  // ─────────────────────────────────────────────
  // filter-bw: Apply B&W
  // ─────────────────────────────────────────────

  const handleApplyBW = useCallback(() => {
    if (!sourceUrl) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setErrorMsg(null);
    // Always reload original image first so re-applying gives correct result
    const img = new window.Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setIsProcessing(false); return; }
      ctx.drawImage(img, 0, 0);
      applyBlackAndWhite(ctx, canvas.width, canvas.height, bwBrightness, bwContrast);
      setIsDone(true);
      setIsProcessing(false);
    };
    img.src = sourceUrl;
  }, [sourceUrl, bwBrightness, bwContrast]);

  // B&W live preview via CSS filter (doesn't modify canvas data)
  const bwFilterStyle: React.CSSProperties = editorMode === "filter-bw" && !isDone
    ? {
        filter: `grayscale(1) brightness(${bwBrightness / 100}) contrast(${bwContrast / 100})`,
      }
    : {};

  // ─────────────────────────────────────────────
  // flip-rotate: Transform operations
  // ─────────────────────────────────────────────

  const saveTransformHistory = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    transformHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // Cap history at 20 steps
    if (transformHistoryRef.current.length > 20) transformHistoryRef.current.shift();
  }, []);

  const handleFlipH = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveTransformHistory();
    const temp = document.createElement("canvas");
    temp.width = canvas.width; temp.height = canvas.height;
    const tCtx = temp.getContext("2d")!;
    tCtx.drawImage(canvas, 0, 0);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(temp, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    setIsDone(true);
  }, [saveTransformHistory]);

  const handleFlipV = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveTransformHistory();
    const temp = document.createElement("canvas");
    temp.width = canvas.width; temp.height = canvas.height;
    const tCtx = temp.getContext("2d")!;
    tCtx.drawImage(canvas, 0, 0);
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(temp, 0, -canvas.height, canvas.width, canvas.height);
    ctx.restore();
    setIsDone(true);
  }, [saveTransformHistory]);

  const handleRotate = useCallback((clockwise: boolean) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveTransformHistory();
    const { width: w, height: h } = canvas;
    const temp = document.createElement("canvas");
    temp.width = w; temp.height = h;
    const tCtx = temp.getContext("2d")!;
    tCtx.drawImage(canvas, 0, 0);

    // Swap dimensions
    canvas.width = h; canvas.height = w;
    ctx.save();
    if (clockwise) {
      ctx.translate(h, 0);
      ctx.rotate(Math.PI / 2);
    } else {
      ctx.translate(0, w);
      ctx.rotate(-Math.PI / 2);
    }
    ctx.drawImage(temp, 0, 0);
    ctx.restore();
    setImageDimensions({ w: h, h: w });

    // Resize overlay + mask
    const overlay = overlayCanvasRef.current;
    const mask    = maskCanvasRef.current;
    if (overlay) { overlay.width = h; overlay.height = w; }
    if (mask)    { mask.width    = h; mask.height    = w; }
    setIsDone(true);
  }, [saveTransformHistory]);

  const handleResetTransforms = useCallback(() => {
    if (transformHistoryRef.current.length < 2) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Go back to original
    const original = transformHistoryRef.current[0];
    canvas.width  = original.width;
    canvas.height = original.height;
    ctx.putImageData(original, 0, 0);
    setImageDimensions({ w: original.width, h: original.height });
    const overlay = overlayCanvasRef.current;
    const mask    = maskCanvasRef.current;
    if (overlay) { overlay.width = original.width; overlay.height = original.height; }
    if (mask)    { mask.width    = original.width; mask.height    = original.height; }
    setIsDone(false);
  }, []);

  const handleUndoTransform = useCallback(() => {
    if (transformHistoryRef.current.length < 2) return;
    const prev = transformHistoryRef.current[transformHistoryRef.current.length - 2];
    transformHistoryRef.current.pop();
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width  = prev.width;
    canvas.height = prev.height;
    ctx.putImageData(prev, 0, 0);
    setImageDimensions({ w: prev.width, h: prev.height });
    const overlay = overlayCanvasRef.current;
    const mask    = maskCanvasRef.current;
    if (overlay) { overlay.width = prev.width; overlay.height = prev.height; }
    if (mask)    { mask.width    = prev.width; mask.height    = prev.height; }
  }, []);

  // ─────────────────────────────────────────────
  // add-border: Apply border
  // ─────────────────────────────────────────────

  const handleApplyBorder = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      const { width: w, height: h } = canvas;
      const bw = borderWidth;
      // Save original
      const temp = document.createElement("canvas");
      temp.width = w; temp.height = h;
      temp.getContext("2d")!.drawImage(canvas, 0, 0);
      // Resize canvas to include border
      canvas.width  = w + bw * 2;
      canvas.height = h + bw * 2;
      // Fill border
      if (borderStyle === "shadow") {
        ctx.shadowColor   = "rgba(0,0,0,0.5)";
        ctx.shadowBlur    = bw;
        ctx.shadowOffsetX = bw / 2;
        ctx.shadowOffsetY = bw / 2;
      }
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur  = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      if (borderStyle === "double") {
        // Inner border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth   = Math.max(1, bw / 5);
        ctx.strokeRect(bw / 2, bw / 2, w + bw, h + bw);
      }
      ctx.drawImage(temp, bw, bw);
      setImageDimensions({ w: canvas.width, h: canvas.height });
      setIsDone(true);
      setIsProcessing(false);
    }, 50);
  }, [borderWidth, borderColor, borderStyle]);

  // ─────────────────────────────────────────────
  // round-image: Apply rounding
  // ─────────────────────────────────────────────

  const handleApplyRound = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      applyRoundClip(ctx, canvas.width, canvas.height, roundShape, roundRadius);
      setIsDone(true);
      setIsProcessing(false);
    }, 50);
  }, [roundShape, roundRadius]);

  // ─────────────────────────────────────────────
  // combine: Add + combine images
  // ─────────────────────────────────────────────

  const handleAddCombineImage = useCallback(
    (file: File) => {
      const err = validateFile(file, tool.acceptedFileTypes, tool.maxFileSizeMB);
      if (err) { setErrorMsg(err); return; }
      const url = URL.createObjectURL(file);
      setCombineImages((prev) => [...prev, { id: Date.now().toString(), file, url }]);
    },
    [tool.acceptedFileTypes, tool.maxFileSizeMB]
  );

  const handleRemoveCombineImage = useCallback((id: string) => {
    setCombineImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleCombine = useCallback(() => {
    if (combineImages.length < 2) { setErrorMsg("Add at least 2 images to combine."); return; }
    setIsProcessing(true);
    setErrorMsg(null);

    const loadedImgs: HTMLImageElement[] = [];
    let loaded = 0;

    combineImages.forEach((ci, idx) => {
      const img = new window.Image();
      img.onload = () => {
        loadedImgs[idx] = img;
        loaded++;
        if (loaded !== combineImages.length) return;

        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const s = combineSpacing;
        const maxH = Math.max(...loadedImgs.map((i) => i.naturalHeight));
        const maxW = Math.max(...loadedImgs.map((i) => i.naturalWidth));

        if (combineLayout === "side-by-side") {
          canvas.width  = loadedImgs.reduce((sum, i) => sum + i.naturalWidth, 0) + s * (loadedImgs.length - 1);
          canvas.height = maxH;
          let x = 0;
          loadedImgs.forEach((i) => { ctx.drawImage(i, x, (maxH - i.naturalHeight) / 2); x += i.naturalWidth + s; });
        } else if (combineLayout === "vertical") {
          canvas.width  = maxW;
          canvas.height = loadedImgs.reduce((sum, i) => sum + i.naturalHeight, 0) + s * (loadedImgs.length - 1);
          let y = 0;
          loadedImgs.forEach((i) => { ctx.drawImage(i, (maxW - i.naturalWidth) / 2, y); y += i.naturalHeight + s; });
        } else {
          // grid-2x2
          const cols = 2;
          const rows = Math.ceil(loadedImgs.length / cols);
          canvas.width  = maxW * cols + s * (cols - 1);
          canvas.height = maxH * rows + s * (rows - 1);
          loadedImgs.forEach((i, n) => {
            const col = n % cols, row = Math.floor(n / cols);
            ctx.drawImage(i, col * (maxW + s), row * (maxH + s));
          });
        }
        setImageDimensions({ w: canvas.width, h: canvas.height });
        setIsDone(true);
        setIsProcessing(false);
      };
      img.src = ci.url;
    });
  }, [combineImages, combineLayout, combineSpacing]);

  // ─────────────────────────────────────────────
  // profile-photo: Crop to platform size
  // ─────────────────────────────────────────────

  const handleApplyProfile = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      const { w, h } = PROFILE_SIZES[profilePlatform];
      const temp = document.createElement("canvas");
      temp.width = canvas.width; temp.height = canvas.height;
      temp.getContext("2d")!.drawImage(canvas, 0, 0);

      canvas.width  = w;
      canvas.height = h;

      // Crop-fit: cover mode
      const srcAR  = temp.width / temp.height;
      const destAR = w / h;
      let sx = 0, sy = 0, sw = temp.width, sh = temp.height;
      if (srcAR > destAR) { sw = temp.height * destAR; sx = (temp.width - sw) / 2; }
      else                { sh = temp.width  / destAR; sy = (temp.height - sh) / 2; }
      ctx.drawImage(temp, sx, sy, sw, sh, 0, 0, w, h);

      if (profileShape === "circle") {
        applyRoundClip(ctx, w, h, "circle", Math.min(w, h) / 2);
      }
      setImageDimensions({ w, h });
      setIsDone(true);
      setIsProcessing(false);
    }, 50);
  }, [profilePlatform, profileShape]);

  // ─────────────────────────────────────────────
  // ai-process: Simulate AI
  // ─────────────────────────────────────────────

  const handleAiProcess = useCallback(() => {
    setAiProcessing(true);
    setAiProgress(0);
    setErrorMsg(null);
    const interval = setInterval(() => {
      setAiProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setAiProcessing(false);
          setIsDone(true);
          return 100;
        }
        return p + 4;
      });
    }, 120);
  }, []);

  // ─────────────────────────────────────────────
  // draw: direct canvas drawing
  // ─────────────────────────────────────────────

  const saveDrawHistory = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (drawHistoryRef.current.length > 30) drawHistoryRef.current.shift();
  }, []);

  const handleDrawMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (editorMode !== "draw") return;
      const { cx, cy } = toCanvasCoords(e);
      saveDrawHistory();
      isDrawingOnCanvasRef.current = true;
      drawLastRef.current = { x: cx, y: cy };

      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation =
        drawTool === "eraser" ? "destination-out" : "source-over";
      ctx.fillStyle = drawTool === "eraser" ? "rgba(0,0,0,1)" : drawColor;
      ctx.beginPath();
      ctx.arc(cx, cy, drawSize / 2, 0, Math.PI * 2);
      ctx.fill();
      setIsDone(true);
    },
    [editorMode, toCanvasCoords, saveDrawHistory, drawTool, drawColor, drawSize]
  );

  const handleDrawMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (editorMode !== "draw" || !isDrawingOnCanvasRef.current) return;
      const { cx, cy } = toCanvasCoords(e);
      const last = drawLastRef.current;
      if (!last) return;

      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation =
        drawTool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = drawTool === "eraser" ? "rgba(0,0,0,1)" : drawColor;
      ctx.lineWidth = drawSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      drawLastRef.current = { x: cx, y: cy };
    },
    [editorMode, toCanvasCoords, drawTool, drawColor, drawSize]
  );

  const handleDrawMouseUp = useCallback(() => {
    if (editorMode !== "draw") return;
    isDrawingOnCanvasRef.current = false;
    drawLastRef.current = null;
    const ctx = mainCanvasRef.current?.getContext("2d");
    if (ctx) ctx.globalCompositeOperation = "source-over";
  }, [editorMode]);

  const handleUndoDraw = useCallback(() => {
    if (drawHistoryRef.current.length === 0) return;
    const prev = drawHistoryRef.current.pop()!;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(prev, 0, 0);
    if (drawHistoryRef.current.length === 0) setIsDone(false);
  }, []);

  const handleClearDraw = useCallback(() => {
    if (!sourceUrl) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      drawHistoryRef.current = [];
      setIsDone(false);
    };
    img.src = sourceUrl;
  }, [sourceUrl]);

  // ─────────────────────────────────────────────
  // adjust: brightness / contrast / saturation
  // ─────────────────────────────────────────────

  // Live CSS filter preview while adjusting
  const adjustFilterStyle: React.CSSProperties =
    editorMode === "adjust" && !isDone
      ? {
          filter: `brightness(${adjBrightness / 100}) contrast(${adjContrast / 100}) saturate(${adjSaturation / 100})`,
        }
      : {};

  const handleApplyAdjust = useCallback(() => {
    if (!sourceUrl) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setErrorMsg(null);
    const img = new window.Image();
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width  = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext("2d")!;
      ctx.filter = `brightness(${adjBrightness / 100}) contrast(${adjContrast / 100}) saturate(${adjSaturation / 100})`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";
      canvas.width  = offscreen.width;
      canvas.height = offscreen.height;
      canvas.getContext("2d")!.drawImage(offscreen, 0, 0);
      setIsDone(true);
      setIsProcessing(false);
    };
    img.src = sourceUrl;
  }, [sourceUrl, adjBrightness, adjContrast, adjSaturation]);

  const handleResetAdjust = useCallback(() => {
    setAdjBrightness(100);
    setAdjContrast(100);
    setAdjSaturation(100);
    setIsDone(false);
    if (sourceUrl) loadImageToCanvas(sourceUrl);
  }, [sourceUrl, loadImageToCanvas]);

  // ─────────────────────────────────────────────
  // color-filter: preset filter gallery
  // ─────────────────────────────────────────────

  const filterPreviewStyle: React.CSSProperties =
    editorMode === "color-filter" && !isDone && activeFilter !== "normal"
      ? { filter: COLOR_FILTERS.find((f) => f.id === activeFilter)?.css ?? "none" }
      : {};

  const handleApplyFilter = useCallback(() => {
    if (activeFilter === "normal") {
      setIsDone(true);
      return;
    }
    if (!sourceUrl) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setErrorMsg(null);
    const img = new window.Image();
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width  = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext("2d")!;
      ctx.filter = COLOR_FILTERS.find((f) => f.id === activeFilter)?.css ?? "none";
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";
      canvas.width  = offscreen.width;
      canvas.height = offscreen.height;
      canvas.getContext("2d")!.drawImage(offscreen, 0, 0);
      setIsDone(true);
      setIsProcessing(false);
    };
    img.src = sourceUrl;
  }, [sourceUrl, activeFilter]);

  // ─────────────────────────────────────────────
  // crop: interactive crop with overlay handles
  // ─────────────────────────────────────────────

  // Initialize crop box when image dimensions are known
  useEffect(() => {
    if (editorMode === "crop" && imageDimensions.w > 0) {
      const margin = 0.1;
      setCropBox({
        x: Math.round(imageDimensions.w * margin),
        y: Math.round(imageDimensions.h * margin),
        w: Math.round(imageDimensions.w * (1 - margin * 2)),
        h: Math.round(imageDimensions.h * (1 - margin * 2)),
      });
    }
  }, [editorMode, imageDimensions.w, imageDimensions.h]);

  // Draw crop overlay on the overlay canvas
  const drawCropOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !cropBox) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    const { x, y, w, h } = cropBox;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Dark mask outside crop
    ctx.fillStyle = "rgba(0,0,0,0.52)";
    ctx.fillRect(0, 0, overlay.width, overlay.height);
    ctx.clearRect(x, y, w, h);

    // Crop border
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    // Rule-of-thirds grid
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 3, y);     ctx.lineTo(x + w / 3, y + h);
    ctx.moveTo(x + w * 2 / 3, y); ctx.lineTo(x + w * 2 / 3, y + h);
    ctx.moveTo(x, y + h / 3);     ctx.lineTo(x + w, y + h / 3);
    ctx.moveTo(x, y + h * 2 / 3); ctx.lineTo(x + w, y + h * 2 / 3);
    ctx.stroke();

    // Corner handles
    const hs = 10;
    ctx.fillStyle = "white";
    for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]] as [number, number][]) {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    }
  }, [cropBox]);

  useEffect(() => {
    if (editorMode === "crop") drawCropOverlay();
  }, [editorMode, cropBox, drawCropOverlay]);

  const handleCropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (editorMode !== "crop" || !cropBox) return;
      const { cx, cy } = toCanvasCoords(e);
      const { x, y, w, h } = cropBox;
      const hs = 14;

      let type: (typeof cropDragRef.current extends null ? never : NonNullable<typeof cropDragRef.current>["type"]) | null = null;
      if (Math.abs(cx - x)       < hs && Math.abs(cy - y)       < hs) type = "tl";
      else if (Math.abs(cx - (x + w)) < hs && Math.abs(cy - y)       < hs) type = "tr";
      else if (Math.abs(cx - x)       < hs && Math.abs(cy - (y + h)) < hs) type = "bl";
      else if (Math.abs(cx - (x + w)) < hs && Math.abs(cy - (y + h)) < hs) type = "br";
      else if (cx >= x && cx <= x + w && cy >= y && cy <= y + h) type = "move";

      if (type) {
        cropDragRef.current = { type, startX: cx, startY: cy, startBox: { ...cropBox } };
      }
    },
    [editorMode, cropBox, toCanvasCoords]
  );

  const handleCropMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (editorMode !== "crop" || !cropDragRef.current) return;
      const { cx, cy } = toCanvasCoords(e);
      const { type, startX, startY, startBox } = cropDragRef.current;
      const dx = cx - startX;
      const dy = cy - startY;
      const iw = imageDimensions.w;
      const ih = imageDimensions.h;
      const MIN = 20;

      let nb = { ...startBox };
      if (type === "move") {
        nb.x = Math.max(0, Math.min(iw - nb.w, startBox.x + dx));
        nb.y = Math.max(0, Math.min(ih - nb.h, startBox.y + dy));
      } else if (type === "tl") {
        const nx = Math.max(0, Math.min(startBox.x + startBox.w - MIN, startBox.x + dx));
        const ny = Math.max(0, Math.min(startBox.y + startBox.h - MIN, startBox.y + dy));
        nb = { x: nx, y: ny, w: startBox.x + startBox.w - nx, h: startBox.y + startBox.h - ny };
      } else if (type === "tr") {
        const ny = Math.max(0, Math.min(startBox.y + startBox.h - MIN, startBox.y + dy));
        nb = { x: startBox.x, y: ny, w: Math.max(MIN, Math.min(iw - startBox.x, startBox.w + dx)), h: startBox.y + startBox.h - ny };
      } else if (type === "bl") {
        const nx = Math.max(0, Math.min(startBox.x + startBox.w - MIN, startBox.x + dx));
        nb = { x: nx, y: startBox.y, w: startBox.x + startBox.w - nx, h: Math.max(MIN, Math.min(ih - startBox.y, startBox.h + dy)) };
      } else if (type === "br") {
        nb = { x: startBox.x, y: startBox.y, w: Math.max(MIN, Math.min(iw - startBox.x, startBox.w + dx)), h: Math.max(MIN, Math.min(ih - startBox.y, startBox.h + dy)) };
      }
      setCropBox(nb);
    },
    [editorMode, toCanvasCoords, imageDimensions]
  );

  const handleCropMouseUp = useCallback(() => {
    cropDragRef.current = null;
  }, []);

  const handleApplyCrop = useCallback(() => {
    if (!cropBox) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y, w, h } = cropBox;
    const temp = document.createElement("canvas");
    temp.width = w; temp.height = h;
    temp.getContext("2d")!.drawImage(canvas, x, y, w, h, 0, 0, w, h);
    canvas.width = w; canvas.height = h;
    ctx.drawImage(temp, 0, 0);
    setImageDimensions({ w, h });

    const overlay = overlayCanvasRef.current;
    if (overlay) {
      overlay.width = w; overlay.height = h;
      overlay.getContext("2d")?.clearRect(0, 0, w, h);
    }
    const mask = maskCanvasRef.current;
    if (mask) { mask.width = w; mask.height = h; }

    // Re-init crop box after crop applied
    const margin = 0.1;
    setCropBox({ x: Math.round(w * margin), y: Math.round(h * margin), w: Math.round(w * (1 - margin * 2)), h: Math.round(h * (1 - margin * 2)) });
    setIsDone(true);
  }, [cropBox]);

  // ─────────────────────────────────────────────
  // Download
  // ─────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const baseName = sourceFile ? sourceFile.name.replace(/\.[^.]+$/, "") : "image";
    // For round-image with circle shape, force PNG to preserve transparency
    const fmt = (editorMode === "round-image" && roundShape === "circle") ? "image/png" : dlFormat;
    downloadCanvas(canvas, `${baseName}-${editorMode}.png`, fmt, dlQuality / 100);
  }, [sourceFile, editorMode, dlFormat, dlQuality, roundShape]);

  // ─────────────────────────────────────────────
  // Start Over
  // ─────────────────────────────────────────────

  const handleStartOver = useCallback(() => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceFile(null);
    setSourceUrl(null);
    setBrushStrokes([]);
    setIsDone(false);
    setErrorMsg(null);
    setIsProcessing(false);
    setAiProcessing(false);
    setAiProgress(0);
    setCombineImages([]);
    setPhase("upload");
    transformHistoryRef.current = [];
    drawHistoryRef.current = [];
    setAdjBrightness(100);
    setAdjContrast(100);
    setAdjSaturation(100);
    setActiveFilter("normal");
    setCropBox(null);
  }, [sourceUrl]);

  // ─────────────────────────────────────────────
  // Render — Phase 1: Upload
  // ─────────────────────────────────────────────

  if (phase === "upload") {
    const acceptAttr =
      tool.acceptedFileTypes.length > 0
        ? tool.acceptedFileTypes.join(",")
        : "image/*";
    return (
      <div className="w-full">
        {/* Upload zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => uploadInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={`Upload image. Accepted formats: ${acceptAttr}. Max size: ${tool.maxFileSizeMB} MB`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              uploadInputRef.current?.click();
            }
          }}
          className={clsx(
            "relative flex flex-col items-center justify-center gap-5",
            "rounded-2xl border-2 border-dashed px-8 py-16 text-center",
            "select-none outline-none cursor-pointer",
            "transition-all duration-300",
            "focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2",
            isDragOver
              ? "border-blue-500 bg-blue-500/5 scale-[1.01]"
              : "border-border bg-background-subtle hover:border-blue-400 hover:bg-blue-500/[0.03]"
          )}
        >
          <div
            className={clsx(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
              isDragOver
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-background border border-border text-foreground-muted"
            )}
          >
            {isDragOver ? (
              <Download className="h-8 w-8 rotate-180" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>

          <div className="space-y-1.5">
            <p className={clsx("text-base font-semibold transition-colors", isDragOver ? "text-blue-600" : "text-foreground")}>
              {isDragOver ? "Drop your image here" : "Drag & drop your image here"}
            </p>
            <p className="text-sm text-foreground-muted">
              or{" "}
              <span className="font-medium text-blue-500 underline underline-offset-2 decoration-dashed">
                click to browse
              </span>{" "}
              from your computer
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
              {acceptAttr}
            </span>
            {tool.maxFileSizeMB > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Max {tool.maxFileSizeMB} MB
              </span>
            )}
          </div>

          <input
            ref={uploadInputRef}
            type="file"
            className="sr-only"
            accept={acceptAttr}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = "";
            }}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        {/* Upload error */}
        {uploadError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render — Phase 2: Editor
  // ─────────────────────────────────────────────

  // Canvas dimensions are managed imperatively via loadImageToCanvas.
  // Do NOT pass width/height as JSX props — changing them would clear the canvas.

  return (
    <div className="w-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

      {/* ── TOOLBAR ─────────────────────────────────────────── */}
      <div
        className={clsx(
          "sticky top-0 z-10 flex flex-wrap items-center gap-2",
          "border-b border-border bg-white dark:bg-card px-4 py-2.5 shadow-sm"
        )}
        role="toolbar"
        aria-label="Image editor toolbar"
      >
        {/* ─── brush-remove toolbar ─── */}
        {editorMode === "brush-remove" && (
          <>
            <ToolbarBtn onClick={handleUndoBrush} disabled={brushStrokes.length === 0} title="Undo last brush stroke">
              <Undo2 className="h-4 w-4" />
              Undo Brush
            </ToolbarBtn>
            <ToolbarBtn onClick={handleClearMask} disabled={brushStrokes.length === 0} title="Clear all brush strokes">
              <Trash2 className="h-4 w-4" />
              Clear
            </ToolbarBtn>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <ToolbarBtn onClick={() => setZoomActive((v) => !v)} active={zoomActive} title={zoomActive ? "Disable zoom" : "Enable zoom"}>
              {zoomActive ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              Zoom {zoomActive ? "On" : "Off"}
            </ToolbarBtn>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <SliderControl label="Brush size" value={brushSize} min={5} max={100} unit="px" onChange={setBrushSize} />
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleRemove}
                disabled={isProcessing || brushStrokes.length === 0}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Remove
              </button>
            </div>
          </>
        )}

        {/* ─── brush-blur toolbar ─── */}
        {editorMode === "brush-blur" && (
          <>
            <ToolbarBtn onClick={handleUndoBrush} disabled={brushStrokes.length === 0} title="Undo last brush stroke">
              <Undo2 className="h-4 w-4" />
              Undo
            </ToolbarBtn>
            <ToolbarBtn onClick={handleClearMask} disabled={brushStrokes.length === 0} title="Clear all brush strokes">
              <Trash2 className="h-4 w-4" />
              Clear Mask
            </ToolbarBtn>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <SliderControl label="Brush size" value={brushSize} min={5} max={100} unit="px" onChange={setBrushSize} />
            {blurSubMode === "blur" ? (
              <SliderControl label="Blur intensity" value={blurIntensity} min={1} max={30} onChange={setBlurIntensity} />
            ) : (
              <SliderControl label="Pixel size" value={pixelSize} min={4} max={64} onChange={setPixelSize} />
            )}
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleApplyBlur}
                disabled={isProcessing || brushStrokes.length === 0}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {blurSubMode === "pixelate" ? "Pixelate" : "Apply Blur"}
              </button>
            </div>
          </>
        )}

        {/* ─── filter-bw toolbar ─── */}
        {editorMode === "filter-bw" && (
          <>
            <SliderControl label="Brightness" value={bwBrightness} min={50} max={200} unit="%" onChange={(v) => { setBwBrightness(v); setIsDone(false); }} />
            <SliderControl label="Contrast" value={bwContrast} min={50} max={200} unit="%" onChange={(v) => { setBwContrast(v); setIsDone(false); }} />
            <div className="ml-auto flex items-center gap-2">
              {isDone && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                    "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.97]",
                    "transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  )}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
              <button
                type="button"
                onClick={handleApplyBW}
                disabled={isProcessing}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isDone ? "Re-apply" : "Apply B&W"}
              </button>
            </div>
          </>
        )}

        {/* ─── flip-rotate toolbar ─── */}
        {editorMode === "flip-rotate" && (
          <>
            <ToolbarBtn onClick={handleFlipH} title="Flip horizontal">
              <FlipHorizontal className="h-4 w-4" />
              Flip H
            </ToolbarBtn>
            <ToolbarBtn onClick={handleFlipV} title="Flip vertical">
              <FlipVertical className="h-4 w-4" />
              Flip V
            </ToolbarBtn>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <ToolbarBtn onClick={() => handleRotate(true)} title="Rotate 90° clockwise">
              <RotateCw className="h-4 w-4" />
              90° CW
            </ToolbarBtn>
            <ToolbarBtn onClick={() => handleRotate(false)} title="Rotate 90° counter-clockwise">
              <RotateCcw className="h-4 w-4" />
              90° CCW
            </ToolbarBtn>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <ToolbarBtn onClick={handleUndoTransform} disabled={transformHistoryRef.current.length < 2} title="Undo last transform">
              <Undo2 className="h-4 w-4" />
              Undo
            </ToolbarBtn>
            <ToolbarBtn onClick={handleResetTransforms} disabled={transformHistoryRef.current.length < 2} title="Reset to original">
              <RefreshCw className="h-4 w-4" />
              Reset
            </ToolbarBtn>
          </>
        )}

        {/* ─── add-border toolbar ─── */}
        {editorMode === "add-border" && (
          <>
            <SliderControl label="Border width" value={borderWidth} min={1} max={80} unit="px" onChange={setBorderWidth} />
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-sm text-foreground-muted whitespace-nowrap" htmlFor="border-color-input">Color:</label>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
                <input
                  id="border-color-input"
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="h-5 w-7 rounded cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Border color"
                />
                <span className="text-xs font-mono text-foreground">{borderColor}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(["solid", "double", "shadow"] as BorderStyle[]).map((s) => (
                <ToolbarBtn key={s} onClick={() => setBorderStyle(s)} active={borderStyle === s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </ToolbarBtn>
              ))}
            </div>
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleApplyBorder}
                disabled={isProcessing}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Apply Border
              </button>
            </div>
          </>
        )}

        {/* ─── round-image toolbar ─── */}
        {editorMode === "round-image" && (
          <>
            <div className="flex items-center gap-1">
              <ToolbarBtn onClick={() => setRoundShape("circle")} active={roundShape === "circle"}>
                <Circle className="h-4 w-4" />
                Circle
              </ToolbarBtn>
              <ToolbarBtn onClick={() => setRoundShape("rounded")} active={roundShape === "rounded"}>
                <Square className="h-4 w-4" />
                Rounded
              </ToolbarBtn>
            </div>
            {roundShape === "rounded" && (
              <SliderControl label="Radius" value={roundRadius} min={5} max={200} unit="px" onChange={setRoundRadius} />
            )}
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleApplyRound}
                disabled={isProcessing}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Apply
              </button>
            </div>
          </>
        )}

        {/* ─── combine toolbar ─── */}
        {editorMode === "combine" && (
          <>
            <ToolbarBtn
              onClick={() => combineInputRef.current?.click()}
              title="Add another image"
            >
              <Plus className="h-4 w-4" />
              Add Image
            </ToolbarBtn>
            <div className="flex items-center gap-1">
              {(["side-by-side", "grid-2x2", "vertical"] as CombineLayout[]).map((l) => (
                <ToolbarBtn key={l} onClick={() => setCombineLayout(l)} active={combineLayout === l}>
                  {l === "side-by-side" ? "Side by Side" : l === "grid-2x2" ? "Grid 2×2" : "Vertical"}
                </ToolbarBtn>
              ))}
            </div>
            <SliderControl label="Spacing" value={combineSpacing} min={0} max={40} unit="px" onChange={setCombineSpacing} />
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleCombine}
                disabled={isProcessing || combineImages.length < 2}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Combine
              </button>
            </div>
            <input
              ref={combineInputRef}
              type="file"
              className="sr-only"
              accept={tool.acceptedFileTypes.join(",") || "image/*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAddCombineImage(file);
                e.target.value = "";
              }}
              aria-hidden="true"
              tabIndex={-1}
            />
          </>
        )}

        {/* ─── profile-photo toolbar ─── */}
        {editorMode === "profile-photo" && (
          <>
            <div className="flex items-center gap-1">
              {(Object.keys(PROFILE_SIZES) as ProfilePlatform[]).map((p) => (
                <ToolbarBtn key={p} onClick={() => setProfilePlatform(p)} active={profilePlatform === p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </ToolbarBtn>
              ))}
            </div>
            <span className="text-xs text-foreground-muted px-1">{PROFILE_SIZES[profilePlatform].label}</span>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <ToolbarBtn onClick={() => setProfileShape("circle")} active={profileShape === "circle"}>
                <Circle className="h-4 w-4" />
                Circle
              </ToolbarBtn>
              <ToolbarBtn onClick={() => setProfileShape("square")} active={profileShape === "square"}>
                <Square className="h-4 w-4" />
                Square
              </ToolbarBtn>
            </div>
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleApplyProfile}
                disabled={isProcessing}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Apply
              </button>
            </div>
          </>
        )}

        {/* ─── ai-process toolbar ─── */}
        {editorMode === "ai-process" && (
          <span className="text-sm font-medium text-foreground">
            <Sparkles className="inline h-4 w-4 text-blue-500 mr-1.5" />
            AI Processing — {tool.name}
          </span>
        )}

        {/* ─── draw toolbar ─── */}
        {editorMode === "draw" && (
          <>
            <ToolbarBtn onClick={() => setDrawTool("pen")} active={drawTool === "pen"} title="Pen / brush">
              <Pen className="h-4 w-4" />
              Pen
            </ToolbarBtn>
            <ToolbarBtn onClick={() => setDrawTool("eraser")} active={drawTool === "eraser"} title="Eraser">
              <Eraser className="h-4 w-4" />
              Eraser
            </ToolbarBtn>
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            {drawTool === "pen" && (
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-sm text-foreground-muted whitespace-nowrap" htmlFor="draw-color-input">Color:</label>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
                  <input
                    id="draw-color-input"
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="h-5 w-7 rounded cursor-pointer border-0 bg-transparent p-0"
                    aria-label="Draw color"
                  />
                  <span className="text-xs font-mono text-foreground">{drawColor}</span>
                </div>
              </div>
            )}
            <SliderControl label="Size" value={drawSize} min={2} max={60} unit="px" onChange={setDrawSize} />
            <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <ToolbarBtn onClick={handleUndoDraw} disabled={drawHistoryRef.current.length === 0} title="Undo">
              <Undo2 className="h-4 w-4" />
              Undo
            </ToolbarBtn>
            <ToolbarBtn onClick={handleClearDraw} title="Clear all drawing">
              <Trash2 className="h-4 w-4" />
              Clear
            </ToolbarBtn>
          </>
        )}

        {/* ─── adjust toolbar ─── */}
        {editorMode === "adjust" && (
          <>
            <SliderControl label="Brightness" value={adjBrightness} min={0} max={300} unit="%" onChange={(v) => { setAdjBrightness(v); setIsDone(false); }} />
            <SliderControl label="Contrast"   value={adjContrast}   min={0} max={300} unit="%" onChange={(v) => { setAdjContrast(v);   setIsDone(false); }} />
            <SliderControl label="Saturation" value={adjSaturation} min={0} max={300} unit="%" onChange={(v) => { setAdjSaturation(v); setIsDone(false); }} />
            <div className="ml-auto flex items-center gap-2">
              <ToolbarBtn onClick={handleResetAdjust} title="Reset to defaults">
                <RefreshCw className="h-4 w-4" />
                Reset
              </ToolbarBtn>
              <button
                type="button"
                onClick={handleApplyAdjust}
                disabled={isProcessing}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Apply
              </button>
            </div>
          </>
        )}

        {/* ─── color-filter toolbar ─── */}
        {editorMode === "color-filter" && (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setActiveFilter(f.id); setIsDone(false); }}
                  className={clsx(
                    "rounded-lg px-2.5 py-1 text-xs font-medium border transition-all",
                    activeFilter === f.id
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/40"
                      : "border-border bg-background text-foreground-muted hover:bg-background-subtle"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleApplyFilter}
                disabled={isProcessing}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Apply Filter
              </button>
            </div>
          </>
        )}

        {/* ─── crop toolbar ─── */}
        {editorMode === "crop" && (
          <>
            <span className="text-sm text-foreground-muted">
              <Crop className="inline h-4 w-4 mr-1.5 text-blue-500" />
              Drag corners or inside box to reposition
            </span>
            {cropBox && (
              <span className="text-xs text-foreground-muted/70">
                {Math.round(cropBox.w)} × {Math.round(cropBox.h)} px
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <ToolbarBtn
                onClick={() => {
                  if (!imageDimensions.w) return;
                  const m = 0.1;
                  setCropBox({ x: Math.round(imageDimensions.w * m), y: Math.round(imageDimensions.h * m), w: Math.round(imageDimensions.w * (1 - m * 2)), h: Math.round(imageDimensions.h * (1 - m * 2)) });
                }}
                title="Reset crop selection"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </ToolbarBtn>
              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={!cropBox}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold",
                  "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                )}
              >
                <Crop className="h-4 w-4" />
                Crop
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── CANVAS AREA ──────────────────────────────────────── */}
      <div
        className={clsx(
          "relative overflow-auto",
          // checkered background to show transparency
          "bg-[linear-gradient(45deg,#e5e5e5_25%,transparent_25%),linear-gradient(-45deg,#e5e5e5_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e5e5_75%),linear-gradient(-45deg,transparent_75%,#e5e5e5_75%)]",
          "[background-size:16px_16px]",
          "[background-position:0_0,0_8px,8px_-8px,-8px_0]",
          "dark:[--checker-light:#2a2a2a] dark:[--checker-dark:#1a1a1a]"
        )}
        style={{ minHeight: 400, maxHeight: "70vh" }}
      >
        {/* ai-process overlay UI */}
        {editorMode === "ai-process" && !isDone && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-sm">
            {!aiProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <button
                  type="button"
                  onClick={handleAiProcess}
                  className={clsx(
                    "inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-base font-semibold",
                    "bg-gradient-to-r from-blue-500 to-violet-500 text-white",
                    "shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40",
                    "transition-all duration-200 active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  )}
                >
                  <Sparkles className="h-5 w-5" />
                  Process with AI
                </button>
                <p className="text-xs text-white/60 max-w-xs text-center">
                  Note: AI processing requires backend connection. This is a demo simulation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 min-w-64">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
                <p className="text-sm font-semibold text-white">Processing with AI...</p>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-violet-400 rounded-full transition-all duration-200"
                    style={{ width: `${aiProgress}%` }}
                    role="progressbar"
                    aria-valuenow={aiProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="text-xs text-white/60">{aiProgress}% complete</p>
              </div>
            )}
          </div>
        )}

        {/* Combine: image thumbnail strip */}
        {editorMode === "combine" && combineImages.length > 0 && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-sm px-3 py-2">
            {combineImages.map((ci) => (
              <div key={ci.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ci.url}
                  alt={ci.file.name}
                  className="h-12 w-12 rounded-lg object-cover border border-white/20"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCombineImage(ci.id)}
                  className={clsx(
                    "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white",
                    "flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                    "text-[10px] font-bold leading-none"
                  )}
                  title={`Remove ${ci.file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Canvas container with optional zoom */}
        <div
          className="flex items-start justify-center p-6"
          style={{ minWidth: "fit-content" }}
        >
          <div
            className="relative inline-block"
            style={zoomActive ? { transform: "scale(1.5)", transformOrigin: "top left" } : undefined}
          >
            {/* Main canvas — dimensions set imperatively in loadImageToCanvas */}
            <canvas
              ref={mainCanvasRef}
              className={clsx("block max-w-full shadow-lg", editorMode === "draw" && "cursor-crosshair")}
              style={{
                maxWidth: "100%",
                height: "auto",
                ...bwFilterStyle,
                ...adjustFilterStyle,
                ...filterPreviewStyle,
              }}
              onMouseDown={editorMode === "draw" ? handleDrawMouseDown : undefined}
              onMouseMove={editorMode === "draw" ? handleDrawMouseMove : undefined}
              onMouseUp={editorMode === "draw" ? handleDrawMouseUp : undefined}
              onMouseLeave={editorMode === "draw" ? handleDrawMouseUp : undefined}
              aria-label="Image editor canvas"
            />

            {/* Overlay canvas — brush strokes + cursor / crop box */}
            {(isBrushMode || editorMode === "crop") && (
              <canvas
                ref={overlayCanvasRef}
                onMouseDown={editorMode === "crop" ? handleCropMouseDown : onMouseDown}
                onMouseMove={editorMode === "crop" ? handleCropMouseMove : onMouseMove}
                onMouseUp={editorMode === "crop" ? handleCropMouseUp : onMouseUp}
                onMouseLeave={editorMode === "crop" ? handleCropMouseUp : onMouseLeave}
                className={clsx(
                  "absolute inset-0",
                  isBrushMode ? "cursor-none" : "cursor-move"
                )}
                style={{ maxWidth: "100%", height: "auto" }}
                aria-hidden="true"
              />
            )}

            {/* Hidden mask canvas — never rendered, used for pixel operations */}
            <canvas
              ref={maskCanvasRef}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* ── BRUSH CURSOR — CSS custom cursor handled via canvas overlay ─── */}
      {/* Cursor ring drawn inline via useEffect below */}

      {/* ── BOTTOM BAR ───────────────────────────────────────── */}
      <div className="border-t border-border bg-background">

        {/* Format / quality row — shown when download is available */}
        {(isDone || editorMode === "flip-rotate" || editorMode === "draw" || editorMode === "crop") && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b border-border/50 bg-background-subtle">
            <span className="text-xs font-medium text-foreground-muted">Save as:</span>

            {/* Format selector */}
            <div className="flex rounded-lg overflow-hidden border border-border text-xs font-medium">
              {(["image/png", "image/jpeg", "image/webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setDlFormat(fmt)}
                  className={clsx(
                    "px-2.5 py-1 transition-colors",
                    dlFormat === fmt
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground-muted hover:bg-background-subtle"
                  )}
                >
                  {fmt === "image/png" ? "PNG" : fmt === "image/jpeg" ? "JPG" : "WebP"}
                </button>
              ))}
            </div>

            {/* Quality slider — only for JPG / WebP */}
            {dlFormat !== "image/png" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted">Quality:</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={dlQuality}
                  onChange={(e) => setDlQuality(Number(e.target.value))}
                  className="w-20 accent-blue-500 cursor-pointer"
                  aria-label={`Output quality ${dlQuality}%`}
                />
                <span className="text-xs font-semibold text-foreground w-8">{dlQuality}%</span>
              </div>
            )}
          </div>
        )}

        {/* Main action row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">

          {/* File info */}
          <div className="flex items-center gap-2 text-xs text-foreground-muted min-w-0">
            <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{sourceFile?.name}</span>
            {sourceFile && <span className="shrink-0">· {formatFileSize(sourceFile.size)}</span>}
            {imageDimensions.w > 0 && (
              <span className="shrink-0 text-foreground-muted/60">
                · {imageDimensions.w}×{imageDimensions.h}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Error inline */}
            {errorMsg && (
              <p
                role="alert"
                aria-live="polite"
                className="text-xs text-rose-600 dark:text-rose-400 max-w-xs truncate"
              >
                {errorMsg}
              </p>
            )}

            {/* Download — shown after any meaningful edit OR always in flip/rotate/ai/draw/crop */}
            {(isDone || editorMode === "flip-rotate" || editorMode === "ai-process" || editorMode === "draw" || editorMode === "crop") && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={editorMode === "ai-process" && !isDone}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold",
                  "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.97]",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                )}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}

            <button
              type="button"
              onClick={handleStartOver}
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                "border border-border bg-background text-foreground",
                "hover:bg-background-subtle active:scale-[0.97]",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Start Over
            </button>
          </div>
        </div>
      </div>

      {/* ── LIVE BRUSH CURSOR RING ────────────────────────────── */}
      {isBrushMode && <BrushCursorRing overlayRef={overlayCanvasRef} brushSize={brushSize} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Brush cursor ring — renders an outline circle following the mouse
// Uses CSS approach: pointer-events-none div positioned via DOM
// ─────────────────────────────────────────────

function BrushCursorRing({
  overlayRef,
  brushSize,
}: {
  overlayRef: React.RefObject<HTMLCanvasElement | null>;
  brushSize: number;
}) {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = overlayRef.current;
    const ring   = ringRef.current;
    if (!canvas || !ring) return;

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = canvas!.width  / rect.width;
      const scaleY = canvas!.height / rect.height;
      // Display radius = brushSize/2 scaled to screen pixels
      const displayR = (brushSize / 2) / Math.min(scaleX, scaleY);
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ring!.style.left    = `${x - displayR}px`;
      ring!.style.top     = `${y - displayR}px`;
      ring!.style.width   = `${displayR * 2}px`;
      ring!.style.height  = `${displayR * 2}px`;
      ring!.style.opacity = "1";
    }

    function onLeave() {
      ring!.style.opacity = "0";
    }

    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [overlayRef, brushSize]);

  return (
    <div
      ref={ringRef}
      className="pointer-events-none fixed z-50 rounded-full border-2 border-white opacity-0 transition-none mix-blend-difference"
      style={{ position: "fixed", boxShadow: "0 0 0 1px rgba(0,0,0,0.5)" }}
      aria-hidden="true"
    />
  );
}

export default CanvasImageEditor;
