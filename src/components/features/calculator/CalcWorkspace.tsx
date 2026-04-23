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
