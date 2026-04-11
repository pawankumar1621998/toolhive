"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/types";
import { Download, Copy, Share2, Upload, ImageIcon, CheckCircle2 } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type TemplateTab = "templates" | "upload";
type FontSize = "small" | "medium" | "large" | "xlarge";
type TextStyle = "normal" | "bold" | "impact";

interface MemeTemplate {
  id: string;
  name: string;
  bgStyle: string;
  layout: "two-row" | "split" | "single" | "tiers";
}

// ─────────────────────────────────────────────
// Meme Templates
// ─────────────────────────────────────────────

const TEMPLATES: MemeTemplate[] = [
  {
    id: "drake",
    name: "Drake Pointing",
    bgStyle: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    layout: "two-row",
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    bgStyle: "linear-gradient(135deg, #c8783c 0%, #a0522d 40%, #8b4513 100%)",
    layout: "split",
  },
  {
    id: "yelling-cat",
    name: "Woman Yelling at Cat",
    bgStyle: "linear-gradient(90deg, #e8d5b7 0%, #d4a76a 50%, #f0f0e8 100%)",
    layout: "split",
  },
  {
    id: "this-is-fine",
    name: "This is Fine",
    bgStyle: "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcd3c 100%)",
    layout: "single",
  },
  {
    id: "two-buttons",
    name: "Two Buttons",
    bgStyle: "linear-gradient(160deg, #667eea 0%, #764ba2 50%, #3b4fd4 100%)",
    layout: "two-row",
  },
  {
    id: "galaxy-brain",
    name: "Galaxy Brain",
    bgStyle: "linear-gradient(135deg, #1a0533 0%, #3d1266 50%, #6a0dad 100%)",
    layout: "tiers",
  },
  {
    id: "expanding-brain",
    name: "Expanding Brain",
    bgStyle: "linear-gradient(180deg, #0d0d0d 0%, #1a1a40 25%, #6610f2 65%, #e040fb 100%)",
    layout: "tiers",
  },
  {
    id: "stonks",
    name: "Stonks",
    bgStyle: "linear-gradient(135deg, #00b09b 0%, #1a6b3a 50%, #2ecc71 100%)",
    layout: "single",
  },
];

// ─────────────────────────────────────────────
// Font size map
// ─────────────────────────────────────────────

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-xl",
  large: "text-3xl",
  xlarge: "text-5xl",
};

const FONT_SIZE_PX: Record<FontSize, number> = {
  small: 16,
  medium: 20,
  large: 30,
  xlarge: 48,
};

// ─────────────────────────────────────────────
// Input style
// ─────────────────────────────────────────────

const inputCls =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-violet-500/30";

const labelCls = "block text-xs font-medium text-foreground-muted mb-1.5";

