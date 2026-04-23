"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hex = hslToHex(h, s, l);
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

type SchemeType = "complementary" | "analogous" | "triadic" | "tetradic" | "monochromatic" | "split-complementary";

function generatePalette(hex: string, scheme: SchemeType): { hex: string; name: string }[] {
  const [h, s, l] = hexToHsl(hex);
  const base = { hex, name: "Base" };
  switch (scheme) {
    case "complementary":
      return [base, { hex: hslToHex(h + 180, s, l), name: "Complement" }];
    case "analogous":
      return [
        { hex: hslToHex(h - 30, s, l), name: "-30°" }, base,
        { hex: hslToHex(h + 30, s, l), name: "+30°" },
      ];
    case "triadic":
      return [base, { hex: hslToHex(h + 120, s, l), name: "+120°" }, { hex: hslToHex(h + 240, s, l), name: "+240°" }];
    case "tetradic":
      return [base, { hex: hslToHex(h + 90, s, l), name: "+90°" }, { hex: hslToHex(h + 180, s, l), name: "+180°" }, { hex: hslToHex(h + 270, s, l), name: "+270°" }];
    case "monochromatic":
      return [
        { hex: hslToHex(h, s, Math.max(10, l - 40)), name: "Dark" },
        { hex: hslToHex(h, s, Math.max(10, l - 20)), name: "Mid-Dark" },
        base,
        { hex: hslToHex(h, s, Math.min(90, l + 20)), name: "Light" },
        { hex: hslToHex(h, s, Math.min(90, l + 40)), name: "Pale" },
      ];
    case "split-complementary":
      return [base, { hex: hslToHex(h + 150, s, l), name: "+150°" }, { hex: hslToHex(h + 210, s, l), name: "+210°" }];
  }
}

const SCHEMES: { id: SchemeType; label: string; desc: string }[] = [
  { id: "monochromatic", label: "Monochromatic", desc: "5 shades of the same hue" },
  { id: "complementary", label: "Complementary", desc: "Opposite colors on the wheel" },
  { id: "analogous", label: "Analogous", desc: "Colors next to each other" },
  { id: "triadic", label: "Triadic", desc: "3 equally spaced colors" },
  { id: "tetradic", label: "Tetradic", desc: "4 equally spaced colors" },
  { id: "split-complementary", label: "Split Complementary", desc: "Base + 2 near-complements" },
];

export function ColorPalette() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [scheme, setScheme] = useState<SchemeType>("monochromatic");
  const [copied, setCopied] = useState<string | null>(null);
  const [copyFormat, setCopyFormat] = useState<"hex" | "rgb" | "hsl">("hex");

  const palette = generatePalette(baseColor, scheme);

  function getDisplayValue(hex: string): string {
    const [h, s, l] = hexToHsl(hex);
    const [r, g, b] = hslToRgb(h, s, l);
    if (copyFormat === "hex") return hex.toUpperCase();
    if (copyFormat === "rgb") return `rgb(${r}, ${g}, ${b})`;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  function copy(hex: string) {
    navigator.clipboard.writeText(getDisplayValue(hex)).catch(() => {});
    setCopied(hex); setTimeout(() => setCopied(null), 2000);
  }

  function isLight(hex: string): boolean {
    const [h, s, l] = hexToHsl(hex);
    void h; void s;
    return l > 60;
  }

  const PRESET_COLORS = ["#6366f1","#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#3b82f6","#64748b"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Color Palette Generator</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Generate beautiful color schemes for your designs. Click a color to copy it.</p>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Base Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-14 h-12 rounded-xl cursor-pointer border border-card-border" />
              <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground font-mono w-28 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                value={baseColor} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setBaseColor(e.target.value); }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Copy Format</label>
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(["hex", "rgb", "hsl"] as const).map(f => (
                <button key={f} onClick={() => setCopyFormat(f)} className={clsx("px-3 py-2.5 text-xs font-bold uppercase transition-colors",
                  copyFormat === f ? "bg-sky-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preset colors */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => setBaseColor(c)} className={clsx("w-8 h-8 rounded-lg border-2 transition-all", baseColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105")} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* Scheme selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Color Scheme</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SCHEMES.map(s => (
              <button key={s.id} onClick={() => setScheme(s.id)}
                className={clsx("px-3 py-2.5 rounded-xl border text-left transition-colors",
                  scheme === s.id ? "bg-sky-500/10 border-sky-500 text-sky-600" : "bg-background border-border text-foreground-muted hover:border-sky-400")}>
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette display */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${palette.length}, 1fr)` }}>
        {palette.map(({ hex, name }) => (
          <button key={hex} onClick={() => copy(hex)}
            className="group rounded-2xl overflow-hidden border border-card-border shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200">
            <div className="h-36 sm:h-48 w-full relative" style={{ backgroundColor: hex }}>
              <div className={clsx("absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                isLight(hex) ? "text-gray-800" : "text-white")}>
                <span className="text-sm font-bold">{copied === hex ? "Copied!" : "Copy"}</span>
              </div>
            </div>
            <div className="p-3 bg-card">
              <p className="text-xs font-bold text-foreground truncate">{getDisplayValue(hex)}</p>
              <p className="text-xs text-foreground-muted">{name}</p>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Full palette row */}
      <div className="rounded-2xl overflow-hidden border border-card-border shadow h-20 flex">
        {palette.map(({ hex }) => (
          <div key={hex} className="flex-1" style={{ backgroundColor: hex }} />
        ))}
      </div>

      {/* Color details */}
      <div className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-sm font-bold text-foreground mb-3">Color Values</h2>
        <div className="space-y-2">
          {palette.map(({ hex, name }) => {
            const [h, s, l] = hexToHsl(hex);
            const [r, g, b] = hslToRgb(h, s, l);
            return (
              <div key={hex} className="grid grid-cols-4 gap-3 items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded shrink-0" style={{ backgroundColor: hex }} />
                  <span className="font-semibold text-foreground-muted">{name}</span>
                </div>
                <span className="font-mono text-foreground">{hex.toUpperCase()}</span>
                <span className="font-mono text-foreground-muted">rgb({r},{g},{b})</span>
                <span className="font-mono text-foreground-muted">hsl({h},{s}%,{l}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
