"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      aria-label="Назад"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 shadow-sm backdrop-blur"
    >
      <ChevronLeft size={18} strokeWidth={1.8} color="var(--ink-soft)" />
    </button>
  );
}
