import type { Metadata } from "next";
import { CountdownTimer } from "@/components/features/countdown/CountdownTimer";

export const metadata: Metadata = {
  title: "Countdown Timer — Free Online Countdown | ToolHive",
  description: "Create multiple countdown timers to events, deadlines, and special occasions. Days, hours, minutes, seconds — all in real-time.",
};

export default function CountdownPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CountdownTimer />
      </div>
    </main>
  );
}
