import type { Metadata } from "next";
import { TermsOfServicePage } from "@/components/features/legal/TermsOfServicePage";

export const metadata: Metadata = {
  title: "Terms of Service — ToolHive",
  description:
    "Read ToolHive's Terms of Service to understand your rights and responsibilities when using our platform.",
};

export default function TermsRoute() {
  return <TermsOfServicePage />;
}
