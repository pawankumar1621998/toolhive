import type { Metadata } from "next";
import { CareersPage } from "@/components/features/careers/CareersPage";

export const metadata: Metadata = {
  title: "Careers — ToolHive",
  description: "Join the ToolHive team and help build the future of AI tools.",
};

export default function CareersRoute() {
  return <CareersPage />;
}
