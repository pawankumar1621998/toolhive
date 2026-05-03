import AutomationDashboard from "@/components/features/instagram/AutomationDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Instagram Automation — ToolHive",
  description: "Auto-reply to comments, send DMs, and collect leads automatically with keyword triggers.",
};

export default function InstagramAutomationPage() {
  return <AutomationDashboard />;
}