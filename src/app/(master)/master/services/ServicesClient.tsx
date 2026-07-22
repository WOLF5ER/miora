"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { categories } from "@/lib/mock-data";
import type { Database, ServiceCategory } from "@/lib/supabase/database.types";

type Service = Database["public"]["Tables"]["services"]["Row"];

export default function ServicesClient({ masterId, initialServices }: { masterId: string; initialServices: Service[] }) {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addService(title: string, price: number, durationMin: number, category: ServiceCategory) {
    setSaving(true);
    const { data, error } = await supabase
      .from("services")
      .insert({ master_id: masterId, category, title, price, duration_min: durationMin })
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setServices((prev) => [...prev, data]);
      setShowAdd(false);
    }
  }

  async function updateService(id: string, title: string, price: number, durationMin: number, category: ServiceCategory) {
    setSaving(true);
    const { data, error } = await supabase
      .from("services")
      .update({ title, price, duration_min: durationMin, category })
      .eq("id", id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setServices((prev) => prev.map((s) => (s.id === id ? data : s)));
      setEditingId(null);
    }
  }

  async function deleteService(id: string) {
    setSaving(true);
    const { error } = await supabase.from("services").delete().eq("id", id);
    setSaving(false);
    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    }
  }

  async function toggleOnline(service: Service) {
    const next = !service.online_booking;
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, online_booking: next } : s)));
    await supabase.from("services").update({ online_booking: next }).eq("id", service.id);
  }

  const grouped = categories
    .map((cat) => ({ cat, items: services.filter((s) => s.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] text-ink">Услуги</h1>
          <p className="mt-1 text-[13px] text-ink-soft">{services.length} услуг · {grouped.length} категорий</p>
        </div>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
          }}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={14} strokeWidth={2} />
          Добавить услугу
        </button>
      </div>

      {showAdd ? <ServiceForm saving={saving} onClose={() => setShowAdd(false)} onSubmit={addService} submitLabel="Сохранить услугу" /> : null}

      {services.length === 0 && !showAdd ? (
        <div className="rounded-2xl border border-dashed border-line-strong px-4 py-10 text-center text-[13.5px] text-ink-faint">
          Пока нет ни одной услуги — добавьте первую, чтобы клиенты могли записаться.
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <h2 className="mb-2.5 text-[13px] uppercase tracking-wide text-ink-faint">{cat}</h2>
            <div className="flex flex-col gap-2.5">
              {items.map((s) =>
                editingId === s.id ? (
                  <ServiceForm
                    key={s.id}
                    saving={saving}
                    initial={s}
                    onClose={() => setEditingId(null)}
                    onSubmit={(title, price, duration, category) => updateService(s.id, title, price, duration, category)}
                    submitLabel="Сохранить изменения"
                  />
                ) : (
                  <div key={s.id} className="rounded-2xl border border-line bg-surface">
                    {deletingId === s.id ? (
                      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                        <span className="text-[13px] text-ink">Удалить «{s.title}»?</span>
                        <div className="flex shrink-0 gap-2">
                          <button onClick={() => setDeletingId(null)} className="rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-soft">
                            Отмена
                          </button>
                          <button
                            onClick={() => deleteService(s.id)}
                            disabled={saving}
                            className="rounded-full px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                            style={{ background: "var(--accent)" }}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                        <div className="min-w-0">
                          <div className="truncate text-[13.5px] text-ink">{s.title}</div>
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-ink-faint">
                            <Clock size={11} strokeWidth={1.8} />
                            {s.duration_min} мин
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-[13.5px] font-medium text-ink">{s.price.toLocaleString("ru-RU")} ₽</span>
                          <button
                            onClick={() => toggleOnline(s)}
                            aria-label="Онлайн-запись"
                            className="relative h-5 w-9 rounded-full transition-colors"
                            style={{ background: s.online_booking ? "var(--accent)" : "var(--line-strong)" }}
                          >
                            <span
                              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                              style={{ transform: s.online_booking ? "translateX(16px)" : "translateX(0px)" }}
                            />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(s.id);
                              setShowAdd(false);
                            }}
                            aria-label="Изменить"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-faint"
                          >
                            <Pencil size={12} strokeWidth={1.8} />
                          </button>
                          <button
                            onClick={() => setDeletingId(s.id)}
                            aria-label="Удалить"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-faint"
                          >
                            <Trash2 size={12} strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({
  saving,
  initial,
  onClose,
  onSubmit,
  submitLabel,
}: {
  saving: boolean;
  initial?: Service;
  onClose: () => void;
  onSubmit: (title: string, price: number, durationMin: number, category: ServiceCategory) => void;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(initial?.price ?? 2000);
  const [duration, setDuration] = useState(initial?.duration_min ?? 60);
  const [category, setCategory] = useState<ServiceCategory>(initial?.category ?? categories[0]);

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-medium text-ink">{initial ? "Изменить услугу" : "Новая услуга"}</div>
        <button onClick={onClose} aria-label="Закрыть">
          <X size={16} strokeWidth={1.8} color="var(--ink-faint)" />
        </button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название услуги"
        className="rounded-lg border border-line bg-surface px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <div className="grid grid-cols-3 gap-2.5">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ServiceCategory)}
          className="col-span-3 rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] text-ink sm:col-span-1"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[13px] text-ink-soft">
          <span className="shrink-0 text-ink-faint">₽</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full bg-transparent focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[13px] text-ink-soft">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-transparent focus:outline-none"
          />
          <span className="shrink-0 text-ink-faint">мин</span>
        </label>
      </div>
      <button
        disabled={!title.trim() || saving}
        onClick={() => onSubmit(title.trim(), price, duration, category)}
        className="rounded-lg py-2.5 text-[13px] font-medium text-white disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        {saving ? "Сохраняем…" : submitLabel}
      </button>
    </div>
  );
}
