import type { Metadata } from "next";
import { AboutPage } from "@/components/features/about/AboutPage";

export const metadata: Metadata = {
  title: "About — ToolHive",
  description:
    "Learn about ToolHive — our mission to make powerful AI tools free and accessible to everyone, with no signup required.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
