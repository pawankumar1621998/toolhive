import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Forgot Password — ToolHive",
  description: "Reset your ToolHive account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  redirect("/");
}