import type { Metadata } from "next";
import { StatusPage } from "@/components/features/status/StatusPage";

export const metadata: Metadata = {
  title: "System Status — ToolHive",
  description: "Real-time status of all ToolHive services.",
};

export default function StatusRoute() {
  return <StatusPage />;
}
