"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];

const dayHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type Selection = { type: "booking"; id: string } | { type: "add"; dayIndex: number; time: string } | null;

function cellKeyFor(scheduledAt: string, weekStart: Date) {
  const d = new Date(scheduledAt);
  const dayIndex = Math.floor((d.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return { dayIndex, time, key: `${dayIndex}-${time}` };
}

function dateFor(weekStart: Date, dayIndex: number, time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  d.setHours(h, m, 0, 0);
  return d;
}

export default function CalendarClient({
  masterId,
  weekStartIso,
  initialBookings,
  services,
}: {
  masterId: string;
  weekStartIso: string;
  initialBookings: Booking[];
  services: Service[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const weekStart = useMemo(() => new Date(weekStartIso), [weekStartIso]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selection, setSelection] = useState<Selection>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function flashToast(message: string) {
    setToast(message);
    setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  }

  const weekDayDates = useMemo(
    () =>
      dayLabels.map((label, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return { label, date: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) };
      }),
    [weekStart]
  );

  const grid = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach((b) => {
      const { key } = cellKeyFor(b.scheduled_at, weekStart);
      map.set(key, b);
    });
    return map;
  }, [bookings, weekStart]);

  const selectedBooking = selection?.type === "booking" ? bookings.find((b) => b.id === selection.id) : null;

  async function cancelBooking(id: string) {
    setBusy(true);
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    setBusy(false);
    if (error) {
      flashToast("Не удалось отменить запись");
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setSelection(null);
    flashToast("Запись отменена");
    router.refresh();
  }

  async function rescheduleBooking(id: string, dayIndex: number, time: string) {
    const clashing = grid.get(`${dayIndex}-${time}`);
    if (clashing && clashing.id !== id) {
      flashToast("Это время уже занято");
      return;
    }
    setBusy(true);
    const scheduledAt = dateFor(weekStart, dayIndex, time).toISOString();
    const { data, error } = await supabase.from("bookings").update({ scheduled_at: scheduledAt }).eq("id", id).select().single();
    setBusy(false);
    if (error || !data) {
      flashToast("Не удалось перенести запись");
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
    setSelection(null);
    flashToast(`Перенесено на ${dayLabels[dayIndex]}, ${time}`);
    router.refresh();
  }

  async function addBooking(dayIndex: number, time: string, clientName: string, service: Service) {
    setBusy(true);
    const scheduledAt = dateFor(weekStart, dayIndex, time).toISOString();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        master_id: masterId,
        service_id: service.id,
        service_title: service.title,
        price: service.price,
        duration_min: service.duration_min,
        scheduled_at: scheduledAt,
        client_name: clientName,
        status: "confirmed",
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      flashToast("Не удалось добавить запись");
      return;
    }
    setBookings((prev) => [...prev, data]);
    setSelection(null);
    flashToast("Запись добавлена");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] text-ink">Календарь</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            {weekDayDates[0].date} – {weekDayDates[6].date}
          </p>
        </div>
        <button
          onClick={() => setSelection({ type: "add", dayIndex: 0, time: dayHours[0] })}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={14} strokeWidth={2} />
          Добавить запись
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,1fr)]">
            <div className="border-b border-r border-line" />
            {weekDayDates.map((d) => (
              <div key={d.label} className="border-b border-r border-line px-2 py-2.5 text-center last:border-r-0">
                <div className="text-[11px] text-ink-faint">{d.label}</div>
                <div className="text-[12.5px] font-medium text-ink">{d.date.split(" ")[0]}</div>
              </div>
            ))}

            {dayHours.map((hour) => (
              <RowFragment
                key={hour}
                hour={hour}
                grid={grid}
                selection={selection}
                onSelectBooking={(id) => setSelection({ type: "booking", id })}
                onSelectEmpty={(dayIndex, time) => setSelection({ type: "add", dayIndex, time })}
              />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          {!selection ? (
            <p className="text-[13px] text-ink-faint">
              Выберите запись, чтобы увидеть детали, или пустой слот, чтобы добавить новую запись.
            </p>
          ) : null}

          {selectedBooking ? (
            <BookingDetails
              booking={selectedBooking}
              weekStart={weekStart}
              busy={busy}
              onClose={() => setSelection(null)}
              onCancel={() => cancelBooking(selectedBooking.id)}
              onReschedule={(dayIndex, time) => rescheduleBooking(selectedBooking.id, dayIndex, time)}
            />
          ) : null}

          {selection?.type === "add" ? (
            <AddBookingForm
              dayIndex={selection.dayIndex}
              time={selection.time}
              services={services}
              occupied={grid}
              busy={busy}
              onClose={() => setSelection(null)}
              onAdd={addBooking}
            />
          ) : null}
        </aside>
      </div>

      {toast ? (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="rounded-full px-4 py-2.5 text-[13px] font-medium text-white shadow-2xl" style={{ background: "var(--accent-strong)" }}>
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RowFragment({
  hour,
  grid,
  selection,
  onSelectBooking,
  onSelectEmpty,
}: {
  hour: string;
  grid: Map<string, Booking>;
  selection: Selection;
  onSelectBooking: (id: string) => void;
  onSelectEmpty: (dayIndex: number, time: string) => void;
}) {
  return (
    <>
      <div className="border-b border-r border-line px-2 py-2 text-[11px] text-ink-faint">{hour}</div>
      {dayLabels.map((_, dayIndex) => {
        const key = `${dayIndex}-${hour}`;
        const booking = grid.get(key);
        const isSelected =
          (selection?.type === "booking" && booking?.id === selection.id) ||
          (selection?.type === "add" && selection.dayIndex === dayIndex && selection.time === hour);

        if (booking) {
          const label = booking.client_name ?? "Клиент";
          return (
            <button key={key} onClick={() => onSelectBooking(booking.id)} className="min-h-[52px] border-b border-r border-line p-1 text-left last:border-r-0">
              <div
                className="h-full rounded-lg px-2 py-1.5 text-[11px] leading-tight"
                style={{
                  background: booking.status === "confirmed" ? "var(--accent-tint)" : "var(--surface-3)",
                  border: isSelected ? "1.5px solid var(--accent)" : "1px solid transparent",
                  color: "var(--ink)",
                }}
              >
                <div className="truncate font-medium">{label}</div>
                <div className="truncate text-ink-faint">{booking.service_title}</div>
              </div>
            </button>
          );
        }

        return (
          <button
            key={key}
            onClick={() => onSelectEmpty(dayIndex, hour)}
            className="min-h-[52px] border-b border-r border-line transition-colors last:border-r-0 hover:bg-surface-2"
            style={{ outline: isSelected ? "1.5px solid var(--accent)" : "none", outlineOffset: -1.5 }}
          />
        );
      })}
    </>
  );
}

function BookingDetails({
  booking,
  weekStart,
  busy,
  onClose,
  onCancel,
  onReschedule,
}: {
  booking: Booking;
  weekStart: Date;
  busy: boolean;
  onClose: () => void;
  onCancel: () => void;
  onReschedule: (dayIndex: number, time: string) => void;
}) {
  const current = cellKeyFor(booking.scheduled_at, weekStart);
  const [day, setDay] = useState(current.dayIndex);
  const [time, setTime] = useState(dayHours.includes(current.time) ? current.time : dayHours[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14.5px] font-medium text-ink">{booking.client_name ?? "Клиент"}</div>
          <div className="text-[12.5px] text-ink-soft">{booking.service_title}</div>
        </div>
        <button onClick={onClose} aria-label="Закрыть">
          <X size={16} strokeWidth={1.8} color="var(--ink-faint)" />
        </button>
      </div>

      <div className="flex justify-between text-[12.5px] text-ink-soft">
        <span>{dayLabels[current.dayIndex]}, {current.time}</span>
        <span>{booking.duration_min} мин</span>
      </div>
      <div className="flex justify-between text-[13.5px] font-medium text-ink">
        <span>Стоимость</span>
        <span>{booking.price.toLocaleString("ru-RU")} ₽</span>
      </div>

      <div className="border-t border-line pt-3">
        <div className="text-[11.5px] uppercase tracking-wide text-ink-faint">Перенести на</div>
        <div className="mt-2 flex gap-2">
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="flex-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px] text-ink">
            {dayLabels.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
          <select value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px] text-ink">
            {dayHours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <button disabled={busy} onClick={() => onReschedule(day, time)} className="mt-2.5 w-full rounded-lg border border-line py-2 text-[12.5px] text-ink-soft disabled:opacity-50">
          Перенести запись
        </button>
      </div>

      <button disabled={busy} onClick={onCancel} className="rounded-lg py-2 text-[12.5px] font-medium disabled:opacity-50" style={{ color: "var(--accent)" }}>
        Отменить запись
      </button>
    </div>
  );
}

function AddBookingForm({
  dayIndex,
  time,
  services,
  occupied,
  busy,
  onClose,
  onAdd,
}: {
  dayIndex: number;
  time: string;
  services: Service[];
  occupied: Map<string, Booking>;
  busy: boolean;
  onClose: () => void;
  onAdd: (dayIndex: number, time: string, clientName: string, service: Service) => void;
}) {
  const [day, setDay] = useState(dayIndex);
  const [slot, setSlot] = useState(time);
  const [clientName, setClientName] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");

  const takenNow = occupied.has(`${day}-${slot}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-medium text-ink">Новая запись</div>
        <button onClick={onClose} aria-label="Закрыть">
          <X size={16} strokeWidth={1.8} color="var(--ink-faint)" />
        </button>
      </div>

      <div>
        <label className="text-[11.5px] uppercase tracking-wide text-ink-faint">Имя клиента</label>
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Например, Марина Волкова"
          className="mt-1.5 w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      {services.length === 0 ? (
        <p className="text-[12.5px] text-ink-faint">Сначала добавьте хотя бы одну услугу на странице «Услуги».</p>
      ) : (
        <div>
          <label className="text-[11.5px] uppercase tracking-wide text-ink-faint">Услуга</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] text-ink"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} · {s.price.toLocaleString("ru-RU")} ₽
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="flex-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px] text-ink">
          {dayLabels.map((label, i) => (
            <option key={label} value={i}>
              {label}
            </option>
          ))}
        </select>
        <select value={slot} onChange={(e) => setSlot(e.target.value)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px] text-ink">
          {dayHours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {takenNow ? <p className="text-[12px]" style={{ color: "var(--accent)" }}>Это время уже занято</p> : null}

      <button
        disabled={takenNow || busy || !clientName.trim() || services.length === 0}
        onClick={() => {
          const service = services.find((s) => s.id === serviceId);
          if (!service) return;
          onAdd(day, slot, clientName.trim(), service);
        }}
        className="rounded-lg py-2.5 text-[13px] font-medium text-white disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        {busy ? "Сохраняем…" : "Добавить запись"}
      </button>
    </div>
  );
}
