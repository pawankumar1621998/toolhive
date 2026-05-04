"use client";

import { useState } from "react";
import type { Tool } from "@/types";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import {
  Hash, User, Shuffle, Fingerprint, ScanBarcode, Scan, MapPin, Palette, Link,
  Paintbrush, KeyRound, Braces, BookOpen, Sword, Gamepad2, Sun, Laugh, HelpCircle,
  Dumbbell, Target, Copy, RefreshCw, Check, Info, Lock, Eye, EyeOff, Globe, Flag,
  Wand2, Heart, Flame, Sparkles, Zap, Dice1, SwordIcon, Crown, Shield
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn = "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn = "h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-background-subtle transition-colors disabled:opacity-50";
const resultCard = "rounded-xl border border-card-border bg-background-subtle p-4 font-mono text-sm";
// ─────────────────────────────────────────────────────────────────────────────

// ─── Password Generator ──────────────────────────────────────────────────────
function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function generate() {
    let chars = "";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) return;
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(pwd);
  }

  function copy() {
    navigator.clipboard.writeText(password);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Lowercase", checked: includeLower, set: setIncludeLower },
          { label: "Uppercase", checked: includeUpper, set: setIncludeUpper },
          { label: "Numbers", checked: includeNumbers, set: setIncludeNumbers },
          { label: "Symbols", checked: includeSymbols, set: setIncludeSymbols },
        ].map(({ label, checked, set: s }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => s(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-500" />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Length: <span className="text-orange-500 font-bold">{length}</span></label>
        <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-orange-500" />
      </div>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <RefreshCw className="h-4 w-4" /> Generate Password
      </button>
      {password && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="relative">
            <div className={clsx(resultCard, "break-all pr-12")}>{show ? password : "•".repeat(password.length)}</div>
            <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button onClick={copy} className={secondaryBtn + " flex items-center gap-2"}>
            <Copy className="h-4 w-4" /> Copy to Clipboard
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Username Generator ───────────────────────────────────────────────────────
const USERNAME_STYLES = ["cool", "aesthetic", "funny", "gaming", "professional", "cute"];

function UsernameGeneratorTool() {
  const [style, setStyle] = useState("cool");
  const [prefix, setPrefix] = useState("");
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<string[]>([]);

  const prefixes = { cool: ["Shadow", "Dark", "Neo", "Cyber", "Storm", "Blaze", "Frost", "Thunder", "Phoenix", "Vortex"], aesthetic: ["Moon", "Dream", "Star", "Cloud", "Willow", "Coral", "Sage", "Violet", "Ember", "Iris"], funny: ["Super", "Mega", "Ultra", "Epic", "Turbo", "Hyper", "Omega", "Alpha", "Pro", "Elite"], gaming: ["xX", "Xx", "__", "Pro", "Noob", "GG", "LR", "MLG", "YT", "TTV"], professional: ["Mr", "Dr", "The", "Real", "Official", "Master", "Expert", "Chief", "Head", "Lead"], cute: ["Sweet", "Cutie", "Bambi", "Pluff", "Snug", "Mochi", "Peach", "Coco", "Nori", "Miki"] };
  const suffixes = ["_99", "_2000", "_x", "_pro", "_hd", "_yt", "_yt", "_ed", "_ing", "_er", "_ist", "_er", "_ive", "_tion", "_ness", ""];
  const chars = "0123456789";

  function generate() {
    const p = prefixes[style as keyof typeof prefixes] || prefixes.cool;
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const base = (prefix ? prefix + "_" : "") + p[Math.floor(Math.random() * p.length)];
      const num = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
      const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
      out.push(base + num + suf);
    }
    setResults([...new Set(out)]);
  }

  function copyAll() { navigator.clipboard.writeText(results.join("\n")); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {USERNAME_STYLES.map((s) => (
          <button key={s} onClick={() => setStyle(s)} className={clsx("px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all",
            style === s ? "bg-orange-500 text-white" : "border border-border text-foreground-muted hover:bg-background-subtle")}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <input className={inputClass} placeholder="Optional prefix (e.g. your name)" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-20 border border-border rounded-xl px-3 py-3 text-sm bg-background" />
      </div>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <Shuffle className="h-4 w-4" /> Generate Usernames
      </button>
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={resultCard + " space-y-1.5"}>
            {results.map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>{u}</span>
                <button onClick={() => navigator.clipboard.writeText(u)} className="text-foreground-muted hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={copyAll} className={clsx(secondaryBtn, "mt-3 flex items-center gap-2")}>
            <Copy className="h-4 w-4" /> Copy All
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Random Number Generator ─────────────────────────────────────────────────
function RandomNumberTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);

  function generate() {
    const nums: number[] = [];
    for (let i = 0; i < count; i++) {
      nums.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    setResults(nums);
    setHistory((h) => [[...nums], ...h].slice(0, 10));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-muted">Min</label>
          <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-muted">Max</label>
          <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-muted">Count</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} className={inputClass} />
        </div>
      </div>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <Shuffle className="h-4 w-4" /> Generate
      </button>
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {results.map((n, i) => (
              <div key={i} className={clsx(cardClass, "text-center font-bold text-lg text-orange-500")}>{n}</div>
            ))}
          </div>
          {history.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground-muted">History</p>
              {history.slice(1).map((h, i) => (
                <div key={i} className="text-xs text-foreground-muted font-mono">{h.join(", ")}</div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── UUID Generator ───────────────────────────────────────────────────────────
function UUIDGeneratorTool() {
  const [version, setVersion] = useState("v4");
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [uppercase, setUppercase] = useState(false);

  function generate() {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      if (version === "v4") {
        let u = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        u = u.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        out.push(uppercase ? u.toUpperCase() : u);
      } else if (version === "v1") {
        const now = Date.now();
        const uuid = [((now / 0x10000) & 0xffff).toString(16).padStart(4, "0"), ((now / 0x100) & 0xffff).toString(16).padStart(4, "0"),
        "4" + Math.random().toString(16).slice(2, 6), ((Math.random() * 0xffff) & 0x3fff | 0x8000).toString(16).padStart(4, "0"),
        (Math.random() * 0xffff).toString(16).padStart(4, "0") + (Math.random() * 0xffff).toString(16).padStart(4, "0")].join("-");
        out.push(uppercase ? uuid.toUpperCase() : uuid);
      }
    }
    setResults(out);
  }

  function copyAll() { navigator.clipboard.writeText(results.join("\n")); }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {["v1", "v4"].map((v) => (
          <button key={v} onClick={() => setVersion(v)} className={clsx("px-4 py-2 rounded-lg text-sm font-medium",
            version === v ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>
            UUID {v.toUpperCase()}
          </button>
        ))}
        <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-20 border border-border rounded-xl px-3 py-2 text-sm bg-background" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
        <span className="text-sm">UPPERCASE</span>
      </label>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <Fingerprint className="h-4 w-4" /> Generate
      </button>
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={resultCard + " space-y-1.5"}>
            {results.map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>{u}</span>
                <button onClick={() => navigator.clipboard.writeText(u)} className="text-foreground-muted hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={copyAll} className={clsx(secondaryBtn, "mt-3 flex items-center gap-2")}>
            <Copy className="h-4 w-4" /> Copy All
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Barcode Generator ────────────────────────────────────────────────────────
function BarcodeTool() {
  const [data, setData] = useState("");
  const [type, setType] = useState("CODE128");
  const [result, setResult] = useState("");

  function generate() {
    if (!data.trim()) return;
    // Generate a simple barcode-like visual using barcode API
    setResult(`https://bwipjs-api.metafloor.com/?bgcolor=ffffff&textcolor=black&scale=3&modulewidth=0.33&format=${type.toLowerCase()}&text=${encodeURIComponent(data)}&paddingwidth=10&paddingheight=10`);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {["CODE128", "EAN13", "UPC", "QR"].map((t) => (
          <button key={t} onClick={() => setType(t)} className={clsx("px-4 py-2 rounded-lg text-sm font-medium",
            type === t ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>
            {t}
          </button>
        ))}
      </div>
      <input className={inputClass} placeholder="Enter data (e.g. 1234567890123)" value={data} onChange={(e) => setData(e.target.value)} />
      <button onClick={generate} disabled={!data.trim()} className={primaryBtn + " flex items-center gap-2"}>
        <ScanBarcode className="h-4 w-4" /> Generate Barcode
      </button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className={clsx(cardClass, "flex justify-center")}>
            <img src={result} alt="Barcode" className="max-w-full" />
          </div>
          <button onClick={() => window.open(result, "_blank")} className={secondaryBtn + " flex items-center gap-2"}>
            <Eye className="h-4 w-4" /> Open Full Size
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── QR Code Generator ────────────────────────────────────────────────────────
function QRCodeTool() {
  const [data, setData] = useState("");
  const [result, setResult] = useState("");

  function generate() {
    if (!data.trim()) return;
    setResult(`https://bwipjs-api.metafloor.com/?bgcolor=ffffff&textcolor=black&scale=3&format=png&text=${encodeURIComponent(data)}`);
  }

  return (
    <div className="space-y-5">
      <textarea className={inputClass} rows={3} placeholder="Enter URL, text, or data..." value={data} onChange={(e) => setData(e.target.value)} />
      <button onClick={generate} disabled={!data.trim()} className={primaryBtn + " flex items-center gap-2"}>
        <Scan className="h-4 w-4" /> Generate QR Code
      </button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className={clsx(cardClass, "flex justify-center")}>
            <img src={result} alt="QR Code" className="max-w-xs" />
          </div>
          <button onClick={() => window.open(result, "_blank")} className={secondaryBtn + " flex items-center gap-2"}>
            <Eye className="h-4 w-4" /> Open Full Size
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Fake Address Generator ───────────────────────────────────────────────────
function FakeAddressTool() {
  const [country, setCountry] = useState("US");
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);

  const STREETS = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Washington Blvd", "Park Ave", "Lake Dr", "River Rd"];
  const FIRST = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Emma", "Liam", "Olivia", "Aarav", "Zara", "Raj", "Priya", "Yuki"];
  const LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Singh", "Chen", "Tanaka", "Müller", "Kim", "Patel", "Ali"];

  const CITY_DATA: Record<string, { cities: string[]; states: string[]; zips: string }> = {
    US: { cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin"], states: ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "TX"], zips: "#####" },
    UK: { cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Bristol"], states: ["England", "England", "England", "England", "Scotland", "England", "England", "England", "Scotland", "England"], zips: "SW1A 1AA" },
    IN: { cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"], states: ["MH", "DL", "KA", "TS", "TN", "WB", "MH", "GJ", "RJ", "UP"], zips: "######" },
    CA: { cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"], states: ["ON", "QC", "BC", "AB", "AB", "ON", "MB", "QC", "ON", "ON"], zips: "A1A 1A1" },
    AU: { cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Gold Coast", "Newcastle", "Wollongong", "Logan City"], states: ["NSW", "VIC", "QLD", "WA", "SA", "ACT", "QLD", "NSW", "NSW", "QLD"], zips: "####" },
  };

  function generate() {
    const out: string[] = [];
    const d = CITY_DATA[country] || CITY_DATA.US;
    for (let i = 0; i < count; i++) {
      const num = Math.floor(Math.random() * 9999) + 1;
      const street = STREETS[Math.floor(Math.random() * STREETS.length)];
      const first = FIRST[Math.floor(Math.random() * FIRST.length)];
      const last = LAST[Math.floor(Math.random() * LAST.length)];
      const city = d.cities[Math.floor(Math.random() * d.cities.length)];
      const state = d.states[Math.floor(Math.random() * d.states.length)];
      const zip = d.zips.replace(/#/g, () => Math.floor(Math.random() * 10).toString());
      out.push(`${num} ${street}\n${first} ${last}\n${city}, ${state} ${zip}\n${country}`);
    }
    setResults(out);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass + " flex-1"}>
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="IN">India</option>
          <option value="CA">Canada</option>
          <option value="AU">Australia</option>
        </select>
        <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-20 border border-border rounded-xl px-3 py-3 text-sm bg-background" />
      </div>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <MapPin className="h-4 w-4" /> Generate Address
      </button>
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {results.map((addr, i) => (
            <div key={i} className={clsx(cardClass, "whitespace-pre-line text-sm")}>{addr}</div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Random Color Generator ────────────────────────────────────────────────────
function RandomColorTool() {
  const [colors, setColors] = useState<Array<{ hex: string; rgb: string; hsl: string; name: string }>>([]);

  function generate(count: number) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      const hsl = `hsl(${(Math.round((g / 255) * 360))}, ${Math.round(((g / 255) * 100))}%, ${Math.round(((b / 255) * 100))}%)`;
      out.push({ hex: hex.toUpperCase(), rgb: `rgb(${r}, ${g}, ${b})`, hsl, name: "" });
    }
    setColors(out);
  }

  function copy(val: string) { navigator.clipboard.writeText(val); }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[3, 5, 8, 10].map((n) => (
          <button key={n} onClick={() => generate(n)} className={primaryBtn}>{n} Colors</button>
        ))}
      </div>
      {colors.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colors.map((c, i) => (
              <div key={i} className={clsx(cardClass, "space-y-2")}>
                <div className="h-20 rounded-lg" style={{ backgroundColor: c.hex }} />
                <div className="space-y-0.5">
                  {[["HEX", c.hex], ["RGB", c.rgb]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-foreground-muted">{label}</span>
                      <button onClick={() => copy(val!)} className="text-xs font-mono text-orange-500 hover:underline">{val}</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Slug Generator ───────────────────────────────────────────────────────────
function SlugGeneratorTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  function toSlug(str: string) {
    return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().replace(/^-|-$/g, "");
  }

  function generate() { setResult(toSlug(text)); }

  return (
    <div className="space-y-5">
      <input className={inputClass} placeholder="Enter text to convert to slug..." value={text} onChange={(e) => { setText(e.target.value); setResult(toSlug(e.target.value)); }} />
      <div className="flex gap-3">
        <button onClick={generate} disabled={!text.trim()} className={primaryBtn + " flex items-center gap-2"}>
          <Link className="h-4 w-4" /> Generate Slug
        </button>
        <button onClick={() => { setText(""); setResult(""); }} className={secondaryBtn}>Clear</button>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={resultCard + " flex items-center justify-between"}>
            <span className="text-foreground">{result}</span>
            <button onClick={() => navigator.clipboard.writeText(result)} className="text-foreground-muted hover:text-foreground"><Copy className="h-4 w-4" /></button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Random Name Generator ────────────────────────────────────────────────────
function RandomNameTool() {
  const [culture, setCulture] = useState("any");
  const [gender, setGender] = useState("any");
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<string[]>([]);

  const names: Record<string, { first: string[]; last: string[] }> = {
    indian: { first: ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Kavya", "Ananya", "Diya", "Priya", "Riya", "Ishita", "Rohan", "Kabir", "Ishaan"], last: ["Sharma", "Patel", "Singh", "Gupta", "Kumar", "Verma", "Reddy", "Nair", "Iyer", "Joshi", "Mehta", "Shah"] },
    arabic: { first: ["Ahmed", "Omar", "Ali", "Yusuf", "Hassan", "Ibrahim", "Fatima", "Aisha", "Mariam", "Layla", "Sara", "Noor", "Zainab", "Amir", "Khalid"], last: ["Khan", "Ali", "Hassan", "Ibrahim", "Malik", "Saad", "Farooq", "Nasser", "Karim", "Rahman"] },
    japanese: { first: ["Haruto", "Yuto", "Sota", "Hayato", "Ren", "Yuki", "Hana", "Sakura", "Mei", "Aoi", "Hinata", "Yui", "Natsuki", "Haruka", "Kaito"], last: ["Tanaka", "Yamamoto", "Watanabe", "Suzuki", "Takahashi", "Kobayashi", "Nakamura"] },
    african: { first: ["Kofi", "Kwame", "Amani", "Jabari", "Zuri", "Nia", "Kamau", "Tendai", "Amara", "Oluwaseun", "Chidi", "Adaeze", "Tariq", "Imani", "Makena"], last: ["Asante", "Okonkwo", "Mwangi", "Diallo", "Osei", "Toure", "Adeyemi", "Nkosi"] },
    european: { first: ["Liam", "Noah", "Oliver", "Lucas", "Hugo", "Arthur", "Charlotte", "Emma", "Mia", "Lena", "Sofia", "Marie", "Anna", "Camille", "Louise"], last: ["Müller", "Schmidt", "Dubois", "Bernard", "Rossi", "Russo", "Johansson", "Andersen", "Fischer", "Becker"] },
    chinese: { first: ["Wei", "Jun", "Ming", "Lei", "Bo", "Xiao", "Lin", "Mei", "Yan", "Hui", "Jia", "Qing", "Feng", "Chun", "Hao"], last: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou"] },
  };

  function generate() {
    const allCultures = culture === "any" ? Object.keys(names) : [culture];
    const allGenders = gender === "any" ? ["male", "female", "neutral"] : [gender];
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const c = allCultures[Math.floor(Math.random() * allCultures.length)];
      const n = names[c];
      const fn = n.first[Math.floor(Math.random() * n.first.length)];
      const ln = n.last[Math.floor(Math.random() * n.last.length)];
      out.push(`${fn} ${ln}`);
    }
    setResults([...new Set(out)]);
  }

  function copyAll() { navigator.clipboard.writeText(results.join("\n")); }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <select value={culture} onChange={(e) => setCulture(e.target.value)} className={inputClass + " flex-1"}>
          <option value="any">Any Culture</option>
          {Object.keys(names).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass + " w-32"}>
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-20 border border-border rounded-xl px-3 py-3 text-sm bg-background" />
      </div>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <User className="h-4 w-4" /> Generate Names
      </button>
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={resultCard + " space-y-1.5"}>
            {results.map((n, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>{n}</span>
                <button onClick={() => navigator.clipboard.writeText(n)} className="text-foreground-muted hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={copyAll} className={clsx(secondaryBtn, "mt-3 flex items-center gap-2")}>
            <Copy className="h-4 w-4" /> Copy All
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Hex Gradient Generator ───────────────────────────────────────────────────
function HexGradientTool() {
  const [color1, setColor1] = useState("#FF6B6B");
  const [color2, setColor2] = useState("#4ECDC4");
  const [angle, setAngle] = useState(135);
  const [css, setCss] = useState("");

  function generate() {
    const code = `background: linear-gradient(${angle}deg, ${color1}, ${color2});`;
    setCss(code);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-muted">Color 1</label>
          <div className="flex gap-2">
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-12 h-11 rounded-lg cursor-pointer" />
            <input className={inputClass + " flex-1"} value={color1} onChange={(e) => setColor1(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-muted">Color 2</label>
          <div className="flex gap-2">
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-12 h-11 rounded-lg cursor-pointer" />
            <input className={inputClass + " flex-1"} value={color2} onChange={(e) => setColor2(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Angle: <span className="text-orange-500">{angle}°</span></label>
        <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-orange-500" />
      </div>
      <div className={clsx(cardClass, "h-24 rounded-xl w-full")} style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }} />
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <Paintbrush className="h-4 w-4" /> Generate CSS
      </button>
      {css && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={resultCard + " flex items-center justify-between"}>
            <span>{css}</span>
            <button onClick={() => navigator.clipboard.writeText(css)} className="text-foreground-muted hover:text-foreground"><Copy className="h-4 w-4" /></button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── API Key Generator ────────────────────────────────────────────────────────
function APIKeyTool() {
  const [format, setFormat] = useState("hex");
  const [length, setLength] = useState(32);
  const [prefix, setPrefix] = useState("");
  const [result, setResult] = useState("");

  function generate() {
    const chars = format === "hex" ? "0123456789abcdef" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < length; i++) key += chars[Math.floor(Math.random() * chars.length)];
    setResult((prefix ? prefix + "_" : "") + key);
  }

  function copy() { navigator.clipboard.writeText(result); }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[["hex", "Hexadecimal"], ["alphanum", "Alphanumeric"]].map(([v, l]) => (
          <button key={v} onClick={() => setFormat(v)} className={clsx("px-4 py-2 rounded-lg text-sm", format === v ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{l}</button>
        ))}
        <input className={inputClass + " w-24"} placeholder="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Length: <span className="text-orange-500">{length}</span></label>
        <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-orange-500" />
      </div>
      <button onClick={generate} className={primaryBtn + " flex items-center gap-2"}>
        <KeyRound className="h-4 w-4" /> Generate API Key
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={resultCard + " break-all"}>{result}</div>
          <button onClick={copy} className={clsx(secondaryBtn, "mt-3 flex items-center gap-2")}><Copy className="h-4 w-4" /> Copy</button>
        </motion.div>
      )}
    </div>
  );
}

// ─── 8. Story Ideas Generator ──────────────────────────────────────────────────
function StoryIdeasTool() {
  const [genre, setGenre] = useState("any");
  const { output, loading, error, generate, clear } = useAIGenerate("story-ideas");

  async function handleGenerate() {
    await generate({ genre });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {["any", "scifi", "romance", "thriller", "fantasy"].map((g) => (
          <button key={g} onClick={() => setGenre(g)} className={clsx("px-3 py-1.5 rounded-lg text-sm capitalize", genre === g ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{g}</button>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <BookOpen className="h-4 w-4" /> {loading ? "Generating..." : "Generate Story Idea"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={clsx(cardClass, "text-sm leading-relaxed")}>{output}</motion.div>
      )}
    </div>
  );
}

// ─── Fantasy Name Generator ───────────────────────────────────────────────────
// ─── 9. Fantasy Name Generator ─────────────────────────────────────────────────
function FantasyNameTool() {
  const [race, setRace] = useState("elf");
  const [type, setType] = useState("character");
  const { output, loading, error, generate, clear } = useAIGenerate("fantasy-name");

  async function handleGenerate() {
    await generate({ race, type });
  }

  const copyResult = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {["elf", "dwarf", "orc", "dragon", "wizard", "fairy"].map((r) => (
          <button key={r} onClick={() => setRace(r)} className={clsx("px-3 py-1.5 rounded-lg text-sm capitalize", race === r ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{r}</button>
        ))}
      </div>
      <div className="flex gap-2">
        {[["character", "Character"], ["place", "Place"], ["weapon", "Weapon"]].map(([v, l]) => (
          <button key={v} onClick={() => setType(v)} className={clsx("px-4 py-2 rounded-lg text-sm", type === v ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{l}</button>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <Sword className="h-4 w-4" /> {loading ? "Generating..." : "Generate Name"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={clsx(resultCard, "text-center text-lg font-bold text-orange-500")}>{output}</div>
          <button onClick={copyResult} className={clsx(secondaryBtn, "mt-3 w-full flex items-center justify-center gap-2")}><Copy className="h-4 w-4" /> Copy</button>
        </motion.div>
      )}
    </div>
  );
}

// ─── 10. RPG Character Generator ──────────────────────────────────────────────
function RPGCharacterTool() {
  const { output, loading, error, generate, clear } = useAIGenerate("rpg-character");

  async function handleGenerate() {
    await generate({});
  }

  return (
    <div className="space-y-5">
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <Gamepad2 className="h-4 w-4" /> {loading ? "Generating..." : "Generate Character"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className={clsx(cardClass, "whitespace-pre-wrap text-sm leading-relaxed")}>{output}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Daily Affirmation Generator ─────────────────────────────────────────────
// ─── 11. Daily Affirmation Generator ─────────────────────────────────────────
function DailyAffirmationTool() {
  const [category, setCategory] = useState("confidence");
  const { output, loading, error, generate, clear } = useAIGenerate("daily-affirmation");

  async function handleGenerate() {
    await generate({ category });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {["confidence", "success", "health", "happiness"].map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={clsx("px-3 py-1.5 rounded-lg text-sm capitalize", category === c ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{c}</button>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <Sun className="h-4 w-4" /> {loading ? "Generating..." : "Get Affirmation"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={clsx(cardClass, "text-center text-lg font-medium leading-relaxed")}>{output}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── 12. Joke Generator ────────────────────────────────────────────────────────
function JokeGeneratorTool() {
  const [category, setCategory] = useState("all");
  const { output, loading, error, generate, clear } = useAIGenerate("joke-generator");

  async function handleGenerate() {
    await generate({ category });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {["all", "programming", "dad"].map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={clsx("px-4 py-2 rounded-lg text-sm capitalize", category === c ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{c}</button>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <Laugh className="h-4 w-4" /> {loading ? "Generating..." : "Tell Me a Joke"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={clsx(cardClass, "whitespace-pre-wrap text-sm leading-relaxed")}>{output}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── 13. Trivia Generator ───────────────────────────────────────────────────────
function TriviaGeneratorTool() {
  const { output, loading, error, generate, clear } = useAIGenerate("trivia-generator");

  async function handleGenerate() {
    await generate({});
  }

  return (
    <div className="space-y-5">
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <HelpCircle className="h-4 w-4" /> {loading ? "Generating..." : "Get Trivia Question"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={clsx(cardClass, "whitespace-pre-wrap text-base")}>{output}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── 14. HIIT Workout Generator ───────────────────────────────────────────────
function WorkoutGeneratorTool() {
  const [level, setLevel] = useState("intermediate");
  const [duration, setDuration] = useState(20);
  const { output, loading, error, generate, clear } = useAIGenerate("workout-generator");

  async function handleGenerate() {
    await generate({ level, duration });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {["beginner", "intermediate", "advanced"].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={clsx("px-4 py-2 rounded-lg text-sm capitalize", level === l ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{l}</button>
        ))}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Duration: <span className="text-orange-500">{duration} min</span></label>
        <input type="range" min={5} max={45} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-orange-500" />
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <Dumbbell className="h-4 w-4" /> {loading ? "Generating..." : "Generate Workout"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={clsx(cardClass, "whitespace-pre-wrap text-sm")}>{output}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── 15. Daily Challenge Generator ────────────────────────────────────────────
function DailyChallengeTool() {
  const [category, setCategory] = useState("all");
  const { output, loading, error, generate, clear } = useAIGenerate("daily-challenge");

  async function handleGenerate() {
    await generate({ category });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {["all", "creative", "fitness", "productivity"].map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={clsx("px-3 py-1.5 rounded-lg text-sm capitalize", category === c ? "bg-orange-500 text-white" : "border border-border text-foreground-muted")}>{c}</button>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading} className={primaryBtn + " flex items-center gap-2"}>
        <Target className="h-4 w-4" /> {loading ? "Generating..." : "Get Challenge"}
      </button>
      {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <div className={clsx(cardClass, "text-center text-base font-medium")}>{output}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GeneratorWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "password-generator": return <PasswordGeneratorTool />;
    case "username-generator": return <UsernameGeneratorTool />;
    case "random-num-gen": return <RandomNumberTool />;
    case "uuid-generator": return <UUIDGeneratorTool />;
    case "barcode-generator": return <BarcodeTool />;
    case "qr-code-generator": return <QRCodeTool />;
    case "fake-address": return <FakeAddressTool />;
    case "random-color": return <RandomColorTool />;
    case "slug-generator": return <SlugGeneratorTool />;
    case "random-name-generator": return <RandomNameTool />;
    case "hex-gradient": return <HexGradientTool />;
    case "api-key-generator": return <APIKeyTool />;
    case "json-schema-generator": return <JSONSchemaTool />;
    case "story-ideas": return <StoryIdeasTool />;
    case "fantasy-name": return <FantasyNameTool />;
    case "rpg-character": return <RPGCharacterTool />;
    case "daily-affirmation": return <DailyAffirmationTool />;
    case "joke-generator": return <JokeGeneratorTool />;
    case "trivia-generator": return <TriviaGeneratorTool />;
    case "workout-generator": return <WorkoutGeneratorTool />;
    case "daily-challenge": return <DailyChallengeTool />;
    default:
      return (
        <div className="text-center py-12 text-foreground-muted">
          <Info className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Tool not found: {tool.slug}</p>
        </div>
      );
  }
}

// ─── JSON Schema Generator (placeholder) ────────────────────────────────────
function JSONSchemaTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  function generate() {
    if (!input.trim()) return;
    try {
      const data = JSON.parse(input);
      const schema = generateSchema(data, "Root");
      setResult(JSON.stringify(schema, null, 2));
    } catch {
      setResult("❌ Invalid JSON. Please enter valid JSON data.");
    }
  }

  function generateSchema(data: unknown, name: string): Record<string, unknown> {
    if (data === null) return { type: "null" };
    if (Array.isArray(data)) {
      const item = data.length > 0 ? generateSchema(data[0], "Item") : { type: "string" };
      return { type: "array", items: item };
    }
    if (typeof data === "object") {
      const props: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
        props[k] = generateSchema(v, k.charAt(0).toUpperCase() + k.slice(1));
      }
      return { type: "object", properties: props };
    }
    return { type: typeof data };
  }

  return (
    <div className="space-y-5">
      <textarea className={inputClass} rows={4} placeholder='Paste JSON here, e.g. {"name": "John", "age": 30}' value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={generate} disabled={!input.trim()} className={primaryBtn + " flex items-center gap-2"}>
        <Braces className="h-4 w-4" /> Generate Schema
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <pre className={resultCard + " overflow-auto max-h-80 whitespace-pre-wrap"}>{result}</pre>
          <button onClick={() => navigator.clipboard.writeText(result)} className={clsx(secondaryBtn, "mt-3 flex items-center gap-2")}><Copy className="h-4 w-4" /> Copy</button>
        </motion.div>
      )}
    </div>
  );
}