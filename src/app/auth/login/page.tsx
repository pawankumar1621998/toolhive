import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login — ToolHive",
  description: "Login to your ToolHive account to save favorites and access your history.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  redirect("/");
}