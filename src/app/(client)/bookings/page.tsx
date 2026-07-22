import Link from "next/link";
import { CalendarCheck, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PortfolioTile from "@/components/PortfolioTile";
import UpcomingBookingCard from "./UpcomingBookingCard";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-5 px-4 pt-6">
        <h1 className="font-serif text-[24px] text-ink">Мои записи</h1>
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
          <CalendarCheck size={24} strokeWidth={1.6} color="var(--ink-faint)" />
          <p className="text-[13.5px] text-ink-soft">Войдите, чтобы видеть свои записи.</p>
          <Link href="/login" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
            Войти
          </Link>
        </div>
      </div>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", user.id)
    .neq("status", "cancelled")
    .order("scheduled_at", { ascending: false });

  const masterIds = Array.from(new Set((bookings ?? []).map((b) => b.master_id)));
  const { data: mastersData } =
    masterIds.length > 0 ? await supabase.from("master_public").select("*").in("id", masterIds) : { data: [] };
  const masterMap = Object.fromEntries((mastersData ?? []).map((m) => [m.id, m]));

  const now = new Date();
  const upcoming = (bookings ?? []).filter((b) => new Date(b.scheduled_at) >= now);
  const past = (bookings ?? []).filter((b) => new Date(b.scheduled_at) < now);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="font-serif text-[24px] text-ink">Мои записи</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] uppercase tracking-wide text-ink-faint">Предстоящие</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
            <CalendarCheck size={24} strokeWidth={1.6} color="var(--ink-faint)" />
            <p className="text-[13.5px] text-ink-soft">Нет предстоящих записей</p>
            <Link href="/search" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
              Найти мастера
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcoming.map((b) => {
              const master = masterMap[b.master_id];
              return (
                <UpcomingBookingCard
                  key={b.id}
                  id={b.id}
                  masterName={master?.name ?? "Мастер"}
                  masterHue={master?.hue ?? 340}
                  serviceTitle={b.service_title}
                  price={b.price}
                  scheduledAt={b.scheduled_at}
                />
              );
            })}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="flex flex-col gap-3 pb-6">
          <h2 className="text-[13px] uppercase tracking-wide text-ink-faint">История посещений</h2>
          <div className="flex flex-col gap-2.5">
            {past.map((b) => {
              const master = masterMap[b.master_id];
              return (
                <div key={b.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
                  <div className="w-16 shrink-0">
                    <PortfolioTile hue={master?.hue ?? 340} aspect="aspect-square" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink">{master?.name ?? "Мастер"}</div>
                    <div className="truncate text-[12.5px] text-ink-soft">{b.service_title}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11.5px] text-ink-faint">
                      <span>{new Date(b.scheduled_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
                      <span className="font-medium text-ink-soft">{b.price.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
                    {master ? (
                      <Link href={`/masters/${master.id}/book`} className="rounded-full border border-line px-3 py-1.5 text-[11.5px] text-ink-soft">
                        Повторить
                      </Link>
                    ) : null}
                    {master ? (
                      <Link href={`/masters/${master.id}`} className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--brass)" }}>
                        <Star size={11} strokeWidth={1.8} />
                        Оставить отзыв
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
