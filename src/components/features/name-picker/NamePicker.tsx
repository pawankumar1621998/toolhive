"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ── CSS for confetti + winner animation is injected as a style tag ── */
const STYLES = `
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
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

const COLORS = ["#f97316","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#ef4444","#06b6d4"];

function spawnConfetti() {
  const container = document.body;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.top  = "-10px";
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.animationDuration = (1.5 + Math.random() * 2) + "s";
    el.style.animationDelay    = (Math.random() * 0.8) + "s";
    el.style.transform         = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function parseNames(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map(n => n.trim())
    .filter(Boolean);
}

export function NamePicker() {
  const [input,     setInput]     = useState("");
  const [winner,    setWinner]    = useState<string | null>(null);
  const [spinning,  setSpinning]  = useState(false);
  const [drumName,  setDrumName]  = useState("");
  const [history,   setHistory]   = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const drumRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inject styles once
  useEffect(() => {
    const id = "np-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

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
        setHistory(prev => [picked, ...prev].slice(0, 20));
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
    const pool = (remaining.length > 0 ? remaining : names).filter(n => n !== winner);
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

  const activePool  = remaining.length > 0 ? remaining : names;
  const canPick     = activePool.length >= 1 && !spinning;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Random Name Picker</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Paste names (one per line or comma-separated) and pick a random winner.</p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Names</label>
            <span className="text-xs text-foreground-muted">{names.length} name{names.length !== 1 ? "s" : ""} · {activePool.length} remaining</span>
          </div>
          <textarea
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none font-mono"
            rows={6}
            placeholder={"Alice\nBob\nCharlie\n\nOr: Alice, Bob, Charlie"}
            value={input}
            onChange={e => { setInput(e.target.value); setRemaining([]); setWinner(null); }}
          />
        </div>

        <button
          onClick={handlePick}
          disabled={!canPick}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spinning ? "Picking…" : winner ? "Pick Again" : "Pick Winner"}
        </button>
      </div>

      {/* Drum roll / winner display */}
      {(spinning || winner) && (
        <div className="rounded-2xl border border-card-border bg-card p-8 flex flex-col items-center gap-4 text-center">
          {spinning && (
            <>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-widest">Drawing…</p>
              <div className="drum-roll text-4xl font-bold text-foreground font-mono min-h-[3rem]">
                {drumName}
              </div>
            </>
          )}
          {!spinning && winner && (
            <>
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Winner!</p>
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
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Pick History</label>
            <button onClick={() => setHistory([])} className="text-xs text-foreground-muted hover:text-red-500 transition-colors">Clear</button>
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
