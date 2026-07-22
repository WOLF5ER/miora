import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { MasterPublic } from "@/lib/supabase/database.types";
import RatingBadge from "./RatingBadge";
import PortfolioTile from "./PortfolioTile";

export default function MasterCard({ master }: { master: MasterPublic }) {
  return (
    <Link
      href={`/masters/${master.id}`}
      className="flex shrink-0 w-[168px] flex-col gap-2.5 rounded-2xl border border-line bg-surface p-2.5 shadow-sm transition-transform active:scale-[0.98]"
    >
      <PortfolioTile hue={master.hue} aspect="aspect-[4/5]" imageUrl={master.avatar_url || undefined} />
      <div className="px-0.5 pb-0.5">
        <div className="flex items-center gap-1">
          <span className="truncate text-[14px] font-medium text-ink">{master.name}</span>
          {master.is_verified ? <BadgeCheck size={13} strokeWidth={2} color="var(--accent)" /> : null}
        </div>
        <div className="truncate text-[12px] text-ink-soft">{master.specialization}</div>
        <div className="mt-1.5 flex items-center justify-between">
          <RatingBadge rating={master.rating} />
        </div>
        <div className="mt-1 truncate text-[11px] text-ink-faint">
          {master.city}, {master.district}
        </div>
      </div>
    </Link>
  );
}
