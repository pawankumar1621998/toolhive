"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Winston Churchill said that the pessimist sees difficulty in every opportunity.",
  "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "Technology is best when it brings people together. The internet is becoming the town square for the global village of tomorrow.",
  "Reading is to the mind what exercise is to the body. A reader lives a thousand lives before he dies. The man who never reads lives only one.",
];

function wpm(chars: number, seconds: number) { return seconds > 0 ? Math.round((chars / 5) / (seconds / 60)) : 0; }
function accuracy(correct: number, total: number) { return total > 0 ? Math.round((correct / total) * 100) : 100; }

export function TypingTest() {
  const [textIdx, setTextIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const target = TEXTS[textIdx];

  const stopTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    if (started && !finished) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= duration) { stopTimer(); setFinished(true); return duration; }
          return prev + 1;
        });
      }, 1000);
    }
    return stopTimer;
  }, [started, finished, duration, stopTimer]);

  useEffect(() => {
    if (typed.length >= target.length && started && !finished) {
      stopTimer();
      setFinished(true);
    }
  }, [typed, target, started, finished, stopTimer]);

  function handleInput(val: string) {
    if (!started && val.length > 0) setStarted(true);
    if (finished) return;
    setTyped(val);
  }

  function reset() {
    stopTimer();
    setTyped(""); setStarted(false); setFinished(false); setElapsed(0);
    setTextIdx(Math.floor(Math.random() * TEXTS.length));
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const correctChars = typed.split("").filter((c, i) => c === target[i]).length;
  const totalTyped = typed.length;
  const currentWPM = wpm(correctChars, elapsed);
  const acc = accuracy(correctChars, totalTyped);
  const timeLeft = duration - elapsed;
  const progress = Math.min((typed.length / target.length) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Typing Speed Test</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Test your typing speed and accuracy. Results in WPM (words per minute).</p>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Duration:</span>
        {[30, 60, 120].map(d => (
          <button key={d} onClick={() => { setDuration(d); reset(); }}
            className={clsx("px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors", duration === d ? "bg-indigo-500 text-white border-indigo-500" : "border-border text-foreground-muted hover:border-indigo-400")}>
            {d}s
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "WPM", value: currentWPM, color: "text-indigo-500" },
          { label: "Accuracy", value: `${acc}%`, color: acc >= 95 ? "text-emerald-500" : acc >= 80 ? "text-yellow-500" : "text-red-500" },
          { label: "Time Left", value: `${timeLeft}s`, color: timeLeft <= 10 ? "text-red-500" : "text-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-card-border bg-card p-3 text-center">
            <div className={clsx("text-2xl font-bold", color)}>{value}</div>
            <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Text display */}
      <div className="rounded-2xl border border-card-border bg-card p-5 font-mono text-base leading-relaxed select-none">
        {target.split("").map((char, i) => {
          let className = "text-foreground-muted";
          if (i < typed.length) className = typed[i] === char ? "text-emerald-500" : "bg-red-500/20 text-red-500";
          if (i === typed.length) className += " border-l-2 border-indigo-500";
          return <span key={i} className={className}>{char}</span>;
        })}
      </div>

      {/* Input */}
      {!finished ? (
        <textarea ref={inputRef} rows={4} value={typed} onChange={e => handleInput(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono resize-none"
          placeholder="Click here and start typing..." autoFocus />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-800 p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground-muted">Test Complete!</p>
            <div className="flex justify-center gap-6">
              <div><div className="text-3xl font-bold text-indigo-500">{currentWPM}</div><div className="text-xs text-foreground-muted">WPM</div></div>
              <div><div className="text-3xl font-bold text-emerald-500">{acc}%</div><div className="text-xs text-foreground-muted">Accuracy</div></div>
              <div><div className="text-3xl font-bold text-foreground">{correctChars}</div><div className="text-xs text-foreground-muted">Correct Chars</div></div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <button onClick={reset} className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
        {finished ? "Try Again" : "Reset"}
      </button>
    </div>
  );
}
