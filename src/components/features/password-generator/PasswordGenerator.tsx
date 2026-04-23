"use client";

import { useState, useCallback } from "react";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS  = "0123456789";
const SYMS  = "!@#$%^&*()-_=+[]{}|;:,.<>?";

function generatePassword(length: number, upper: boolean, lower: boolean, nums: boolean, syms: boolean): string {
  let charset = "";
  if (upper) charset += UPPER;
  if (lower) charset += LOWER;
  if (nums)  charset += NUMS;
  if (syms)  charset += SYMS;
  if (!charset) charset = LOWER;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => charset[n % charset.length]).join("");
}

function calcEntropy(length: number, upper: boolean, lower: boolean, nums: boolean, syms: boolean): number {
  let pool = 0;
  if (upper) pool += 26;
  if (lower) pool += 26;
  if (nums)  pool += 10;
  if (syms)  pool += SYMS.length;
  if (pool === 0) pool = 26;
  return length * Math.log2(pool);
}

type Strength = { label: string; color: string; width: string };

function getStrength(entropy: number): Strength {
  if (entropy < 28) return { label: "Weak",        color: "bg-red-500",    width: "w-1/4" };
  if (entropy < 60) return { label: "Fair",        color: "bg-yellow-500", width: "w-2/4" };
  if (entropy < 90) return { label: "Strong",      color: "bg-emerald-500", width: "w-3/4" };
  return              { label: "Very Strong",  color: "bg-green-500",   width: "w-full" };
}

export function PasswordGenerator() {
  const [length,  setLength]  = useState(16);
  const [upper,   setUpper]   = useState(true);
  const [lower,   setLower]   = useState(true);
  const [nums,    setNums]    = useState(true);
  const [syms,    setSyms]    = useState(false);
  const [password, setPassword] = useState("");
  const [copied,  setCopied]  = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const pw = generatePassword(length, upper, lower, nums, syms);
    setPassword(pw);
    setCopied(false);
    setHistory(prev => [pw, ...prev].slice(0, 5));
  }, [length, upper, lower, nums, syms]);

  const copy = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [password]);

  const entropy   = calcEntropy(length, upper, lower, nums, syms);
  const strength  = getStrength(entropy);

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
        checked
          ? "border-orange-500 bg-orange-500/10 text-orange-500"
          : "border-border text-foreground-muted hover:border-orange-400"
      }`}
    >
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "border-orange-500 bg-orange-500" : "border-border"}`}>
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      </span>
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Password Generator</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Generate cryptographically secure passwords.</p>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-5">
        {/* Length slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Password Length</label>
            <span className="text-sm font-bold text-orange-500 tabular-nums">{length}</span>
          </div>
          <input
            type="range" min={8} max={64} value={length}
            onChange={e => setLength(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-foreground-muted mt-1">
            <span>8</span><span>64</span>
          </div>
        </div>

        {/* Character toggles */}
        <div>
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block mb-2">Character Types</label>
          <div className="flex flex-wrap gap-2">
            <Toggle label="Uppercase (A–Z)" checked={upper} onChange={() => setUpper(v => !v)} />
            <Toggle label="Lowercase (a–z)" checked={lower} onChange={() => setLower(v => !v)} />
            <Toggle label="Numbers (0–9)"   checked={nums}  onChange={() => setNums(v => !v)}  />
            <Toggle label="Symbols (!@#…)"  checked={syms}  onChange={() => setSyms(v => !v)}  />
          </div>
        </div>

        {/* Strength meter */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Strength</label>
            <span className={`text-xs font-semibold ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
          </div>
          <p className="text-xs text-foreground-muted mt-1">~{Math.round(entropy)} bits of entropy</p>
        </div>

        <button
          onClick={generate}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Generate Password
        </button>
      </div>

      {/* Result */}
      {password && (
        <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Generated Password</label>
          <div className="flex gap-2">
            <div className="flex-1 font-mono text-sm bg-background border border-border rounded-xl px-4 py-3 text-foreground break-all select-all">
              {password}
            </div>
            <button
              onClick={copy}
              className={`shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:opacity-90"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={generate}
            className="text-xs text-orange-500 hover:underline"
          >
            Generate New
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Recent Passwords</label>
          <ul className="space-y-2">
            {history.map((pw, i) => (
              <li key={i} className="flex items-center justify-between gap-2 group">
                <span className="font-mono text-xs text-foreground-muted break-all flex-1">{pw}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(pw); }}
                  className="shrink-0 text-xs text-foreground-muted hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
