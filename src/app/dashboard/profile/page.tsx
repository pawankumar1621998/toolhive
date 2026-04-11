import type { Metadata } from "next";
import { ProfilePage } from "@/components/features/dashboard/ProfilePage";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your account settings, appearance, and security on ToolHive.",
};

/**
 * /dashboard/profile
 *
 * Renders ProfilePage which includes:
 * - Avatar upload section (click-to-replace, 5MB limit)
 * - Personal info form: name, email, bio (with character counter)
 * - Subscription plan info card
 * - Appearance theme switcher (Light / Dark / System)
 * - Password change form with strength indicator
 * - Danger zone: delete account with typed-confirmation modal
 */
export default function ProfileRoute() {
  return <ProfilePage />;
}
