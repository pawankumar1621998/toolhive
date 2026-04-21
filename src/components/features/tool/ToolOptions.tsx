"use client";

/**
 * ToolOptions — renders tool-specific settings controls.
 *
 * Each tool gets its own set of inputs that write directly to
 * Zustand's toolOptions map. The values are forwarded to the
 * backend when the user clicks Process.
 */

import React from "react";
import { clsx } from "clsx";
import { useToolStore, selectToolOptions } from "@/lib/store/toolStore";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────
// Primitive UI helpers (self-contained, no extra deps)
// ─────────────────────────────────────────────

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-foreground-muted mb-1.5">
      {children}
    </label>
  );
}

function Select({
  id, value, onChange, options,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
        "transition-colors"
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function NumberInput({
  id, value, min, max, step = 1, onChange, suffix,
}: {
  id?: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={clsx(
          "flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "transition-colors"
        )}
      />
      {suffix && <span className="text-xs text-foreground-muted shrink-0">{suffix}</span>}
    </div>
  );
}

function RangeSlider({
  id, value, min, max, step = 1, onChange, showValue = true,
}: {
  id?: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; showValue?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary cursor-pointer"
      />
      {showValue && (
        <span className="text-xs font-semibold text-primary w-8 text-right tabular-nums shrink-0">
          {value}
        </span>
      )}
    </div>
  );
}

function TextInput({
  id, value, onChange, placeholder, type = "text",
}: {
  id?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
        "placeholder:text-foreground-subtle",
        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
        "transition-colors"
      )}
    />
  );
}

function Toggle({
  id, checked, onChange, label,
}: {
  id?: string; checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent",
          "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
          checked ? "bg-primary" : "bg-border"
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
}

function OptionRow({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function Divider() {
  return <div className="border-t border-border" />;
}

// ─────────────────────────────────────────────
// Tool-specific option panels
// ─────────────────────────────────────────────

function PdfCompressOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const quality = (opts.quality as string) || "medium";
  return (
    <OptionRow>
      <Label htmlFor="pdf-quality">Compression Level</Label>
      <Select
        id="pdf-quality"
        value={quality}
        onChange={(v) => set("quality", v)}
        options={[
          { value: "extreme", label: "Extreme (smallest file)" },
          { value: "high",    label: "High compression" },
          { value: "medium",  label: "Medium (recommended)" },
          { value: "low",     label: "Low (best quality)" },
        ]}
      />
      <p className="text-xs text-foreground-subtle">
        {quality === "extreme" ? "Up to 90% size reduction — some quality loss."
          : quality === "high"   ? "Up to 70% size reduction — minor quality loss."
          : quality === "medium" ? "Up to 50% size reduction — good balance."
          : "Up to 20% reduction — near-original quality."}
      </p>
    </OptionRow>
  );
}

function PdfSplitOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const mode = (opts.splitMode as string) || "all";
  return (
    <>
      <OptionRow>
        <Label htmlFor="split-mode">Split Mode</Label>
        <Select
          id="split-mode"
          value={mode}
          onChange={(v) => set("splitMode", v)}
          options={[
            { value: "all",    label: "Extract all pages" },
            { value: "range",  label: "Custom page ranges" },
            { value: "every",  label: "Split every N pages" },
          ]}
        />
      </OptionRow>
      {mode === "range" && (
        <OptionRow>
          <Label htmlFor="split-ranges">Page Ranges</Label>
          <TextInput
            id="split-ranges"
            value={(opts.ranges as string) || ""}
            onChange={(v) => set("ranges", v)}
            placeholder="e.g. 1-3, 5, 7-9"
          />
          <p className="text-xs text-foreground-subtle">Separate ranges with commas.</p>
        </OptionRow>
      )}
      {mode === "every" && (
        <OptionRow>
          <Label htmlFor="split-every">Pages per chunk</Label>
          <NumberInput
            id="split-every"
            value={(opts.everyN as number) || 1}
            min={1}
            max={100}
            onChange={(v) => set("everyN", v)}
          />
        </OptionRow>
      )}
    </>
  );
}

function PdfRotateOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const angle = (opts.angle as number) || 90;
  return (
    <OptionRow>
      <Label>Rotation Angle</Label>
      <div className="grid grid-cols-3 gap-2">
        {[90, 180, 270].map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => set("angle", a)}
            className={clsx(
              "rounded-lg border py-2 text-sm font-medium transition-colors",
              angle === a
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground-muted hover:bg-background-subtle"
            )}
          >
            {a}°
          </button>
        ))}
      </div>
    </OptionRow>
  );
}

function PdfProtectOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      {/* Notice: PDF encryption requires a native engine not available in browser environments */}
      <div className="rounded-lg border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/20 px-3 py-2.5 mb-2">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Feature Limitation</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed mb-1.5">
          PDF password protection requires a native encryption engine not available in this environment.
        </p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
          Free alternatives:{" "}
          <a href="https://www.ilovepdf.com/protect-pdf" target="_blank" rel="noreferrer" className="underline font-medium">ilovepdf.com</a>
          {" · "}
          <a href="https://www.sejda.com/encrypt-pdf" target="_blank" rel="noreferrer" className="underline font-medium">sejda.com</a>
          {" · "}
          <a href="https://smallpdf.com/protect-pdf" target="_blank" rel="noreferrer" className="underline font-medium">smallpdf.com</a>
        </p>
      </div>
      <OptionRow>
        <Label htmlFor="pdf-password">Password</Label>
        <TextInput
          id="pdf-password"
          type="password"
          value={(opts.password as string) || ""}
          onChange={(v) => set("password", v)}
          placeholder="Enter password"
        />
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label>Permissions</Label>
        <div className="space-y-2">
          <Toggle
            checked={!!(opts.allowPrint ?? true)}
            onChange={(v) => set("allowPrint", v)}
            label="Allow printing"
          />
          <Toggle
            checked={!!(opts.allowCopy ?? true)}
            onChange={(v) => set("allowCopy", v)}
            label="Allow copying text"
          />
          <Toggle
            checked={!!(opts.allowEdit ?? false)}
            onChange={(v) => set("allowEdit", v)}
            label="Allow editing"
          />
        </div>
      </OptionRow>
    </>
  );
}

function PdfUnlockOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="unlock-password">PDF Password</Label>
      <TextInput
        id="unlock-password"
        type="password"
        value={(opts.password as string) || ""}
        onChange={(v) => set("password", v)}
        placeholder="Enter current password"
      />
      <p className="text-xs text-foreground-subtle">
        Leave blank if the PDF is protected without a password.
      </p>
    </OptionRow>
  );
}

function PdfWatermarkOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="wm-text">Watermark Text</Label>
        <TextInput
          id="wm-text"
          value={(opts.text as string) || ""}
          onChange={(v) => set("text", v)}
          placeholder="e.g. CONFIDENTIAL"
        />
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label htmlFor="wm-position">Position</Label>
        <Select
          id="wm-position"
          value={(opts.position as string) || "center"}
          onChange={(v) => set("position", v)}
          options={[
            { value: "center",       label: "Center" },
            { value: "top-left",     label: "Top Left" },
            { value: "top-right",    label: "Top Right" },
            { value: "bottom-left",  label: "Bottom Left" },
            { value: "bottom-right", label: "Bottom Right" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="wm-opacity">Opacity — {opts.opacity ?? 40}%</Label>
        <RangeSlider
          id="wm-opacity"
          value={(opts.opacity as number) ?? 40}
          min={10} max={100} step={5}
          onChange={(v) => set("opacity", v)}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="wm-size">Font Size — {opts.fontSize ?? 48}px</Label>
        <RangeSlider
          id="wm-size"
          value={(opts.fontSize as number) ?? 48}
          min={12} max={120} step={4}
          onChange={(v) => set("fontSize", v)}
        />
      </OptionRow>
    </>
  );
}

function PdfPageNumbersOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="pn-position">Position</Label>
        <Select
          id="pn-position"
          value={(opts.position as string) || "bottom-center"}
          onChange={(v) => set("position", v)}
          options={[
            { value: "bottom-center", label: "Bottom Center" },
            { value: "bottom-right",  label: "Bottom Right" },
            { value: "bottom-left",   label: "Bottom Left" },
            { value: "top-center",    label: "Top Center" },
            { value: "top-right",     label: "Top Right" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="pn-start">Start Number</Label>
        <NumberInput
          id="pn-start"
          value={(opts.startNumber as number) || 1}
          min={1} max={9999}
          onChange={(v) => set("startNumber", v)}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="pn-format">Format</Label>
        <Select
          id="pn-format"
          value={(opts.format as string) || "1"}
          onChange={(v) => set("format", v)}
          options={[
            { value: "1",       label: "1, 2, 3 …" },
            { value: "page-1",  label: "Page 1, Page 2 …" },
            { value: "1-of-n",  label: "1 of N" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="pn-size">Font Size — {opts.fontSize ?? 12}px</Label>
        <RangeSlider
          id="pn-size"
          value={(opts.fontSize as number) ?? 12}
          min={8} max={24}
          onChange={(v) => set("fontSize", v)}
        />
      </OptionRow>
    </>
  );
}

function PdfOcrOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="ocr-lang">Language</Label>
        <Select
          id="ocr-lang"
          value={(opts.language as string) || "eng"}
          onChange={(v) => set("language", v)}
          options={[
            { value: "eng", label: "English" },
            { value: "hin", label: "Hindi" },
            { value: "fra", label: "French" },
            { value: "deu", label: "German" },
            { value: "spa", label: "Spanish" },
            { value: "ara", label: "Arabic" },
            { value: "chi_sim", label: "Chinese (Simplified)" },
            { value: "jpn", label: "Japanese" },
            { value: "kor", label: "Korean" },
            { value: "por", label: "Portuguese" },
            { value: "rus", label: "Russian" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="ocr-output">Output Format</Label>
        <Select
          id="ocr-output"
          value={(opts.outputFormat as string) || "searchable-pdf"}
          onChange={(v) => set("outputFormat", v)}
          options={[
            { value: "searchable-pdf", label: "Searchable PDF" },
            { value: "txt",            label: "Plain Text (.txt)" },
            { value: "docx",           label: "Word Document (.docx)" },
          ]}
        />
      </OptionRow>
    </>
  );
}

function PdfToJpgOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="ptj-dpi">Resolution (DPI)</Label>
        <Select
          id="ptj-dpi"
          value={String(opts.dpi ?? 150)}
          onChange={(v) => set("dpi", Number(v))}
          options={[
            { value: "72",  label: "72 DPI (web)" },
            { value: "150", label: "150 DPI (standard)" },
            { value: "300", label: "300 DPI (print quality)" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="ptj-quality">JPEG Quality — {opts.quality ?? 85}%</Label>
        <RangeSlider
          id="ptj-quality"
          value={(opts.quality as number) ?? 85}
          min={10} max={100} step={5}
          onChange={(v) => set("quality", v)}
        />
      </OptionRow>
    </>
  );
}

function ImageCompressOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="ic-quality">Quality — {opts.quality ?? 80}%</Label>
        <RangeSlider
          id="ic-quality"
          value={(opts.quality as number) ?? 80}
          min={1} max={100}
          onChange={(v) => set("quality", v)}
        />
        <div className="flex justify-between text-[10px] text-foreground-subtle">
          <span>Smaller file</span><span>Better quality</span>
        </div>
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label htmlFor="ic-format">Output Format</Label>
        <Select
          id="ic-format"
          value={(opts.format as string) || "auto"}
          onChange={(v) => set("format", v)}
          options={[
            { value: "auto", label: "Auto (best for each file)" },
            { value: "webp", label: "WebP (best compression)" },
            { value: "jpg",  label: "JPEG" },
            { value: "png",  label: "PNG" },
          ]}
        />
      </OptionRow>
    </>
  );
}

function ImageResizeOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const lock = (opts.maintainAspectRatio as boolean) ?? true;
  const unit = (opts.unit as string) || "px";
  return (
    <>
      <OptionRow>
        <Label htmlFor="ir-preset">Quick Preset</Label>
        <Select
          id="ir-preset"
          value={(opts.preset as string) || "custom"}
          onChange={(v) => {
            set("preset", v);
            const presets: Record<string, [number, number]> = {
              "1920x1080": [1920, 1080],
              "1280x720":  [1280, 720],
              "800x600":   [800, 600],
              "400x400":   [400, 400],
              "thumbnail": [150, 150],
            };
            if (presets[v]) { set("width", presets[v][0]); set("height", presets[v][1]); }
          }}
          options={[
            { value: "custom",    label: "Custom size" },
            { value: "1920x1080", label: "Full HD (1920×1080)" },
            { value: "1280x720",  label: "HD (1280×720)" },
            { value: "800x600",   label: "800×600" },
            { value: "400x400",   label: "400×400" },
            { value: "thumbnail", label: "Thumbnail (150×150)" },
          ]}
        />
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label htmlFor="ir-unit">Unit</Label>
        <div className="flex gap-2">
          {["px", "%"].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => set("unit", u)}
              className={clsx(
                "flex-1 rounded-lg border py-1.5 text-sm font-medium transition-colors",
                unit === u
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:bg-background-subtle"
              )}
            >{u}</button>
          ))}
        </div>
      </OptionRow>
      <div className="grid grid-cols-2 gap-3">
        <OptionRow>
          <Label htmlFor="ir-width">Width</Label>
          <NumberInput
            id="ir-width"
            value={(opts.width as number) || 800}
            min={1} max={10000}
            onChange={(v) => set("width", v)}
            suffix={unit}
          />
        </OptionRow>
        <OptionRow>
          <Label htmlFor="ir-height">Height</Label>
          <NumberInput
            id="ir-height"
            value={(opts.height as number) || 600}
            min={1} max={10000}
            onChange={(v) => set("height", v)}
            suffix={unit}
          />
        </OptionRow>
      </div>
      <Toggle
        checked={lock}
        onChange={(v) => set("maintainAspectRatio", v)}
        label="Lock aspect ratio"
      />
    </>
  );
}

function ImageConvertOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="imgconv-format">Convert to</Label>
      <Select
        id="imgconv-format"
        value={(opts.format as string) || "webp"}
        onChange={(v) => set("format", v)}
        options={[
          { value: "webp", label: "WebP (modern, small)" },
          { value: "jpg",  label: "JPEG (.jpg)" },
          { value: "png",  label: "PNG (lossless)" },
          { value: "gif",  label: "GIF" },
          { value: "bmp",  label: "BMP" },
          { value: "tiff", label: "TIFF" },
          { value: "avif", label: "AVIF (next-gen)" },
        ]}
      />
    </OptionRow>
  );
}

function ImageCropOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const mode = (opts.cropMode as string) || "custom";
  return (
    <>
      <OptionRow>
        <Label>Aspect Ratio</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { v: "custom", l: "Free" },
            { v: "1:1",    l: "1:1" },
            { v: "16:9",   l: "16:9" },
            { v: "4:3",    l: "4:3" },
            { v: "3:2",    l: "3:2" },
            { v: "9:16",   l: "9:16" },
          ].map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => set("cropMode", v)}
              className={clsx(
                "rounded-lg border py-1.5 text-xs font-medium transition-colors",
                mode === v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:bg-background-subtle"
              )}
            >{l}</button>
          ))}
        </div>
      </OptionRow>
      {mode === "custom" && (
        <>
          <Divider />
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "width",  label: "Width",  id: "crop-w" },
              { key: "height", label: "Height", id: "crop-h" },
            ].map(({ key, label, id }) => (
              <OptionRow key={key}>
                <Label htmlFor={id}>{label}</Label>
                <NumberInput
                  id={id}
                  value={(opts[key] as number) || 400}
                  min={1} max={10000}
                  onChange={(v) => set(key, v)}
                  suffix="px"
                />
              </OptionRow>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ImageRotateOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label>Rotation</Label>
        <div className="grid grid-cols-3 gap-2">
          {[90, 180, 270].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => set("angle", a)}
              className={clsx(
                "rounded-lg border py-2 text-sm font-medium transition-colors",
                (opts.angle ?? 90) === a
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:bg-background-subtle"
              )}
            >{a}°</button>
          ))}
        </div>
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label>Flip</Label>
        <div className="flex gap-2">
          <Toggle
            checked={!!(opts.flipHorizontal)}
            onChange={(v) => set("flipHorizontal", v)}
            label="Horizontal"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <Toggle
            checked={!!(opts.flipVertical)}
            onChange={(v) => set("flipVertical", v)}
            label="Vertical"
          />
        </div>
      </OptionRow>
    </>
  );
}

function ImageUpscaleOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label>Upscale Factor</Label>
      <div className="flex gap-3">
        {[2, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => set("scale", n)}
            className={clsx(
              "flex-1 rounded-xl border py-3 text-sm font-bold transition-colors",
              (opts.scale ?? 2) === n
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:bg-background-subtle"
            )}
          >{n}×</button>
        ))}
      </div>
      <p className="text-xs text-foreground-subtle">
        AI enhances details and sharpness. 4× recommended for small images.
      </p>
    </OptionRow>
  );
}

function ImageWatermarkOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="imgwm-text">Watermark Text</Label>
        <TextInput
          id="imgwm-text"
          value={(opts.text as string) || ""}
          onChange={(v) => set("text", v)}
          placeholder="Enter watermark text"
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="imgwm-pos">Position</Label>
        <Select
          id="imgwm-pos"
          value={(opts.position as string) || "bottom-right"}
          onChange={(v) => set("position", v)}
          options={[
            { value: "center",       label: "Center" },
            { value: "top-left",     label: "Top Left" },
            { value: "top-right",    label: "Top Right" },
            { value: "bottom-left",  label: "Bottom Left" },
            { value: "bottom-right", label: "Bottom Right" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label>Opacity — {opts.opacity ?? 50}%</Label>
        <RangeSlider
          value={(opts.opacity as number) ?? 50}
          min={10} max={100} step={10}
          onChange={(v) => set("opacity", v)}
        />
      </OptionRow>
      <OptionRow>
        <Label>Font Size — {opts.fontSize ?? 32}px</Label>
        <RangeSlider
          value={(opts.fontSize as number) ?? 32}
          min={12} max={80} step={4}
          onChange={(v) => set("fontSize", v)}
        />
      </OptionRow>
    </>
  );
}

function ImageToPdfOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="i2p-size">Page Size</Label>
        <Select
          id="i2p-size"
          value={(opts.pageSize as string) || "A4"}
          onChange={(v) => set("pageSize", v)}
          options={[
            { value: "A4",      label: "A4 (210×297mm)" },
            { value: "Letter",  label: "US Letter (8.5×11in)" },
            { value: "A3",      label: "A3 (297×420mm)" },
            { value: "original", label: "Match image size" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="i2p-orient">Orientation</Label>
        <Select
          id="i2p-orient"
          value={(opts.orientation as string) || "portrait"}
          onChange={(v) => set("orientation", v)}
          options={[
            { value: "portrait",  label: "Portrait" },
            { value: "landscape", label: "Landscape" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="i2p-margin">Margin</Label>
        <Select
          id="i2p-margin"
          value={(opts.margin as string) || "normal"}
          onChange={(v) => set("margin", v)}
          options={[
            { value: "none",   label: "No margin" },
            { value: "small",  label: "Small (5mm)" },
            { value: "normal", label: "Normal (15mm)" },
            { value: "large",  label: "Large (25mm)" },
          ]}
        />
      </OptionRow>
    </>
  );
}

function ImageFlipOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const dir = (opts.direction as string) || "horizontal";
  return (
    <OptionRow>
      <Label>Flip Direction</Label>
      <div className="flex gap-2">
        {[{ value: "horizontal", label: "↔ Horizontal" }, { value: "vertical", label: "↕ Vertical" }].map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => set("direction", o.value)}
            className={clsx(
              "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
              dir === o.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:bg-background-subtle"
            )}
          >{o.label}</button>
        ))}
      </div>
    </OptionRow>
  );
}

function ImageBlurOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="blur-sigma">Blur Intensity</Label>
      <RangeSlider
        id="blur-sigma"
        value={Number(opts.sigma ?? 5)}
        min={1}
        max={30}
        step={1}
        onChange={(v) => set("sigma", v)}
      />
    </OptionRow>
  );
}

function ImagePixelArtOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="pixel-size">Pixel Size</Label>
      <RangeSlider
        id="pixel-size"
        value={Number(opts.pixelSize ?? 10)}
        min={2}
        max={40}
        step={2}
        onChange={(v) => set("pixelSize", v)}
      />
      <p className="text-xs text-foreground-subtle mt-1">Larger = bigger pixels / more retro look.</p>
    </OptionRow>
  );
}

function ImageSocialResizeOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);

  const PRESETS: { label: string; w: number; h: number }[] = [
    { label: "Instagram Post (1080×1080)",  w: 1080, h: 1080 },
    { label: "Instagram Story (1080×1920)", w: 1080, h: 1920 },
    { label: "Facebook Post (1200×628)",    w: 1200, h: 628  },
    { label: "Twitter/X Post (1200×675)",   w: 1200, h: 675  },
    { label: "YouTube Thumbnail (1280×720)",w: 1280, h: 720  },
    { label: "LinkedIn Post (1200×627)",    w: 1200, h: 627  },
    { label: "Pinterest Pin (1000×1500)",   w: 1000, h: 1500 },
    { label: "WhatsApp DP (500×500)",       w: 500,  h: 500  },
  ];

  const currentW = Number(opts.width ?? 1080);
  const currentH = Number(opts.height ?? 1080);
  const active   = PRESETS.find((p) => p.w === currentW && p.h === currentH);

  return (
    <>
      <OptionRow>
        <Label>Platform Preset</Label>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => { set("width", p.w); set("height", p.h); }}
              className={clsx(
                "w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                active?.label === p.label
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground-muted hover:bg-background-subtle"
              )}
            >{p.label}</button>
          ))}
        </div>
      </OptionRow>
      <OptionRow>
        <Label>Custom Size (px)</Label>
        <div className="flex items-center gap-2">
          <NumberInput value={currentW} min={10} max={8000} onChange={(v) => set("width", v)} suffix="W" />
          <span className="text-foreground-muted text-sm">×</span>
          <NumberInput value={currentH} min={10} max={8000} onChange={(v) => set("height", v)} suffix="H" />
        </div>
      </OptionRow>
    </>
  );
}

function ImageAddLogoOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="logo-text">Logo / Text</Label>
        <TextInput
          id="logo-text"
          value={(opts.text as string) || ""}
          onChange={(v) => set("text", v)}
          placeholder="Your brand name or text"
        />
      </OptionRow>
      <OptionRow>
        <Label>Position</Label>
        <Select
          value={(opts.position as string) || "bottom-right"}
          onChange={(v) => set("position", v)}
          options={[
            { value: "bottom-right",  label: "Bottom Right" },
            { value: "bottom-left",   label: "Bottom Left" },
            { value: "top-right",     label: "Top Right" },
            { value: "top-left",      label: "Top Left" },
            { value: "center-middle", label: "Center" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="logo-size">Font Size</Label>
        <RangeSlider
          id="logo-size"
          value={Number(opts.fontSize ?? 48)}
          min={16}
          max={120}
          step={4}
          onChange={(v) => set("fontSize", v)}
        />
      </OptionRow>
    </>
  );
}

function AudioCompressOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="ac-bitrate">Target Bitrate</Label>
      <Select
        id="ac-bitrate"
        value={String(opts.bitrate ?? 128)}
        onChange={(v) => set("bitrate", Number(v))}
        options={[
          { value: "64",  label: "64 kbps (smallest)" },
          { value: "96",  label: "96 kbps" },
          { value: "128", label: "128 kbps (standard)" },
          { value: "192", label: "192 kbps (high quality)" },
        ]}
      />
    </OptionRow>
  );
}

function AudioConvertOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="acnv-fmt">Convert to</Label>
        <Select
          id="acnv-fmt"
          value={(opts.format as string) || "mp3"}
          onChange={(v) => set("format", v)}
          options={[
            { value: "mp3",  label: "MP3 (most compatible)" },
            { value: "wav",  label: "WAV (lossless)" },
            { value: "flac", label: "FLAC (lossless compressed)" },
            { value: "aac",  label: "AAC (Apple/iOS)" },
            { value: "ogg",  label: "OGG (open source)" },
            { value: "m4a",  label: "M4A (iTunes)" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="acnv-bitrate">Bitrate</Label>
        <Select
          id="acnv-bitrate"
          value={String(opts.bitrate ?? 192)}
          onChange={(v) => set("bitrate", Number(v))}
          options={[
            { value: "128", label: "128 kbps" },
            { value: "192", label: "192 kbps (recommended)" },
            { value: "256", label: "256 kbps" },
            { value: "320", label: "320 kbps (best)" },
          ]}
        />
      </OptionRow>
    </>
  );
}

function AudioTrimOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="at-start">Start Time</Label>
        <TextInput
          id="at-start"
          value={(opts.startTime as string) || "0:00"}
          onChange={(v) => set("startTime", v)}
          placeholder="0:00"
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="at-end">End Time</Label>
        <TextInput
          id="at-end"
          value={(opts.endTime as string) || ""}
          onChange={(v) => set("endTime", v)}
          placeholder="e.g. 1:30"
        />
      </OptionRow>
      <p className="text-xs text-foreground-subtle">Format: mm:ss</p>
    </>
  );
}

function AudioTranscribeOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="tr-lang">Language</Label>
        <Select
          id="tr-lang"
          value={(opts.language as string) || "auto"}
          onChange={(v) => set("language", v)}
          options={[
            { value: "auto", label: "Auto-detect" },
            { value: "en",   label: "English" },
            { value: "hi",   label: "Hindi" },
            { value: "fr",   label: "French" },
            { value: "de",   label: "German" },
            { value: "es",   label: "Spanish" },
            { value: "ar",   label: "Arabic" },
            { value: "zh",   label: "Chinese" },
            { value: "ja",   label: "Japanese" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="tr-output">Output Format</Label>
        <Select
          id="tr-output"
          value={(opts.outputFormat as string) || "txt"}
          onChange={(v) => set("outputFormat", v)}
          options={[
            { value: "txt", label: "Plain Text (.txt)" },
            { value: "srt", label: "Subtitle File (.srt)" },
            { value: "vtt", label: "WebVTT (.vtt)" },
          ]}
        />
      </OptionRow>
    </>
  );
}

function ConverterDocOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="cd-size">Page Size</Label>
        <Select
          id="cd-size"
          value={(opts.pageSize as string) || "A4"}
          onChange={(v) => set("pageSize", v)}
          options={[
            { value: "A4",     label: "A4" },
            { value: "Letter", label: "US Letter" },
            { value: "A3",     label: "A3" },
          ]}
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="cd-orient">Orientation</Label>
        <Select
          id="cd-orient"
          value={(opts.orientation as string) || "portrait"}
          onChange={(v) => set("orientation", v)}
          options={[
            { value: "portrait",  label: "Portrait" },
            { value: "landscape", label: "Landscape" },
          ]}
        />
      </OptionRow>
    </>
  );
}

function JsonToCsvOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="j2c-delim">Delimiter</Label>
      <Select
        id="j2c-delim"
        value={(opts.delimiter as string) || ","}
        onChange={(v) => set("delimiter", v)}
        options={[
          { value: ",",  label: "Comma (,)" },
          { value: ";",  label: "Semicolon (;)" },
          { value: "\t", label: "Tab" },
          { value: "|",  label: "Pipe (|)" },
        ]}
      />
    </OptionRow>
  );
}

function PdfSignOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="pdf-signer-name">Signer Name</Label>
      <TextInput
        id="pdf-signer-name"
        value={(opts.signerName as string) || ""}
        onChange={(v) => set("signerName", v)}
        placeholder="Your full name"
      />
      <p className="text-xs text-foreground-subtle mt-1">Your name will be added as a text signature on the last page.</p>
    </OptionRow>
  );
}

function PdfTranslatePdfOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const LANGS = ["Hindi", "Hinglish", "Spanish", "French", "German", "Arabic", "Portuguese", "Bengali", "Urdu", "Japanese"];
  return (
    <OptionRow>
      <Label htmlFor="pdf-target-lang">Target Language</Label>
      <Select
        id="pdf-target-lang"
        value={(opts.targetLanguage as string) || "Hindi"}
        onChange={(v) => set("targetLanguage", v)}
        options={LANGS.map((l) => ({ value: l, label: l }))}
      />
      <p className="text-xs text-foreground-subtle mt-1">AI will extract and translate the PDF text. Result is a .txt file.</p>
    </OptionRow>
  );
}

function PdfRedactOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="pdf-redact-keyword">Keyword to Redact</Label>
      <TextInput
        id="pdf-redact-keyword"
        value={(opts.keyword as string) || ""}
        onChange={(v) => set("keyword", v)}
        placeholder="e.g. Confidential"
      />
      <p className="text-xs text-foreground-subtle mt-1">Text matching this keyword will be marked as redacted.</p>
    </OptionRow>
  );
}

function PdfHeaderFooterOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label htmlFor="pdf-header">Header Text</Label>
        <TextInput
          id="pdf-header"
          value={(opts.headerText as string) || ""}
          onChange={(v) => set("headerText", v)}
          placeholder="e.g. Company Confidential · {page}"
        />
        <p className="text-xs text-foreground-subtle mt-1">Use {"{page}"} for page number, {"{total}"} for total pages.</p>
      </OptionRow>
      <OptionRow>
        <Label htmlFor="pdf-footer">Footer Text</Label>
        <TextInput
          id="pdf-footer"
          value={(opts.footerText as string) || ""}
          onChange={(v) => set("footerText", v)}
          placeholder="e.g. Page {page} of {total}"
        />
      </OptionRow>
      <OptionRow>
        <Label htmlFor="pdf-hf-size">Font Size</Label>
        <RangeSlider
          id="pdf-hf-size"
          value={Number(opts.fontSize ?? 10)}
          min={7}
          max={16}
          step={1}
          onChange={(v) => set("fontSize", v)}
        />
      </OptionRow>
    </>
  );
}

function PdfEditOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="pdf-annotation">Annotation / Note Text</Label>
      <TextInput
        id="pdf-annotation"
        value={(opts.text as string) || ""}
        onChange={(v) => set("text", v)}
        placeholder="e.g. DRAFT - For Internal Review Only"
      />
      <p className="text-xs text-foreground-subtle mt-1">This text will be added as a highlighted banner at the top of every page.</p>
    </OptionRow>
  );
}

function PdfHtmlToPdfOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label htmlFor="pdf-html-text">HTML or Plain Text</Label>
      <textarea
        id="pdf-html-text"
        rows={6}
        value={(opts.htmlText as string) || ""}
        onChange={(e) => set("htmlText", e.target.value)}
        placeholder="Paste your HTML or plain text content here..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <p className="text-xs text-foreground-subtle mt-1">HTML tags will be stripped. Plain text is recommended for best results.</p>
    </OptionRow>
  );
}

// ─────────────────────────────────────────────
// Main component — dispatches to the right panel
// ─────────────────────────────────────────────

export function ToolOptions({ tool }: { tool: Tool }) {
  const { slug, category } = tool;

  // PDF tools
  if (category === "pdf") {
    if (slug === "compress")     return <PdfCompressOptions />;
    if (slug === "split")        return <PdfSplitOptions />;
    if (slug === "rotate")       return <PdfRotateOptions />;
    if (slug === "watermark")    return <PdfWatermarkOptions />;
    if (slug === "page-numbers") return <PdfPageNumbersOptions />;
    if (slug === "ocr")            return <PdfOcrOptions />;
    if (slug === "pdf-to-jpg")     return <PdfToJpgOptions />;
    if (slug === "sign")           return <PdfSignOptions />;
    if (slug === "translate-pdf")  return <PdfTranslatePdfOptions />;
    if (slug === "redact-pdf")     return <PdfRedactOptions />;
    if (slug === "header-footer")  return <PdfHeaderFooterOptions />;
    if (slug === "edit-pdf")       return <PdfEditOptions />;
    if (slug === "html-to-pdf")    return <PdfHtmlToPdfOptions />;
  }

  // Image tools
  if (category === "image") {
    if (slug === "compress")          return <ImageCompressOptions />;
    if (slug === "resize")            return <ImageResizeOptions />;
    if (slug === "convert")           return <ImageConvertOptions />;
    if (slug === "crop")              return <ImageCropOptions />;
    if (slug === "rotate")            return <ImageRotateOptions />;
    if (slug === "upscale")           return <ImageUpscaleOptions />;
    if (slug === "watermark")         return <ImageWatermarkOptions />;
    if (slug === "image-to-pdf")      return <ImageToPdfOptions />;
    if (slug === "flip")              return <ImageFlipOptions />;
    if (slug === "blur-image")        return <ImageBlurOptions />;
    if (slug === "pixel-art")         return <ImagePixelArtOptions />;
    if (slug === "social-resize")     return <ImageSocialResizeOptions />;
    if (slug === "add-logo")          return <ImageAddLogoOptions />;
    if (slug === "color-filter")      return <ImageColorFilterOptions />;
    if (slug === "adjust")            return <ImageAdjustOptions />;
    if (slug === "add-border")        return <ImageAddBorderOptions />;
    if (slug === "pixelate")          return <ImagePixelateOptions />;
    if (slug === "profile-photo")     return <ImageProfilePhotoOptions />;
  }

  // Converter tools
  if (category === "converter") {
    if (slug === "word-to-pdf" || slug === "excel-to-pdf" || slug === "ppt-to-pdf" || slug === "html-to-pdf") {
      return <ConverterDocOptions />;
    }
    if (slug === "json-to-csv" || slug === "csv-to-json") {
      return <JsonToCsvOptions />;
    }
  }

  // No options for this tool
  return null;
}

