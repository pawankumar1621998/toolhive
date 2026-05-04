"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import {
  Code,
  Palette,
  Copy,
  Check,
  RotateCcw,
  Download,
  Columns,
  Table,
  Box,
  Database,
  Regex,
  Binary,
  Link,
  AlignLeft,
  Eye,
  AlertCircle,
  Braces,
  Type,
  Grid3X3,
  FileCode,
  Hash,
  Plus,
  Minus,
  X,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Tool } from "@/types";
import { useAIGenerate } from "@/hooks/useAIGenerate";

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const cardClass = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn =
  "h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-background-subtle transition-colors disabled:opacity-50";

// CSS Gradient Generator
function CSSGradientGenerator() {
  const [type, setType] = useState<"linear" | "radial" | "conic">("linear");
  const [angle, setAngle] = useState(90);
  const [colors, setColors] = useState(["#ff6b6b", "#4ecdc4"]);
  const [stops, setStops] = useState([0, 100]);
  const [copied, setCopied] = useState(false);

  const getGradient = () => {
    if (type === "linear") {
      return `linear-gradient(${angle}deg, ${colors.map((c, i) => `${c} ${stops[i] || 0}%`).join(", ")})`;
    } else if (type === "radial") {
      return `radial-gradient(circle, ${colors.map((c, i) => `${c} ${stops[i] || 0}%`).join(", ")})`;
    } else {
      return `conic-gradient(from ${angle}deg, ${colors.map((c, i) => `${c} ${stops[i] || 0}%`).join(", ")})`;
    }
  };

  const getCSS = () => {
    const gradient = getGradient();
    return `background: ${gradient};`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addColor = () => {
    if (colors.length < 10) {
      setColors([...colors, "#ffffff"]);
      setStops([...stops, 100]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      const newStops = stops.filter((_, i) => i !== index);
      setColors(newColors);
      setStops(newStops);
    }
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {(["linear", "radial", "conic"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              type === t
                ? "bg-orange-500 text-white"
                : "border border-border text-foreground hover:bg-background-subtle"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {type === "linear" || type === "conic" ? (
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Angle: {angle}deg</label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      ) : null}

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-foreground-muted">Colors</label>
          <button onClick={addColor} className="text-sm text-orange-500 hover:underline">
            + Add Color
          </button>
        </div>
        <div className="space-y-3">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="w-12 h-12 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground uppercase"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={stops[index] || 0}
                onChange={(e) => {
                  const newStops = [...stops];
                  newStops[index] = parseInt(e.target.value);
                  setStops(newStops);
                }}
                className="w-24 accent-orange-500"
              />
              <span className="text-xs text-foreground-muted w-12">{stops[index] || 0}%</span>
              {colors.length > 2 && (
                <button onClick={() => removeColor(index)} className="p-1 hover:bg-background rounded">
                  <Minus className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="h-48 rounded-xl border border-border"
        style={{ background: getGradient() }}
      />

      <div className={cardClass}>
        <div className="flex justify-between items-center">
          <code className="text-sm text-foreground font-mono">{getCSS()}</code>
          <button onClick={copyToClipboard} className={clsx(secondaryBtn, "h-9 px-4")}>
            {copied ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4" /> Copy
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// JSON Formatter
function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { output: aiOutput, loading: aiLoading, generate: aiGenerate, clear: aiClear } = useAIGenerate("json-beautify");

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(input);
      setError(null);
      setOutput("Valid JSON");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleAIExplain = async () => {
    if (!input.trim()) return;
    await aiGenerate({ json: input, task: "explain" });
  };

  const handleAIImprove = async () => {
    if (!input.trim()) return;
    await aiGenerate({ json: input, task: "suggest_improvements" });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <textarea
        className={inputClass}
        rows={8}
        placeholder='{"key": "value"}'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <button onClick={formatJSON} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Braces className="w-4 h-4" /> Format
          </span>
        </button>
        <button onClick={minifyJSON} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Minimize2 className="w-4 h-4" /> Minify
          </span>
        </button>
        <button onClick={validateJSON} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Validate
          </span>
        </button>
        <button onClick={handleAIExplain} disabled={aiLoading || !input.trim()} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            {aiLoading ? "Loading..." : "AI Explain"}
          </span>
        </button>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {aiOutput && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardClass}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">AI Response</h3>
            <button onClick={aiClear} className="text-xs text-foreground-muted hover:text-foreground">Clear</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground">{aiOutput}</pre>
        </motion.div>
      )}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-end">
            <button onClick={copyToClipboard} className={secondaryBtn}>
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-4 h-4" /> Copy
                </span>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-border bg-background text-sm overflow-x-auto font-mono">
            {output}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// Minimize2 icon helper
function Minimize2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" x2="21" y1="10" y2="3" />
      <line x1="3" x2="10" y1="21" y2="14" />
    </svg>
  );
}

// HTML Table Generator
function HTMLTableGenerator() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headerText, setHeaderText] = useState("Header");
  const [striped, setStriped] = useState(false);
  const [bordered, setBordered] = useState(true);
  const [hover, setHover] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const { output: aiOutput, loading: aiLoading, generate: aiGenerate, clear: aiClear } = useAIGenerate("html-table-generator");

  const generateTable = () => {
    const headerCells = Array.from({ length: cols }, (_, i) => `<th>${headerText} ${i + 1}</th>`).join("\n          ");
    const bodyCells = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => `<td>Row ${r + 1}, Col ${c + 1}</td>`).join("\n          ")
    ).join("\n        </tr>\n        <tr>\n          ");

    const classes = clsx(
      striped && "table-striped",
      bordered && "table-bordered",
      hover && "table-hover"
    );

    const css = `
table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
}
th, td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}
th {
  background: #f8f9fa;
  font-weight: bold;
}
${striped ? "tr:nth-child(even) { background: #f8f9fa; }" : ""}
${hover ? "tr:hover { background: #f0f0f0; }" : ""}`;

    const html = `<table${classes ? ` class="${classes}"` : ""}>
  <thead>
    <tr>
      ${headerCells}
    </tr>
  </thead>
  <tbody>
    <tr>
      ${bodyCells}
    </tr>
  </tbody>
</table>

<style>
${css}
</style>`;

    setOutput(html);
  };

  const handleAIGenerateContent = async () => {
    await aiGenerate({ rows, cols, headerText, task: "generate_content" });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Rows</label>
          <input
            type="number"
            min="1"
            max="20"
            value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Columns</label>
          <input
            type="number"
            min="1"
            max="10"
            value={cols}
            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-foreground-muted mb-2">Header Text</label>
        <input
          type="text"
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          className={inputClass}
          placeholder="Header text for columns"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Striped", checked: striped, onChange: setStriped },
          { label: "Bordered", checked: bordered, onChange: setBordered },
          { label: "Hover Effect", checked: hover, onChange: setHover },
        ].map(({ label, checked, onChange }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={generateTable} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" /> Generate Table
          </span>
        </button>
        <button onClick={handleAIGenerateContent} disabled={aiLoading} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            {aiLoading ? "Loading..." : "AI Generate Content"}
          </span>
        </button>
      </div>
      {aiOutput && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardClass}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">AI Suggested Content</h3>
            <button onClick={aiClear} className="text-xs text-foreground-muted hover:text-foreground">Clear</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground">{aiOutput}</pre>
        </motion.div>
      )}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-end">
            <button onClick={copyToClipboard} className={secondaryBtn}>
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-4 h-4" /> Copy
                </span>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-border bg-background text-sm overflow-x-auto font-mono whitespace-pre-wrap">
            {output}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// CSS Shadow Generator
function CSSShadowGenerator() {
  const [offsetX, setOffsetX] = useState(5);
  const [offsetY, setOffsetY] = useState(5);
  const [blur, setBlur] = useState(10);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);
  const { output: aiOutput, loading: aiLoading, generate: aiGenerate, clear: aiClear } = useAIGenerate("css-shadow-generator");

  const getShadow = () => {
    const rgba = hexToRgba(color, opacity / 100);
    const insetText = inset ? "inset " : "";
    return `${insetText}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`;
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getCSS = () => `box-shadow: ${getShadow()};`;

  const handleAISuggest = async () => {
    await aiGenerate({ offsetX, offsetY, blur, spread, color, opacity, inset, task: "suggest" });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Offset X: {offsetX}px</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={offsetX}
            onChange={(e) => setOffsetX(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Offset Y: {offsetY}px</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={offsetY}
            onChange={(e) => setOffsetY(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Blur: {blur}px</label>
          <input
            type="range"
            min="0"
            max="100"
            value={blur}
            onChange={(e) => setBlur(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Spread: {spread}px</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={spread}
            onChange={(e) => setSpread(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-foreground-muted mb-2">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-12 rounded-xl border border-border cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-foreground-muted mb-2">Opacity: {opacity}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inset}
          onChange={(e) => setInset(e.target.checked)}
          className="w-4 h-4 accent-orange-500"
        />
        <span className="text-sm text-foreground">Inset Shadow</span>
      </label>

      <div className="bg-background-subtle rounded-xl p-8 flex items-center justify-center">
        <div
          className="w-48 h-48 bg-white rounded-xl"
          style={{ boxShadow: getShadow() }}
        />
      </div>

      <div className={cardClass}>
        <div className="flex justify-between items-center">
          <code className="text-sm text-foreground font-mono">{getCSS()}</code>
          <button onClick={copyToClipboard} className={clsx(secondaryBtn, "h-9 px-4")}>
            {copied ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4" /> Copy
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// SQL Insert Generator
function SQLInsertGenerator() {
  const [csv, setCsv] = useState("");
  const [tableName, setTableName] = useState("my_table");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { output: aiOutput, loading: aiLoading, generate: aiGenerate, clear: aiClear } = useAIGenerate("sql-insert-generator");

  const parseCSV = (input: string) => {
    const lines = input.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have a header row and at least one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/['"]/g, ""));
    const rows = lines.slice(1).map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""));
      return values;
    });

    return { headers, rows };
  };

  const generateSQL = () => {
    try {
      const { headers, rows } = parseCSV(csv);

      const statements = rows.map((row) => {
        const values = row.map((v) => {
          if (v === null || v === undefined || v === "") return "NULL";
          if (!isNaN(Number(v))) return v;
          return `'${v.replace(/'/g, "''")}'`;
        });

        return `INSERT INTO ${tableName} (${headers.join(", ")}) VALUES (${values.join(", ")});`;
      });

      setOutput(statements.join("\n"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-foreground-muted mb-2">Table Name</label>
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className={inputClass}
          placeholder="my_table"
        />
      </div>
      <div>
        <label className="block text-sm text-foreground-muted mb-2">CSV Data (First row = headers)</label>
        <textarea
          className={inputClass}
          rows={6}
          placeholder="name, email, age
John Doe, john@example.com, 25
Jane Smith, jane@example.com, 30"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
      </div>
      <button onClick={generateSQL} className={primaryBtn}>
        <span className="flex items-center gap-2">
          <Database className="w-4 h-4" /> Generate SQL
        </span>
      </button>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-end">
            <button onClick={copyToClipboard} className={secondaryBtn}>
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-4 h-4" /> Copy
                </span>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-border bg-background text-sm overflow-x-auto font-mono">
            {output}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// Regex Tester
function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState<{ text: string; index: number; groups: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { output: aiOutput, loading: aiLoading, generate: aiGenerate, clear: aiClear } = useAIGenerate("regex-test");

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const found: { text: string; index: number; groups: string[] }[] = [];
      let match;

      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          found.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          found.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(found);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  };

  const handleAIExplain = async () => {
    if (!pattern.trim()) return;
    await aiGenerate({ pattern, task: "explain" });
  };

  const handleAIGenerateTests = async () => {
    if (!pattern.trim()) return;
    await aiGenerate({ pattern, task: "generate_tests" });
  };

  const highlightMatches = () => {
    if (!pattern || !testString) return testString;

    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      return testString.replace(regex, (match) => `<mark class="bg-orange-500/30 text-orange-600">${match}</mark>`);
    } catch {
      return testString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-foreground-muted mb-2">Regex Pattern</label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className={inputClass}
          placeholder="[a-z]+"
          onKeyDown={(e) => e.key === "Enter" && testRegex()}
        />
      </div>
      <div>
        <label className="block text-sm text-foreground-muted mb-2">Flags</label>
        <div className="flex gap-4">
          {[
            { flag: "g", label: "Global" },
            { flag: "i", label: "Case Insensitive" },
            { flag: "m", label: "Multiline" },
          ].map(({ flag, label }) => (
            <label key={flag} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.includes(flag)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFlags((prev) => prev + flag);
                  } else {
                    setFlags((prev) => prev.replace(flag, ""));
                  }
                }}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-foreground-muted mb-2">Test String</label>
        <textarea
          className={inputClass}
          rows={6}
          placeholder="Enter text to test against the regex..."
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={testRegex} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Regex className="w-4 h-4" /> Test Regex
          </span>
        </button>
        <button onClick={handleAIExplain} disabled={aiLoading || !pattern.trim()} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            {aiLoading ? "Loading..." : "AI Explain"}
          </span>
        </button>
        <button onClick={handleAIGenerateTests} disabled={aiLoading || !pattern.trim()} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            {aiLoading ? "Loading..." : "Generate Test Cases"}
          </span>
        </button>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {aiOutput && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cardClass}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">AI Response</h3>
            <button onClick={aiClear} className="text-xs text-foreground-muted hover:text-foreground">Clear</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground">{aiOutput}</pre>
        </motion.div>
      )}
      {matches.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className={cardClass}>
            <h3 className="text-sm font-medium text-foreground mb-3">Highlighted Matches</h3>
            <div
              className="font-mono text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightMatches() }}
            />
          </div>
          <div className={cardClass}>
            <h3 className="text-sm font-medium text-foreground mb-3">Matches ({matches.length})</h3>
            <div className="space-y-2">
              {matches.map((match, i) => (
                <div key={i} className="flex items-center gap-4 p-2 bg-background rounded-lg">
                  <span className="text-xs text-foreground-muted">#{i + 1}</span>
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded font-mono text-sm">
                    {match.text}
                  </span>
                  <span className="text-xs text-foreground-muted">index: {match.index}</span>
                  {match.groups.length > 0 && (
                    <div className="flex gap-1">
                      {match.groups.map((g, gi) => (
                        <span key={gi} className="px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded text-xs">
                          ${gi + 1}: {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Base64 Encoder/Decoder
function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const swapValues = () => {
    setInput(output);
    setOutput("");
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("encode")}
          className={clsx(
            "flex-1 h-11 rounded-xl font-semibold text-sm transition-colors",
            mode === "encode"
              ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white"
              : "border border-border text-foreground hover:bg-background-subtle"
          )}
        >
          Encode
        </button>
        <button
          onClick={() => setMode("decode")}
          className={clsx(
            "flex-1 h-11 rounded-xl font-semibold text-sm transition-colors",
            mode === "decode"
              ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white"
              : "border border-border text-foreground hover:bg-background-subtle"
          )}
        >
          Decode
        </button>
      </div>
      <div>
        <label className="block text-sm text-foreground-muted mb-2">
          {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
        </label>
        <textarea
          className={inputClass}
          rows={5}
          placeholder={mode === "encode" ? "Enter text..." : "Enter base64 string..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button onClick={process} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Binary className="w-4 h-4" /> {mode === "encode" ? "Encode" : "Decode"}
          </span>
        </button>
        <button onClick={swapValues} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Swap
          </span>
        </button>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-foreground-muted">Result</label>
            <button onClick={copyToClipboard} className={secondaryBtn}>
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-4 h-4" /> Copy
                </span>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-border bg-background text-sm font-mono break-all">
            {output}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// URL Encoder/Decoder
function URLEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const swapValues = () => {
    setInput(output);
    setOutput("");
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("encode")}
          className={clsx(
            "flex-1 h-11 rounded-xl font-semibold text-sm transition-colors",
            mode === "encode"
              ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white"
              : "border border-border text-foreground hover:bg-background-subtle"
          )}
        >
          Encode
        </button>
        <button
          onClick={() => setMode("decode")}
          className={clsx(
            "flex-1 h-11 rounded-xl font-semibold text-sm transition-colors",
            mode === "decode"
              ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white"
              : "border border-border text-foreground hover:bg-background-subtle"
          )}
        >
          Decode
        </button>
      </div>
      <div>
        <label className="block text-sm text-foreground-muted mb-2">
          {mode === "encode" ? "Text to Encode" : "URL to Decode"}
        </label>
        <textarea
          className={inputClass}
          rows={5}
          placeholder={mode === "encode" ? "Enter text..." : "Enter encoded URL..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button onClick={process} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Link className="w-4 h-4" /> {mode === "encode" ? "Encode" : "Decode"}
          </span>
        </button>
        <button onClick={swapValues} className={secondaryBtn}>
          <span className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Swap
          </span>
        </button>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-foreground-muted">Result</label>
            <button onClick={copyToClipboard} className={secondaryBtn}>
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-4 h-4" /> Copy
                </span>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-border bg-background text-sm font-mono break-all">
            {output}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// Main Component
export default function CodeWorkspace({ tool }: { tool: Tool }) {
  const components: Record<string, React.ReactNode> = {
    "css-gradient-generator": <CSSGradientGenerator />,
    "json-beautify": <JSONFormatter />,
    "html-table-generator": <HTMLTableGenerator />,
    "css-shadow-generator": <CSSShadowGenerator />,
    "sql-insert-generator": <SQLInsertGenerator />,
    "regex-test": <RegexTester />,
    "base64-encoder": <Base64Encoder />,
    "url-encoder": <URLEncoder />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {components[tool.slug] || (
        <p className="text-foreground-muted">Tool not found: {tool.slug}</p>
      )}
    </motion.div>
  );
}