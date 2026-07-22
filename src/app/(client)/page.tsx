import Link from "next/link";
import { Search as SearchIcon, ChevronRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { categories } from "@/lib/mock-data";
import MasterCard from "@/components/MasterCard";
import PortfolioTile from "@/components/PortfolioTile";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = createPublicClient();

  const [{ data: nearby }, { data: trending }] = await Promise.all([
    supabase.from("master_public").select("*").order("rating", { ascending: false }).limit(6),
    supabase.from("portfolio_items").select("id, master_id, hue, caption").order("created_at", { ascending: false }).limit(6),
  ]);

  return (
    <div className="flex flex-col gap-7 px-4 pt-6">
      <div className="flex items-center justify-between md:hidden">
        <Logo />
        <ThemeToggle />
      </div>

      <div>
        <div className="font-serif text-[26px] leading-tight text-ink">
          Ближе к красоте
        </div>
        <p className="mt-1 text-[13.5px] text-ink-soft">Найдите мастера рядом и запишитесь без переписки</p>
      </div>

      <Link
        href="/search"
        className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5 text-[14px] text-ink-faint shadow-sm"
      >
        <SearchIcon size={16} strokeWidth={1.8} />
        Мастер, услуга, студия…
      </Link>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/search?category=${encodeURIComponent(c)}`}
            className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-ink-soft"
          >
            {c}
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[19px] text-ink">Рядом с вами</h2>
          <Link href="/search" className="inline-flex items-center gap-0.5 text-[12.5px] text-ink-faint">
            Все мастера <ChevronRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
        {!nearby || nearby.length === 0 ? (
          <p className="text-[13px] text-ink-faint">Пока нет ни одного мастера.</p>
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nearby.map((m) => (
              <MasterCard key={m.id} master={m} />
            ))}
          </div>
        )}
      </section>

      {trending && trending.length > 0 ? (
        <section className="flex flex-col gap-3 pb-4">
          <div>
            <h2 className="font-serif text-[19px] text-ink">Подборка редакции</h2>
            <p className="text-[12.5px] text-ink-faint">Работы, на которые стоит посмотреть на этой неделе</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {trending.map((p) => (
              <Link key={p.id} href={`/masters/${p.master_id}`}>
                <PortfolioTile hue={p.hue} caption={p.caption} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
