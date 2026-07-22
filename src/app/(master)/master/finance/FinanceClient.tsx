"use client";

import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatTile from "@/components/StatTile";
import Sparkline from "@/components/Sparkline";
import type { Database } from "@/lib/supabase/database.types";

type Month = { key: string; label: string; income: number; expenses: number };
type Expense = Database["public"]["Tables"]["expenses"]["Row"];

export default function FinanceClient({ masterId, months, expenses }: { masterId: string; months: Month[]; expenses: Expense[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(1000);

  const last = months[months.length - 1];
  const prev = months[months.length - 2];
  const profit = (m: Month) => m.income - m.expenses;
  const changePct = prev.income > 0 ? Math.round(((last.income - prev.income) / prev.income) * 100) : 0;
  const maxIncome = Math.max(...months.map((m) => m.income), 1);

  function exportCsv() {
    const rows = [
      ["Месяц", "Доход", "Расходы", "Прибыль"],
      ...months.map((m) => [m.label, String(m.income), String(m.expenses), String(profit(m))]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "miora-finance.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function addExpense() {
    if (!label.trim()) return;
    await supabase.from("expenses").insert({ master_id: masterId, label: label.trim(), amount });
    setShowAdd(false);
    setLabel("");
    setAmount(1000);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] text-ink">Финансы</h1>
          <p className="mt-1 text-[13px] text-ink-soft">Последние 6 месяцев</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-ink-soft">
            <Plus size={14} strokeWidth={1.8} />
            Расход
          </button>
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-ink-soft">
            <Download size={14} strokeWidth={1.8} />
            Экспорт в CSV
          </button>
        </div>
      </div>

      {showAdd ? (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-4">
          <label className="flex flex-1 min-w-[160px] flex-col gap-1.5">
            <span className="text-[11.5px] text-ink-faint">Статья расхода</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Например, материалы" className="rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] text-ink-faint">Сумма</span>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-28 rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] text-ink focus:outline-none" />
          </label>
          <button onClick={addExpense} className="rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "var(--accent)" }}>
            Сохранить
          </button>
          <button onClick={() => setShowAdd(false)} className="rounded-lg px-3 py-2 text-[13px] text-ink-faint">
            Отмена
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label={`Доход за ${last.label}`} value={`${last.income.toLocaleString("ru-RU")} ₽`} delta={last.income && prev.income ? `${changePct > 0 ? "+" : ""}${changePct}%` : undefined}>
          <Sparkline values={months.map((m) => m.income || 1)} />
        </StatTile>
        <StatTile label={`Расходы за ${last.label}`} value={`${last.expenses.toLocaleString("ru-RU")} ₽`} />
        <StatTile label={`Прибыль за ${last.label}`} value={`${profit(last).toLocaleString("ru-RU")} ₽`} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-[13px] uppercase tracking-wide text-ink-faint">Доход и расходы по месяцам</h2>
        <div className="flex flex-col gap-3">
          {months.map((m) => (
            <div key={m.key} className="flex items-center gap-3">
              <span className="w-9 shrink-0 text-[12.5px] text-ink-faint">{m.label}</span>
              <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(m.income / maxIncome) * 100}%`, background: "var(--accent-tint)" }} />
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(m.expenses / maxIncome) * 100}%`, background: "var(--brass)", opacity: 0.55 }} />
              </div>
              <span className="w-24 shrink-0 text-right text-[12.5px] text-ink">{m.income.toLocaleString("ru-RU")} ₽</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-[12px] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
            Доход
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--brass)", opacity: 0.55 }} />
            Расходы
          </span>
        </div>
      </div>

      {expenses.length > 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <div className="border-b border-line px-4 py-3 text-[13px] uppercase tracking-wide text-ink-faint">Расходы</div>
          <div className="flex flex-col divide-y divide-line">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-ink">{e.label}</span>
                <span className="text-ink-faint">
                  {new Date(e.occurred_on).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} · {e.amount.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
