"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { MasterPublic, ServiceRow, PortfolioItemRow, ReviewRow } from "@/lib/supabase/database.types";
import PortfolioTile from "./PortfolioTile";

const TABS = ["Портфолио", "Услуги", "Отзывы", "О мастере"] as const;
type Tab = (typeof TABS)[number];

export default function MasterProfileTabs({
  master,
  services,
  portfolio,
  reviews,
}: {
  master: MasterPublic;
  services: ServiceRow[];
  portfolio: PortfolioItemRow[];
  reviews: ReviewRow[];
}) {
  const [tab, setTab] = useState<Tab>("Портфолио");

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-surface/95 px-4 backdrop-blur">
        <div className="flex gap-5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative py-3 text-[13.5px] transition-colors"
              style={{ color: tab === t ? "var(--ink)" : "var(--ink-faint)" }}
            >
              {t}
              {tab === t ? (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full" style={{ background: "var(--accent)" }} />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="py-5">
        {tab === "Портфолио" ? (
          portfolio.length === 0 ? (
            <p className="text-[13px] text-ink-faint">Мастер пока не добавил работы в портфолио.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {portfolio.map((p) => (
                <PortfolioTile key={p.id} hue={p.hue} caption={p.caption} imageUrl={p.image_url ?? undefined} />
              ))}
            </div>
          )
        ) : null}

        {tab === "Услуги" ? (
          services.length === 0 ? (
            <p className="text-[13px] text-ink-faint">Мастер пока не добавил услуги.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3.5">
                  <div>
                    <div className="text-[14px] text-ink">{s.title}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-ink-faint">
                      <Clock size={11} strokeWidth={1.8} />
                      {s.duration_min} мин
                    </div>
                  </div>
                  <div className="text-[14px] font-medium text-ink">{s.price.toLocaleString("ru-RU")} ₽</div>
                </div>
              ))}
            </div>
          )
        ) : null}

        {tab === "Отзывы" ? (
          reviews.length === 0 ? (
            <p className="text-[13px] text-ink-faint">Пока нет отзывов.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-medium text-ink">{r.author_name}</span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-ink-soft">
                      <Star size={12} strokeWidth={0} fill="var(--brass)" />
                      {r.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{r.text}</p>
                  <div className="mt-2 text-[11.5px] text-ink-faint">
                    {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                  </div>
                  {r.master_reply ? (
                    <div className="mt-2.5 rounded-lg bg-surface-2 px-3 py-2 text-[12.5px] text-ink-soft">
                      <span className="font-medium text-ink">Ответ мастера. </span>
                      {r.master_reply}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )
        ) : null}

        {tab === "О мастере" ? (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-ink-soft">{master.bio || "Мастер пока не добавил описание."}</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Записей выполнено" value={master.bookings_count.toString()} />
              <Stat label="В Miora с" value={master.member_since} />
              <Stat label="Город" value={`${master.city}, ${master.district}`} />
              <Stat label="Отзывов" value={master.reviews_count.toString()} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="h-20" />

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4 md:inset-x-auto md:left-60 md:right-0 md:bottom-10">
        <Link
          href={`/masters/${master.id}/book`}
          className="flex items-center justify-between rounded-2xl px-5 py-3.5 text-[14px] shadow-md"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <span className="opacity-90">Услуг: {services.length}</span>
          <span className="font-medium">Записаться</span>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3">
      <div className="text-[14px] font-medium text-ink">{value}</div>
      <div className="text-[11.5px] text-ink-faint">{label}</div>
    </div>
  );
}
