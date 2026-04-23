import type { Metadata } from "next";
import { NamePicker } from "@/components/features/name-picker/NamePicker";

export const metadata: Metadata = {
  title: "Random Name Picker — Pick a Winner | ToolHive",
  description: "Free online random name picker. Paste your list, spin, and pick a random winner with a fun drum-roll animation and confetti. Perfect for giveaways, classrooms, and raffles.",
};

export default function NamePickerPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <NamePicker />
      </div>
    </main>
  );
}
