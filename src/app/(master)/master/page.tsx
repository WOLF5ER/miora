import { Clock, Sparkles, UserPlus } from "lucide-react";
import StatTile from "@/components/StatTile";
import Sparkline from "@/components/Sparkline";
import { requireMaster } from "@/lib/supabase/auth";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");
}

export default async function MasterDashboardPage() {
  const { supabase, profile, masterProfile } = await requireMaster();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [{ data: today }, { data: upcoming }, { data: recentBookings }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, scheduled_at, service_title, price, status, client_id, profiles!client_id(full_name)")
      .eq("master_id", masterProfile.id)
      .neq("status", "cancelled")
      .gte("scheduled_at", todayStart.toISOString())
      .lt("scheduled_at", todayEnd.toISOString())
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("bookings")
      .select("id, scheduled_at, service_title, profiles!client_id(full_name)")
      .eq("master_id", masterProfile.id)
      .neq("status", "cancelled")
      .gte("scheduled_at", todayEnd.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(3),
    supabase
      .from("bookings")
      .select("price, status, scheduled_at, client_id, created_at")
      .eq("master_id", masterProfile.id)
      .neq("status", "cancelled")
      .gte("scheduled_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), income: 0 };
  });
  (recentBookings ?? []).forEach((b) => {
    const d = new Date(b.scheduled_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.income += b.price;
  });
  const last = months[months.length - 1];
  const prev = months[months.length - 2];
  const changePct = prev.income > 0 ? Math.round(((last.income - prev.income) / prev.income) * 100) : 0;

  const newClients = new Set(
    (recentBookings ?? []).filter((b) => new Date(b.created_at) >= weekAgo).map((b) => b.client_id)
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-[26px] text-ink">Здравствуйте, {profile.full_name.split(" ")[0] || "мастер"}</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">Вот как проходит ваш день</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Записей сегодня" value={String(today?.length ?? 0)} />
        <StatTile
          label="Доход за месяц"
          value={`${last.income.toLocaleString("ru-RU")} ₽`}
          delta={last.income && prev.income ? `${changePct > 0 ? "+" : ""}${changePct}% к прошлому` : undefined}
        >
          <Sparkline values={months.map((m) => m.income || 1)} />
        </StatTile>
        <StatTile label="Новые клиенты" value={String(newClients)} delta="за последние 7 дней" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] uppercase tracking-wide text-ink-faint">Сегодня</h2>
          <div className="flex flex-col gap-2.5">
            {!today || today.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface px-4 py-8 text-center text-[13.5px] text-ink-faint">
                На сегодня записей нет
              </div>
            ) : (
              today.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
                  <div className="w-14 shrink-0 text-[13px] font-medium text-ink">
                    {new Date(b.scheduled_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div
                    className="h-9 w-9 shrink-0 rounded-full"
                    style={{ background: `linear-gradient(155deg, hsl(350 32% 88%), hsl(350 30% 60%))` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink">
                      {(b.profiles as unknown as { full_name: string } | null)?.full_name ?? "Клиент"}
                    </div>
                    <div className="truncate text-[12px] text-ink-soft">{b.service_title}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[13px] text-ink">{b.price.toLocaleString("ru-RU")} ₽</div>
                    <span className="text-[10.5px]" style={{ color: b.status === "confirmed" ? "var(--accent)" : "var(--brass)" }}>
                      {b.status === "confirmed" ? "Подтверждено" : "Ожидает"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--accent)", background: "var(--accent-tint)" }}>
            <div className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: "var(--accent)" }}>
              <Sparkles size={14} strokeWidth={1.8} />
              Совет от «Мира»
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {today && today.length > 0
                ? "Загляните в календарь — на этой неделе ещё есть свободные окна, которые можно предложить постоянным клиентам."
                : "Сегодня свободный день — хороший момент обновить портфолио или добавить новую услугу."}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-[13px] uppercase tracking-wide text-ink-faint">Ближайшие события</h2>
            <div className="flex flex-col gap-2.5">
              {!upcoming || upcoming.length === 0 ? (
                <p className="text-[12.5px] text-ink-faint">Пока нет предстоящих записей</p>
              ) : (
                upcoming.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--surface-2)" }}>
                      <Clock size={14} strokeWidth={1.8} color="var(--ink-soft)" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-ink">
                        {(e.profiles as unknown as { full_name: string } | null)?.full_name ?? "Клиент"}
                      </div>
                      <div className="truncate text-[12px] text-ink-soft">{e.service_title}</div>
                    </div>
                    <div className="shrink-0 text-right text-[11.5px] text-ink-faint">
                      <div>{new Date(e.scheduled_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</div>
                      <div>{new Date(e.scheduled_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {newClients > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-3.5 text-[12.5px] text-ink-faint">
              <UserPlus size={16} strokeWidth={1.8} />
              {newClients} {newClients === 1 ? "клиент записался" : "клиента записались"} впервые за последнюю неделю
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
