"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import {
  Sparkles,
  Film,
  Sword,
  CircleDot,
  Shuffle,
  Copy,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

// ─── Shared Styles ───────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const cardClass =
  "rounded-xl border border-card-border bg-background-subtle p-4";

const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryBtn =
  "h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-background-subtle transition-colors disabled:opacity-50";

// ─── CSS Animations (injected once) ──────────────────────────────────────────

const STYLES = `
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
@keyframes winner-pop {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
}
@keyframes drum-roll {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.confetti-piece {
  position: fixed;
  width: 10px;
  height: 10px;
  animation: confetti-fall linear forwards;
  pointer-events: none;
  z-index: 9999;
  border-radius: 2px;
}
.winner-pop {
  animation: winner-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
.drum-roll {
  animation: drum-roll 0.15s infinite;
}
`;

const CONFETTI_COLORS = [
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#06b6d4",
];

function spawnConfetti() {
  const container = document.body;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.top = "-10px";
    el.style.background =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.animationDuration = 1.5 + Math.random() * 2 + "s";
    el.style.animationDelay = Math.random() * 0.8 + "s";
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ─── Shared Output Card ─────────────────────────────────────────────────────

function OutputCard({
  text,
  onClear,
  label = "Generated Content",
}: {
  text: string;
  onClear: () => void;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClass}
    >
      {label && (
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            {label}
          </p>
        </div>
      )}
      <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
        {text}
      </pre>
      {text && (
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button
            onClick={handleCopy}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
              copied
                ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                : "bg-background border-border text-foreground-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground-muted hover:text-foreground hover:border-border-strong transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── 1. Meme Generator ───────────────────────────────────────────────────────

const MEME_TEMPLATES = [
  { id: "drake", name: "Drake Hotline Bling" },
  { id: "distracted", name: "Distracted Boyfriend" },
  { id: "two-buttons", name: "Two Buttons" },
  { id: "change-my-mind", name: "Change My Mind" },
  { id: "expanding-brain", name: "Expanding Brain" },
  { id: "is-this-a", name: "Is This a Butterfly?" },
  { id: "woman-yelling-cat", name: "Woman Yelling at Cat" },
  { id: "surprised-pikachu", name: "Surprised Pikachu" },
  { id: "this-is-fine", name: "This Is Fine" },
  { id: "button", name: "Will It Blend?" },
];

function MemeGenerator() {
  const [template, setTemplate] = useState("drake");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("fun-meme-gen");

  async function handleGenerate() {
    const selectedTemplate = MEME_TEMPLATES.find((t) => t.id === template);
    await generate({
      template: selectedTemplate?.name || template,
      topText,
      bottomText,
    });
  }

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1.5">
          Meme Template
        </label>
        <div className="relative">
          <select
            className={clsx(inputClass, "appearance-none pr-10 cursor-pointer")}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {MEME_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Top Text
          </label>
          <input
            className={inputClass}
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            placeholder="TOP TEXT"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1">
            Bottom Text
          </label>
          <input
            className={inputClass}
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            placeholder="BOTTOM TEXT"
          />
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className={primaryBtn}>
        {loading ? "Generating..." : "Generate Meme"}
      </button>

      {output && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Your Meme
            </p>
            <button
              onClick={handleCopy}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium flex items-center gap-1.5",
                copied
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-600"
                  : "bg-background border-border text-foreground-muted hover:text-foreground"
              )}
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-foreground text-sm whitespace-pre-wrap">
            {output}
          </p>
          <p className="text-xs text-foreground-muted mt-3">
            Tip: Use bold, uppercase text for classic meme style!
          </p>
        </div>
      )}
    </div>
  );
}

// ─── 2. Movie Plot Generator ─────────────────────────────────────────────────

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Fantasy",
  "Mystery",
  "Animation",
  "Documentary",
];

