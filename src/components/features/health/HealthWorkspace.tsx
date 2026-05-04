"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import type { Tool } from "@/types";
import {
  Activity,
  Calendar,
  Heart,
  Flame,
  Baby,
  Droplets,
  Calculator,
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

const fmt = (n: number) => n.toLocaleString("en-IN");

// ─────────────────────────────────────────────────────────────────────────────
// BMI Calculator
// ─────────────────────────────────────────────────────────────────────────────

function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [result, setResult] = useState<number | null>(null);

  function calculate() {
    let bmi: number;
    if (unit === "metric") {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (!h || !w) return;
      bmi = w / (h * h);
    } else {
      const totalIn = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      if (!totalIn || !weightLb) return;
      bmi = (parseFloat(weightLb) / (totalIn * totalIn)) * 703;
    }
    setResult(Math.round(bmi * 10) / 10);
  }

  function category(b: number) {
    if (b < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" };
    if (b < 25) return { label: "Normal", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
    if (b < 30) return { label: "Overweight", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" };
    return { label: "Obese", color: "text-rose-500", bg: "bg-rose-50 border-rose-200" };
  }

  const cat = result !== null ? category(result) : null;

  return (
    <div className="space-y-5">
      {/* Unit Toggle */}
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            onClick={() => { setUnit(u); setResult(null); }}
            className={clsx(
              "flex-1 h-10 rounded-lg text-sm font-medium transition-colors border",
              unit === u
                ? "bg-orange-500 text-white border-orange-500"
                : "border-border text-foreground-muted hover:border-primary"
            )}
          >
            {u === "metric" ? "Metric (kg/cm)" : "Imperial (lb/ft-in)"}
          </button>
        ))}
      </div>

      {unit === "metric" ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Height (cm)</label>
            <input type="number" className={inputClass} placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Weight (kg)</label>
            <input type="number" className={inputClass} placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Height</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" className={inputClass} placeholder="Feet" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
              <input type="number" className={inputClass} placeholder="Inches" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Weight (lb)</label>
            <input type="number" className={inputClass} placeholder="e.g. 154" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} />
          </div>
        </>
      )}

      <button className={primaryBtn} onClick={calculate}>Calculate BMI</button>

      {result !== null && cat && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, cat.bg, "text-center py-6")}>
            <div className="text-5xl font-bold" style={{ color: cat.color === "text-blue-500" ? "#3b82f6" : cat.color === "text-emerald-500" ? "#10b981" : cat.color === "text-amber-500" ? "#f59e0b" : "#f43f5e" }}>{result}</div>
            <div className={clsx("text-sm font-semibold mt-2", cat.color)}>{cat.label}</div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            BMI is a general indicator and does not account for muscle mass, bone density, or overall body composition.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calorie Calculator (BMR/TDEE)
// ─────────────────────────────────────────────────────────────────────────────

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

