"use client";

import { useState, useEffect, useCallback } from "react";

type Category = "Housing" | "Food" | "Transport" | "Entertainment" | "Health" | "Education" | "Savings" | "Other";

const CATEGORIES: Category[] = ["Housing", "Food", "Transport", "Entertainment", "Health", "Education", "Savings", "Other"];

const CATEGORY_COLORS: Record<Category, string> = {
  Housing:       "bg-blue-500",
  Food:          "bg-orange-500",
  Transport:     "bg-yellow-500",
  Entertainment: "bg-purple-500",
  Health:        "bg-red-500",
  Education:     "bg-cyan-500",
  Savings:       "bg-emerald-500",
  Other:         "bg-slate-500",
};

interface Expense {
  id: string;
  category: Category;
  description: string;
  amount: number;
}

const STORAGE_KEY = "toolhive_budget_planner";

function loadData(): { income: string; expenses: Expense[] } {
  if (typeof window === "undefined") return { income: "", expenses: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { income: "", expenses: [] };
    return JSON.parse(raw) as { income: string; expenses: Expense[] };
  } catch { return { income: "", expenses: [] }; }
}

function newExpense(): Expense {
  return { id: Math.random().toString(36).slice(2), category: "Other", description: "", amount: 0 };
}

export function BudgetPlanner() {
  const [income,   setIncome]   = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [draft,    setDraft]    = useState<Expense>(newExpense());
  const [saved,    setSaved]    = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (Vercel-safe)
  useEffect(() => {
    const data = loadData();
    setIncome(data.income);
    setExpenses(data.expenses);
    setHydrated(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, expenses }));
  }, [income, expenses, hydrated]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const incomeNum     = parseFloat(income) || 0;
  const remaining     = incomeNum - totalExpenses;
  const isDeficit     = remaining < 0;

  const addExpense = useCallback(() => {
    if (!draft.description.trim() || draft.amount <= 0) return;
    setExpenses(prev => [...prev, { ...draft, id: Math.random().toString(36).slice(2) }]);
    setDraft(newExpense());
  }, [draft]);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const exportSummary = useCallback(() => {
    const lines = [
      "=== Budget Summary ===",
      `Monthly Income:   ₹${incomeNum.toLocaleString("en-IN")}`,
      `Total Expenses:   ₹${totalExpenses.toLocaleString("en-IN")}`,
      `${isDeficit ? "Deficit" : "Remaining"}:         ₹${Math.abs(remaining).toLocaleString("en-IN")}`,
      "",
      "--- Expenses ---",
      ...expenses.map(e => `[${e.category}] ${e.description}: ₹${e.amount.toLocaleString("en-IN")}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "budget-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [incomeNum, totalExpenses, remaining, isDeficit, expenses]);

  // Spending breakdown by category
  const breakdown = CATEGORIES.map(cat => ({
    cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(b => b.total > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Budget Planner</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Track your monthly income and expenses. Data is saved locally.</p>
      </div>

      {/* Income */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block">Monthly Income</label>
        <div className="flex items-center gap-2">
          <span className="text-foreground-muted text-sm font-semibold">₹</span>
          <input
            type="number" min={0} placeholder="e.g. 50000"
            className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            value={income}
            onChange={e => setIncome(e.target.value)}
          />
        </div>
      </div>

      {/* Add expense */}
      <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
        <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block">Add Expense</label>
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            className="border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            value={draft.category}
            onChange={e => setDraft(d => ({ ...d, category: e.target.value as Category }))}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            className="border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Description"
            value={draft.description}
            onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <span className="text-foreground-muted text-sm font-semibold">₹</span>
            <input
              type="number" min={0} placeholder="Amount"
              className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              value={draft.amount || ""}
              onChange={e => setDraft(d => ({ ...d, amount: parseFloat(e.target.value) || 0 }))}
              onKeyDown={e => e.key === "Enter" && addExpense()}
            />
          </div>
        </div>
        <button
          onClick={addExpense}
          disabled={!draft.description.trim() || draft.amount <= 0}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Expense
        </button>
      </div>

      {/* Summary */}
      {(incomeNum > 0 || totalExpenses > 0) && (
        <div className="rounded-2xl border border-card-border bg-card p-5 space-y-4">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide block">Summary</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
              <p className="text-xs text-blue-500 font-semibold mb-1">Income</p>
              <p className="text-lg font-bold text-foreground">₹{incomeNum.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3 text-center">
              <p className="text-xs text-orange-500 font-semibold mb-1">Expenses</p>
              <p className="text-lg font-bold text-foreground">₹{totalExpenses.toLocaleString("en-IN")}</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${isDeficit ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <p className={`text-xs font-semibold mb-1 ${isDeficit ? "text-red-500" : "text-emerald-500"}`}>{isDeficit ? "Deficit" : "Remaining"}</p>
              <p className={`text-lg font-bold ${isDeficit ? "text-red-500" : "text-emerald-500"}`}>
                {isDeficit ? "-" : ""}₹{Math.abs(remaining).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Spending bar */}
          {totalExpenses > 0 && (
            <div>
              <p className="text-xs text-foreground-muted mb-2 font-semibold">Spending Breakdown</p>
              <div className="flex rounded-full overflow-hidden h-4 gap-px">
                {breakdown.map(b => (
                  <div
                    key={b.cat}
                    className={`${CATEGORY_COLORS[b.cat]} transition-all`}
                    style={{ width: `${(b.total / totalExpenses) * 100}%` }}
                    title={`${b.cat}: ₹${b.total.toLocaleString("en-IN")} (${Math.round((b.total / totalExpenses) * 100)}%)`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                {breakdown.map(b => (
                  <div key={b.cat} className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[b.cat]}`} />
                    {b.cat}: {Math.round((b.total / totalExpenses) * 100)}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="rounded-2xl border border-card-border bg-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Expenses ({expenses.length})</label>
            <div className="flex gap-2">
              <button onClick={exportSummary} className="text-xs text-orange-500 hover:underline">Export</button>
              <button onClick={() => setExpenses([])} className="text-xs text-foreground-muted hover:text-red-500 transition-colors">Clear All</button>
            </div>
          </div>
          <ul className="space-y-2">
            {expenses.map(e => (
              <li key={e.id} className="flex items-center gap-3 group">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CATEGORY_COLORS[e.category]}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{e.description}</span>
                  <span className="text-xs text-foreground-muted ml-2">{e.category}</span>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">₹{e.amount.toLocaleString("en-IN")}</span>
                <button
                  onClick={() => removeExpense(e.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-foreground-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {saved && (
        <p className="text-xs text-emerald-500 text-center">Saved!</p>
      )}
    </div>
  );
}
