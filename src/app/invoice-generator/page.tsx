import type { Metadata } from "next";
import { InvoiceGenerator } from "@/components/features/invoice/InvoiceGenerator";

export const metadata: Metadata = {
  title: "Free Invoice Generator — Create & Download Invoice PDF | ToolHive",
  description: "Create professional invoices instantly. Add your business details, client info, line items, taxes, and download as PDF. Free, no signup needed.",
};

export default function InvoiceGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <InvoiceGenerator />
      </div>
    </main>
  );
}
