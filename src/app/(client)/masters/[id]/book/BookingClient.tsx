"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/BackButton";
import type { ServiceRow } from "@/lib/supabase/database.types";

type Step = 1 | 2 | 3 | 4;
const dayHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function dateFor(weekStart: Date, dayIndex: number, time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  d.setHours(h, m, 0, 0);
  return d;
}

export default function BookingClient({
  masterId,
  masterName,
  services,
  weekStartIso,
  takenIso,
}: {
  masterId: string;
  masterName: string;
  services: ServiceRow[];
  weekStartIso: string;
  takenIso: string[];
}) {
  const supabase = createClient();
  const weekStart = useMemo(() => new Date(weekStartIso), [weekStartIso]);

  const takenKeys = useMemo(() => {
    const set = new Set<string>();
    takenIso.forEach((iso) => {
      const d = new Date(iso);
      const dayIndex = Math.floor((d.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      set.add(`${dayIndex}-${time}`);
    });
    return set;
  }, [takenIso, weekStart]);

  const days = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return {
          weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }),
          dayLabel: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        };
      }),
    [weekStart]
  );

  const [step, setStep] = useState<Step>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const chosen = services.filter((s) => selectedIds.includes(s.id));
  const totalPrice = chosen.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = chosen.reduce((sum, s) => sum + s.duration_min, 0);
  const combinedTitle = chosen.map((s) => s.title).join(" + ");

  function toggleService(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const canContinue = useMemo(() => {
    if (step === 1) return selectedIds.length > 0;
    if (step === 2) return time !== null;
    return true;
  }, [step, selectedIds, time]);

  async function next() {
    if (step === 3) {
      if (chosen.length === 0 || !time) return;
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userData.user!.id).single();
      const scheduledAt = dateFor(weekStart, dayIndex, time).toISOString();
      const { error } = await supabase.from("bookings").insert({
        client_id: userData.user!.id,
        client_name: profile?.full_name ?? null,
        master_id: masterId,
        service_id: chosen.length === 1 ? chosen[0].id : null,
        service_title: combinedTitle,
        price: totalPrice,
        duration_min: totalDuration,
        scheduled_at: scheduledAt,
        comment: comment.trim() || null,
        status: "confirmed",
      });
      setSaving(false);
      if (!error) setStep(4);
      return;
    }
    setStep((s) => (s + 1) as Step);
  }

  function back() {
    setStep((s) => (s - 1) as Step);
  }

  if (step === 4) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--accent-tint)" }}>
          <Check size={26} strokeWidth={2.2} color="var(--accent)" />
        </div>
        <div>
          <h1 className="font-serif text-[22px] text-ink">Запись подтверждена</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-soft">
            {masterName} ждёт вас {days[dayIndex].dayLabel} в {time}
          </p>
        </div>
        {chosen.length > 0 ? (
          <div className="w-full rounded-2xl border border-line bg-surface p-4 text-left">
            {chosen.map((s) => (
              <div key={s.id} className="flex justify-between py-1 text-[13px] text-ink-soft">
                <span>{s.title}</span>
                <span>{s.price.toLocaleString("ru-RU")} ₽</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-line pt-2 text-[13.5px] font-medium text-ink">
              <span>Итого</span>
              <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>
        ) : null}
        <div className="flex w-full flex-col gap-2.5">
          <Link href="/bookings" className="rounded-xl border border-line bg-surface py-3 text-center text-[13.5px] text-ink">
            Мои записи
          </Link>
          <Link href="/" className="rounded-xl py-3 text-center text-[13.5px] font-medium text-white" style={{ background: "var(--accent)" }}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 px-4 pt-5">
        {step === 1 ? (
          <BackButton />
        ) : (
          <button onClick={back} aria-label="Назад" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface shadow-sm">
            <ChevronLeft size={18} strokeWidth={1.8} color="var(--ink-soft)" />
          </button>
        )}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span key={n} className="h-1.5 w-1.5 rounded-full" style={{ background: n <= step ? "var(--accent)" : "var(--line-strong)" }} />
          ))}
        </div>
        <span className="text-[11.5px] text-ink-faint">шаг {step} из 3</span>
      </div>

      <div className="flex-1 px-4 pt-5">
        <h1 className="font-serif text-[21px] text-ink">
          {step === 1 && "Выберите услуги"}
          {step === 2 && "Дата и время"}
          {step === 3 && "Подтверждение"}
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">Запись к {masterName}</p>

        {step === 1 ? (
          <div className="mt-5 flex flex-col gap-2.5 pb-28">
            {services.length === 0 ? (
              <p className="text-[13.5px] text-ink-faint">У мастера пока нет услуг, доступных для онлайн-записи.</p>
            ) : (
              <>
                <p className="text-[12px] text-ink-faint">Можно выбрать несколько услуг на один визит</p>
                {services.map((s) => {
                  const active = selectedIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className="flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors"
                      style={{ borderColor: active ? "var(--accent)" : "var(--line)", background: active ? "var(--accent-tint)" : "var(--surface)" }}
                    >
                      <div>
                        <div className="text-[14px] text-ink">{s.title}</div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-ink-faint">
                          <Clock size={11} strokeWidth={1.8} />
                          {s.duration_min} мин
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-medium text-ink">{s.price.toLocaleString("ru-RU")} ₽</span>
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-md border"
                          style={{ borderColor: active ? "var(--accent)" : "var(--line-strong)", background: active ? "var(--accent)" : "transparent" }}
                        >
                          {active ? <Check size={12} strokeWidth={2.4} color="#fff" /> : null}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-5 flex flex-col gap-5 pb-28">
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {days.map((d, i) => (
                <button
                  key={d.dayLabel}
                  onClick={() => {
                    setDayIndex(i);
                    setTime(null);
                  }}
                  className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2.5"
                  style={{ borderColor: dayIndex === i ? "var(--accent)" : "var(--line)", background: dayIndex === i ? "var(--accent-tint)" : "var(--surface)" }}
                >
                  <span className="text-[11px] text-ink-faint">{d.weekday}</span>
                  <span className="text-[13px] font-medium text-ink">{d.dayLabel.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {dayHours.map((t) => {
                const available = !takenKeys.has(`${dayIndex}-${t}`);
                return (
                  <button
                    key={t}
                    disabled={!available}
                    onClick={() => setTime(t)}
                    className="rounded-xl border py-2.5 text-[13.5px] transition-colors"
                    style={{
                      borderColor: time === t ? "var(--accent)" : "var(--line)",
                      background: time === t ? "var(--accent-tint)" : "var(--surface)",
                      color: !available ? "var(--ink-faint)" : time === t ? "var(--accent)" : "var(--ink)",
                      textDecoration: !available ? "line-through" : "none",
                      opacity: !available ? 0.5 : 1,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 && chosen.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4 pb-28">
            <div className="rounded-2xl border border-line bg-surface p-4">
              {chosen.map((s) => (
                <div key={s.id} className="flex justify-between py-1 text-[13px] text-ink-soft">
                  <span>{s.title}</span>
                  <span>{s.price.toLocaleString("ru-RU")} ₽</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-line pt-2 text-[12.5px] text-ink-faint">
                <span>{days[dayIndex].dayLabel}, {time}</span>
                <span>{totalDuration} мин</span>
              </div>
              <div className="mt-1 flex justify-between text-[14px] font-medium text-ink">
                <span>Итого</span>
                <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
            <div>
              <label className="text-[12.5px] text-ink-faint">Комментарий мастеру (необязательно)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например, пожелания к оттенку или форме"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface p-3 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4 md:inset-x-auto md:left-60 md:right-0 md:bottom-10">
        <button
          onClick={next}
          disabled={!canContinue || saving}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-[14px] font-medium shadow-md disabled:opacity-40"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <span>{chosen.length > 0 ? `${totalPrice.toLocaleString("ru-RU")} ₽` : ""}</span>
          <span>{saving ? "Сохраняем…" : step === 3 ? "Подтвердить запись" : "Далее"}</span>
        </button>
      </div>
    </div>
  );
}
