"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

type Phase = "work" | "short-break" | "long-break";

const DEFAULTS: Record<Phase, number> = { work: 25, "short-break": 5, "long-break": 15 };
const PHASE_COLORS: Record<Phase, string> = {
  work: "from-rose-500 to-orange-400",
  "short-break": "from-emerald-500 to-teal-400",
  "long-break": "from-blue-500 to-indigo-400",
};
const PHASE_LABELS: Record<Phase, string> = {
  work: "Focus Time",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

export function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>("work");
  const [durations, setDurations] = useState(DEFAULTS);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingDraft, setSettingDraft] = useState(DEFAULTS);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  function playBeep(freq = 880, duration = 0.3) {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    } catch { /* audio not available */ }
  }

  const advance = useCallback(() => {
    setRunning(false);
    playBeep(660, 0.5);
    if (phase === "work") {
      setCompletedPomodoros(c => {
        const next = c + 1;
        const nextPhase: Phase = next % 4 === 0 ? "long-break" : "short-break";
        setPhase(nextPhase);
        setSecondsLeft(durations[nextPhase] * 60);
        return next;
      });
    } else {
      setPhase("work");
      setSecondsLeft(durations.work * 60);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, durations]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { advance(); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, advance]);

  function switchPhase(p: Phase) {
    setPhase(p); setSecondsLeft(durations[p] * 60); setRunning(false);
  }

  function reset() { setSecondsLeft(durations[phase] * 60); setRunning(false); }

  function saveSettings() {
    setDurations(settingDraft);
    setSecondsLeft(settingDraft[phase] * 60);
    setRunning(false);
    setShowSettings(false);
  }

  function addTask() {
    if (!taskInput.trim()) return;
    setTasks(t => [...t, { id: Date.now(), text: taskInput.trim(), done: false }]);
    setTaskInput("");
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const totalSecs = durations[phase] * 60;
  const progress = totalSecs > 0 ? (totalSecs - secondsLeft) / totalSecs : 0;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1>
          <p className="text-sm text-foreground-muted">{completedPomodoros} pomodoros completed today</p>
        </div>
        <button onClick={() => { setShowSettings(s => !s); setSettingDraft(durations); }}
          className="h-10 w-10 rounded-xl border border-border bg-background text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors flex items-center justify-center text-xl">
          ⚙
        </button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-card-border bg-card overflow-hidden">
            <div className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground">Timer Settings (minutes)</h2>
              <div className="grid grid-cols-3 gap-4">
                {(["work", "short-break", "long-break"] as Phase[]).map(p => (
                  <div key={p} className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">{PHASE_LABELS[p]}</label>
                    <input type="number" className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      value={settingDraft[p]} onChange={e => setSettingDraft(d => ({ ...d, [p]: parseInt(e.target.value) || 1 }))} min="1" max="120" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={saveSettings} className="h-9 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">Save</button>
                <button onClick={() => setShowSettings(false)} className="h-9 px-4 rounded-xl border border-border bg-background text-foreground-muted text-sm hover:bg-background-subtle transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase tabs */}
      <div className="flex rounded-2xl border border-card-border bg-card overflow-hidden">
        {(["work", "short-break", "long-break"] as Phase[]).map(p => (
          <button key={p} onClick={() => switchPhase(p)} className={clsx("flex-1 py-3 text-xs font-semibold transition-all",
            phase === p ? `bg-gradient-to-r ${PHASE_COLORS[p]} text-white` : "text-foreground-muted hover:text-foreground hover:bg-background-subtle")}>
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className={`rounded-3xl bg-gradient-to-br ${PHASE_COLORS[phase]} p-8 flex flex-col items-center gap-6`}>
        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div className="text-center text-white">
            <p className="text-6xl font-black tabular-nums tracking-tight">{mins}:{secs}</p>
            <p className="text-sm opacity-80 mt-1">{PHASE_LABELS[phase]}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={reset}
            className="h-12 w-12 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center text-xl">
            ↺
          </button>
          <button onClick={() => { setRunning(r => !r); if (!running) playBeep(440, 0.1); }}
            className="h-12 px-10 rounded-2xl bg-white text-gray-800 font-black text-base hover:bg-white/90 transition-colors shadow-lg">
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={advance}
            className="h-12 w-12 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center text-xl">
            ⏭
          </button>
        </div>
      </div>

      {/* Pomodoro dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: Math.max(4, completedPomodoros + 1) }).map((_, i) => (
          <div key={i} className={clsx("w-3 h-3 rounded-full transition-colors",
            i < completedPomodoros ? "bg-rose-500" : "bg-border")} />
        ))}
      </div>

      {/* Task list */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Tasks</h2>
        <div className="flex gap-2">
          <input className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Add a task and press Enter…" />
          <button onClick={addTask} className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity">Add</button>
        </div>
        {tasks.length === 0 && <p className="text-xs text-foreground-muted text-center py-2">No tasks yet. Add tasks to stay focused.</p>}
        <div className="space-y-1.5">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 group">
              <button onClick={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                className={clsx("w-5 h-5 rounded-md border-2 shrink-0 transition-colors flex items-center justify-center text-xs",
                  task.done ? "bg-rose-500 border-rose-500 text-white" : "border-border hover:border-rose-400")}>
                {task.done && "✓"}
              </button>
              <span className={clsx("flex-1 text-sm", task.done && "line-through text-foreground-muted")}>{task.text}</span>
              <button onClick={() => setTasks(ts => ts.filter(t => t.id !== task.id))}
                className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-rose-500 transition-all text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
