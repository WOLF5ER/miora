"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/lib/types";
import type { MasterPublic } from "@/lib/supabase/database.types";
import CategoryChips from "@/components/CategoryChips";
import MasterRow from "@/components/MasterRow";

type SortKey = "rating" | "price";

function SearchInner({ masters, categoriesByMaster }: { masters: MasterPublic[]; categoriesByMaster: Record<string, string[]> }) {
  const params = useSearchParams();
  const initialCategory = (params.get("category") as Category | null) ?? null;

  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");

  const results = useMemo(() => {
    let list = masters.filter((m) => (category ? (categoriesByMaster[m.id] ?? []).includes(category) : true));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.specialization.toLowerCase().includes(q) ||
          m.district.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "price") sorted.sort((a, b) => a.price_from - b.price_from);
    return sorted;
  }, [category, query, sort, masters, categoriesByMaster]);

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="font-serif text-[24px] text-ink">Поиск мастеров</h1>

      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-sm">
        <SearchIcon size={16} strokeWidth={1.8} color="var(--ink-faint)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Мастер, услуга, район…"
          className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      <CategoryChips active={category} onChange={(v) => setCategory(v as Category | null)} />

      <div className="flex items-center justify-between text-[12.5px] text-ink-faint">
        <span>{results.length} мастеров найдено</span>
        <div className="flex items-center gap-1">
          <SlidersHorizontal size={13} strokeWidth={1.8} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent text-ink-soft focus:outline-none"
          >
            <option value="rating">По рейтингу</option>
            <option value="price">По цене</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pb-6">
        {results.map((m) => (
          <MasterRow key={m.id} master={m} />
        ))}
        {results.length === 0 ? (
          <p className="pt-8 text-center text-[13.5px] text-ink-faint">
            Ничего не найдено — попробуйте другую категорию или запрос.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchClient(props: { masters: MasterPublic[]; categoriesByMaster: Record<string, string[]> }) {
  return (
    <Suspense>
      <SearchInner {...props} />
    </Suspense>
  );
}
