"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Sparkles,
  X,
  Download,
  Copy,
  RefreshCw,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Platform = "youtube" | "instagram" | "twitter" | "tiktok" | "facebook";
type StylePreset =
  | "gaming"
  | "tutorial"
  | "vlog"
  | "news"
  | "food"
  | "tech";
type TextColorPreset = "white" | "yellow" | "red" | "gradient";

interface PlatformConfig {
  label: string;
  ratio: string;
  width: number;
  height: number;
  display: string;
}

interface StyleConfig {
  label: string;
  desc: string;
  bgClass: string;
  accentColor: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PLATFORMS: Record<Platform, PlatformConfig> = {
  youtube:   { label: "YouTube",    ratio: "16:9",  width: 1280, height: 720,  display: "1280 × 720 px · YouTube" },
  instagram: { label: "Instagram",  ratio: "1:1",   width: 1080, height: 1080, display: "1080 × 1080 px · Instagram" },
  twitter:   { label: "Twitter/X",  ratio: "16:9",  width: 1200, height: 675,  display: "1200 × 675 px · Twitter/X" },
  tiktok:    { label: "TikTok",     ratio: "9:16",  width: 1080, height: 1920, display: "1080 × 1920 px · TikTok" },
  facebook:  { label: "Facebook",   ratio: "16:9",  width: 1200, height: 630,  display: "1200 × 630 px · Facebook" },
};

const STYLE_PRESETS: Record<StylePreset, StyleConfig> = {
  gaming:   { label: "Gaming",         desc: "dark, neon, explosive",         bgClass: "bg-gradient-to-br from-gray-900 via-purple-900 to-black",     accentColor: "#a855f7" },
  tutorial: { label: "Tutorial",       desc: "clean, bright, professional",   bgClass: "bg-gradient-to-br from-blue-500 to-cyan-400",                  accentColor: "#06b6d4" },
  vlog:     { label: "Vlog",           desc: "warm, personal, candid",        bgClass: "bg-gradient-to-br from-orange-400 to-rose-500",                accentColor: "#f97316" },
  news:     { label: "News",           desc: "bold, urgent, contrasting",     bgClass: "bg-gradient-to-br from-red-600 to-red-900",                    accentColor: "#ef4444" },
  food:     { label: "Food/Lifestyle", desc: "warm, appetizing",              bgClass: "bg-gradient-to-br from-orange-300 to-yellow-400",              accentColor: "#fb923c" },
  tech:     { label: "Tech/Business",  desc: "minimal, modern, sleek",        bgClass: "bg-gradient-to-br from-slate-800 to-slate-900",                accentColor: "#64748b" },
};

const TEXT_COLORS: Record<TextColorPreset, { label: string; titleStyle: React.CSSProperties; swatch: string }> = {
  white:    { label: "White",    swatch: "#ffffff", titleStyle: { color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)" } },
  yellow:   { label: "Yellow",   swatch: "#fbbf24", titleStyle: { color: "#fbbf24", textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(251,191,36,0.4)" } },
  red:      { label: "Red",      swatch: "#f87171", titleStyle: { color: "#f87171", textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(248,113,113,0.4)" } },
  gradient: { label: "Gradient", swatch: "linear-gradient(90deg,#a855f7,#ec4899)", titleStyle: { backgroundImage: "linear-gradient(90deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none" } },
};

// ─────────────────────────────────────────────
// Aspect ratio helper → padding-bottom trick
// ─────────────────────────────────────────────

function getAspectPaddingBottom(platform: Platform): string {
  const cfg = PLATFORMS[platform];
  return `${((cfg.height / cfg.width) * 100).toFixed(4)}%`;
}

// ─────────────────────────────────────────────
// Decorative SVG overlay per style
// ─────────────────────────────────────────────

function StyleOverlay({ style }: { style: StylePreset }) {
  if (style === "gaming") {
    return (
      <>
        {/* Neon grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#a855f7" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Diagonal slash */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 225" preserveAspectRatio="none">
          <polygon points="320,0 400,0 80,225 0,225" fill="#a855f7" />
        </svg>
        {/* Spotlight glow */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(168,85,247,0.35) 0%,transparent 70%)" }} />
      </>
    );
  }
  if (style === "tutorial") {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 225" preserveAspectRatio="none">
          <circle cx="380" cy="20" r="120" fill="white" fillOpacity="0.15" />
          <circle cx="20" cy="200" r="80" fill="white" fillOpacity="0.1" />
        </svg>
        <div className="absolute top-0 right-0 w-2/3 h-full"
          style={{ background: "linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.12) 100%)" }} />
      </>
    );
  }
  if (style === "vlog") {
    return (
      <>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 30%,rgba(255,255,255,0.2) 0%,transparent 60%)" }} />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 225" preserveAspectRatio="none">
          <ellipse cx="350" cy="50" rx="160" ry="100" fill="white" />
        </svg>
      </>
    );
  }
  if (style === "news") {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 225" preserveAspectRatio="none">
          <polygon points="0,0 200,0 160,225 0,225" fill="rgba(0,0,0,0.3)" />
          <line x1="0" y1="60" x2="400" y2="60" stroke="white" strokeWidth="2" opacity="0.4" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-1/4"
          style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.6))" }} />
      </>
    );
  }
  if (style === "food") {
    return (
      <>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.25) 0%,transparent 60%)" }} />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 225" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="80" fill="white" />
          <circle cx="370" cy="190" r="60" fill="white" />
        </svg>
      </>
    );
  }
  // tech/business
  return (
    <>
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="techgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#techgrid)" />
      </svg>
      <div className="absolute top-0 right-0 w-1/2 h-full"
        style={{ background: "linear-gradient(to left,rgba(99,102,241,0.15),transparent)" }} />
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 225" preserveAspectRatio="none">
        <polygon points="260,0 400,0 400,225 320,225" fill="#6366f1" fillOpacity="0.3" />
      </svg>
    </>
  );
}

