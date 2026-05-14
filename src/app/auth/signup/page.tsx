import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up — ToolHive",
  description: "Create your free ToolHive account and start using 200+ AI tools today.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  redirect("/");
}