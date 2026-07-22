"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, ListChecks, Wallet, Image as ImageIcon, ArrowLeftRight, LogOut, Settings } from "lucide-react";
import BrandIcon from "./BrandIcon";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "@/app/(auth)/actions";

const items = [
  { href: "/master", label: "Dashboard", icon: LayoutDashboard },
  { href: "/master/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/master/clients", label: "Клиенты", icon: Users },
  { href: "/master/services", label: "Услуги", icon: ListChecks },
  { href: "/master/finance", label: "Финансы", icon: Wallet },
  { href: "/master/portfolio", label: "Портфолио", icon: ImageIcon },
  { href: "/master/settings", label: "Настройки", icon: Settings },
];

export default function MasterSidebar({
  name,
  specialization,
  avatarUrl,
}: {
  name: string;
  specialization: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const initials = name.split(" ").map((p) => p[0]).join("");

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <Link href="/master" className="flex items-center gap-2 px-2">
          <BrandIcon size={24} />
          <span className="font-serif text-[19px] text-ink">Miora</span>
        </Link>
        <span className="mt-0.5 px-2 text-[11px] uppercase tracking-wide text-ink-faint">Кабинет мастера</span>

        <nav className="mt-8 flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/master" ? pathname === "/master" : pathname.startsWith(href);
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

        <div className="mt-auto flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-ink-faint">
            <ArrowLeftRight size={15} strokeWidth={1.8} />
            Клиентское приложение
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5">
            <Link href="/master/settings" className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={initials} avatarUrl={avatarUrl} size={32} fontSize={12} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-ink">{name}</div>
                <div className="truncate text-[11px] text-ink-faint">{specialization || "Специализация не указана"}</div>
              </div>
            </Link>
            <ThemeToggle />
          </div>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-ink-faint">
              <LogOut size={14} strokeWidth={1.8} />
              Выйти
            </button>
          </form>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/master" className="flex items-center gap-2">
          <BrandIcon size={20} />
          <span className="font-serif text-[16px] text-ink">Miora · мастер</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/master/settings" aria-label="Настройки аккаунта">
            <Avatar name={initials} avatarUrl={avatarUrl} size={32} fontSize={12} />
          </Link>
        </div>
      </div>
      <nav className="sticky top-[53px] z-30 flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/master" ? pathname === "/master" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
              style={{
                background: active ? "var(--accent-tint)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink-faint)",
              }}
            >
              <Icon size={13} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] text-ink-faint"
        >
          <ArrowLeftRight size={13} strokeWidth={1.8} />
          Клиент
        </Link>
      </nav>
    </>
  );
}

function Avatar({ name, avatarUrl, size, fontSize }: { name: string; avatarUrl?: string | null; size: number; fontSize: number }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="shrink-0 rounded-full border border-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-serif"
      style={{ width: size, height: size, fontSize, background: "var(--surface-2)", color: "var(--ink)" }}
    >
      {name}
    </div>
  );
}
