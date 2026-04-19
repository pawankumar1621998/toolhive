"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import type { Tool } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const resultCard = "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn = "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

// ─────────────────────────────────────────────────────────────────────────────
// Age Calculator
// ─────────────────────────────────────────────────────────────────────────────

function AgeCalc() {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<{ years: number; months: number; days: number; totalDays: number; nextBirthday: string } | null>(null);
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    const d = new Date();
    setMaxDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  function calculate() {
    if (!dob) return;
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) { months--; const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday <= today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToNextBday = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setResult({ years, months, days, totalDays, nextBirthday: `${daysToNextBday} days` });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Date of Birth</label>
        <input type="date" className={inputClass} value={dob} onChange={(e) => { setDob(e.target.value); setResult(null); }} max={maxDate || undefined} />
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!dob}>Calculate Age</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Years", value: result.years },
            { label: "Months", value: result.months },
            { label: "Days", value: result.days },
            { label: "Total Days", value: result.totalDays.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className={clsx(resultCard, "text-center")}>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
            </div>
          ))}
          <div className={clsx(resultCard, "col-span-2 sm:col-span-4 text-center")}>
            <p className="text-sm text-foreground-muted">Next birthday in <span className="font-bold text-orange-500">{result.nextBirthday}</span></p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BMI Calculator
// ─────────────────────────────────────────────────────────────────────────────

type UnitSystem = "metric" | "imperial";

