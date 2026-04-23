import type { Metadata } from "next";
import { BudgetPlanner } from "@/components/features/budget-planner/BudgetPlanner";

export const metadata: Metadata = {
  title: "Budget Planner — Monthly Income & Expense Tracker | ToolHive",
  description: "Plan your monthly budget with ease. Track income, add expense categories, and see your spending breakdown with a live surplus or deficit indicator.",
};

export default function BudgetPlannerPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <BudgetPlanner />
      </div>
    </main>
  );
}
