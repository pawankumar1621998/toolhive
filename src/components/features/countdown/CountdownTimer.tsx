"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface Countdown {
  id: string;
  label: string;
  targetDate: string;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  };
}

function CountdownCard({ item, onRemove }: { item: Countdown; onRemove: () => void }) {
  const [time, setTime] = useState(() => getTimeLeft(item.targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(item.targetDate)), 1000);
    return () => clearInterval(id);
  }, [item.targetDate]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-card-border bg-card p-5 relative">
      <button onClick={onRemove} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background-subtle text-foreground-muted hover:text-foreground text-sm flex items-center justify-center">✕</button>
      <p className="text-sm font-semibold text-foreground mb-1 pr-8">{item.label}</p>
      <p className="text-xs text-foreground-muted mb-4">{new Date(item.targetDate).toLocaleString()}</p>
      {time.done ? (
        <div className="text-center py-2 text-emerald-500 font-bold text-lg">🎉 Time&apos;s up!</div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[{ label: "Days", val: time.days }, { label: "Hours", val: time.hours }, { label: "Mins", val: time.minutes }, { label: "Secs", val: time.seconds }].map(({ label, val }) => (
            <div key={label} className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30 p-2">
              <div className="text-2xl font-bold text-foreground font-mono">{pad(val)}</div>
              <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const PRESETS = [
  { label: "New Year 2027", days: 0, date: "2027-01-01T00:00:00" },
  { label: "Christmas 2026", days: 0, date: "2026-12-25T00:00:00" },
];

export function CountdownTimer() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [label, setLabel] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const nextId = useRef(1);

  function add() {
    if (!targetDate) return;
    const l = label.trim() || "Countdown";
    setCountdowns(prev => [...prev, { id: String(nextId.current++), label: l, targetDate }]);
    setLabel(""); setTargetDate("");
  }

  function addPreset(p: { label: string; date: string }) {
    setCountdowns(prev => [...prev, { id: String(nextId.current++), label: p.label, targetDate: p.date }]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Countdown Timer</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Add countdowns to events, deadlines, or special occasions.</p>
      </div>

      {/* Add form */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-1.5">Event Name</label>
            <input className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. My Birthday, Product Launch" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-1.5">Target Date & Time</label>
            <input type="datetime-local" className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        </div>
        <button onClick={add} disabled={!targetDate}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          Add Countdown
        </button>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => addPreset(p)} className="px-3 py-1.5 rounded-xl border border-border text-xs text-foreground-muted hover:border-indigo-400 hover:text-foreground transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Countdown cards */}
      <AnimatePresence>
        {countdowns.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-foreground-muted text-sm">
            No countdowns yet. Add one above to get started.
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {countdowns.map(item => (
            <CountdownCard key={item.id} item={item} onRemove={() => setCountdowns(prev => prev.filter(c => c.id !== item.id))} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
