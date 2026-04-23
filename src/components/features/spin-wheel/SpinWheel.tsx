"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const COLORS = ["#6366f1","#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#3b82f6","#64748b","#e11d48","#0ea5e9"];

const DEFAULT_ITEMS = ["Option 1","Option 2","Option 3","Option 4","Option 5","Option 6"];

export function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [newItem, setNewItem] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    const sliceAngle = (2 * Math.PI) / items.length;
    ctx.clearRect(0, 0, size, size);

    items.forEach((item, i) => {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, Math.min(16, 180 / items.length))}px sans-serif`;
      const label = item.length > 12 ? item.slice(0, 12) + "…" : item;
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

  useEffect(() => { drawWheel(angleRef.current); }, [items]);

  function spin() {
    if (spinning || items.length === 0) return;
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
        const sliceAngle = (2 * Math.PI) / items.length;
        const normalizedAngle = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = 0;
        const idx = Math.floor(((2 * Math.PI - ((normalizedAngle - pointerAngle + 2 * Math.PI) % (2 * Math.PI))) / sliceAngle)) % items.length;
        setResult(items[(idx + items.length) % items.length]);
      }
    }
    requestAnimationFrame(animate);
  }

  function addItem() {
    const t = newItem.trim();
    if (!t || items.includes(t)) return;
    setItems(prev => [...prev, t]);
    setNewItem("");
  }

  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Spin the Wheel</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Random decision maker — add options and spin!</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Wheel */}
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvasRef} width={360} height={360} className="w-full max-w-[360px] rounded-full shadow-xl" />
          <button onClick={spin} disabled={spinning || items.length < 2}
            className={clsx("h-12 px-8 rounded-xl font-bold text-sm transition-all", spinning ? "bg-gray-400 text-white cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg hover:shadow-indigo-300")}>
            {spinning ? "Spinning…" : "🎲 Spin!"}
          </button>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl px-6 py-4 shadow-lg">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Result</p>
              <p className="text-xl font-bold">{result}</p>
            </motion.div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add an option…"
              onKeyDown={e => e.key === "Enter" && addItem()} />
            <button onClick={addItem} className="h-11 px-4 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:opacity-90">Add</button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-2.5">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-sm text-foreground">{item}</span>
                <button onClick={() => removeItem(i)} className="text-foreground-muted hover:text-foreground text-xs">✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => setItems(DEFAULT_ITEMS)} className="text-xs text-foreground-muted hover:text-foreground underline">Reset to defaults</button>
        </div>
      </div>
    </div>
  );
}
