import type { Metadata } from "next";
import { PricingPage } from "@/components/features/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Pricing — ToolHive",
  description:
    "Simple, transparent pricing for every workflow. Start free with 20 tools per day, upgrade to Pro for unlimited access, or get Enterprise-grade power for your team.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
