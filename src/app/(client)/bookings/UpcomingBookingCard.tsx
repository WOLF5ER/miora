"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PortfolioTile from "@/components/PortfolioTile";

export default function UpcomingBookingCard({
  id,
  masterName,
  masterHue,
  serviceTitle,
  price,
  scheduledAt,
}: {
  id: string;
  masterName: string;
  masterHue: number;
  serviceTitle: string;
  price: number;
  scheduledAt: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function cancel() {
    setCancelling(true);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    setCancelling(false);
    router.refresh();
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
      <div className="w-16 shrink-0">
        <PortfolioTile hue={masterHue} aspect="aspect-square" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium text-ink">{masterName}</div>
        <div className="truncate text-[12.5px] text-ink-soft">{serviceTitle}</div>
        <div className="mt-1 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-faint">
            <Clock size={11} strokeWidth={1.8} />
            {new Date(scheduledAt).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-[11.5px] font-medium text-ink">{price.toLocaleString("ru-RU")} ₽</span>
        </div>
      </div>
      <div className="flex shrink-0 items-start">
        {confirming ? (
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={cancel}
              disabled={cancelling}
              className="rounded-full px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {cancelling ? "Отменяем…" : "Точно отменить"}
            </button>
            <button onClick={() => setConfirming(false)} className="text-[11px] text-ink-faint">
              Передумал(а)
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Отменить запись"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-faint"
          >
            <X size={13} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  );
}
