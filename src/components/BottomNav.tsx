"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarCheck, Heart, User } from "lucide-react";

const items = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/bookings", label: "Записи", icon: CalendarCheck },
  { href: "/favorites", label: "Избранное", icon: Heart },
  { href: "/profile", label: "Профиль", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] tracking-wide"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.6}
                color={active ? "var(--accent)" : "var(--ink-faint)"}
              />
              <span style={{ color: active ? "var(--ink)" : "var(--ink-faint)" }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
