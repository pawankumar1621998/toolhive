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

const fmt = (n: number) => n.toLocaleString("en-IN");

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

  function bmiCategory(b: number): { label: string; color: string } {
    if (b < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (b < 25) return { label: "Normal weight", color: "text-emerald-500" };
    if (b < 30) return { label: "Overweight", color: "text-amber-500" };
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
// SIP Calculator
// ─────────────────────────────────────────────────────────────────────────────

function SipCalc() {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<{ maturity: number; invested: number; gained: number } | null>(null);

  function calculate() {
    const p = parseFloat(monthly), r = parseFloat(rate) / 12 / 100, n = parseFloat(years) * 12;
    if (!p || !r || !n || isNaN(p) || isNaN(r) || isNaN(n)) return;
    const maturity = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = p * n;
    setResult({ maturity: Math.round(maturity), invested: Math.round(invested), gained: Math.round(maturity - invested) });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Calculate how much your monthly SIP/mutual fund investment grows over time.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Monthly Investment (\u20b9)", value: monthly, set: setMonthly, placeholder: "5000" },
          { label: "Expected Return (% p.a.)", value: rate, set: setRate, placeholder: "12" },
          { label: "Investment Period (Years)", value: years, set: setYears, placeholder: "10" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={value} onChange={(e) => { set(e.target.value); setResult(null); }} placeholder={placeholder} min="0" />
          </div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!monthly || !rate || !years}>Calculate Returns</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Maturity Value", value: `\u20b9${fmt(result.maturity)}`, highlight: true },
              { label: "Amount Invested", value: `\u20b9${fmt(result.invested)}`, highlight: false },
              { label: "Wealth Gained", value: `\u20b9${fmt(result.gained)}`, highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={clsx(resultCard, "text-center")}>
                <div className={clsx("text-lg font-bold", highlight ? "text-orange-500" : "text-emerald-500")}>{value}</div>
                <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className={clsx(resultCard, "text-center")}>
            <p className="text-sm text-foreground-muted">
              Returns of <span className="font-bold text-orange-500">{((result.gained / result.invested) * 100).toFixed(1)}%</span> on your total investment
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GST Calculator
// ─────────────────────────────────────────────────────────────────────────────

function GstCalc() {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [result, setResult] = useState<{ base: number; cgst: number; sgst: number; total: number } | null>(null);

  function calculate() {
    const a = parseFloat(amount);
    if (!a || isNaN(a)) return;
    let base: number, total: number;
    if (mode === "add") {
      base = a;
      total = a * (1 + gstRate / 100);
    } else {
      total = a;
      base = a / (1 + gstRate / 100);
    }
    const gstAmt = total - base;
    setResult({ base: Math.round(base * 100) / 100, cgst: Math.round(gstAmt / 2 * 100) / 100, sgst: Math.round(gstAmt / 2 * 100) / 100, total: Math.round(total * 100) / 100 });
  }

  const rates = [5, 12, 18, 28];

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["add", "remove"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); }}
            className={clsx("px-5 py-2 text-xs font-semibold transition-colors",
              mode === m ? "bg-orange-500 text-white" : "bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m === "add" ? "Add GST" : "Remove GST"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">{mode === "add" ? "Original Amount (\u20b9)" : "Amount with GST (\u20b9)"}</label>
        <input type="number" className={inputClass} value={amount} onChange={(e) => { setAmount(e.target.value); setResult(null); }} placeholder="1000" min="0" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">GST Rate</label>
        <div className="flex flex-wrap gap-2">
          {rates.map((r) => (
            <button key={r} onClick={() => { setGstRate(r); setResult(null); }}
              className={clsx("px-4 py-2 text-sm font-semibold rounded-xl border transition-colors",
                gstRate === r ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
              {r}%
            </button>
          ))}
        </div>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!amount}>Calculate GST</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          {[
            { label: "Base Amount", value: `\u20b9${result.base.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, highlight: false },
            { label: `CGST (${gstRate / 2}%)`, value: `\u20b9${result.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, highlight: false },
            { label: `SGST (${gstRate / 2}%)`, value: `\u20b9${result.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, highlight: false },
            { label: "Total with GST", value: `\u20b9${result.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={clsx(resultCard, "text-center")}>
              <div className={clsx("text-lg font-bold", highlight ? "text-orange-500" : "text-foreground")}>{value}</div>
              <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Income Tax Calculator (India FY 2025-26)
// ─────────────────────────────────────────────────────────────────────────────

function IncomeTaxCalc() {
  const [income, setIncome] = useState("");
  const [deductions80C, setDeductions80C] = useState("");
  const [deductions80D, setDeductions80D] = useState("");
  const [hra, setHra] = useState("");
  const [result, setResult] = useState<{ oldTax: number; newTax: number; oldTakeHome: number; newTakeHome: number } | null>(null);

  function calcNewRegimeTax(taxable: number): number {
    if (taxable <= 400000) return 0;
    let tax = 0;
    const slabs = [[400000, 800000, 0.05], [800000, 1200000, 0.10], [1200000, 1600000, 0.15], [1600000, 2000000, 0.20], [2000000, 2400000, 0.25], [2400000, Infinity, 0.30]] as [number, number, number][];
    for (const [lo, hi, r] of slabs) {
      if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * r;
    }
    const cess = tax * 0.04;
    // Rebate u/s 87A: if taxable income ≤ 12L, full rebate (tax = 0 before cess if ≤12L)
    if (taxable <= 1200000) return 0;
    return Math.round(tax + cess);
  }

  function calcOldRegimeTax(taxable: number): number {
    if (taxable <= 250000) return 0;
    let tax = 0;
    const slabs = [[250000, 500000, 0.05], [500000, 1000000, 0.20], [1000000, Infinity, 0.30]] as [number, number, number][];
    for (const [lo, hi, r] of slabs) {
      if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * r;
    }
    const cess = tax * 0.04;
    // Rebate u/s 87A: if taxable ≤ 5L, full rebate
    if (taxable <= 500000) return 0;
    return Math.round(tax + cess);
  }

  function calculate() {
    const grossIncome = parseFloat(income);
    if (!grossIncome || isNaN(grossIncome)) return;

    const stdDedNew = 75000;
    const stdDedOld = 50000;
    const ded80C = Math.min(parseFloat(deductions80C) || 0, 150000);
    const ded80D = Math.min(parseFloat(deductions80D) || 0, 25000);
    const hraAmt = parseFloat(hra) || 0;

    const newTaxable = Math.max(0, grossIncome - stdDedNew);
    const oldTaxable = Math.max(0, grossIncome - stdDedOld - ded80C - ded80D - hraAmt);

    const newTax = calcNewRegimeTax(newTaxable);
    const oldTax = calcOldRegimeTax(oldTaxable);

    setResult({ oldTax, newTax, oldTakeHome: Math.round(grossIncome - oldTax), newTakeHome: Math.round(grossIncome - newTax) });
  }

  const better = result ? (result.newTax <= result.oldTax ? "new" : "old") : null;

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">FY 2025-26 | Old Regime vs New Regime comparison</p>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Annual Gross Income (\u20b9)</label>
        <input type="number" className={inputClass} value={income} onChange={(e) => { setIncome(e.target.value); setResult(null); }} placeholder="800000" min="0" />
      </div>
      <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Old Regime Deductions (optional)</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "80C (max \u20b91.5L)", value: deductions80C, set: setDeductions80C, placeholder: "150000" },
          { label: "80D Health Ins. (max \u20b925K)", value: deductions80D, set: setDeductions80D, placeholder: "25000" },
          { label: "HRA Exemption (\u20b9)", value: hra, set: setHra, placeholder: "0" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={value} onChange={(e) => { set(e.target.value); setResult(null); }} placeholder={placeholder} min="0" />
          </div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!income}>Compare Tax Regimes</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { regime: "Old Regime", tax: result.oldTax, takeHome: result.oldTakeHome },
              { regime: "New Regime", tax: result.newTax, takeHome: result.newTakeHome },
            ].map(({ regime, tax, takeHome }) => {
              const isBetter = better === (regime === "New Regime" ? "new" : "old");
              return (
                <div key={regime} className={clsx(resultCard, "relative", isBetter && "ring-2 ring-emerald-500")}>
                  {isBetter && <span className="absolute -top-2.5 left-3 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">Better Option</span>}
                  <p className="text-xs font-semibold text-foreground-muted mt-1">{regime}</p>
                  <p className="text-lg font-bold text-rose-500 mt-1">\u20b9{fmt(tax)} tax</p>
                  <p className="text-sm text-foreground mt-0.5">Take Home: <span className="font-bold text-foreground">\u20b9{fmt(takeHome)}</span></p>
                </div>
              );
            })}
          </div>
          <div className={clsx(resultCard, "text-center")}>
            <p className="text-sm text-foreground-muted">
              {better === "new" ? "New" : "Old"} Regime saves you{" "}
              <span className="font-bold text-emerald-500">\u20b9{fmt(Math.abs(result.oldTax - result.newTax))}</span> in taxes this year
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixed Deposit Calculator
// ─────────────────────────────────────────────────────────────────────────────

function FdCalc() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [freq, setFreq] = useState<1 | 2 | 4 | 12>(4);
  const [result, setResult] = useState<{ maturity: number; interest: number } | null>(null);

  const freqLabels: Record<number, string> = { 1: "Yearly", 2: "Half-Yearly", 4: "Quarterly", 12: "Monthly" };

  function calculate() {
    const p = parseFloat(principal), r = parseFloat(rate) / 100, n = parseFloat(years);
    if (!p || !r || !n || isNaN(p) || isNaN(r) || isNaN(n)) return;
    const maturity = p * Math.pow(1 + r / freq, freq * n);
    setResult({ maturity: Math.round(maturity), interest: Math.round(maturity - p) });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Principal Amount (\u20b9)", value: principal, set: setPrincipal, placeholder: "100000" },
          { label: "Interest Rate (% p.a.)", value: rate, set: setRate, placeholder: "7.1" },
          { label: "Tenure (Years)", value: years, set: setYears, placeholder: "3" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={value} onChange={(e) => { set(e.target.value); setResult(null); }} placeholder={placeholder} min="0" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Compounding Frequency</label>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 4, 12] as const).map((f) => (
            <button key={f} onClick={() => { setFreq(f); setResult(null); }}
              className={clsx("px-4 py-2 text-xs font-semibold rounded-xl border transition-colors",
                freq === f ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
              {freqLabels[f]}
            </button>
          ))}
        </div>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!principal || !rate || !years}>Calculate FD</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {[
            { label: "Principal", value: `\u20b9${fmt(parseFloat(principal))}`, highlight: false },
            { label: "Interest Earned", value: `\u20b9${fmt(result.interest)}`, highlight: false },
            { label: "Maturity Amount", value: `\u20b9${fmt(result.maturity)}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={clsx(resultCard, "text-center")}>
              <div className={clsx("text-lg font-bold", highlight ? "text-orange-500" : "text-foreground")}>{value}</div>
              <div className="text-xs text-foreground-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Hand Salary Calculator (India)
// ─────────────────────────────────────────────────────────────────────────────

function SalaryCalc() {
  const [ctc, setCtc] = useState("");
  const [result, setResult] = useState<{
    gross: number; basic: number; hra: number; specialAllowance: number;
    epfEmployee: number; epfEmployer: number; profTax: number; incomeTax: number;
    monthlyInHand: number; annualInHand: number;
  } | null>(null);

  function calculate() {
    const annual = parseFloat(ctc);
    if (!annual || isNaN(annual)) return;

    const basic = annual * 0.4;
    const hra = basic * 0.5;
    const specialAllowance = annual - basic - hra - annual * 0.12;
    const epfEmployee = Math.min(basic * 0.12, 21600);
    const epfEmployer = epfEmployee;
    const profTax = 2400;

    const grossForTax = annual - epfEmployee - profTax;
    const stdDed = 75000;
    const taxable = Math.max(0, grossForTax - stdDed);

    let incomeTax = 0;
    if (taxable > 1200000) {
      const slabs: [number, number, number][] = [[400000,800000,0.05],[800000,1200000,0.10],[1200000,1600000,0.15],[1600000,2000000,0.20],[2000000,2400000,0.25],[2400000,Infinity,0.30]];
      for (const [lo, hi, r] of slabs) if (taxable > lo) incomeTax += (Math.min(taxable, hi) - lo) * r;
      incomeTax = Math.round(incomeTax * 1.04);
    }

    const annualInHand = Math.round(annual - epfEmployee - epfEmployer - profTax - incomeTax);
    setResult({ gross: Math.round(annual), basic: Math.round(basic), hra: Math.round(hra), specialAllowance: Math.round(Math.max(0, specialAllowance)), epfEmployee: Math.round(epfEmployee), epfEmployer: Math.round(epfEmployer), profTax, incomeTax, monthlyInHand: Math.round(annualInHand / 12), annualInHand });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Estimate monthly in-hand salary from CTC (India, New Tax Regime FY2025-26)</p>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Annual CTC (\u20b9)</label>
        <input type="number" className={inputClass} value={ctc} onChange={(e) => { setCtc(e.target.value); setResult(null); }} placeholder="1200000" min="0" />
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!ctc}>Calculate In-Hand Salary</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center col-span-2 bg-gradient-to-r from-orange-500/10 to-amber-400/10")}>
              <p className="text-3xl font-bold text-orange-500">\u20b9{fmt(result.monthlyInHand)}<span className="text-sm font-normal text-foreground-muted">/month</span></p>
              <p className="text-xs text-foreground-muted mt-1">Estimated In-Hand</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Basic Salary/yr", value: `\u20b9${fmt(result.basic)}` },
              { label: "HRA/yr", value: `\u20b9${fmt(result.hra)}` },
              { label: "EPF (Employee)/yr", value: `-\u20b9${fmt(result.epfEmployee)}` },
              { label: "EPF (Employer)/yr", value: `\u20b9${fmt(result.epfEmployer)}` },
              { label: "Professional Tax/yr", value: `-\u20b9${fmt(result.profTax)}` },
              { label: "Income Tax/yr", value: `-\u20b9${fmt(result.incomeTax)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs px-3 py-2 rounded-lg bg-background-subtle border border-card-border">
                <span className="text-foreground-muted">{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-foreground-muted text-center">*Approximate. Actual may vary by company structure.</div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit Converter
// ─────────────────────────────────────────────────────────────────────────────

type UnitCategory = "length" | "weight" | "temperature" | "speed";

const UNITS: Record<UnitCategory, string[]> = {
  length: ["Meter", "Kilometer", "Centimeter", "Millimeter", "Mile", "Yard", "Foot", "Inch"],
  weight: ["Kilogram", "Gram", "Milligram", "Pound", "Ounce", "Metric Ton"],
  temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  speed: ["km/h", "mph", "m/s", "knot"],
};

function toBase(val: number, unit: string, cat: UnitCategory): number {
  if (cat === "length") {
    const m: Record<string, number> = { Meter:1, Kilometer:1000, Centimeter:0.01, Millimeter:0.001, Mile:1609.344, Yard:0.9144, Foot:0.3048, Inch:0.0254 };
    return val * (m[unit] ?? 1);
  }
  if (cat === "weight") {
    const m: Record<string, number> = { Kilogram:1, Gram:0.001, Milligram:0.000001, Pound:0.453592, Ounce:0.0283495, "Metric Ton":1000 };
    return val * (m[unit] ?? 1);
  }
  if (cat === "temperature") {
    if (unit === "Celsius") return val;
    if (unit === "Fahrenheit") return (val - 32) * 5 / 9;
    return val - 273.15;
  }
  if (cat === "speed") {
    const m: Record<string, number> = { "km/h":1, "mph":1.60934, "m/s":3.6, "knot":1.852 };
    return val * (m[unit] ?? 1);
  }
  return val;
}

function fromBase(val: number, unit: string, cat: UnitCategory): number {
  if (cat === "length") {
    const m: Record<string, number> = { Meter:1, Kilometer:1000, Centimeter:0.01, Millimeter:0.001, Mile:1609.344, Yard:0.9144, Foot:0.3048, Inch:0.0254 };
    return val / (m[unit] ?? 1);
  }
  if (cat === "weight") {
    const m: Record<string, number> = { Kilogram:1, Gram:0.001, Milligram:0.000001, Pound:0.453592, Ounce:0.0283495, "Metric Ton":1000 };
    return val / (m[unit] ?? 1);
  }
  if (cat === "temperature") {
    if (unit === "Celsius") return val;
    if (unit === "Fahrenheit") return val * 9 / 5 + 32;
    return val + 273.15;
  }
  if (cat === "speed") {
    const m: Record<string, number> = { "km/h":1, "mph":1.60934, "m/s":3.6, "knot":1.852 };
    return val / (m[unit] ?? 1);
  }
  return val;
}

function UnitCalc() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState("Meter");
  const [toUnit, setToUnit] = useState("Kilometer");
  const [value, setValue] = useState("");

  const units = UNITS[category];

  function handleCategoryChange(cat: UnitCategory) {
    setCategory(cat);
    setFromUnit(UNITS[cat][0]);
    setToUnit(UNITS[cat][1]);
    setValue("");
  }

  const converted = (() => {
    const v = parseFloat(value);
    if (isNaN(v) || !value) return "";
    const base = toBase(v, fromUnit, category);
    const result = fromBase(base, toUnit, category);
    const abs = Math.abs(result);
    if (abs === 0) return "0";
    if (abs < 0.0001 || abs > 1e9) return result.toExponential(6);
    return parseFloat(result.toPrecision(8)).toString();
  })();

  const cats: UnitCategory[] = ["length", "weight", "temperature", "speed"];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => handleCategoryChange(c)}
            className={clsx("px-4 py-2 text-xs font-semibold rounded-xl border capitalize transition-colors",
              category === c ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">From</label>
          <select className={inputClass} value={fromUnit} onChange={(e) => { setFromUnit(e.target.value); }}>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">To</label>
          <select className={inputClass} value={toUnit} onChange={(e) => { setToUnit(e.target.value); }}>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Value</label>
        <input type="number" className={inputClass} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value to convert" />
      </div>
      {converted !== "" && value !== "" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx(resultCard, "text-center")}>
          <p className="text-3xl font-bold text-orange-500">{converted}</p>
          <p className="text-sm text-foreground-muted mt-1">{toUnit}</p>
          <p className="text-xs text-foreground-muted mt-2">{value} {fromUnit} = {converted} {toUnit}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fuel Cost Calculator
// ─────────────────────────────────────────────────────────────────────────────

function FuelCalc() {
  const [distance, setDistance] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [trips, setTrips] = useState("1");
  const [result, setResult] = useState<{ fuelNeeded: number; costPerTrip: number; totalCost: number; costPerKm: number } | null>(null);

  function calculate() {
    const d = parseFloat(distance), m = parseFloat(mileage), p = parseFloat(fuelPrice), t = parseInt(trips) || 1;
    if (!d || !m || !p || isNaN(d) || isNaN(m) || isNaN(p)) return;
    const fuelNeeded = d / m;
    const costPerTrip = fuelNeeded * p;
    setResult({ fuelNeeded: Math.round(fuelNeeded * 100) / 100, costPerTrip: Math.round(costPerTrip * 100) / 100, totalCost: Math.round(costPerTrip * t * 100) / 100, costPerKm: Math.round((costPerTrip / d) * 100) / 100 });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Calculate your fuel cost for any trip. Ideal for road trips, daily commute cost tracking.</p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Trip Distance (km)", value: distance, set: setDistance, placeholder: "100" },
          { label: "Vehicle Mileage (km/L)", value: mileage, set: setMileage, placeholder: "15" },
          { label: "Fuel Price (\u20b9/L)", value: fuelPrice, set: setFuelPrice, placeholder: "103" },
          { label: "Number of Trips", value: trips, set: setTrips, placeholder: "1" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={value} onChange={(e) => { set(e.target.value); setResult(null); }} placeholder={placeholder} min="0" />
          </div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!distance || !mileage || !fuelPrice}>Calculate Fuel Cost</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          {[
            { label: "Fuel Needed", value: `${result.fuelNeeded} L`, highlight: false },
            { label: "Cost per Trip", value: `\u20b9${result.costPerTrip}`, highlight: true },
            { label: "Cost per km", value: `\u20b9${result.costPerKm}`, highlight: false },
            { label: `Total (${trips} trip${parseInt(trips) > 1 ? "s" : ""})`, value: `\u20b9${result.totalCost}`, highlight: false },
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
// Mortgage / Home Loan Calculator
// ─────────────────────────────────────────────────────────────────────────────

function MortgageCalc() {
  const [price, setPrice] = useState(""); const [down, setDown] = useState("20"); const [rate, setRate] = useState(""); const [years, setYears] = useState("20");
  const [result, setResult] = useState<{monthly:number;loan:number;interest:number;dp:number;total:number}|null>(null);
  function calculate() {
    const p=parseFloat(price),dp=parseFloat(down)/100,r=parseFloat(rate)/12/100,n=parseFloat(years)*12;
    if(!p||!r||!n||isNaN(p)||isNaN(r)||isNaN(n))return;
    const loan=p*(1-dp); const monthly=(loan*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    setResult({monthly:Math.round(monthly),loan:Math.round(loan),interest:Math.round(monthly*n-loan),dp:Math.round(p*dp),total:Math.round(monthly*n+p*dp)});
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[{l:"Property Price (₹)",v:price,s:setPrice,p:"5000000"},{l:"Down Payment (%)",v:down,s:setDown,p:"20"},{l:"Interest Rate (% p.a.)",v:rate,s:setRate,p:"8.5"},{l:"Loan Tenure (Years)",v:years,s:setYears,p:"20"}].map(({l,v,s,p})=>(
          <div key={l} className="space-y-2"><label className="text-sm font-medium text-foreground block">{l}</label><input type="number" className={inputClass} value={v} onChange={e=>{s(e.target.value);setResult(null);}} placeholder={p} min="0"/></div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!price||!rate}>Calculate Mortgage</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[{l:"Monthly EMI",v:`₹${fmt(result.monthly)}`,h:true},{l:"Down Payment",v:`₹${fmt(result.dp)}`,h:false},{l:"Loan Amount",v:`₹${fmt(result.loan)}`,h:false},{l:"Total Interest",v:`₹${fmt(result.interest)}`,h:false},{l:"Total Cost",v:`₹${fmt(result.total)}`,h:false}].map(({l,v,h})=>(
          <div key={l} className={clsx(resultCard,"text-center")}><div className={clsx("text-xl font-bold",h?"text-orange-500":"text-foreground")}>{v}</div><div className="text-xs text-foreground-muted mt-0.5">{l}</div></div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROI Calculator
// ─────────────────────────────────────────────────────────────────────────────

function RoiCalc() {
  const [invest, setInvest] = useState(""); const [returns, setReturns] = useState(""); const [months, setMonths] = useState("");
  const [result, setResult] = useState<{roi:number;profit:number;annualRoi:number}|null>(null);
  function calculate() {
    const i=parseFloat(invest),r=parseFloat(returns),m=parseFloat(months)||12;
    if(!i||!r||isNaN(i)||isNaN(r))return;
    const profit=r-i; const roi=(profit/i)*100; const annualRoi=(roi/m)*12;
    setResult({roi:Math.round(roi*100)/100,profit:Math.round(profit),annualRoi:Math.round(annualRoi*100)/100});
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[{l:"Investment Cost (₹)",v:invest,s:setInvest,p:"100000"},{l:"Return / Revenue (₹)",v:returns,s:setReturns,p:"150000"},{l:"Period (Months)",v:months,s:setMonths,p:"12"}].map(({l,v,s,p})=>(
          <div key={l} className="space-y-2"><label className="text-sm font-medium text-foreground block">{l}</label><input type="number" className={inputClass} value={v} onChange={e=>{s(e.target.value);setResult(null);}} placeholder={p} min="0"/></div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!invest||!returns}>Calculate ROI</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-3 gap-3">
        {[{l:"ROI",v:`${result.roi}%`,h:true},{l:"Net Profit",v:`₹${fmt(result.profit)}`,h:false},{l:"Annual ROI",v:`${result.annualRoi}%`,h:false}].map(({l,v,h})=>(
          <div key={l} className={clsx(resultCard,"text-center")}><div className={clsx("text-xl font-bold",h?(result.roi>=0?"text-emerald-500":"text-rose-500"):"text-foreground")}>{v}</div><div className="text-xs text-foreground-muted mt-0.5">{l}</div></div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profit Margin Calculator
// ─────────────────────────────────────────────────────────────────────────────

function ProfitCalc() {
  const [cost, setCost] = useState(""); const [revenue, setRevenue] = useState("");
  const [result, setResult] = useState<{profit:number;grossMargin:number;markup:number}|null>(null);
  function calculate() {
    const c=parseFloat(cost),r=parseFloat(revenue);
    if(!c||!r||isNaN(c)||isNaN(r))return;
    setResult({profit:Math.round((r-c)*100)/100,grossMargin:Math.round(((r-c)/r)*10000)/100,markup:Math.round(((r-c)/c)*10000)/100});
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[{l:"Cost / COGS (₹)",v:cost,s:setCost,p:"500"},{l:"Revenue / Selling Price (₹)",v:revenue,s:setRevenue,p:"800"}].map(({l,v,s,p})=>(
          <div key={l} className="space-y-2"><label className="text-sm font-medium text-foreground block">{l}</label><input type="number" className={inputClass} value={v} onChange={e=>{s(e.target.value);setResult(null);}} placeholder={p} min="0"/></div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!cost||!revenue}>Calculate Margin</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-3 gap-3">
        {[{l:"Gross Profit",v:`₹${result.profit}`,h:false},{l:"Profit Margin",v:`${result.grossMargin}%`,h:true},{l:"Markup %",v:`${result.markup}%`,h:false}].map(({l,v,h})=>(
          <div key={l} className={clsx(resultCard,"text-center")}><div className={clsx("text-xl font-bold",h?"text-orange-500":"text-foreground")}>{v}</div><div className="text-xs text-foreground-muted mt-0.5">{l}</div></div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GPA Calculator
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_POINTS: Record<string,number> = {"A+":4.0,"A":4.0,"A-":3.7,"B+":3.3,"B":3.0,"B-":2.7,"C+":2.3,"C":2.0,"C-":1.7,"D+":1.3,"D":1.0,"F":0.0};

function GpaCalc() {
  const [courses, setCourses] = useState([{id:1,name:"",grade:"A",credits:"3"},{id:2,name:"",grade:"B+",credits:"3"}]);
  const [gpa, setGpa] = useState<number|null>(null);
  function addCourse(){setCourses(p=>[...p,{id:Date.now(),name:"",grade:"A",credits:"3"}]);}
  function update(id:number,f:string,v:string){setCourses(p=>p.map(c=>c.id===id?{...c,[f]:v}:c));setGpa(null);}
  function calculate(){
    const valid=courses.filter(c=>c.credits);
    const totalCredits=valid.reduce((s,c)=>s+parseFloat(c.credits),0);
    if(!totalCredits)return;
    const totalPoints=valid.reduce((s,c)=>s+(GRADE_POINTS[c.grade]??0)*parseFloat(c.credits),0);
    setGpa(Math.round((totalPoints/totalCredits)*100)/100);
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-foreground-muted uppercase tracking-wide">
          <span className="col-span-5">Course</span><span className="col-span-4">Grade</span><span className="col-span-2">Credits</span><span className="col-span-1"></span>
        </div>
        {courses.map(c=>(
          <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
            <input className={clsx(inputClass,"col-span-5 py-2")} value={c.name} onChange={e=>update(c.id,"name",e.target.value)} placeholder="Course name"/>
            <select className={clsx(inputClass,"col-span-4 py-2")} value={c.grade} onChange={e=>update(c.id,"grade",e.target.value)}>
              {Object.keys(GRADE_POINTS).map(g=><option key={g}>{g}</option>)}
            </select>
            <input type="number" className={clsx(inputClass,"col-span-2 py-2 text-center")} value={c.credits} onChange={e=>update(c.id,"credits",e.target.value)} min="1" max="6"/>
            <button onClick={()=>setCourses(p=>p.filter(x=>x.id!==c.id))} className="col-span-1 text-foreground-muted hover:text-rose-500 text-lg text-center">×</button>
          </div>
        ))}
        <button onClick={addCourse} className="text-xs font-semibold text-orange-500 hover:text-orange-600">+ Add Course</button>
      </div>
      <button className={primaryBtn} onClick={calculate}>Calculate GPA</button>
      {gpa!==null&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={clsx(resultCard,"text-center")}>
        <div className="text-5xl font-black text-orange-500">{gpa.toFixed(2)}</div>
        <p className="text-sm text-foreground-muted mt-1">GPA (out of 4.0)</p>
        <p className="text-xs text-foreground-muted mt-1">{gpa>=3.7?"A — Excellent":gpa>=3.0?"B — Good":gpa>=2.0?"C — Satisfactory":"D/F — Needs Improvement"}</p>
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fraction Calculator
// ─────────────────────────────────────────────────────────────────────────────

function gcd(a:number,b:number):number{return b===0?Math.abs(a):gcd(b,a%b);}

function FractionCalc() {
  const [n1,setN1]=useState("");const [d1,setD1]=useState("");const [op,setOp]=useState("+");const [n2,setN2]=useState("");const [d2,setD2]=useState("");
  const [result,setResult]=useState<{num:number;den:number;decimal:number}|null>(null);
  function calculate(){
    const a=parseInt(n1),b=parseInt(d1)||1,c=parseInt(n2),d=parseInt(d2)||1;
    if(isNaN(a)||isNaN(c))return;
    let rn,rd;
    if(op==="+"){rn=a*d+c*b;rd=b*d;}
    else if(op==="-"){rn=a*d-c*b;rd=b*d;}
    else if(op==="×"){rn=a*c;rd=b*d;}
    else{rn=a*d;rd=b*c;}
    const g=gcd(Math.abs(rn),Math.abs(rd));
    setResult({num:rn/g,den:rd/g,decimal:Math.round((rn/rd)*100000)/100000});
  }
  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1.5 text-center">
          <input type="number" className={clsx(inputClass,"w-20 text-center")} value={n1} onChange={e=>{setN1(e.target.value);setResult(null);}} placeholder="3"/>
          <div className="border-t-2 border-foreground mx-2"/>
          <input type="number" className={clsx(inputClass,"w-20 text-center")} value={d1} onChange={e=>{setD1(e.target.value);setResult(null);}} placeholder="4"/>
        </div>
        <div className="flex flex-col gap-1.5 mb-1">
          {["+","-","×","÷"].map(o=>(
            <button key={o} onClick={()=>setOp(o)} className={clsx("w-8 h-8 rounded-lg border text-sm font-bold transition-colors",op===o?"bg-orange-500 text-white border-orange-500":"bg-background border-border text-foreground-muted hover:border-orange-400")}>{o}</button>
          ))}
        </div>
        <div className="space-y-1.5 text-center">
          <input type="number" className={clsx(inputClass,"w-20 text-center")} value={n2} onChange={e=>{setN2(e.target.value);setResult(null);}} placeholder="1"/>
          <div className="border-t-2 border-foreground mx-2"/>
          <input type="number" className={clsx(inputClass,"w-20 text-center")} value={d2} onChange={e=>{setD2(e.target.value);setResult(null);}} placeholder="2"/>
        </div>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!n1||!n2}>= Calculate</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={clsx(resultCard,"text-center space-y-1")}>
        <div className="text-3xl font-black text-orange-500">{result.num}/{result.den}</div>
        <p className="text-sm text-foreground-muted">= {result.decimal}</p>
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Statistics Calculator
// ─────────────────────────────────────────────────────────────────────────────

function StatsCalc() {
  const [input,setInput]=useState("");
  const [stats,setStats]=useState<{count:number;sum:number;mean:number;median:number;mode:string;range:number;variance:number;sd:number;min:number;max:number}|null>(null);
  function calculate(){
    const nums=input.split(/[\s,\n]+/).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n));
    if(nums.length===0)return;
    const sorted=[...nums].sort((a,b)=>a-b);
    const n=nums.length,sum=nums.reduce((s,v)=>s+v,0),mean=sum/n;
    const mid=Math.floor(n/2); const median=n%2===0?(sorted[mid-1]+sorted[mid])/2:sorted[mid];
    const freq:Record<number,number>={};nums.forEach(v=>{freq[v]=(freq[v]||0)+1;});
    const maxF=Math.max(...Object.values(freq));const modes=Object.entries(freq).filter(([,f])=>f===maxF).map(([v])=>v);
    const mode=maxF===1?"No mode":modes.join(", ");
    const variance=nums.reduce((s,v)=>s+Math.pow(v-mean,2),0)/n;
    setStats({count:n,sum:Math.round(sum*1000)/1000,mean:Math.round(mean*1000)/1000,median:Math.round(median*1000)/1000,mode,range:sorted[n-1]-sorted[0],variance:Math.round(variance*1000)/1000,sd:Math.round(Math.sqrt(variance)*1000)/1000,min:sorted[0],max:sorted[n-1]});
  }
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Enter Numbers (comma, space, or newline separated)</label>
        <textarea className={clsx(inputClass,"h-24 resize-none")} value={input} onChange={e=>{setInput(e.target.value);setStats(null);}} placeholder="e.g. 4, 8, 15, 16, 23, 42"/>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!input.trim()}>Calculate Statistics</button>
      {stats&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[{l:"Count",v:stats.count},{l:"Sum",v:stats.sum},{l:"Mean",v:stats.mean},{l:"Median",v:stats.median},{l:"Mode",v:stats.mode},{l:"Range",v:stats.range},{l:"Std Dev (σ)",v:stats.sd},{l:"Variance (σ²)",v:stats.variance},{l:"Min",v:stats.min},{l:"Max",v:stats.max}].map(({l,v})=>(
          <div key={l} className={clsx(resultCard,"text-center")}>
            <div className="text-lg font-bold text-foreground truncate">{v}</div>
            <div className="text-xs text-foreground-muted mt-0.5">{l}</div>
          </div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Body Fat % Calculator (US Navy Method)
// ─────────────────────────────────────────────────────────────────────────────

function BodyFatCalc() {
  const [gender,setGender]=useState<"male"|"female">("male");
  const [height,setHeight]=useState("");const [waist,setWaist]=useState("");const [neck,setNeck]=useState("");const [hips,setHips]=useState("");
  const [result,setResult]=useState<{bf:number;category:string}|null>(null);
  function calculate(){
    const h=parseFloat(height),w=parseFloat(waist),n=parseFloat(neck),hi=parseFloat(hips);
    if(!h||!w||!n||(gender==="female"&&!hi))return;
    let bf:number;
    if(gender==="male"){bf=495/(1.0324-0.19077*Math.log10(w-n)+0.15456*Math.log10(h))-450;}
    else{bf=495/(1.29579-0.35004*Math.log10(w+hi-n)+0.22100*Math.log10(h))-450;}
    bf=Math.round(bf*10)/10;
    const cats=gender==="male"?[{l:6,u:13.9,n:"Athlete"},{l:14,u:17.9,n:"Fitness"},{l:18,u:24.9,n:"Average"},{l:25,u:Infinity,n:"Obese"}]:[{l:20,u:23.9,n:"Athlete"},{l:24,u:30.9,n:"Fitness"},{l:31,u:38.9,n:"Average"},{l:39,u:Infinity,n:"Obese"}];
    const category=bf<(gender==="male"?6:14)?"Essential Fat":cats.find(c=>bf>=c.l&&bf<=c.u)?.n??"Unknown";
    setResult({bf,category});
  }
  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">US Navy Method — requires body measurements in cm</p>
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["male","female"] as const).map(g=>(
          <button key={g} onClick={()=>{setGender(g);setResult(null);}} className={clsx("px-5 py-2 text-xs font-semibold capitalize transition-colors",gender===g?"bg-orange-500 text-white":"bg-background text-foreground-muted hover:bg-background-subtle")}>{g}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[{l:"Height (cm)",v:height,s:setHeight,p:"175"},{l:"Waist (cm)",v:waist,s:setWaist,p:"80"},{l:"Neck (cm)",v:neck,s:setNeck,p:"38"},
          ...(gender==="female"?[{l:"Hips (cm)",v:hips,s:setHips,p:"95"}]:[])].map(({l,v,s,p})=>(
          <div key={l} className="space-y-2"><label className="text-sm font-medium text-foreground block">{l}</label><input type="number" className={inputClass} value={v} onChange={e=>{s(e.target.value);setResult(null);}} placeholder={p} min="0"/></div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!height||!waist||!neck}>Calculate Body Fat</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={clsx(resultCard,"text-center space-y-2")}>
        <div className="text-4xl font-black text-orange-500">{result.bf}%</div>
        <p className="text-sm font-semibold text-foreground">{result.category}</p>
        <p className="text-xs text-foreground-muted">Body Fat Percentage</p>
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pregnancy Due Date Calculator
// ─────────────────────────────────────────────────────────────────────────────

function PregnancyCalc() {
  const [lmp,setLmp]=useState("");const [result,setResult]=useState<{edd:string;weeks:number;days:number;trimester:number;daysLeft:number}|null>(null);
  function calculate(){
    if(!lmp)return;
    const lmpDate=new Date(lmp);
    const edd=new Date(lmpDate.getTime()+280*24*60*60*1000);
    const today=new Date(); const diffMs=today.getTime()-lmpDate.getTime();
    const totalDaysPregnant=Math.max(0,Math.floor(diffMs/(24*60*60*1000)));
    const weeks=Math.floor(totalDaysPregnant/7); const days=totalDaysPregnant%7;
    const trimester=weeks<13?1:weeks<27?2:3;
    const daysLeft=Math.max(0,Math.ceil((edd.getTime()-today.getTime())/(24*60*60*1000)));
    setResult({edd:edd.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),weeks,days,trimester,daysLeft});
  }
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">First Day of Last Menstrual Period (LMP)</label>
        <input type="date" className={inputClass} value={lmp} onChange={e=>{setLmp(e.target.value);setResult(null);}} max={new Date().toISOString().slice(0,10)}/>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!lmp}>Calculate Due Date</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3">
        <div className={clsx(resultCard,"text-center bg-pink-50 dark:bg-pink-900/20")}>
          <p className="text-xs text-foreground-muted">Expected Due Date</p>
          <p className="text-2xl font-black text-pink-600">{result.edd}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{l:"Week",v:result.weeks},{l:"Extra Days",v:result.days},{l:"Trimester",v:result.trimester},{l:"Days Remaining",v:result.daysLeft}].map(({l,v})=>(
            <div key={l} className={clsx(resultCard,"text-center")}><div className="text-2xl font-bold text-foreground">{v}</div><div className="text-xs text-foreground-muted mt-0.5">{l}</div></div>
          ))}
        </div>
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ideal Weight Calculator
// ─────────────────────────────────────────────────────────────────────────────

function IdealWeightCalc() {
  const [gender,setGender]=useState<"male"|"female">("male");const [height,setHeight]=useState("");
  const [result,setResult]=useState<Record<string,number>|null>(null);
  function calculate(){
    const h=parseFloat(height);if(!h||isNaN(h))return;
    const hi=(h-100)/2.54; // inches
    const base=gender==="male"?50:45.5;const baseIn=gender==="male"?60:60;
    const devine=base+2.3*(hi-baseIn);
    const robinson=base+0.75*(hi-baseIn); const miller=base+2.2*(hi-baseIn);
    const hamwi=gender==="male"?48+2.7*(hi-60):45.5+2.2*(hi-60);
    setResult({Devine:Math.round(devine),Robinson:Math.round(robinson),Miller:Math.round(miller),Hamwi:Math.round(hamwi)});
  }
  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["male","female"] as const).map(g=>(
          <button key={g} onClick={()=>{setGender(g);setResult(null);}} className={clsx("px-5 py-2 text-xs font-semibold capitalize transition-colors",gender===g?"bg-orange-500 text-white":"bg-background text-foreground-muted hover:bg-background-subtle")}>{g}</button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Height (cm)</label>
        <input type="number" className={inputClass} value={height} onChange={e=>{setHeight(e.target.value);setResult(null);}} placeholder="170" min="100" max="250"/>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!height}>Calculate Ideal Weight</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-2 gap-3">
        {Object.entries(result).map(([formula,kg])=>(
          <div key={formula} className={clsx(resultCard,"text-center")}>
            <div className="text-xl font-bold text-orange-500">{kg} kg</div>
            <div className="text-xs text-foreground-muted mt-0.5">{formula} Formula</div>
          </div>
        ))}
        <div className={clsx(resultCard,"col-span-2 text-center")}>
          <p className="text-sm text-foreground-muted">Average: <span className="font-bold text-foreground">{Math.round(Object.values(result).reduce((s,v)=>s+v,0)/4)} kg</span></p>
        </div>
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Water Intake Calculator
// ─────────────────────────────────────────────────────────────────────────────

function WaterCalc() {
  const [weight,setWeight]=useState("");const [activity,setActivity]=useState("moderate");const [climate,setClimate]=useState("normal");
  const [result,setResult]=useState<{liters:number;glasses:number;ml:number}|null>(null);
  function calculate(){
    const w=parseFloat(weight);if(!w||isNaN(w))return;
    let base=w*35; // ml
    if(activity==="light")base*=1;else if(activity==="moderate")base*=1.1;else if(activity==="active")base*=1.25;else base*=1.4;
    if(climate==="hot")base*=1.15;else if(climate==="cold")base*=0.9;
    const ml=Math.round(base);
    setResult({ml,liters:Math.round(ml/100)/10,glasses:Math.round(ml/250)});
  }
  return (
    <div className="space-y-5">
      <div className="space-y-2"><label className="text-sm font-medium text-foreground block">Body Weight (kg)</label><input type="number" className={inputClass} value={weight} onChange={e=>{setWeight(e.target.value);setResult(null);}} placeholder="70" min="0"/></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Activity Level</label>
          <select className={inputClass} value={activity} onChange={e=>{setActivity(e.target.value);setResult(null);}}>
            {[["sedentary","Sedentary (desk job)"],["light","Light (1-3 days/week)"],["moderate","Moderate (3-5 days)"],["active","Active (6-7 days)"],["very-active","Very Active (athlete)"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Climate</label>
          <select className={inputClass} value={climate} onChange={e=>{setClimate(e.target.value);setResult(null);}}>
            {[["cold","Cold"],["normal","Normal"],["hot","Hot / Humid"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!weight}>Calculate Water Intake</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-3 gap-3">
        {[{l:"Daily Water",v:`${result.liters}L`,h:true},{l:"Milliliters",v:`${result.ml} ml`,h:false},{l:"Glasses (250ml)",v:`${result.glasses}`,h:false}].map(({l,v,h})=>(
          <div key={l} className={clsx(resultCard,"text-center")}><div className={clsx("text-xl font-bold",h?"text-blue-500":"text-foreground")}>{v}</div><div className="text-xs text-foreground-muted mt-0.5">{l}</div></div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sleep Calculator
// ─────────────────────────────────────────────────────────────────────────────

function SleepCalc() {
  const [mode,setMode]=useState<"wake"|"sleep">("wake");const [time,setTime]=useState("");
  const [times,setTimes]=useState<string[]|null>(null);
  function calculate(){
    if(!time)return;
    const [h,m]=time.split(":").map(Number);const base=new Date();base.setHours(h,m,0,0);
    const CYCLE=90*60*1000; const FALLASLEEP=14*60*1000;
    const results:string[]=[];
    for(let cycles=6;cycles>=4;cycles--){
      let target:Date;
      if(mode==="wake"){target=new Date(base.getTime()-(cycles*CYCLE+FALLASLEEP));}
      else{target=new Date(base.getTime()+cycles*CYCLE+FALLASLEEP);}
      const th=target.getHours(),tm=target.getMinutes();
      results.push(`${String(th).padStart(2,"0")}:${String(tm).padStart(2,"0")} (${cycles} cycles = ${cycles*1.5}h)`);
    }
    setTimes(results);
  }
  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Based on 90-minute sleep cycles. Takes ~14 min to fall asleep.</p>
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["wake","sleep"] as const).map(m=>(
          <button key={m} onClick={()=>{setMode(m);setTimes(null);}} className={clsx("px-5 py-2 text-xs font-semibold transition-colors",mode===m?"bg-orange-500 text-white":"bg-background text-foreground-muted hover:bg-background-subtle")}>
            {m==="wake"?"I want to wake at…":"I need to sleep at…"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">{mode==="wake"?"Wake Up Time":"Bedtime"}</label>
        <input type="time" className={inputClass} value={time} onChange={e=>{setTime(e.target.value);setTimes(null);}}/>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!time}>Find Sleep Times</button>
      {times&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{mode==="wake"?"Suggested bedtimes:":"Wake up at:"}</p>
        {times.map((t,i)=>(
          <div key={i} className={clsx(resultCard,"flex justify-between items-center")}>
            <span className="text-base font-bold text-foreground font-mono">{t.split(" ")[0]}</span>
            <span className="text-xs text-foreground-muted">{t.split(" ").slice(1).join(" ")}</span>
            {i===0&&<span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">Best</span>}
          </div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Electricity Bill Calculator
// ─────────────────────────────────────────────────────────────────────────────

type Appliance={id:number;name:string;watts:string;hours:string;days:string};

function ElectricityCalc() {
  const [appliances,setAppliances]=useState<Appliance[]>([{id:1,name:"AC",watts:"1500",hours:"8",days:"30"},{id:2,name:"Fan",watts:"75",hours:"12",days:"30"},{id:3,name:"LED TV",watts:"100",hours:"5",days:"30"}]);
  const [rate,setRate]=useState("8");const [result,setResult]=useState<{totalUnits:number;monthlyCost:number;annualCost:number}|null>(null);
  function addAppliance(){setAppliances(p=>[...p,{id:Date.now(),name:"",watts:"",hours:"",days:"30"}]);}
  function update(id:number,f:keyof Appliance,v:string){setAppliances(p=>p.map(a=>a.id===id?{...a,[f]:v}:a));setResult(null);}
  function calculate(){
    const r=parseFloat(rate)||8;
    const totalUnits=appliances.reduce((s,a)=>{
      const w=parseFloat(a.watts),h=parseFloat(a.hours),d=parseFloat(a.days);
      return s+(w&&h&&d?(w*h*d)/1000:0);
    },0);
    setResult({totalUnits:Math.round(totalUnits*100)/100,monthlyCost:Math.round(totalUnits*r),annualCost:Math.round(totalUnits*r*12)});
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-foreground-muted uppercase tracking-wide">
          <span className="col-span-4">Appliance</span><span className="col-span-2">Watts</span><span className="col-span-2">Hrs/Day</span><span className="col-span-2">Days</span><span className="col-span-2"></span>
        </div>
        {appliances.map(a=>(
          <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
            <input className={clsx(inputClass,"col-span-4 py-2")} value={a.name} onChange={e=>update(a.id,"name",e.target.value)} placeholder="Appliance"/>
            <input type="number" className={clsx(inputClass,"col-span-2 py-2")} value={a.watts} onChange={e=>update(a.id,"watts",e.target.value)} placeholder="W" min="0"/>
            <input type="number" className={clsx(inputClass,"col-span-2 py-2")} value={a.hours} onChange={e=>update(a.id,"hours",e.target.value)} placeholder="h" min="0" max="24"/>
            <input type="number" className={clsx(inputClass,"col-span-2 py-2")} value={a.days} onChange={e=>update(a.id,"days",e.target.value)} placeholder="days" min="0" max="31"/>
            <button onClick={()=>setAppliances(p=>p.filter(x=>x.id!==a.id))} className="col-span-2 text-foreground-muted hover:text-rose-500 text-lg text-center">×</button>
          </div>
        ))}
        <button onClick={addAppliance} className="text-xs font-semibold text-orange-500 hover:text-orange-600">+ Add Appliance</button>
      </div>
      <div className="space-y-2"><label className="text-sm font-medium text-foreground block">Electricity Rate (₹/unit)</label><input type="number" className={inputClass} value={rate} onChange={e=>{setRate(e.target.value);setResult(null);}} placeholder="8" min="0"/></div>
      <button className={primaryBtn} onClick={calculate}>Calculate Bill</button>
      {result&&(<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-cols-3 gap-3">
        {[{l:"Units (kWh)",v:result.totalUnits,h:false},{l:"Monthly Bill",v:`₹${fmt(result.monthlyCost)}`,h:true},{l:"Annual Cost",v:`₹${fmt(result.annualCost)}`,h:false}].map(({l,v,h})=>(
          <div key={l} className={clsx(resultCard,"text-center")}><div className={clsx("text-xl font-bold",h?"text-orange-500":"text-foreground")}>{v}</div><div className="text-xs text-foreground-muted mt-0.5">{l}</div></div>
        ))}
      </motion.div>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scientific Calculator
// ─────────────────────────────────────────────────────────────────────────────

function safeEval(expr: string, toRad: number): number {
  const sin = (x: number) => Math.sin(x * toRad);
  const cos = (x: number) => Math.cos(x * toRad);
  const tan = (x: number) => Math.tan(x * toRad);
  const sqrt = Math.sqrt, log = Math.log10, ln = Math.log, abs = Math.abs, cbrt = Math.cbrt;
  const PI = Math.PI, E = Math.E;
  const e = expr.toLowerCase()
    .replace(/\^/g, "**").replace(/\bpi\b/g, String(PI)).replace(/\be\b/g, String(E))
    .replace(/\bsqrt\b/g, "sqrt").replace(/\bcbrt\b/g, "cbrt")
    .replace(/\bsin\b/g, "sin").replace(/\bcos\b/g, "cos").replace(/\btan\b/g, "tan")
    .replace(/\bln\b/g, "ln").replace(/\blog\b/g, "log").replace(/\babs\b/g, "abs");
  // eslint-disable-next-line no-new-func
  return Function("sin","cos","tan","sqrt","cbrt","log","ln","abs","PI","E", `"use strict"; return (${e});`)(sin,cos,tan,sqrt,cbrt,log,ln,abs,PI,E);
}

function ScientificCalc() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");

  const ins = (s: string) => setExpr(p => p + s);

  function evaluate() {
    if (!expr.trim()) return;
    try {
      const toRad = angleMode === "deg" ? Math.PI / 180 : 1;
      const res = safeEval(expr, toRad);
      if (!isFinite(res) || isNaN(res)) throw new Error("Undefined");
      setResult(parseFloat(res.toPrecision(12)).toString());
      setError(null);
    } catch { setError("Invalid expression"); setResult(null); }
  }

  const btnClass = (variant: "fn" | "num" | "op" | "eq") => clsx(
    "h-10 rounded-lg text-sm font-semibold border transition-colors",
    variant === "fn" && "bg-background-subtle border-border text-foreground-muted hover:border-orange-400 hover:text-orange-500 text-xs",
    variant === "num" && "bg-background border-border text-foreground hover:bg-background-subtle",
    variant === "op" && "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-600 hover:bg-orange-100",
    variant === "eq" && "bg-gradient-to-r from-orange-500 to-amber-400 text-white border-transparent hover:opacity-90"
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {(["deg","rad"] as const).map(m => (
          <button key={m} onClick={() => setAngleMode(m)} className={clsx("px-3 py-1 text-xs font-bold rounded-lg border uppercase transition-colors", angleMode===m?"bg-orange-500 text-white border-orange-500":"bg-background border-border text-foreground-muted")}>{m}</button>
        ))}
        <span className="text-xs text-foreground-muted">Angle mode for trig functions</span>
      </div>

      <div className="space-y-2">
        <input className={clsx(inputClass, "font-mono text-base")} value={expr} onChange={e => { setExpr(e.target.value); setResult(null); setError(null); }} placeholder="e.g.  sin(45) + sqrt(16) * pi" onKeyDown={e => e.key === "Enter" && evaluate()} />
        {result !== null && <div className={clsx(resultCard, "text-center")}><span className="text-sm text-foreground-muted">= </span><span className="text-2xl font-bold text-orange-500">{result}</span></div>}
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {[
          {l:"sin",a:()=>ins("sin("),v:"fn"},{l:"cos",a:()=>ins("cos("),v:"fn"},{l:"tan",a:()=>ins("tan("),v:"fn"},
          {l:"log",a:()=>ins("log("),v:"fn"},{l:"ln",a:()=>ins("ln("),v:"fn"},{l:"√",a:()=>ins("sqrt("),v:"fn"},
          {l:"x²",a:()=>ins("^2"),v:"fn"},{l:"xⁿ",a:()=>ins("^"),v:"fn"},{l:"π",a:()=>ins("pi"),v:"fn"},
          {l:"e",a:()=>ins("e"),v:"fn"},{l:"(",a:()=>ins("("),v:"fn"},{l:")",a:()=>ins(")"),v:"fn"},
          {l:"7",a:()=>ins("7"),v:"num"},{l:"8",a:()=>ins("8"),v:"num"},{l:"9",a:()=>ins("9"),v:"num"},
          {l:"÷",a:()=>ins("/"),v:"op"},{l:"4",a:()=>ins("4"),v:"num"},{l:"5",a:()=>ins("5"),v:"num"},
          {l:"6",a:()=>ins("6"),v:"num"},{l:"×",a:()=>ins("*"),v:"op"},{l:"1",a:()=>ins("1"),v:"num"},
          {l:"2",a:()=>ins("2"),v:"num"},{l:"3",a:()=>ins("3"),v:"num"},{l:"−",a:()=>ins("-"),v:"op"},
          {l:"0",a:()=>ins("0"),v:"num"},{l:".",a:()=>ins("."),v:"num"},{l:"%",a:()=>ins("%"),v:"op"},
          {l:"+",a:()=>ins("+"),v:"op"},{l:"⌫",a:()=>setExpr(p=>p.slice(0,-1)),v:"op"},{l:"C",a:()=>{setExpr("");setResult(null);setError(null);},v:"op"},
        ].map(({l,a,v}) => (
          <button key={l} className={btnClass(v as "fn"|"num"|"op"|"eq")} onClick={a}>{l}</button>
        ))}
        <button className={clsx(btnClass("eq"),"col-span-6")} onClick={evaluate}>=</button>
      </div>
      <p className="text-xs text-foreground-muted text-center">Type or click buttons. Supports: sin, cos, tan, log, ln, sqrt, cbrt, abs, pi, e, ^ (power)</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calorie / BMR / TDEE Calculator
// ─────────────────────────────────────────────────────────────────────────────

function CalorieCalc() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [result, setResult] = useState<{ bmr: number; tdee: number } | null>(null);

  const activityLevels = [
    { label: "Sedentary (office job, no exercise)", value: 1.2 },
    { label: "Lightly active (1-3 days/week)", value: 1.375 },
    { label: "Moderately active (3-5 days/week)", value: 1.55 },
    { label: "Very active (6-7 days/week)", value: 1.725 },
    { label: "Extra active (athlete / physical job)", value: 1.9 },
  ];

  function calculate() {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a) return;
    const bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    setResult({ bmr: Math.round(bmr), tdee: Math.round(bmr * activity) });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-foreground-muted">Mifflin-St Jeor formula — most accurate for general population</p>
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {(["male","female"] as const).map(g => (
          <button key={g} onClick={() => { setGender(g); setResult(null); }}
            className={clsx("px-5 py-2 text-xs font-semibold capitalize transition-colors", gender===g?"bg-orange-500 text-white":"bg-background text-foreground-muted hover:bg-background-subtle")}>
            {g}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Age (years)", value: age, set: setAge, placeholder: "25" },
          { label: "Weight (kg)", value: weight, set: setWeight, placeholder: "70" },
          { label: "Height (cm)", value: height, set: setHeight, placeholder: "170" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{label}</label>
            <input type="number" className={inputClass} value={value} onChange={e => { set(e.target.value); setResult(null); }} placeholder={placeholder} min="0" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Activity Level</label>
        <select className={inputClass} value={activity} onChange={e => { setActivity(parseFloat(e.target.value)); setResult(null); }}>
          {activityLevels.map(al => <option key={al.value} value={al.value}>{al.label}</option>)}
        </select>
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!age || !weight || !height}>Calculate Calories</button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-2xl font-bold text-foreground">{result.bmr.toLocaleString()}</div>
              <div className="text-xs text-foreground-muted mt-0.5">BMR (kcal/day)</div>
              <div className="text-xs text-foreground-muted">Calories at rest</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-2xl font-bold text-orange-500">{result.tdee.toLocaleString()}</div>
              <div className="text-xs text-foreground-muted mt-0.5">TDEE (kcal/day)</div>
              <div className="text-xs text-foreground-muted">Calories to maintain weight</div>
            </div>
          </div>
          <div className={resultCard}>
            <p className="text-xs font-semibold text-foreground-muted mb-2">Daily Calorie Goals</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { goal: "Extreme loss", cal: result.tdee - 1000, color: "text-rose-600" },
                { goal: "Weight loss", cal: result.tdee - 500, color: "text-amber-600" },
                { goal: "Maintain", cal: result.tdee, color: "text-foreground" },
                { goal: "Weight gain", cal: result.tdee + 500, color: "text-emerald-600" },
              ].map(({ goal, cal, color }) => (
                <div key={goal} className="text-center">
                  <div className={clsx("text-base font-bold", color)}>{cal.toLocaleString()}</div>
                  <div className="text-xs text-foreground-muted">{goal}</div>
                </div>
              ))}
            </div>
          </div>
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
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(1);

  const billNum = parseFloat(bill) || 0;
  const tipAmount = (billNum * tipPct) / 100;
  const totalAmount = billNum + tipAmount;
  const perPerson = people > 0 ? totalAmount / people : totalAmount;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Bill Amount</label>
        <input type="number" className={inputClass} value={bill} onChange={e => setBill(e.target.value)} placeholder="500.00" min="0" step="0.01" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Tip Percentage</label>
          <span className="text-lg font-bold text-orange-500">{tipPct}%</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {[5, 10, 15, 18, 20, 25].map(p => (
            <button key={p} onClick={() => setTipPct(p)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                tipPct === p ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-foreground-muted hover:border-orange-500/50")}>
              {p}%
            </button>
          ))}
        </div>
        <input type="range" min={0} max={50} value={tipPct} onChange={e => setTipPct(Number(e.target.value))} className="w-full accent-orange-500" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">Split Between (people)</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setPeople(p => Math.max(1, p - 1))} className="h-10 w-10 rounded-xl border border-border bg-background text-foreground hover:bg-background-subtle text-lg font-bold transition-colors">&minus;</button>
          <span className="text-2xl font-bold text-foreground w-8 text-center">{people}</span>
          <button onClick={() => setPeople(p => p + 1)} className="h-10 w-10 rounded-xl border border-border bg-background text-foreground hover:bg-background-subtle text-lg font-bold transition-colors">+</button>
        </div>
      </div>
      {billNum > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tip Amount", value: `${tipAmount.toFixed(2)}` },
            { label: "Total Bill", value: `${totalAmount.toFixed(2)}` },
            { label: "Per Person", value: `${perPerson.toFixed(2)}`, highlight: true },
            { label: "Tip/Person", value: `${(tipAmount / people).toFixed(2)}` },
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
    { id: "saleprice", label: "Sale Price", la: "Original Price", lb: "Discount (%)" },
    { id: "findpct", label: "Find Discount %", la: "Original Price", lb: "Sale Price" },
    { id: "original", label: "Find Original", la: "Sale Price", lb: "Discount (%)" },
  ];

  function calculate() {
    const na = parseFloat(a), nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return;
    if (mode === "saleprice") {
      const disc = na * (nb / 100);
      setResult(`Sale Price: ${(na - disc).toFixed(2)}  (you save ${disc.toFixed(2)})`);
    } else if (mode === "findpct") {
      setResult(`${(((na - nb) / na) * 100).toFixed(2)}% discount`);
    } else {
      setResult(`Original Price: ${(na / (1 - nb / 100)).toFixed(2)}`);
    }
  }

  const activeMode = modes.find(m => m.id === mode)!;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {modes.map(m => (
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
            <input type="number" className={inputClass} value={val} onChange={e => { set(e.target.value); setResult(null); }} placeholder="0" min="0" />
          </div>
        ))}
      </div>
      <button className={primaryBtn} onClick={calculate} disabled={!a || !b}>Calculate</button>
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
  "date-diff": "Date Calculator",
  sip: "SIP / Investment Calculator",
  gst: "GST Calculator",
  "income-tax": "Income Tax Calculator (India)",
  fd: "Fixed Deposit Calculator",
  salary: "In-Hand Salary Calculator",
  unit: "Unit Converter",
  fuel: "Fuel Cost Calculator",
  scientific: "Scientific Calculator",
  calorie: "Calorie & TDEE Calculator",
  tip: "Tip Calculator",
  discount: "Discount Calculator",
  mortgage: "Mortgage / Home Loan Calculator",
  roi: "ROI Calculator",
  "profit-margin": "Profit Margin Calculator",
  gpa: "GPA Calculator",
  fraction: "Fraction Calculator",
  statistics: "Statistics Calculator",
  "body-fat": "Body Fat % Calculator",
  pregnancy: "Pregnancy Due Date Calculator",
  "ideal-weight": "Ideal Weight Calculator",
  "water-intake": "Water Intake Calculator",
  sleep: "Sleep Calculator",
  electricity: "Electricity Bill Calculator",
};

export function CalcWorkspace({ tool }: { tool: Tool }) {
  function renderCalc() {
    switch (tool.slug) {
      case "age": return <AgeCalc />;
      case "bmi": return <BmiCalc />;
      case "percentage": return <PctCalc />;
      case "emi": return <EmiCalc />;
      case "date-diff": return <DateCalc />;
      case "sip": return <SipCalc />;
      case "gst": return <GstCalc />;
      case "income-tax": return <IncomeTaxCalc />;
      case "fd": return <FdCalc />;
      case "salary": return <SalaryCalc />;
      case "unit": return <UnitCalc />;
      case "fuel": return <FuelCalc />;
      case "scientific": return <ScientificCalc />;
      case "calorie": return <CalorieCalc />;
      case "tip": return <TipCalc />;
      case "discount": return <DiscountCalc />;
      case "mortgage": return <MortgageCalc />;
      case "roi": return <RoiCalc />;
      case "profit-margin": return <ProfitCalc />;
      case "gpa": return <GpaCalc />;
      case "fraction": return <FractionCalc />;
      case "statistics": return <StatsCalc />;
      case "body-fat": return <BodyFatCalc />;
      case "pregnancy": return <PregnancyCalc />;
      case "ideal-weight": return <IdealWeightCalc />;
      case "water-intake": return <WaterCalc />;
      case "sleep": return <SleepCalc />;
      case "electricity": return <ElectricityCalc />;
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
