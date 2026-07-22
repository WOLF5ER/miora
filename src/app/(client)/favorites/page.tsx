import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MasterRow from "@/components/MasterRow";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let favoriteMasters: Awaited<ReturnType<typeof loadFavorites>> = [];
  if (user) favoriteMasters = await loadFavorites(user.id);

  async function loadFavorites(userId: string) {
    const { data: favs } = await supabase.from("favorites").select("master_id").eq("client_id", userId);
    const ids = (favs ?? []).map((f) => f.master_id);
    if (ids.length === 0) return [];
    const { data } = await supabase.from("master_public").select("*").in("id", ids);
    return data ?? [];
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="font-serif text-[24px] text-ink">Избранные мастера</h1>

      {!user ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
          <Heart size={26} strokeWidth={1.6} color="var(--ink-faint)" />
          <p className="text-[13.5px] text-ink-soft">Войдите, чтобы сохранять любимых мастеров.</p>
          <Link href="/login" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
            Войти
          </Link>
        </div>
      ) : favoriteMasters.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
          <Heart size={26} strokeWidth={1.6} color="var(--ink-faint)" />
          <p className="text-[13.5px] text-ink-soft">
            Пока пусто. Нажмите на сердце в профиле мастера, чтобы сохранить его здесь.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 pb-6">
          {favoriteMasters.map((m) => (
            <MasterRow key={m.id} master={m} />
          ))}
        </div>
      )}
    </div>
  );
}
