import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function ClientSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = (await supabase.from("profiles").select("*").eq("id", user.id).single()).data;

  if (!profile) {
    redirect("/profile");
  }

  return (
    <SettingsClient
      userId={user.id}
      email={user.email || ""}
      fullName={profile.full_name || ""}
      phone={profile.phone || ""}
      avatarUrl={profile.avatar_url}
    />
  );
}
