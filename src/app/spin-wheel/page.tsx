import type { Metadata } from "next";
import { SpinWheel } from "@/components/features/spin-wheel/SpinWheel";

export const metadata: Metadata = {
  title: "Spin the Wheel — Random Decision Maker | ToolHive",
  description: "Free online spin wheel randomizer. Add your options and spin to make a random decision. Perfect for picking names, topics, games, or anything.",
};

export default function SpinWheelPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SpinWheel />
      </div>
    </main>
  );
}
