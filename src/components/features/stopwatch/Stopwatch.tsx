"use client";

import { useState, useRef, useCallback } from "react";

interface Lap {
  lapNum: number;
  lapTime: number;   // ms for this lap segment
  splitTime: number; // ms from start to this lap
}

function formatTime(ms: number, showMs = true): string {
  const h   = Math.floor(ms / 3_600_000);
  const m   = Math.floor((ms % 3_600_000) / 60_000);
  const s   = Math.floor((ms % 60_000) / 1_000);
  const msp = Math.floor((ms % 1_000) / 10);
  const hh  = String(h).padStart(2, "0");
  const mm  = String(m).padStart(2, "0");
  const ss  = String(s).padStart(2, "0");
  const ms2 = String(msp).padStart(2, "0");
  return showMs ? `${hh}:${mm}:${ss}.${ms2}` : `${hh}:${mm}:${ss}`;
}

export function Stopwatch() {
  const [display,  setDisplay]  = useState(0);   // ms shown in UI
  const [running,  setRunning]  = useState(false);
  const [laps,     setLaps]     = useState<Lap[]>([]);

  // All timing kept in refs to avoid stale closures
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef     = useRef(0);   // timestamp when last started
  const accRef       = useRef(0);   // accumulated ms before last start
  const lapStartRef  = useRef(0);   // accumulated ms at last lap start

  const getElapsed = () => accRef.current + (running ? Date.now() - startRef.current : 0);

  const start = useCallback(() => {
    if (running) return;
    startRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      const elapsed = accRef.current + (Date.now() - startRef.current);
      setDisplay(elapsed);
    }, 16);
  }, [running]);

  const pause = useCallback(() => {
    if (!running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    accRef.current += Date.now() - startRef.current;
    setRunning(false);
  }, [running]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accRef.current    = 0;
    lapStartRef.current = 0;
    setDisplay(0);
    setRunning(false);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    if (!running) return;
    const total   = accRef.current + (Date.now() - startRef.current);
    const lapTime = total - lapStartRef.current;
    lapStartRef.current = total;
    setLaps(prev => [...prev, { lapNum: prev.length + 1, lapTime, splitTime: total }]);
  }, [running]);

  const bestLap  = laps.length > 1 ? Math.min(...laps.map(l => l.lapTime)) : null;
  const worstLap = laps.length > 1 ? Math.max(...laps.map(l => l.lapTime)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stopwatch</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Track time with lap splits and millisecond precision.</p>
      </div>

      {/* Digital display */}
      <div className="rounded-2xl border border-card-border bg-card p-8 flex flex-col items-center gap-6">
        <div className="text-6xl sm:text-7xl font-mono font-bold text-foreground tabular-nums tracking-tight">
          {formatTime(display)}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          {!running ? (
            <button
              onClick={start}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {display === 0 ? "Start" : "Resume"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Pause
            </button>
          )}

          <button
            onClick={lap}
            disabled={!running}
            className="px-8 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:border-orange-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Lap
          </button>

          <button
            onClick={reset}
            disabled={running}
            className="px-8 py-3 rounded-xl border border-border text-foreground-muted font-semibold text-sm hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Lap times */}
      {laps.length > 0 && (
        <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Lap Times</label>
            <span className="text-xs text-foreground-muted">{laps.length} lap{laps.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="overflow-auto max-h-72">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-xs text-foreground-muted font-semibold">Lap</th>
                  <th className="text-left py-2 pr-4 text-xs text-foreground-muted font-semibold">Lap Time</th>
                  <th className="text-left py-2 text-xs text-foreground-muted font-semibold">Split</th>
                </tr>
              </thead>
              <tbody>
                {[...laps].reverse().map(l => {
                  const isBest  = bestLap  !== null && l.lapTime === bestLap;
                  const isWorst = worstLap !== null && l.lapTime === worstLap;
                  return (
                    <tr key={l.lapNum} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-mono text-foreground-muted">#{l.lapNum}</td>
                      <td className={`py-2 pr-4 font-mono font-semibold tabular-nums ${isBest ? "text-emerald-500" : isWorst ? "text-red-500" : "text-foreground"}`}>
                        {formatTime(l.lapTime)}
                        {isBest  && <span className="ml-1.5 text-xs bg-emerald-500/10 text-emerald-500 rounded px-1">Best</span>}
                        {isWorst && <span className="ml-1.5 text-xs bg-red-500/10 text-red-500 rounded px-1">Slow</span>}
                      </td>
                      <td className="py-2 font-mono text-foreground-muted tabular-nums">{formatTime(l.splitTime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
