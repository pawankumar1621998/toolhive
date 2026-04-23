import type { Metadata } from "next";
import { PasswordGenerator } from "@/components/features/password-generator/PasswordGenerator";

export const metadata: Metadata = {
  title: "Password Generator — Secure Random Passwords | ToolHive",
  description: "Generate cryptographically secure random passwords with custom length, uppercase, lowercase, numbers, and symbols. Free online password generator.",
};

export default function PasswordGeneratorPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PasswordGenerator />
      </div>
    </main>
  );
}
