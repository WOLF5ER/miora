"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/use-favorites";

export default function FavoriteButton({ masterId }: { masterId: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(masterId);

  return (
    <button
      onClick={() => toggle(masterId)}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 shadow-sm backdrop-blur"
    >
      <Heart size={17} strokeWidth={1.7} color={active ? "var(--accent)" : "var(--ink-soft)"} fill={active ? "var(--accent)" : "none"} />
    </button>
  );
}
