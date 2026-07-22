"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PortfolioTile from "@/components/PortfolioTile";
import type { Database } from "@/lib/supabase/database.types";

type ClientRow = { id: string; name: string; phone: string; totalVisits: number; lastVisit: string };
type Note = Database["public"]["Tables"]["client_notes"]["Row"];

export default function ClientsClient({
  masterId,
  clients,
  notesMap,
  portfolio,
}: {
  masterId: string;
  clients: ClientRow[];
  notesMap: Record<string, Note>;
  portfolio: { id: string; hue: number; caption: string }[];
}) {
  const supabase = createClient();
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "");
  const [notes, setNotes] = useState<Record<string, { preferences: string; notes: string }>>(
    Object.fromEntries(
      clients.map((c) => [c.id, { preferences: notesMap[c.id]?.preferences ?? "", notes: notesMap[c.id]?.notes ?? "" }])
    )
  );

  const selected = clients.find((c) => c.id === selectedId);

  async function saveNotes(clientId: string, field: "preferences" | "notes", value: string) {
    setNotes((prev) => ({ ...prev, [clientId]: { ...prev[clientId], [field]: value } }));
    await supabase
      .from("client_notes")
      .upsert(
        { master_id: masterId, client_id: clientId, ...notes[clientId], [field]: value, updated_at: new Date().toISOString() },
        { onConflict: "master_id,client_id" }
      );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="font-serif text-[24px] text-ink">Клиенты</h1>
        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center text-[13.5px] text-ink-faint">
          Пока нет ни одного клиента — база пополнится, как только появятся первые записи.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-[24px] text-ink">Клиенты</h1>
        <p className="mt-1 text-[13px] text-ink-soft">{clients.length} клиентов в базе</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{ background: selectedId === c.id ? "var(--accent-tint)" : "transparent" }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-[12px]"
                style={{ background: "var(--surface-2)", color: "var(--ink)" }}
              >
                {c.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-ink">{c.name}</div>
                <div className="truncate text-[12px] text-ink-faint">
                  {c.totalVisits} {c.totalVisits === 1 ? "визит" : "визитов"} · последний {c.lastVisit}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-[15px]"
                style={{ background: "var(--surface-2)", color: "var(--ink)" }}
              >
                {selected.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div>
                <div className="text-[15px] font-medium text-ink">{selected.name}</div>
                {selected.phone ? (
                  <div className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                    <Phone size={12} strokeWidth={1.8} />
                    {selected.phone}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-line px-3.5 py-3">
                <div className="text-[14px] font-medium text-ink">{selected.totalVisits}</div>
                <div className="text-[11.5px] text-ink-faint">Всего визитов</div>
              </div>
              <div className="rounded-xl border border-line px-3.5 py-3">
                <div className="text-[14px] font-medium text-ink">{selected.lastVisit}</div>
                <div className="text-[11.5px] text-ink-faint">Последний визит</div>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] uppercase tracking-wide text-ink-faint">Предпочтения</label>
              <textarea
                value={notes[selected.id]?.preferences ?? ""}
                onChange={(e) => saveNotes(selected.id, "preferences", e.target.value)}
                rows={2}
                placeholder="Например, любимые оттенки, форма"
                className="mt-1.5 w-full rounded-xl border border-line bg-surface p-3 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11.5px] uppercase tracking-wide text-ink-faint">Заметки мастера</label>
              <textarea
                value={notes[selected.id]?.notes ?? ""}
                onChange={(e) => saveNotes(selected.id, "notes", e.target.value)}
                rows={3}
                placeholder="Например, особенности кожи, аллергии, пожелания"
                className="mt-1.5 w-full rounded-xl border border-line bg-surface p-3 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>

            {portfolio.length > 0 ? (
              <div>
                <div className="text-[11.5px] uppercase tracking-wide text-ink-faint">Фото работ</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {portfolio.map((p) => (
                    <PortfolioTile key={p.id} hue={p.hue} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
