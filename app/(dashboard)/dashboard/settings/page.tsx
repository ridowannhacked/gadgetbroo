import { unauthorized } from "next/navigation";
import { getServerSession } from "@/helpers/get-servesession";
import type { Metadata } from "next";
import ProfileSettingsClient from "./ProfileSettingsClient";

export const metadata: Metadata = {
  title: "Profile Settings - GadgetBroo",
};

export default async function SettingsPage() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) unauthorized();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Update your personal information and security settings.</p>
      </div>
      <ProfileSettingsClient user={user} />
    </div>
  );
}
