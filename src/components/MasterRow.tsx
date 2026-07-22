import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import type { MasterPublic } from "@/lib/supabase/database.types";
import RatingBadge from "./RatingBadge";
import PortfolioTile from "./PortfolioTile";

export default function MasterRow({ master }: { master: MasterPublic }) {
  return (
    <Link
      href={`/masters/${master.id}`}
      className="flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="w-20 shrink-0">
        <PortfolioTile hue={master.hue} aspect="aspect-square" imageUrl={master.avatar_url || undefined} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-[14.5px] font-medium text-ink">{master.name}</span>
          {master.is_verified ? <BadgeCheck size={13} strokeWidth={2} color="var(--accent)" /> : null}
        </div>
        <div className="truncate text-[12.5px] text-ink-soft">{master.specialization}</div>
        <div className="mt-1.5 flex items-center gap-3">
          <RatingBadge rating={master.rating} reviewsCount={master.reviews_count} />
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} strokeWidth={1.8} />
            {master.district}
          </span>
        </div>
      </div>
      <div className="shrink-0 self-center text-right">
        <div className="text-[13px] font-medium text-ink">от {master.price_from.toLocaleString("ru-RU")} ₽</div>
      </div>
    </Link>
  );
}
