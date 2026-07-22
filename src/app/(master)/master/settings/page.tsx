import { requireMaster } from "@/lib/supabase/auth";
import SettingsClient from "./SettingsClient";

export default async function MasterSettingsPage() {
  const { profile, masterProfile } = await requireMaster();

  return (
    <SettingsClient
      masterId={masterProfile.id}
      fullName={profile.full_name}
      phone={profile.phone ?? ""}
      avatarUrl={profile.avatar_url}
      coverUrl={masterProfile.cover_url}
      specialization={masterProfile.specialization}
      city={masterProfile.city}
      district={masterProfile.district}
      bio={masterProfile.bio}
    />
  );
}