function CalorieCalculator() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [result, setResult] = useState<{ bmr: number; tdee: number; goal: number } | null>(null);

  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  function calculate() {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || !h || !w) return;

    // Mifflin-St Jeor
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = Math.round(bmr * activityFactors[activity]);
    setResult({ bmr: Math.round(bmr), tdee, goal: tdee });
  }

  return (
    <div className="space-y-5">
      {/* Gender */}
      <div className="flex gap-2">
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={clsx(
              "flex-1 h-10 rounded-lg text-sm font-medium transition-colors capitalize border",
              gender === g ? "bg-orange-500 text-white border-orange-500" : "border-border text-foreground-muted hover:border-primary"
            )}
          >
            {g === "male" ? "Male" : "Female"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Age (years)</label>
          <input type="number" className={inputClass} placeholder="e.g. 30" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Height (cm)</label>
          <input type="number" className={inputClass} placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Weight (kg)</label>
          <input type="number" className={inputClass} placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Activity Level</label>
          <select
            className={inputClass}
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
          >
            <option value="sedentary">Sedentary (office job)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very Active (athlete)</option>
          </select>
        </div>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Calories</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className={clsx(resultCard, "text-center")}>
            <div className="text-2xl font-bold text-foreground">{fmt(result.bmr)}</div>
            <div className="text-xs text-foreground-muted mt-0.5">BMR (resting)</div>
          </div>
          <div className={clsx(resultCard, "text-center")}>
            <div className="text-2xl font-bold text-orange-500">{fmt(result.tdee)}</div>
            <div className="text-xs text-foreground-muted mt-0.5">TDEE (maintenance)</div>
          </div>
          <div className={clsx(resultCard, "text-center")}>
            <div className="text-xl font-bold text-emerald-500">{fmt(result.tdee - 500)}</div>
            <div className="text-xs text-foreground-muted mt-0.5">-500 kcal deficit</div>
          </div>
          <div className={clsx(resultCard, "col-span-3 text-xs text-foreground-muted text-center")}>
            To lose ~0.5 kg/week, eat 500 kcal below TDEE. For 1 kg/week, eat 1000 kcal below TDEE.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pregnancy Due Date Calculator (Naegele's Rule)
// ─────────────────────────────────────────────────────────────────────────────

function PregnancyCalculator() {
  const [lmp, setLmp] = useState("");
  const [result, setResult] = useState<{ dueDate: string; weeks: number; days: number; trimester: string } | null>(null);

  function calculate() {
    if (!lmp) return;
    const d = new Date(lmp);
    // Naegele: LMP + 7 days - 3 months + 1 year
    d.setDate(d.getDate() + 7);
    d.setMonth(d.getMonth() - 3);
    d.setFullYear(d.getFullYear() + 1);

    const today = new Date();
    const diff = Math.floor((today.getTime() - new Date(lmp).getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / 7);
    const days = diff % 7;

    let trimester: string;
    if (weeks < 13) trimester = "1st Trimester";
    else if (weeks < 27) trimester = "2nd Trimester";
    else trimester = "3rd Trimester";

    setResult({
      dueDate: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      weeks,
      days,
      trimester,
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">First Day of Last Menstrual Period (LMP)</label>
        <input type="date" className={inputClass} value={lmp} onChange={(e) => { setLmp(e.target.value); setResult(null); }} />
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Due Date</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, "text-center py-5")}>
            <Baby className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">Due: {result.dueDate}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-2xl font-bold text-foreground">{result.weeks}</div>
              <div className="text-xs text-foreground-muted">Weeks</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-2xl font-bold text-foreground">{result.days}</div>
              <div className="text-xs text-foreground-muted">Days</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-sm font-bold text-pink-500">{result.trimester}</div>
              <div className="text-xs text-foreground-muted">Current</div>
            </div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            Based on Naegele's Rule. Actual due date may vary. Consult your healthcare provider.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ovulation Calculator
// ─────────────────────────────────────────────────────────────────────────────

function OvulationCalculator() {
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<{ ovulation: string; fertileStart: string; fertileEnd: string; nextPeriod: string } | null>(null);

  function calculate() {
    const today = new Date();
    const cycle = parseInt(cycleLength) || 28;
    // Ovulation typically 14 days before next period
    const ovulationDay = cycle - 14;
    const nextPeriodDay = cycle;

    const ovulationDate = new Date(today);
    ovulationDate.setDate(today.getDate() + ovulationDay);

    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 2);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 2);

    const periodDate = new Date(today);
    periodDate.setDate(today.getDate() + nextPeriodDay);

    setResult({
      ovulation: ovulationDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
      fertileStart: fertileStart.toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
      fertileEnd: fertileEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
      nextPeriod: periodDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Cycle Length (days)</label>
        <input type="number" className={inputClass} placeholder="e.g. 28" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
        <p className="text-xs text-foreground-muted">Average is 28 days. Range: 21-35 days.</p>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Ovulation</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, "text-center py-5")}>
            <Droplets className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">Ovulation: {result.ovulation}</div>
          </div>
          <div className={clsx(resultCard, "bg-pink-50 border-pink-200")}>
            <div className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">Fertile Window</div>
            <div className="text-lg font-bold text-pink-700">{result.fertileStart} — {result.fertileEnd}</div>
          </div>
          <div className={clsx(resultCard, "text-center")}>
            <div className="text-sm text-foreground-muted">Next period expected</div>
            <div className="text-lg font-bold text-foreground">{result.nextPeriod}</div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            Fertile window = ovulation date ± 2 days. This is an estimate based on average cycle length.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VO2 Max Calculator (Cooper Test)
// ─────────────────────────────────────────────────────────────────────────────

function VO2MaxCalculator() {
  const [distance, setDistance] = useState("");
  const [timeMin, setTimeMin] = useState("");
  const [timeSec, setTimeSec] = useState("");
  const [result, setResult] = useState<{ vo2max: number; category: string; color: string } | null>(null);

  function calculate() {
    const d = parseFloat(distance);
    const totalSec = (parseFloat(timeMin) || 0) * 60 + (parseFloat(timeSec) || 0);
    if (!d || !totalSec) return;

    // Cooper test: VO2max = (distance_m - 504.45) / 44.73
    // More accurate: (35.97 * d) / totalSec - 11.29
    const vo2max = (35.97 * d) / totalSec - 11.29;

    let category: string;
    let color: string;
    if (vo2max < 26) { category = "Poor"; color = "text-rose-500"; }
    else if (vo2max < 31) { category = "Fair"; color = "text-amber-500"; }
    else if (vo2max < 37) { category = "Average"; color = "text-yellow-500"; }
    else if (vo2max < 42) { category = "Good"; color = "text-emerald-500"; }
    else if (vo2max < 47) { category = "Excellent"; color = "text-blue-500"; }
    else { category = "Superior"; color = "text-purple-500"; }

    setResult({ vo2max: Math.round(vo2max * 10) / 10, category, color });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Distance (meters)</label>
        <input type="number" className={inputClass} placeholder="e.g. 2400" value={distance} onChange={(e) => setDistance(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Minutes</label>
          <input type="number" className={inputClass} placeholder="e.g. 12" value={timeMin} onChange={(e) => setTimeMin(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Seconds</label>
          <input type="number" className={inputClass} placeholder="e.g. 30" value={timeSec} onChange={(e) => setTimeSec(e.target.value)} />
        </div>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate VO2 Max</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, "text-center py-6")}>
            <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-5xl font-bold" style={{ color: result.color === "text-rose-500" ? "#f43f5e" : result.color === "text-amber-500" ? "#f59e0b" : result.color === "text-yellow-500" ? "#eab308" : result.color === "text-emerald-500" ? "#10b981" : result.color === "text-blue-500" ? "#3b82f6" : "#a855f7" }}>{result.vo2max}</div>
            <div className={clsx("text-sm font-semibold mt-2", result.color)}>{result.category}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-foreground-muted">
            <div className={resultCard}>Men 20-29 avg: 38-42 ml/kg/min</div>
            <div className={resultCard}>Women 20-29 avg: 33-37 ml/kg/min</div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            Based on Cooper 12-min test formula. VO2 max measures aerobic capacity.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calorie Deficit Calculator
// ─────────────────────────────────────────────────────────────────────────────

function CalorieDeficitCalculator() {
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<"sedentary" | "light" | "moderate" | "active">("moderate");
  const [weeks, setWeeks] = useState("");
  const [result, setResult] = useState<{ tdee: number; target: number; weeklyLoss: number; deficit: number; days: number } | null>(null);

  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };

  function calculate() {
    const w = parseFloat(currentWeight);
    const gw = parseFloat(goalWeight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !gw || !h || !a) return;

    let bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = Math.round(bmr * factors[activity]);

    const weightDiff = w - gw;
    const d = parseInt(weeks) || 1;
    const totalDays = d * 7;

    // 1 kg fat = ~7700 kcal
    const totalDeficit = weightDiff * 7700;
    const dailyDeficit = Math.round(totalDeficit / totalDays);
    const weeklyLoss = (dailyDeficit / 7700) * 7;

    setResult({
      tdee,
      target: tdee - dailyDeficit,
      weeklyLoss: Math.round(weeklyLoss * 10) / 10,
      deficit: dailyDeficit,
      days: totalDays,
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={clsx("flex-1 h-10 rounded-lg text-sm font-medium capitalize border transition-colors",
              gender === g ? "bg-orange-500 text-white border-orange-500" : "border-border text-foreground-muted hover:border-primary"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Current Weight (kg)</label>
          <input type="number" className={inputClass} placeholder="e.g. 85" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Goal Weight (kg)</label>
          <input type="number" className={inputClass} placeholder="e.g. 75" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Height (cm)</label>
          <input type="number" className={inputClass} placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Age (years)</label>
          <input type="number" className={inputClass} placeholder="e.g. 30" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Activity</label>
          <select className={inputClass} value={activity} onChange={(e) => setActivity(e.target.value as typeof activity)}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Weeks to Goal</label>
          <input type="number" className={inputClass} placeholder="e.g. 12" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
        </div>
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Target Calories</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Your TDEE</div>
              <div className="text-2xl font-bold text-foreground">{result.tdee} <span className="text-sm font-normal text-foreground-muted">kcal/day</span></div>
            </div>
            <div className={clsx(resultCard, "text-center border-orange-200 bg-orange-50")}>
              <div className="text-xs text-orange-600">Target Calories</div>
              <div className="text-2xl font-bold text-orange-500">{result.target} <span className="text-sm font-normal text-orange-400">kcal/day</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Daily Deficit</div>
              <div className="text-lg font-bold text-rose-500">{result.deficit} kcal</div>
            </div>
            <div className={clsx(resultCard, "text-center")}>
              <div className="text-xs text-foreground-muted">Est. Weekly Loss</div>
              <div className="text-lg font-bold text-emerald-500">{result.weeklyLoss} kg</div>
            </div>
          </div>
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            Based on ~7700 kcal per kg of body fat. Actual results may vary based on individual metabolism.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Target Heart Rate Calculator
// ─────────────────────────────────────────────────────────────────────────────

function TargetHeartRateCalculator() {
  const [age, setAge] = useState("");
  const [result, setResult] = useState<{
    maxHR: number;
    zone1: [number, number];
    zone2: [number, number];
    zone3: [number, number];
    zone4: [number, number];
  } | null>(null);

  function calculate() {
    const a = parseInt(age);
    if (!a) return;

    const maxHR = 220 - a;
    setResult({
      maxHR,
      zone1: [Math.round(maxHR * 0.5), Math.round(maxHR * 0.6)],
      zone2: [Math.round(maxHR * 0.6), Math.round(maxHR * 0.7)],
      zone3: [Math.round(maxHR * 0.7), Math.round(maxHR * 0.8)],
      zone4: [Math.round(maxHR * 0.8), Math.round(maxHR * 0.9)],
    });
  }

  const zones = result ? [
    { label: "Zone 1 — Very Light", range: result.zone1, color: "text-blue-500", desc: "Warm-up & cool-down" },
    { label: "Zone 2 — Light", range: result.zone2, color: "text-emerald-500", desc: "Fat burning & endurance" },
    { label: "Zone 3 — Moderate", range: result.zone3, color: "text-amber-500", desc: "Aerobic fitness" },
    { label: "Zone 4 — Hard", range: result.zone4, color: "text-rose-500", desc: "Anaerobic & speed" },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Your Age (years)</label>
        <input type="number" className={inputClass} placeholder="e.g. 30" value={age} onChange={(e) => { setAge(e.target.value); setResult(null); }} />
      </div>

      <button className={primaryBtn} onClick={calculate}>Calculate Heart Rate Zones</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={clsx(resultCard, "text-center py-5 bg-gradient-to-r from-rose-50 to-orange-50")}>
            <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <div className="text-sm text-foreground-muted">Maximum Heart Rate</div>
            <div className="text-5xl font-bold text-rose-500">{result.maxHR} <span className="text-lg text-rose-400 font-normal">bpm</span></div>
          </div>
          {zones.map((z, i) => (
            <div key={i} className={clsx(resultCard, "flex items-center justify-between")}>
              <div>
                <div className={clsx("text-sm font-semibold", z.color)}>{z.label}</div>
                <div className="text-xs text-foreground-muted">{z.desc}</div>
              </div>
              <div className="text-lg font-bold text-foreground">{z.range[0]}–{z.range[1]} <span className="text-sm text-foreground-muted font-normal">bpm</span></div>
            </div>
          ))}
          <div className={clsx(resultCard, "text-xs text-foreground-muted text-center")}>
            Heart rate zones based on standard percentage of max HR (220 - age). Consult a physician before beginning any exercise program.
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Workspace
// ─────────────────────────────────────────────────────────────────────────────

export default function HealthWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "bmi-calculator":
      return <BMICalculator />;
    case "calorie-calculator":
      return <CalorieCalculator />;
    case "pregnancy-calculator":
      return <PregnancyCalculator />;
    case "ovulation-calculator":
      return <OvulationCalculator />;
    case "vo2-max-calculator":
      return <VO2MaxCalculator />;
    case "calorie-deficit":
      return <CalorieDeficitCalculator />;
    case "target-heart-rate":
      return <TargetHeartRateCalculator />;
    default:
      return (
        <div className="text-center py-12 text-foreground-muted">
          <Calculator className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Tool <code className="bg-background-subtle px-1.5 py-0.5 rounded">{tool.slug}</code> not yet implemented.</p>
        </div>
      );
  }
}