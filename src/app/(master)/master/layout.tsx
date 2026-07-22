import MasterSidebar from "@/components/MasterSidebar";
import { requireMaster } from "@/lib/supabase/auth";

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  const { profile, masterProfile } = await requireMaster();

  return (
    <div className="min-h-dvh">
      <MasterSidebar
        name={profile.full_name || "Мастер"}
        specialization={masterProfile.specialization}
        avatarUrl={profile.avatar_url}
      />
      <main className="min-h-dvh md:ml-60">
        <div className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
