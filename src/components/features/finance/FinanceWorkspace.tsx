"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import type { Tool } from "@/types";
import {
  Receipt,
  Calculator,
  Percent,
  TrendingUp,
  BarChart3,
  DollarSign,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";

const resultCard =
  "rounded-xl border border-card-border bg-background-subtle p-4";

const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryBtn =
  "h-11 px-6 rounded-xl border border-border bg-background text-foreground font-medium text-sm hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const fmt = (n: number, decimals = 2) => n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// ─────────────────────────────────────────────────────────────────────────────
// GST Calculator
// ─────────────────────────────────────────────────────────────────────────────

function GSTCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("18");
  const [result, setResult] = useState<{
    base: number;
    gst: number;
    inclusive: number;
    exclusive: number;
  } | null>(null);

  function calculate() {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (!a || !r) return;

    const exclusive = a;
    const gst = exclusive * (r / 100);
    const inclusive = exclusive + gst;

    setResult({
      base: exclusive,
      gst,
      inclusive,
      exclusive,
    });
  }

  const rates = ["5", "12", "18", "28"];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Amount (INR)</label>
        <input
          type="number"
          className={inputClass}
          placeholder="e.g. 10000"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setResult(null); }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">GST Rate (%)</label>
        <div className="grid grid-cols-4 gap-2">
          {rates.map((r) => (
            <button
              key={r}
              onClick={() => { setRate(r); setResult(null); }}
              className={clsx(
                "h-10 rounded-lg text-sm font-medium transition-colors border",
                rate === r
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-border text-foreground-muted hover:border-primary"
              )}
            >
              {r}%
            </button>
          ))}
        </div>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate GST</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center border-blue-200 bg-blue-50")}>
              <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Base Amount</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                ₹{fmt(result.base)}
              </div>
            </div>
            <div className={clsx(resultCard, "text-center border-orange-200 bg-orange-50")}>
              <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide">GST ({rate}%)</div>
              <div className="text-2xl font-bold text-orange-500 mt-1">
                ₹{fmt(result.gst)}
              </div>
            </div>
          </div>
          <div className={clsx(resultCard, "text-center border-emerald-200 bg-emerald-50")}>
            <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Total (GST Inclusive)</div>
            <div className="text-3xl font-bold text-emerald-600">
              ₹{fmt(result.inclusive)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Exclusive Price</div>
              <div className="text-lg font-bold text-foreground">₹{fmt(result.exclusive)}</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Inclusive Price</div>
              <div className="text-lg font-bold text-emerald-500">₹{fmt(result.inclusive)}</div>
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

function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState("15");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<{
    tip: number;
    total: number;
    perPerson: number;
    tipPerPerson: number;
  } | null>(null);

  function calculate() {
    const b = parseFloat(bill);
    const p = parseFloat(tipPct);
    const n = parseInt(people) || 1;
    if (!b) return;

    const tipAmount = b * (p / 100);
    const total = b + tipAmount;
    const perPerson = total / n;
    const tipPerPerson = tipAmount / n;

    setResult({ tip: tipAmount, total, perPerson, tipPerPerson });
  }

  const presets = ["10", "15", "18", "20", "25"];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Bill Amount (₹)</label>
        <input
          type="number"
          className={inputClass}
          placeholder="e.g. 1500"
          value={bill}
          onChange={(e) => { setBill(e.target.value); setResult(null); }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Tip Percentage</label>
        <div className="flex gap-2 mb-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => { setTipPct(p); setResult(null); }}
              className={clsx(
                "flex-1 h-9 rounded-lg text-xs font-medium transition-colors border",
                tipPct === p ? "bg-orange-500 text-white border-orange-500" : "border-border text-foreground-muted hover:border-primary"
              )}
            >
              {p}%
            </button>
          ))}
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={tipPct}
          onChange={(e) => { setTipPct(e.target.value); setResult(null); }}
          className="w-full accent-orange-500"
        />
        <div className="text-center text-sm font-medium text-foreground">{tipPct}%</div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Number of People</label>
        <input type="number" className={inputClass} placeholder="e.g. 4" min="1" value={people} onChange={(e) => { setPeople(e.target.value); setResult(null); }} />
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Tip</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, "text-center border-emerald-200 bg-emerald-50")}>
            <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Total per Person</div>
            <div className="text-4xl font-bold text-emerald-600">
              ₹{fmt(result.perPerson)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Bill</div>
              <div className="text-lg font-bold text-foreground">₹{fmt(parseFloat(bill) || 0)}</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Tip ({tipPct}%)</div>
              <div className="text-lg font-bold text-orange-500">₹{fmt(result.tip)}</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Total</div>
              <div className="text-lg font-bold text-foreground">₹{fmt(result.total)}</div>
            </div>
          </div>
          <div className={clsx(resultCard, "text-center")}>
            <div className="text-xs text-foreground-muted">Tip per Person</div>
            <div className="text-sm font-bold text-orange-400">₹{fmt(result.tipPerPerson)}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROI Calculator
// ─────────────────────────────────────────────────────────────────────────────

function ROICalculator() {
  const [cost, setCost] = useState("");
  const [returnAmt, setReturnAmt] = useState("");
  const [days, setDays] = useState("");
  const [result, setResult] = useState<{ roi: number; annualized: number } | null>(null);

  function calculate() {
    const c = parseFloat(cost);
    const r = parseFloat(returnAmt);
    if (!c || !r) return;

    const roi = ((r - c) / c) * 100;
    const d = parseInt(days) || 365;
    const annualized = (roi / d) * 365;

    setResult({ roi: Math.round(roi * 100) / 100, annualized: Math.round(annualized * 100) / 100 });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Investment Cost (₹)</label>
        <input type="number" className={inputClass} placeholder="e.g. 100000" value={cost} onChange={(e) => { setCost(e.target.value); setResult(null); }} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Return Amount (₹)</label>
        <input type="number" className={inputClass} placeholder="e.g. 125000" value={returnAmt} onChange={(e) => { setReturnAmt(e.target.value); setResult(null); }} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Holding Period (days)</label>
        <input type="number" className={inputClass} placeholder="e.g. 365" value={days} onChange={(e) => { setDays(e.target.value); setResult(null); }} />
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate ROI</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, result.roi >= 0 ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50", "text-center")}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: result.roi >= 0 ? "#10b981" : "#f43f5e" }}>
              {result.roi >= 0 ? "Net Profit" : "Net Loss"}
            </div>
            <div className="text-3xl font-bold" style={{ color: result.roi >= 0 ? "#10b981" : "#f43f5e" }}>
              {result.roi >= 0 ? "+" : ""}{fmt(result.roi)}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Total ROI</div>
              <div className="text-xl font-bold text-foreground">{fmt(result.roi)}%</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Annualized ROI</div>
              <div className="text-xl font-bold text-orange-500">{fmt(result.annualized)}%</div>
            </div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            ROI = (Return - Cost) / Cost × 100. Annualized = ROI × (365 / days).
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profit Margin Calculator
// ─────────────────────────────────────────────────────────────────────────────

function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState("");
  const [cogs, setCogs] = useState("");
  const [opex, setOpex] = useState("");
  const [tax, setTax] = useState("");
  const [result, setResult] = useState<{
    grossProfit: number;
    grossMargin: number;
    operatingProfit: number;
    operatingMargin: number;
    netProfit: number;
    netMargin: number;
  } | null>(null);

  function calculate() {
    const rev = parseFloat(revenue) || 0;
    const c = parseFloat(cogs) || 0;
    const op = parseFloat(opex) || 0;
    const t = parseFloat(tax) || 0;
    if (!rev) return;

    const grossProfit = rev - c;
    const grossMargin = (grossProfit / rev) * 100;
    const operatingProfit = grossProfit - op;
    const operatingMargin = (operatingProfit / rev) * 100;
    const netProfit = operatingProfit - t;
    const netMargin = (netProfit / rev) * 100;

    setResult({
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMargin: Math.round(grossMargin * 100) / 100,
      operatingProfit: Math.round(operatingProfit * 100) / 100,
      operatingMargin: Math.round(operatingMargin * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      netMargin: Math.round(netMargin * 100) / 100,
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Total Revenue (₹)</label>
        <input type="number" className={inputClass} placeholder="e.g. 1000000" value={revenue} onChange={(e) => { setRevenue(e.target.value); setResult(null); }} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Cost of Goods Sold (₹)</label>
          <input type="number" className={inputClass} placeholder="e.g. 400000" value={cogs} onChange={(e) => { setCogs(e.target.value); setResult(null); }} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Operating Expenses (₹)</label>
          <input type="number" className={inputClass} placeholder="e.g. 200000" value={opex} onChange={(e) => { setOpex(e.target.value); setResult(null); }} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-foreground">Taxes (₹)</label>
          <input type="number" className={inputClass} placeholder="e.g. 50000" value={tax} onChange={(e) => { setTax(e.target.value); setResult(null); }} />
        </div>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Margins</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {/* Gross Margin */}
          <div className={clsx(resultCard, "border-blue-200 bg-blue-50")}>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Gross Profit & Margin</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-blue-700">₹{fmt(result.grossProfit, 0)}</div>
              <div className="text-2xl font-bold text-blue-500">{fmt(result.grossMargin)}%</div>
            </div>
            <div className="text-xs text-blue-400 mt-1">Revenue - COGS</div>
          </div>

          {/* Operating Margin */}
          <div className={clsx(resultCard, "border-amber-200 bg-amber-50")}>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Operating Profit & Margin</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-amber-700">₹{fmt(result.operatingProfit, 0)}</div>
              <div className="text-2xl font-bold text-amber-500">{fmt(result.operatingMargin)}%</div>
            </div>
            <div className="text-xs text-amber-400 mt-1">Gross Profit - Operating Expenses</div>
          </div>

          {/* Net Margin */}
          <div className={clsx(resultCard, "border-emerald-200 bg-emerald-50")}>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Net Profit & Margin</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-emerald-700">₹{fmt(result.netProfit, 0)}</div>
              <div className="text-2xl font-bold text-emerald-500">{fmt(result.netMargin)}%</div>
            </div>
            <div className="text-xs text-emerald-400 mt-1">Operating Profit - Taxes</div>
          </div>

          {/* Bar visualization */}
          <div className={resultCard}>
            <div className="text-xs font-medium text-foreground mb-2">Margin Comparison</div>
            {[
              { label: "Gross", value: result.grossMargin, color: "bg-blue-500" },
              { label: "Operating", value: result.operatingMargin, color: "bg-amber-500" },
              { label: "Net", value: result.netMargin, color: "bg-emerald-500" },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-3 mb-1.5">
                <div className="w-16 text-xs text-foreground-muted">{bar.label}</div>
                <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full", bar.color)}
                    style={{ width: `${Math.max(0, bar.value)}%` }}
                  />
                </div>
                <div className="w-12 text-xs font-medium text-foreground text-right">{fmt(bar.value)}%</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Startup Valuation Calculator
// ─────────────────────────────────────────────────────────────────────────────

function StartupValuationCalculator() {
  const [revenue, setRevenue] = useState("");
  const [users, setUsers] = useState("");
  const [industry, setIndustry] = useState<"saas" | "ecommerce" | "marketplace" | "fintech" | "consumer" | "other">("saas");
  const [stage, setStage] = useState<"pre-seed" | "seed" | "series-a" | "series-b">("seed");
  const [result, setResult] = useState<{
    revenueMultiple: number;
    userMultiple: number;
    finalEstimate: number;
    rangeLow: number;
    rangeHigh: number;
  } | null>(null);

  const industryMultipliers = {
    saas: { revenue: 8, user: 50 },
    fintech: { revenue: 10, user: 40 },
    ecommerce: { revenue: 2, user: 20 },
    marketplace: { revenue: 5, user: 30 },
    consumer: { revenue: 3, user: 15 },
    other: { revenue: 4, user: 25 },
  };

  const stageFactors = {
    "pre-seed": 0.5,
    seed: 0.75,
    "series-a": 1.0,
    "series-b": 1.25,
  };

  function calculate() {
    const rev = parseFloat(revenue) || 0;
    const u = parseInt(users) || 0;
    const mult = industryMultipliers[industry];
    const sf = stageFactors[stage];

    const revenueValuation = rev > 0 ? rev * mult.revenue * sf : 0;
    const userValuation = u > 0 ? u * mult.user * sf : 0;

    // Weighted average
    const finalEstimate = rev > 0 && u > 0
      ? (revenueValuation * 0.6 + userValuation * 0.4)
      : Math.max(revenueValuation, userValuation);

    const rangeLow = finalEstimate * 0.6;
    const rangeHigh = finalEstimate * 1.4;

    setResult({
      revenueMultiple: mult.revenue,
      userMultiple: mult.user,
      finalEstimate: Math.round(finalEstimate),
      rangeLow: Math.round(rangeLow),
      rangeHigh: Math.round(rangeHigh),
    });
  }

  const industries: Array<{ value: typeof industry; label: string }> = [
    { value: "saas", label: "SaaS" },
    { value: "fintech", label: "Fintech" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "marketplace", label: "Marketplace" },
    { value: "consumer", label: "Consumer" },
    { value: "other", label: "Other" },
  ];

  const stages: Array<{ value: typeof stage; label: string }> = [
    { value: "pre-seed", label: "Pre-Seed" },
    { value: "seed", label: "Seed" },
    { value: "series-a", label: "Series A" },
    { value: "series-b", label: "Series B" },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Annual Revenue (₹)</label>
        <input type="number" className={inputClass} placeholder="e.g. 5000000" value={revenue} onChange={(e) => { setRevenue(e.target.value); setResult(null); }} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Number of Users</label>
        <input type="number" className={inputClass} placeholder="e.g. 10000" value={users} onChange={(e) => { setUsers(e.target.value); setResult(null); }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <select className={inputClass} value={industry} onChange={(e) => { setIndustry(e.target.value as typeof industry); setResult(null); }}>
            {industries.map((ind) => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Stage</label>
          <select className={inputClass} value={stage} onChange={(e) => { setStage(e.target.value as typeof stage); setResult(null); }}>
            {stages.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Valuation</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, "text-center border-violet-200 bg-violet-50")}>
            <div className="text-xs text-violet-600 font-semibold uppercase tracking-wide mb-1">Estimated Valuation</div>
            <div className="text-3xl font-bold text-violet-600">
              ₹{result.finalEstimate >= 10000000
                ? `${fmt(result.finalEstimate / 10000000, 1)} Cr`
                : result.finalEstimate >= 100000
                  ? `${fmt(result.finalEstimate / 100000, 1)} L`
                  : fmt(result.finalEstimate, 0)
              }
            </div>
          </div>
          <div className={clsx(resultCard, "text-center border-slate-200 bg-slate-50")}>
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-1">Valuation Range</div>
            <div className="text-lg font-bold text-slate-600">
              ₹{fmt(result.rangeLow / 100000, 0)}L — ₹{fmt(result.rangeHigh / 100000, 0)}L
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Revenue Multiple</div>
              <div className="text-lg font-bold text-orange-500">{result.revenueMultiple}x</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Per User Value</div>
              <div className="text-lg font-bold text-emerald-500">₹{result.userMultiple}</div>
            </div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            Estimates based on comparable transaction multiples and industry benchmarks. Actual valuation depends on growth rate, team, market, and other factors.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Generator
// ─────────────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  qty: string;
  rate: string;
}

interface InvoiceState {
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  taxRate: string;
  notes: string;
}

function InvoiceGenerator() {
  const [inv, setInv] = useState<InvoiceState>({
    companyName: "",
    companyAddress: "",
    clientName: "",
    clientAddress: "",
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ id: crypto.randomUUID(), description: "", qty: "1", rate: "" }],
    taxRate: "18",
    notes: "",
  });

  const [showPreview, setShowPreview] = useState(false);

  function addItem() {
    setInv((prev) => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: "", qty: "1", rate: "" }],
    }));
  }

  function removeItem(id: string) {
    setInv((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }

  function updateItem(id: string, field: keyof LineItem, value: string) {
    setInv((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }));
  }

  const subtotal = inv.items.reduce((sum, item) => {
    return sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
  }, 0);

  const taxAmt = subtotal * (parseFloat(inv.taxRate) || 0) / 100;
  const total = subtotal + taxAmt;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-foreground">Your Company Name</label>
          <input type="text" className={inputClass} placeholder="e.g. Acme Solutions Pvt. Ltd." value={inv.companyName} onChange={(e) => setInv((p) => ({ ...p, companyName: e.target.value }))} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-foreground">Your Address</label>
          <input type="text" className={inputClass} placeholder="e.g. 123 Business Park, Mumbai 400001" value={inv.companyAddress} onChange={(e) => setInv((p) => ({ ...p, companyAddress: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Invoice Number</label>
          <input type="text" className={inputClass} value={inv.invoiceNumber} readOnly />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Date</label>
          <input type="date" className={inputClass} value={inv.date} onChange={(e) => setInv((p) => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Client Name</label>
          <input type="text" className={inputClass} placeholder="e.g. Client Corp" value={inv.clientName} onChange={(e) => setInv((p) => ({ ...p, clientName: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Due Date</label>
          <input type="date" className={inputClass} value={inv.dueDate} onChange={(e) => setInv((p) => ({ ...p, dueDate: e.target.value }))} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-foreground">Client Address</label>
          <input type="text" className={inputClass} placeholder="e.g. 456 Client Tower, Bangalore 560001" value={inv.clientAddress} onChange={(e) => setInv((p) => ({ ...p, clientAddress: e.target.value }))} />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Line Items</label>
          <button onClick={addItem} className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>
        {inv.items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <input
                type="text"
                className={inputClass}
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                className={inputClass}
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(item.id, "qty", e.target.value)}
              />
            </div>
            <div className="col-span-4">
              <input
                type="number"
                className={inputClass}
                placeholder="Rate (₹)"
                value={item.rate}
                onChange={(e) => updateItem(item.id, "rate", e.target.value)}
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="col-span-1 h-10 rounded-lg border border-border text-foreground-muted hover:text-rose-500 hover:border-rose-300 transition-colors flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tax Rate (%)</label>
          <select className={inputClass} value={inv.taxRate} onChange={(e) => setInv((p) => ({ ...p, taxRate: e.target.value }))}>
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Notes (optional)</label>
          <input type="text" className={inputClass} placeholder="e.g. Payment due in 30 days" value={inv.notes} onChange={(e) => setInv((p) => ({ ...p, notes: e.target.value }))} />
        </div>
      </div>

      {/* Totals */}
      <div className={clsx(resultCard, "space-y-2")}>
        <div className="flex justify-between text-sm">
          <span className="text-foreground-muted">Subtotal</span>
          <span className="font-medium text-foreground">₹{fmt(subtotal, 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground-muted">Tax ({inv.taxRate}%)</span>
          <span className="font-medium text-foreground">₹{fmt(taxAmt, 0)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-xl text-orange-500">₹{fmt(total, 0)}</span>
        </div>
      </div>

      <button className={primaryBtn} onClick={() => setShowPreview(true)}>
        <FileText className="inline h-4 w-4 mr-2" />
        Preview Invoice
      </button>

      {showPreview && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-card-border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{inv.companyName || "Your Company"}</h2>
                <p className="text-orange-100 text-sm mt-1">{inv.companyAddress || "Company Address"}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">INVOICE</div>
                <div className="text-orange-100 text-sm">{inv.invoiceNumber}</div>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6 bg-background">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1">Bill To</div>
                <div className="text-sm font-semibold text-foreground">{inv.clientName || "Client Name"}</div>
                <div className="text-xs text-foreground-muted">{inv.clientAddress || "Client Address"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1">Invoice Details</div>
                <div className="text-xs text-foreground-muted">Date: {inv.date}</div>
                {inv.dueDate && <div className="text-xs text-foreground-muted">Due: {inv.dueDate}</div>}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 font-semibold text-foreground-muted text-xs uppercase tracking-wide">Description</th>
                  <th className="text-right pb-2 font-semibold text-foreground-muted text-xs uppercase tracking-wide">Qty</th>
                  <th className="text-right pb-2 font-semibold text-foreground-muted text-xs uppercase tracking-wide">Rate</th>
                  <th className="text-right pb-2 font-semibold text-foreground-muted text-xs uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{item.description || "-"}</td>
                    <td className="py-2 text-right text-foreground-muted">{item.qty || "0"}</td>
                    <td className="py-2 text-right text-foreground-muted">₹{fmt(parseFloat(item.rate) || 0, 0)}</td>
                    <td className="py-2 text-right font-medium text-foreground">₹{fmt((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0), 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span className="text-foreground">₹{fmt(subtotal, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Tax ({inv.taxRate}%)</span>
                  <span className="text-foreground">₹{fmt(taxAmt, 0)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-xl text-orange-500">₹{fmt(total, 0)}</span>
                </div>
              </div>
            </div>

            {inv.notes && (
              <div className="border-t border-border pt-4">
                <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1">Notes</div>
                <div className="text-sm text-foreground">{inv.notes}</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Workspace
// ─────────────────────────────────────────────────────────────────────────────

export default function FinanceWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "invoice-generator":
      return <InvoiceGenerator />;
    case "gst-calculator":
      return <GSTCalculator />;
    case "tip-calculator":
      return <TipCalculator />;
    case "roi-calculator":
      return <ROICalculator />;
    case "biz-profit-margin":
      return <ProfitMarginCalculator />;
    case "startup-valuation":
      return <StartupValuationCalculator />;
    default:
      return (
        <div className="text-center py-12 text-foreground-muted">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Tool <code className="bg-background-subtle px-1.5 py-0.5 rounded">{tool.slug}</code> not yet implemented.</p>
        </div>
      );
  }
}