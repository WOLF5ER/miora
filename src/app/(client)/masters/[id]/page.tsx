import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import RatingBadge from "@/components/RatingBadge";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import MasterProfileTabs from "@/components/MasterProfileTabs";

export const revalidate = 30;

export default async function MasterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();

  const [{ data: master }, { data: services }, { data: portfolio }, { data: reviews }] = await Promise.all([
    supabase.from("master_public").select("*").eq("id", id).single(),
    supabase.from("services").select("*").eq("master_id", id).order("created_at", { ascending: true }),
    supabase.from("portfolio_items").select("*").eq("master_id", id).order("created_at", { ascending: false }),
    supabase.from("reviews").select("*").eq("master_id", id).order("created_at", { ascending: false }),
  ]);

  if (!master) notFound();

  const initials = master.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div>
      <div
        className="relative isolate h-44 w-full overflow-hidden"
        style={{
          background: `linear-gradient(160deg, hsl(${master.hue} 34% 90%), hsl(${master.hue + 16} 28% 76%) 55%, hsl(${master.hue - 10} 32% 58%))`,
        }}
      >
        {master.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={master.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="relative flex items-center justify-between px-4 pt-5">
          <BackButton />
          <FavoriteButton masterId={master.id} />
        </div>
      </div>

      <div className="relative z-10 px-4">
        {master.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={master.avatar_url}
            alt=""
            className="-mt-10 h-20 w-20 rounded-full border-4 object-cover"
            style={{ borderColor: "var(--surface)" }}
          />
        ) : (
          <div
            className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 font-serif text-[22px]"
            style={{ borderColor: "var(--surface)", background: "var(--surface-2)", color: "var(--ink)" }}
          >
            {initials}
          </div>
        )}

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif text-[21px] text-ink">{master.name}</h1>
            {master.is_verified ? <BadgeCheck size={16} strokeWidth={2} color="var(--accent)" /> : null}
          </div>
          <p className="text-[13.5px] text-ink-soft">{master.specialization}</p>

          <div className="mt-2 flex items-center gap-3">
            <RatingBadge rating={master.rating} reviewsCount={master.reviews_count} size="md" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {master.is_verified ? <Badge>Verified</Badge> : null}
            <Badge>{master.bookings_count}+ записей</Badge>
            <Badge>В Miora с {master.member_since}</Badge>
          </div>
        </div>

        {master.bio && master.bio.trim() ? (
          <div className="mt-4 text-[13.5px] text-ink-soft">{master.bio}</div>
        ) : null}

        <MasterProfileTabs master={master} services={services ?? []} portfolio={portfolio ?? []} reviews={reviews ?? []} />
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-ink-soft">{children}</span>
  );
}