// ─────────────────────────────────────────────
// Template Preview Card
// ─────────────────────────────────────────────

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: MemeTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-150",
        isSelected
          ? "border-violet-500 shadow-lg shadow-violet-500/20"
          : "border-card-border hover:border-border"
      )}
    >
      {/* Template thumbnail */}
      <div
        className="aspect-video relative overflow-hidden"
        style={{ background: template.bgStyle }}
      >
        {/* Visual layout hint */}
        {template.layout === "two-row" && (
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 border-b border-white/10 flex items-center justify-center">
              <div className="w-8 h-1 rounded bg-white/20" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-1 rounded bg-white/30" />
            </div>
          </div>
        )}
        {template.layout === "split" && (
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-white/10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/20" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/30" />
            </div>
          </div>
        )}
        {template.layout === "tiers" && (
          <div className="absolute inset-0 flex flex-col">
            {[0.15, 0.25, 0.35, 0.45].map((opacity, i) => (
              <div
                key={i}
                className="flex-1 border-b border-white/10 flex items-center px-2"
              >
                <div
                  className="h-1 rounded bg-white"
                  style={{ opacity, width: `${40 + i * 15}%` }}
                />
              </div>
            ))}
          </div>
        )}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5">
            <CheckCircle2 className="h-5 w-5 text-violet-400 drop-shadow" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-card px-2.5 py-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-foreground truncate">
          {template.name}
        </span>
        <button
          onClick={onSelect}
          className={clsx(
            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all",
            isSelected
              ? "bg-violet-500 text-white"
              : "bg-background-subtle text-foreground-muted hover:bg-violet-500/10 hover:text-violet-600"
          )}
        >
          {isSelected ? "Selected" : "Select"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Upload Zone
// ─────────────────────────────────────────────

function UploadZone({
  onFile,
  preview,
}: {
  onFile: (file: File) => void;
  preview: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
        onFile(file);
      }
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 min-h-[160px] p-6",
        dragging
          ? "border-violet-500 bg-violet-500/5"
          : "border-border bg-background-subtle hover:border-violet-400 hover:bg-violet-500/5"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded preview"
            className="max-h-24 rounded-lg object-contain shadow"
          />
          <p className="text-xs text-foreground-muted">Click or drag to replace</p>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border shadow-sm">
            <Upload className="h-5 w-5 text-foreground-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drop image here or click to upload
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              JPG, PNG supported
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function MemeGeneratorUI({ tool }: { tool: Tool }) {
  const [activeTab, setActiveTab] = useState<TemplateTab>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(TEMPLATES[0]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);

  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState<FontSize>("large");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textOutline, setTextOutline] = useState(true);
  const [textStyle, setTextStyle] = useState<TextStyle>("impact");

  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    const url = URL.createObjectURL(file);
    setUploadPreviewUrl(url);
  }, [uploadPreviewUrl]);

  // Derive background for preview
  const previewBackground =
    activeTab === "upload" && uploadPreviewUrl
      ? undefined
      : selectedTemplate.bgStyle;

  const textShadow = textOutline
    ? "2px 2px 4px #000, -2px -2px 4px #000, 2px -2px 4px #000, -2px 2px 4px #000"
    : "2px 2px 6px rgba(0,0,0,0.8)";

  const fontWeightClass =
    textStyle === "bold" || textStyle === "impact" ? "font-black" : "font-normal";

  const fontFamilyStyle =
    textStyle === "impact"
      ? { fontFamily: "'Impact', 'Arial Black', sans-serif", letterSpacing: "0.04em" }
      : textStyle === "bold"
      ? { fontFamily: "inherit", fontWeight: 900 }
      : { fontFamily: "inherit" };

  const memeTextStyle: React.CSSProperties = {
    color: textColor,
    textShadow,
    fontSize: FONT_SIZE_PX[fontSize],
    textTransform: "uppercase" as const,
    ...fontFamilyStyle,
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-md">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tool.name}</h2>
          <p className="text-sm text-foreground-muted">{tool.shortDescription}</p>
        </div>
        {tool.isNew && <Badge variant="new">New</Badge>}
        {tool.isPopular && <Badge variant="popular">Popular</Badge>}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Left: Controls ───────────────────────────── */}
        <div className="rounded-2xl border border-card-border bg-card p-6 space-y-6">

          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-400 text-xs font-bold text-white">
                1
              </span>
              <p className="text-sm font-semibold text-foreground">
                Choose Template or Upload
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="flex rounded-xl border border-border bg-background-subtle p-1 mb-4">
              {(["templates", "upload"] as TemplateTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-150 capitalize",
                    activeTab === tab
                      ? "bg-card text-foreground shadow-sm border border-card-border"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {tab === "templates" ? "Templates" : "Upload Image"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "templates" ? (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-0.5"
                >
                  {TEMPLATES.map((tpl) => (
                    <TemplateCard
                      key={tpl.id}
                      template={tpl}
                      isSelected={selectedTemplate.id === tpl.id}
                      onSelect={() => setSelectedTemplate(tpl)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <UploadZone
                    onFile={handleFileUpload}
                    preview={uploadPreviewUrl}
                  />
                  {uploadedFile && (
                    <p className="mt-2 text-xs text-foreground-muted">
                      {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 2 */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-400 text-xs font-bold text-white">
                2
              </span>
              <p className="text-sm font-semibold text-foreground">Add Text</p>
            </div>

            <div className="space-y-4">
              {/* Top Text */}
              <div>
                <label className={labelCls}>Top Text</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Enter top text..."
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                />
              </div>

              {/* Bottom Text */}
              <div>
                <label className={labelCls}>Bottom Text</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Enter bottom text..."
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                />
              </div>

              {/* Font Size */}
              <div>
                <label className={labelCls}>Font Size</label>
                <select
                  className={inputCls}
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as FontSize)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>

              {/* Text Color + Outline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Text Color</label>
                  <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-sm text-foreground font-mono">{textColor}</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Text Outline</label>
                  <div className="flex items-center gap-3 h-11">
                    <button
                      onClick={() => setTextOutline((v) => !v)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        textOutline ? "bg-violet-500" : "bg-background-subtle border border-border"
                      )}
                      role="switch"
                      aria-checked={textOutline}
                    >
                      <span
                        className={clsx(
                          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
                          textOutline ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-xs text-foreground-muted">
                      {textOutline ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Style */}
              <div>
                <label className={labelCls}>Text Style</label>
                <div className="flex gap-2">
                  {(["Normal", "Bold", "Impact"] as const).map((style) => {
                    const val = style.toLowerCase() as TextStyle;
                    return (
                      <label
                        key={style}
                        className={clsx(
                          "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                          textStyle === val
                            ? "border-violet-500 bg-violet-500/10 text-violet-600"
                            : "border-border bg-background text-foreground-muted hover:border-border"
                        )}
                        style={
                          style === "Bold"
                            ? { fontWeight: 900 }
                            : style === "Impact"
                            ? { fontFamily: "'Impact', 'Arial Black', sans-serif" }
                            : {}
                        }
                      >
                        <input
                          type="radio"
                          name="text-style"
                          value={val}
                          checked={textStyle === val}
                          onChange={() => setTextStyle(val)}
                          className="sr-only"
                        />
                        {style}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Preview ────────────────────────────── */}
        <div className="rounded-2xl border border-card-border bg-card p-6 flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Live Preview
          </p>

          {/* Meme Preview */}
          <div
            className="aspect-video relative overflow-hidden rounded-2xl border border-card-border select-none"
            style={
              activeTab === "upload" && uploadPreviewUrl
                ? {
                    backgroundImage: `url(${uploadPreviewUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { background: previewBackground }
            }
          >
            {/* Template visual accents */}
            {(activeTab === "templates" || !uploadPreviewUrl) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {selectedTemplate.layout === "two-row" && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 border-b border-white/10" />
                    <div className="flex-1" />
                  </div>
                )}
                {selectedTemplate.layout === "split" && (
                  <div className="w-full h-full flex">
                    <div className="flex-1 border-r border-white/10 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/10" />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/15" />
                    </div>
                  </div>
                )}
                {selectedTemplate.layout === "tiers" && (
                  <div className="w-full h-full flex flex-col">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-b border-white/10 last:border-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Top Text */}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-center px-3 pt-4 pointer-events-none">
              <AnimatePresence>
                {topText && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className={clsx(
                      "text-center leading-tight break-words max-w-full",
                      FONT_SIZE_MAP[fontSize],
                      fontWeightClass
                    )}
                    style={{ ...memeTextStyle, textTransform: "uppercase" }}
                  >
                    {topText}
                  </motion.p>
                )}
              </AnimatePresence>
              {!topText && (
                <p
                  className="text-xs text-white/30 italic"
                  style={{ textShadow: "none" }}
                >
                  Top text appears here
                </p>
              )}
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center px-3 pb-4 pointer-events-none">
              <AnimatePresence>
                {bottomText && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.1 }}
                    className={clsx(
                      "text-center leading-tight break-words max-w-full",
                      FONT_SIZE_MAP[fontSize],
                      fontWeightClass
                    )}
                    style={{ ...memeTextStyle, textTransform: "uppercase" }}
                  >
                    {bottomText}
                  </motion.p>
                )}
              </AnimatePresence>
              {!bottomText && (
                <p
                  className="text-xs text-white/30 italic"
                  style={{ textShadow: "none" }}
                >
                  Bottom text appears here
                </p>
              )}
            </div>

            {/* Template name watermark */}
            {activeTab === "templates" && (
              <div className="absolute bottom-2 right-3 pointer-events-none">
                <span className="text-[10px] text-white/20 font-medium">
                  {selectedTemplate.name}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="gradient"
              leftIcon={<Download className="h-4 w-4" />}
              className="bg-gradient-to-r from-violet-500 to-purple-400 col-span-1"
              onClick={() => alert("Meme downloaded!")}
            >
              Download
            </Button>
            <Button
              variant="outline"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `${topText}\n${bottomText}`
                ).then(() => alert("Text copied to clipboard!"));
              }}
            >
              Copy
            </Button>
            <Button
              variant="outline"
              leftIcon={<Share2 className="h-4 w-4" />}
              onClick={() => alert("Share feature coming soon!")}
            >
              Share
            </Button>
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-background-subtle border border-border px-4 py-3">
            <p className="text-xs font-semibold text-foreground mb-1.5">Tips</p>
            <ul className="space-y-1">
              {[
                "Use IMPACT font for the classic meme look",
                "Keep text short — 3 to 5 words per line",
                "Outline helps text stand out on any background",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground-muted">
                  <span className="mt-0.5 text-violet-500 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