function BmiCalc() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  function bmiCategory(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { label: "Normal weight", color: "text-emerald-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-amber-500" };
    return { label: "Obese", color: "text-rose-500" };
  }

  function calculate() {
    const w = parseFloat(weight);
    if (!w || isNaN(w)) return;
    let heightM: number;
    if (unit === "metric") {
      const h = parseFloat(height);
      if (!h || isNaN(h)) return;
      heightM = h / 100;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      heightM = ((ft * 12) + inches) * 0.0254;
    }
    if (heightM <= 0) return;
    const weightKg = unit === "metric" ? w : w * 0.453592;
    setBmi(Math.round((weightKg / (heightM * heightM)) * 10) / 10);
  }

  const cat = bmi ? bmiCategory(bmi) : null;

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["metric", "imperial"] as UnitSystem[]).map((u) => (
          <button key={u} onClick={() => { setUnit(u); setBmi(null); }}
            className={clsx("px-5 py-2 text-xs font-semibold capitalize transition-colors",
              unit === u ? "bg-orange-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {u === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/ft)"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input type="number" className={inputClass} placeholder={unit === "metric" ? "70" : "154"} value={weight} onChange={(e) => { setWeight(e.target.value); setBmi(null); }} min="1" />
        </div>
        {unit === "metric" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Height (cm)</label>
            <input type="number" className={inputClass} placeholder="175" value={height} onChange={(e) => { setHeight(e.target.value); setBmi(null); }} min="1" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Height</label>
            <div className="flex gap-2">
              <input type="number" className={inputClass} placeholder="5 ft" value={heightFt} onChange={(e) => { setHeightFt(e.target.value); setBmi(null); }} min="0" />
              <input type="number" className={inputClass} placeholder="9 in" value={heightIn} onChange={(e) => { setHeightIn(e.target.value); setBmi(null); }} min="0" max="11" />
            </div>
          </div>
        )}
      </div>
      <button className={primaryBtn} onClick={calculate}>Calculate BMI</button>
      {bmi && cat && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={resultCard}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-foreground">{bmi}</p>
              <p className={clsx("text-sm font-semibold mt-1", cat.color)}>{cat.label}</p>
            </div>
            <div className="text-right text-xs text-foreground-muted space-y-1">
              <p>Underweight: &lt; 18.5</p><p>Normal: 18.5 &ndash; 24.9</p>
              <p>Overweight: 25 &ndash; 29.9</p><p>Obese: &ge; 30</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Percentage Calculator
// ─────────────────────────────────────────────────────────────────────────────

type PctMode = "whatpct" | "pctof" | "pctchange";

function PctCalc() {
  const [mode, setMode] = useState<PctMode>("pctof");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const modes: Array<{ id: PctMode; label: string; desc: string; placeholder: [string, string] }> = [
    { id: "pctof", label: "X% of Y", desc: "What is X% of Y?", placeholder: ["Percentage (%)", "Number"] },
    { id: "whatpct", label: "X is what %", desc: "X is what % of Y?", placeholder: ["X (part)", "Y (total)"] },
    { id: "pctchange", label: "% Change", desc: "% change from X to Y", placeholder: ["Original value", "New value"] },
  ];

  function calculate() {
    const numA = parseFloat(a), numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return;
    let res: string;
    if (mode === "pctof") res = `${((numA / 100) * numB).toFixed(4).replace(/\.?0+$/, "")}`;
    else if (mode === "whatpct") res = `${((numA / numB) * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
    else {
      const change = ((numB - numA) / Math.abs(numA)) * 100;
      res = `${change >= 0 ? "+" : ""}${change.toFixed(2).replace(/\.?0+$/, "")}%`;
    }
    setResult(res);
  }

  const activeMode = modes.find((m) => m.id === mode)!;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setA(""); setB(""); }}
            className={clsx("px-4 py-2 text-xs font-semibold rounded-xl border transition-colors",
              mode === m.id ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-foreground-muted">{activeMode.desc}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">{activeMode.placeholder[0]}</label>
          <input type="number" className={inputClass} value={a} onChange={(e) => { setA(e.target.value); setResult(null); }} placeholder="0" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">{activeMode.placeholder[1]}</label>
          <input type="number" className={inputClass} value={b} onChange={(e) => { setB(e.target.value); setResult(null); }} placeholder="0" />
        </div>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!a || !b}>Calculate</button>
      {result !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx(resultCard, "text-center")}>
          <p className="text-4xl font-bold text-orange-500">{result}</p>
          <p className="text-xs text-foreground-muted mt-2">Result</p>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMI Calculator
// ─────────────────────────────────────────────────────────────────────────────

function EmiCalc() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<{ emi: number; total: number; interest: number } | null>(null);

  function calculate() {
    const p = parseFloat(principal), r = parseFloat(rate) / 12 / 100, n = parseFloat(tenure) * 12;
    if (!p || !r || !n || isNaN(p) || isNaN(r) || isNaN(n)) return;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    setResult({ emi: Math.round(emi), total: Math.round(total), interest: Math.round(total - p) });
  }

  function fmt(n: number) { return n.toLocaleString("en-IN"); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Loan Amount (\u20b9)", value: principal, set: setPrincipal, placeholder: "500000" },
          { label: "Interest Rate (% p.a.)", value: rate, set: setRate, placeholder: "8.5" },
          { label: "Tenure (Years)", value: tenure, set: setTenure, placeholder: "20" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={value} onChange={(e) => { set(e.target.value); setResult(null); }} placeholder={placeholder} min="0" />
          </div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!principal || !rate || !tenure}>Calculate EMI</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {[
            { label: "Monthly EMI", value: `\u20b9${fmt(result.emi)}`, highlight: true },
            { label: "Total Amount", value: `\u20b9${fmt(result.total)}`, highlight: false },
            { label: "Total Interest", value: `\u20b9${fmt(result.interest)}`, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={clsx(resultCard, "text-center")}>
              <div className={clsx("text-xl font-bold", highlight ? "text-orange-500" : "text-foreground")}>{value}</div>
              <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tip Calculator
// ─────────────────────────────────────────────────────────────────────────────

function TipCalc() {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(1);

  const billNum = parseFloat(bill) || 0;
  const tipAmount = (billNum * tipPct) / 100;
  const totalAmount = billNum + tipAmount;
  const perPerson = people > 0 ? totalAmount / people : totalAmount;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Bill Amount ($)</label>
        <input type="number" className={inputClass} value={bill} onChange={(e) => setBill(e.target.value)} placeholder="50.00" min="0" step="0.01" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Tip Percentage</label>
          <span className="text-lg font-bold text-orange-500">{tipPct}%</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {[10, 15, 18, 20, 25].map((p) => (
            <button key={p} onClick={() => setTipPct(p)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                tipPct === p ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
              {p}%
            </button>
          ))}
        </div>
        <input type="range" min={0} max={50} value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))} className="w-full accent-orange-500" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Split Between (people)</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setPeople((p) => Math.max(1, p - 1))} className="h-10 w-10 rounded-xl border border-border bg-background text-foreground hover:bg-background-subtle text-lg font-bold transition-colors">&minus;</button>
          <span className="text-2xl font-bold text-foreground w-8 text-center">{people}</span>
          <button onClick={() => setPeople((p) => p + 1)} className="h-10 w-10 rounded-xl border border-border bg-background text-foreground hover:bg-background-subtle text-lg font-bold transition-colors">+</button>
        </div>
      </div>
      {billNum > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tip Amount", value: `$${tipAmount.toFixed(2)}` },
            { label: "Total Bill", value: `$${totalAmount.toFixed(2)}` },
            { label: "Per Person", value: `$${perPerson.toFixed(2)}`, highlight: true },
            { label: "Tip per Person", value: `$${(tipAmount / people).toFixed(2)}` },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={clsx(resultCard, "text-center")}>
              <div className={clsx("text-xl font-bold", highlight ? "text-orange-500" : "text-foreground")}>{value}</div>
              <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Discount Calculator
// ─────────────────────────────────────────────────────────────────────────────

type DiscMode = "saleprice" | "findpct" | "original";

function DiscountCalc() {
  const [mode, setMode] = useState<DiscMode>("saleprice");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const modes: Array<{ id: DiscMode; label: string; la: string; lb: string }> = [
    { id: "saleprice", label: "Sale Price", la: "Original Price ($)", lb: "Discount (%)" },
    { id: "findpct", label: "Find Discount %", la: "Original Price ($)", lb: "Sale Price ($)" },
    { id: "original", label: "Find Original", la: "Sale Price ($)", lb: "Discount (%)" },
  ];

  function calculate() {
    const na = parseFloat(a), nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return;
    if (mode === "saleprice") {
      const disc = na * (nb / 100);
      setResult(`$${(na - disc).toFixed(2)} (save $${disc.toFixed(2)})`);
    } else if (mode === "findpct") {
      setResult(`${(((na - nb) / na) * 100).toFixed(2)}% discount`);
    } else {
      setResult(`$${(na / (1 - nb / 100)).toFixed(2)}`);
    }
  }

  const activeMode = modes.find((m) => m.id === mode)!;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setA(""); setB(""); }}
            className={clsx("px-4 py-2 text-xs font-semibold rounded-xl border transition-colors",
              mode === m.id ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[{ label: activeMode.la, val: a, set: setA }, { label: activeMode.lb, val: b, set: setB }].map(({ label, val, set }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={val} onChange={(e) => { set(e.target.value); setResult(null); }} placeholder="0" min="0" />
          </div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!a || !b}>Calculate</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx(resultCard, "text-center")}>
          <p className="text-2xl font-bold text-orange-500">{result}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Calculator
// ─────────────────────────────────────────────────────────────────────────────

type DateMode = "diff" | "add";

function DateCalc() {
  const [mode, setMode] = useState<DateMode>("diff");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [addDays, setAddDays] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    if (mode === "diff") {
      if (!date1 || !date2) return;
      const d1 = new Date(date1), d2 = new Date(date2);
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
      setResult(`${diffDays} days (${diffWeeks} weeks, ${diffMonths} months)`);
    } else {
      if (!date1 || !addDays) return;
      const d = new Date(date1);
      d.setDate(d.getDate() + parseInt(addDays));
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      setResult(`${d.toDateString()} (${days[d.getDay()]})`);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["diff", "add"] as DateMode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); }}
            className={clsx("px-5 py-2 text-xs font-semibold transition-colors",
              mode === m ? "bg-orange-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "diff" ? "Date Difference" : "Add/Subtract Days"}
          </button>
        ))}
      </div>
      {mode === "diff" ? (
        <div className="grid grid-cols-2 gap-4">
          {[{ label: "Start Date", val: date1, set: setDate1 }, { label: "End Date", val: date2, set: setDate2 }].map(({ label, val, set }) => (
            <div key={label} className="space-y-2">
              <label className="text-sm font-medium text-foreground block">{label}</label>
              <input type="date" className={inputClass} value={val} onChange={(e) => { set(e.target.value); setResult(null); }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Start Date</label>
            <input type="date" className={inputClass} value={date1} onChange={(e) => { setDate1(e.target.value); setResult(null); }} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Days to Add (use &minus; for subtract)</label>
            <input type="number" className={inputClass} value={addDays} onChange={(e) => { setAddDays(e.target.value); setResult(null); }} placeholder="30" />
          </div>
        </div>
      )}
      <button className={primaryBtn} onClick={calculate} disabled={mode === "diff" ? (!date1 || !date2) : (!date1 || !addDays)}>Calculate</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx(resultCard, "text-center")}>
          <p className="text-xl font-bold text-orange-500">{result}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_TITLES: Record<string, string> = {
  age: "Age Calculator",
  bmi: "BMI Calculator",
  percentage: "Percentage Calculator",
  emi: "EMI / Loan Calculator",
  tip: "Tip Calculator",
  discount: "Discount Calculator",
  "date-diff": "Date Calculator",
};

export function CalcWorkspace({ tool }: { tool: Tool }) {
  function renderCalc() {
    switch (tool.slug) {
      case "age": return <AgeCalc />;
      case "bmi": return <BmiCalc />;
      case "percentage": return <PctCalc />;
      case "emi": return <EmiCalc />;
      case "tip": return <TipCalc />;
      case "discount": return <DiscountCalc />;
      case "date-diff": return <DateCalc />;
      default:
        return <p className="text-sm text-foreground-muted">This calculator is coming soon.</p>;
    }
  }

  const title = TOOL_TITLES[tool.slug] ?? tool.name;

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground leading-tight">{title}</h2>
            {tool.shortDescription && (
              <p className="text-xs text-foreground-muted mt-0.5">{tool.shortDescription}</p>
            )}
          </div>
        </div>
        {renderCalc()}
      </div>
      <div className="border-t border-border bg-background-subtle px-6 py-3 text-xs text-center text-foreground-muted">
        All calculations run locally in your browser &mdash; 100% private and instant.
      </div>
    </div>
  );
}

export default CalcWorkspace;