// ─────────────────────────────────────────────
// Play button watermark
// ─────────────────────────────────────────────

function PlayWatermark({ platform }: { platform: Platform }) {
  if (platform === "youtube") {
    return (
      <div className="absolute bottom-[6%] right-[3%] flex items-center gap-1 opacity-70">
        <div className="w-[5%] min-w-[18px] aspect-square rounded-sm flex items-center justify-center"
          style={{ background: "#ff0000" }}>
          <svg viewBox="0 0 24 24" className="w-full h-full p-[20%]" fill="white">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      </div>
    );
  }
  if (platform === "tiktok") {
    return (
      <div className="absolute top-[4%] right-[4%] opacity-60">
        <svg viewBox="0 0 24 24" className="w-[6%] min-w-[20px]" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.04-8.86a8.28 8.28 0 004.84 1.55V4.55a4.85 4.85 0 01-1.03-.86z"/>
        </svg>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function ThumbnailCreator() {
  const { toast } = useToast();

  // Form state
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [stylePreset, setStylePreset] = useState<StylePreset>("gaming");
  const [mainTitle, setMainTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [textColor, setTextColor] = useState<TextColorPreset>("white");

  // Photo upload
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoObjectUrlRef = useRef<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [seed, setSeed] = useState(0); // bump to "regenerate"

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(photoObjectUrlRef.current);
      }
    };
  }, []);

  const handlePhotoFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    photoObjectUrlRef.current = url;
    setPhotoUrl(url);
  }, []);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
    e.target.value = "";
  };

  const removePhoto = () => {
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current);
      photoObjectUrlRef.current = null;
    }
    setPhotoUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      setSeed((s) => s + 1);
      toast({ title: "Thumbnail generated!", variant: "success" });
    }, 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSeed((s) => s + 1);
      toast({ title: "New variation generated!", variant: "success" });
    }, 1500);
  };

  const handleDownload = () => {
    alert("Thumbnail downloaded!");
  };

  const handleCopy = () => {
    toast({ title: "Copied to clipboard!", variant: "success" });
  };

  const platformConfig = PLATFORMS[platform];
  const styleConfig = STYLE_PRESETS[stylePreset];
  const textColorConfig = TEXT_COLORS[textColor];
  const paddingBottom = getAspectPaddingBottom(platform);

  const displayTitle = mainTitle || "YOUR TITLE HERE";
  const displaySubtitle = subtitle;

  // Text positioning based on style
  const textPositionStyle: React.CSSProperties =
    stylePreset === "news"
      ? { bottom: "10%", left: "5%", right: "5%", textAlign: "left" }
      : stylePreset === "tech"
      ? { top: "50%", left: "5%", right: "45%", transform: "translateY(-50%)", textAlign: "left" }
      : { top: "50%", left: "5%", right: "5%", transform: "translateY(-50%)", textAlign: "center" };

  return (
    <div className="w-full">
      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="w-full lg:w-[420px] lg:flex-shrink-0 flex flex-col gap-5">

          {/* Step 1: Describe */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">1</span>
              Describe Your Thumbnail
            </h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={4}
              placeholder={`Describe your thumbnail... e.g. 'A dramatic YouTube thumbnail for a gaming video about Minecraft survival with epic fire background and bold text saying EPIC SURVIVAL'`}
              className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
            />
            <div className="mt-1.5 text-right text-xs text-foreground-muted">
              {description.length}/500
            </div>
          </div>

          {/* Step 2: Upload Photo */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">2</span>
              Upload Your Photo
              <span className="text-xs font-normal text-foreground-muted">(Optional)</span>
            </h3>

            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={photoUrl} alt="Uploaded photo" className="w-full h-32 object-cover" />
                <button
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => photoInputRef.current?.click()}
                className={clsx(
                  "border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all",
                  isDragging
                    ? "border-violet-400 bg-violet-500/10"
                    : "border-border hover:border-violet-400/60 hover:bg-violet-500/5"
                )}
              >
                <Upload className="w-6 h-6 text-foreground-muted" />
                <p className="text-sm text-foreground-muted text-center">
                  Drop your photo here or click to browse
                </p>
                <p className="text-xs text-foreground-muted opacity-60">.jpg · .png · .webp</p>
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Step 3: Platform */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">3</span>
              Platform & Aspect Ratio
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(PLATFORMS) as [Platform, PlatformConfig][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    platform === key
                      ? "bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/30"
                      : "bg-background-subtle border-border text-foreground-muted hover:border-violet-400/60 hover:text-foreground"
                  )}
                >
                  {cfg.label}
                  <span className={clsx(
                    "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                    platform === key ? "bg-white/20 text-white" : "bg-border text-foreground-muted"
                  )}>
                    {cfg.ratio}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Style Preset */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">4</span>
              Style Preset
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STYLE_PRESETS) as [StylePreset, StyleConfig][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setStylePreset(key)}
                  className={clsx(
                    "relative flex flex-col items-start p-3 rounded-xl border text-left transition-all overflow-hidden",
                    stylePreset === key
                      ? "border-violet-500 bg-violet-500/10 shadow-md shadow-violet-500/20"
                      : "border-border bg-background-subtle hover:border-violet-400/50"
                  )}
                >
                  {/* Color swatch strip */}
                  <div className={clsx("w-full h-1.5 rounded-full mb-2", cfg.bgClass)} />
                  <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
                  <span className="text-[10px] text-foreground-muted mt-0.5 leading-tight">{cfg.desc}</span>
                  {stylePreset === key && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-violet-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Text */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">5</span>
              Text on Thumbnail
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1.5 block">Main Title</label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="e.g. EPIC SURVIVAL"
                  className="w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1.5 block">Subtitle <span className="opacity-60">(optional)</span></label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 100 Days Challenge"
                  className="w-full bg-background-subtle border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-2 block">Text Color</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.entries(TEXT_COLORS) as [TextColorPreset, typeof TEXT_COLORS[TextColorPreset]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setTextColor(key)}
                      className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        textColor === key
                          ? "border-violet-500 bg-violet-500/10 text-foreground"
                          : "border-border bg-background-subtle text-foreground-muted hover:border-violet-400/50"
                      )}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                        style={
                          key === "gradient"
                            ? { background: cfg.swatch as string }
                            : { backgroundColor: cfg.swatch as string }
                        }
                      />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className={clsx(
              "w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all",
              isGenerating
                ? "opacity-70 cursor-not-allowed bg-violet-600 text-white"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50"
            )}
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Thumbnail
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── RIGHT PANEL: Preview ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Live Preview
            </h3>

            {/* Thumbnail canvas */}
            <div className="w-full relative" style={{ paddingBottom }}>
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  {!generated ? (
                    /* Placeholder */
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-background-subtle"
                    >
                      <Sparkles className="w-10 h-10 text-foreground-muted opacity-40" />
                      <p className="text-sm text-foreground-muted opacity-60 text-center px-4">
                        Your thumbnail preview will appear here
                      </p>
                    </motion.div>
                  ) : (
                    /* Generated preview */
                    <motion.div
                      key={`preview-${seed}`}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={clsx(
                        "relative w-full h-full overflow-hidden rounded-xl",
                        styleConfig.bgClass
                      )}
                    >
                      {/* Style decorative overlays */}
                      <StyleOverlay style={stylePreset} />

                      {/* Uploaded photo */}
                      {photoUrl && (
                        <div
                          className="absolute"
                          style={
                            stylePreset === "tech"
                              ? { right: 0, top: 0, bottom: 0, width: "45%", display: "flex", alignItems: "center" }
                              : { right: "2%", bottom: 0, height: "75%", width: "40%" }
                          }
                        >
                          <img
                            src={photoUrl}
                            alt="Thumbnail photo"
                            className="w-full h-full object-contain object-bottom drop-shadow-2xl"
                            style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}
                          />
                        </div>
                      )}

                      {/* Text overlay */}
                      <div
                        className="absolute px-[4%] py-[3%] flex flex-col"
                        style={{
                          ...textPositionStyle,
                          zIndex: 10,
                        }}
                      >
                        <span
                          className="font-black uppercase leading-tight tracking-tight"
                          style={{
                            fontSize: "clamp(14px, 5.5cqw, 60px)",
                            ...textColorConfig.titleStyle,
                          }}
                        >
                          {displayTitle}
                        </span>
                        {displaySubtitle && (
                          <span
                            className="font-semibold mt-[0.3em] uppercase tracking-wide"
                            style={{
                              fontSize: "clamp(8px, 2.5cqw, 28px)",
                              color: "rgba(255,255,255,0.85)",
                              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
                            }}
                          >
                            {displaySubtitle}
                          </span>
                        )}
                      </div>

                      {/* Platform watermark */}
                      <PlayWatermark platform={platform} />

                      {/* Vignette */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Actions (shown only after generating) */}
            <AnimatePresence>
              {generated && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex flex-col gap-3"
                >
                  {/* Dimensions info */}
                  <p className="text-xs text-foreground-muted text-center">
                    {platformConfig.display}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-background-subtle border border-border hover:border-violet-400/60 text-foreground-muted hover:text-foreground text-sm font-medium transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-background-subtle border border-border hover:border-violet-400/60 text-foreground-muted hover:text-foreground text-sm font-medium transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={clsx("w-4 h-4", isGenerating && "animate-spin")} />
                      Regenerate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tips card */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Tips for Great Thumbnails</h4>
            <ul className="flex flex-col gap-2">
              {[
                "Use high-contrast text that's readable at small sizes",
                "Keep text to 3–5 words max — less is more",
                "Faces with strong emotions drive higher click rates",
                "Use the rule of thirds: don't center everything",
                "Test how it looks at 120px wide (search result size)",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground-muted">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#a855f7" }} />
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
