"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarCheck, Heart, User } from "lucide-react";
import BrandIcon from "./BrandIcon";
import ThemeToggle from "./ThemeToggle";

const items = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/bookings", label: "Записи", icon: CalendarCheck },
  { href: "/favorites", label: "Избранное", icon: Heart },
  { href: "/profile", label: "Профиль", icon: User },
];

export default function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
      <Link href="/" className="flex items-center gap-2 px-2">
        <BrandIcon size={24} />
        <span className="font-serif text-[19px] text-ink">Miora</span>
      </Link>
      <span className="mt-0.5 px-2 text-[11px] uppercase tracking-wide text-ink-faint">Ближе к красоте</span>

      <nav className="mt-8 flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors"
              style={{
                background: active ? "var(--accent-tint)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink-soft)",
              }}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
        <span className="text-[12.5px] text-ink-faint">Тема</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