function MoviePlotGenerator() {
  const [genre, setGenre] = useState("Action");
  const [mood, setMood] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("movie-plot-generator");

  async function handleGenerate() {
    await generate({
      genre,
      mood: mood || undefined,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1.5">
            Genre
          </label>
          <div className="relative">
            <select
              className={clsx(inputClass, "appearance-none pr-10 cursor-pointer")}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1.5">
            Mood (optional)
          </label>
          <input
            className={inputClass}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g., Dark, Lighthearted"
          />
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className={primaryBtn}>
        {loading ? "Generating..." : "Generate Movie Plot"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Movie Plot" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 3. D&D Character Generator ─────────────────────────────────────────────

const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Gnome",
  "Half-Orc",
  "Tiefling",
  "Dragonborn",
];

const CLASSES = [
  "Fighter",
  "Wizard",
  "Rogue",
  "Cleric",
  "Ranger",
  "Paladin",
  "Barbarian",
  "Bard",
  "Druid",
  "Monk",
  "Sorcerer",
  "Warlock",
];

const BACKGROUNDS = [
  "Acolyte",
  "Charlatan",
  "Criminal",
  "Entertainer",
  "Folk Hero",
  "Guild Artisan",
  "Hermit",
  "Noble",
  "Outlander",
  "Sage",
  "Sailor",
  "Soldier",
];

function DNDCharacterGenerator() {
  const [race, setRace] = useState("Human");
  const [charClass, setCharClass] = useState("Fighter");
  const [background, setBackground] = useState("Soldier");
  const [nameStyle, setNameStyle] = useState("");
  const { output, loading, error, generate, clear } = useAIGenerate("dnd-character-generator");

  async function handleGenerate() {
    await generate({
      race,
      charClass,
      background,
      nameStyle: nameStyle || undefined,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1.5">
            Race
          </label>
          <div className="relative">
            <select
              className={clsx(inputClass, "appearance-none pr-8 cursor-pointer")}
              value={race}
              onChange={(e) => setRace(e.target.value)}
            >
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1.5">
            Class
          </label>
          <div className="relative">
            <select
              className={clsx(inputClass, "appearance-none pr-8 cursor-pointer")}
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-1.5">
            Background
          </label>
          <div className="relative">
            <select
              className={clsx(inputClass, "appearance-none pr-8 cursor-pointer")}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            >
              {BACKGROUNDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground-muted block mb-1">
          Name Style (optional)
        </label>
        <input
          className={inputClass}
          value={nameStyle}
          onChange={(e) => setNameStyle(e.target.value)}
          placeholder="e.g., Viking, Elegant, Fantasy"
        />
      </div>

      <button onClick={handleGenerate} disabled={loading} className={primaryBtn}>
        {loading ? "Generating..." : "Generate Character"}
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <AnimatePresence>
        {output && <OutputCard text={output} onClear={clear} label="Character Sheet" />}
      </AnimatePresence>
    </div>
  );
}

// ─── 4. Spin Wheel ───────────────────────────────────────────────────────────

const WHEEL_COLORS = [
  "#6366f1",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#3b82f6",
  "#64748b",
];

function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Option 6",
  ]);
  const [newOption, setNewOption] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);

  // Inject styles
  useEffect(() => {
    const id = "spinwheel-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2,
      cy = size / 2,
      r = size / 2 - 4;
    const sliceAngle = (2 * Math.PI) / options.length;
    ctx.clearRect(0, 0, size, size);

    options.forEach((item, i) => {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, Math.min(16, 180 / options.length))}px sans-serif`;
      const label = item.length > 12 ? item.slice(0, 12) + "..." : item;
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer
    ctx.beginPath();
    ctx.moveTo(cx + r - 10, cy - 12);
    ctx.lineTo(cx + r + 10, cy);
    ctx.lineTo(cx + r - 10, cy + 12);
    ctx.closePath();
    ctx.fillStyle = "#1f2937";
    ctx.fill();
  }

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [options]);

  function spin() {
    if (spinning || options.length === 0) return;
    setResult(null);
    setSpinning(true);
    velocityRef.current = Math.random() * 0.3 + 0.25;

    function animate() {
      angleRef.current += velocityRef.current;
      velocityRef.current *= 0.992;
      drawWheel(angleRef.current);
      if (velocityRef.current > 0.001) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const sliceAngle = (2 * Math.PI) / options.length;
        const normalizedAngle =
          ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = 0;
        const idx = Math.floor(
          ((2 * Math.PI - ((normalizedAngle - pointerAngle + 2 * Math.PI) % (2 * Math.PI))) /
            sliceAngle) %
            options.length
        );
        const winner = options[(idx + options.length) % options.length];
        setResult(winner);
        spawnConfetti();
      }
    }
    requestAnimationFrame(animate);
  }

  function addOption() {
    const t = newOption.trim();
    if (!t || options.includes(t)) return;
    setOptions([...options, t]);
    setNewOption("");
  }

  function removeOption(i: number) {
    setOptions(options.filter((_, idx) => idx !== i));
  }

  function resetOptions() {
    setOptions(["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6"]);
    setResult(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Wheel */}
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={360}
            height={360}
            className="w-full max-w-[360px] rounded-full shadow-xl"
          />
          <button
            onClick={spin}
            disabled={spinning || options.length < 2}
            className={clsx(
              "h-12 px-8 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              spinning
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg hover:shadow-indigo-300"
            )}
          >
            <CircleDot className="w-4 h-4" />
            {spinning ? "Spinning..." : "Spin!"}
          </button>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl px-6 py-4 shadow-lg winner-pop"
            >
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Result</p>
              <p className="text-xl font-bold">{result}</p>
            </motion.div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className={clsx(inputClass, "flex-1")}
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add an option..."
              onKeyDown={(e) => e.key === "Enter" && addOption()}
            />
            <button
              onClick={addOption}
              className="h-11 px-4 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:opacity-90"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {options.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-2.5"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
                />
                <span className="flex-1 text-sm text-foreground">{item}</span>
                <button
                  onClick={() => removeOption(i)}
                  className="text-foreground-muted hover:text-red-500 text-xs"
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={resetOptions}
            className="text-xs text-foreground-muted hover:text-foreground underline"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Random Name Picker ───────────────────────────────────────────────────

function RandomNamePicker() {
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [drumName, setDrumName] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const drumRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inject styles
  useEffect(() => {
    const id = "namepicker-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  function parseNames(raw: string): string[] {
    return raw.split(/[\n,]+/).map((n) => n.trim()).filter(Boolean);
  }

  const names = parseNames(input);

  const pickFrom = useCallback((pool: string[]) => {
    if (pool.length === 0) return;
    setSpinning(true);
    setWinner(null);

    let ticks = 0;
    const totalTicks = 20 + Math.floor(Math.random() * 15);
    drumRef.current = setInterval(() => {
      ticks++;
      setDrumName(pool[Math.floor(Math.random() * pool.length)]);
      if (ticks >= totalTicks) {
        clearInterval(drumRef.current!);
        const picked = pool[Math.floor(Math.random() * pool.length)];
        setDrumName("");
        setWinner(picked);
        setSpinning(false);
        setHistory((prev) => [picked, ...prev].slice(0, 20));
        spawnConfetti();
      }
    }, 80);
  }, []);

  function handlePick() {
    const pool = remaining.length > 0 ? remaining : names;
    pickFrom(pool);
  }

  function handleRemoveAndPick() {
    if (!winner) return;
    const pool = (remaining.length > 0 ? remaining : names).filter((n) => n !== winner);
    setWinner(null);
    setRemaining(pool);
    if (pool.length > 0) {
      setTimeout(() => pickFrom(pool), 100);
    }
  }

  function handleReset() {
    setWinner(null);
    setSpinning(false);
    setRemaining([]);
    if (drumRef.current) clearInterval(drumRef.current);
  }

  const activePool = remaining.length > 0 ? remaining : names;
  const canPick = activePool.length >= 1 && !spinning;

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
            Names
          </label>
          <span className="text-xs text-foreground-muted">
            {names.length} name{names.length !== 1 ? "s" : ""} &middot;{" "}
            {activePool.length} remaining
          </span>
        </div>
        <textarea
          className={clsx(inputClass, "resize-none font-mono")}
          rows={6}
          placeholder={"Alice\nBob\nCharlie\n\nOr: Alice, Bob, Charlie"}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setRemaining([]);
            setWinner(null);
          }}
        />
      </div>

      <button onClick={handlePick} disabled={!canPick} className={primaryBtn}>
        {spinning ? "Picking..." : winner ? "Pick Again" : "Pick Winner"}
      </button>

      {/* Drum roll / winner display */}
      {(spinning || winner) && (
        <div className={cardClass}>
          <div className="flex flex-col items-center gap-4 text-center">
            {spinning && (
              <>
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-widest">
                  Drawing...
                </p>
                <div className="drum-roll text-4xl font-bold text-foreground font-mono min-h-[3rem]">
                  {drumName}
                </div>
              </>
            )}
            {!spinning && winner && (
              <>
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
                  Winner!
                </p>
                <div className="winner-pop text-4xl sm:text-5xl font-bold text-foreground break-all">
                  {winner}
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:border-orange-400 hover:text-foreground transition-colors"
                  >
                    Pick Again (keep all)
                  </button>
                  {activePool.length > 1 && (
                    <button
                      onClick={handleRemoveAndPick}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Remove &amp; Pick Next
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className={cardClass}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">
              Pick History
            </label>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-foreground-muted hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
          <ol className="space-y-1.5">
            {history.map((name, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 text-xs flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-foreground">{name}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function EntertainmentWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "fun-meme-gen":
      return <MemeGenerator />;
    case "movie-plot-generator":
      return <MoviePlotGenerator />;
    case "dnd-character-generator":
      return <DNDCharacterGenerator />;
    case "spin-wheel":
      return <SpinWheel />;
    case "random-name-picker":
      return <RandomNamePicker />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-foreground-muted">Tool not found: {tool.slug}</p>
        </div>
      );
  }
}