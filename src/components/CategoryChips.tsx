"use client";

import { categories } from "@/lib/mock-data";

export default function CategoryChips({
  active,
  onChange,
}: {
  active: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip label="Все" selected={active === null} onClick={() => onChange(null)} />
      {categories.map((c) => (
        <Chip key={c} label={c} selected={active === c} onClick={() => onChange(c)} />
      ))}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors"
      style={{
        borderColor: selected ? "var(--accent)" : "var(--line)",
        background: selected ? "var(--accent-tint)" : "var(--surface)",
        color: selected ? "var(--accent)" : "var(--ink-soft)",
      }}
    >
      {label}
    </button>
  );
}