// ─── New image tool option panels ─────────────────────────────────────────────

function ImageColorFilterOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const filter = (opts.filter as string) || "sepia";
  const filters = [
    { value: "sepia",     label: "Sepia" },
    { value: "warm",      label: "Warm" },
    { value: "cool",      label: "Cool" },
    { value: "grayscale", label: "Grayscale" },
  ];
  return (
    <OptionRow>
      <Label>Filter</Label>
      <div className="grid grid-cols-2 gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => set("filter", f.value)}
            className={clsx(
              "rounded-lg border py-2 text-sm font-medium transition-colors",
              filter === f.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:bg-background-subtle"
            )}
          >{f.label}</button>
        ))}
      </div>
    </OptionRow>
  );
}

function ImageAdjustOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label>Brightness — {opts.brightness ?? 1}</Label>
        <RangeSlider
          value={Number(opts.brightness ?? 1) * 100}
          min={10} max={300} step={5}
          onChange={(v) => set("brightness", v / 100)}
        />
        <div className="flex justify-between text-[10px] text-foreground-subtle">
          <span>Darker</span><span>Brighter</span>
        </div>
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label>Saturation — {opts.saturation ?? 1}</Label>
        <RangeSlider
          value={Number(opts.saturation ?? 1) * 100}
          min={0} max={300} step={5}
          onChange={(v) => set("saturation", v / 100)}
        />
        <div className="flex justify-between text-[10px] text-foreground-subtle">
          <span>Desaturate</span><span>Vivid</span>
        </div>
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label htmlFor="hue-rotate">Hue Shift — {opts.hue ?? 0}°</Label>
        <RangeSlider
          id="hue-rotate"
          value={Number(opts.hue ?? 0)}
          min={-180} max={180} step={5}
          onChange={(v) => set("hue", v)}
        />
      </OptionRow>
    </>
  );
}

function ImageAddBorderOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <>
      <OptionRow>
        <Label>Border Size — {opts.borderSize ?? 20}px</Label>
        <RangeSlider
          value={Number(opts.borderSize ?? 20)}
          min={2} max={100} step={2}
          onChange={(v) => set("borderSize", v)}
        />
      </OptionRow>
      <Divider />
      <OptionRow>
        <Label htmlFor="border-color">Border Color</Label>
        <div className="flex items-center gap-3">
          <input
            id="border-color"
            type="color"
            value={(opts.borderColor as string) || "#ffffff"}
            onChange={(e) => set("borderColor", e.target.value)}
            className="h-9 w-16 cursor-pointer rounded-lg border border-border bg-background p-0.5"
          />
          <TextInput
            value={(opts.borderColor as string) || "#ffffff"}
            onChange={(v) => set("borderColor", v)}
            placeholder="#ffffff"
          />
        </div>
      </OptionRow>
    </>
  );
}

function ImagePixelateOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  return (
    <OptionRow>
      <Label>Pixel Size — {opts.pixelSize ?? 10}px</Label>
      <RangeSlider
        value={Number(opts.pixelSize ?? 10)}
        min={2} max={50} step={2}
        onChange={(v) => set("pixelSize", v)}
      />
      <p className="text-xs text-foreground-subtle mt-1">Larger = coarser pixelation.</p>
    </OptionRow>
  );
}

function ImageProfilePhotoOptions() {
  const opts = useToolStore(selectToolOptions);
  const set = useToolStore((s) => s.setToolOption);
  const sizes = [200, 400, 600, 800];
  return (
    <OptionRow>
      <Label>Output Size</Label>
      <div className="grid grid-cols-2 gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => set("size", s)}
            className={clsx(
              "rounded-lg border py-2 text-sm font-medium transition-colors",
              Number(opts.size ?? 400) === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:bg-background-subtle"
            )}
          >{s}×{s}px</button>
        ))}
      </div>
      <p className="text-xs text-foreground-subtle mt-1">Outputs a transparent circular PNG.</p>
    </OptionRow>
  );
}

export default ToolOptions;
