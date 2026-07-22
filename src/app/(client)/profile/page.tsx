import Link from "next/link";
import { Bell, ChevronRight, HelpCircle, LogOut, Shield, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import ThemeToggle from "@/components/ThemeToggle";
import InstallAppButton from "@/components/InstallAppButton";

const items = [
  { icon: Bell, label: "Уведомления", href: "/notifications" },
  { icon: Shield, label: "Приватность", href: "/privacy" },
  { icon: HelpCircle, label: "Помощь", href: "/help" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? (await supabase.from("profiles").select("full_name").eq("id", user.id).single()).data : null;
  const name = profile?.full_name || "Гость";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[24px] text-ink">Профиль</h1>
        <ThemeToggle className="md:hidden" />
      </div>

      {!user ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
          <p className="text-[13.5px] text-ink-soft">Войдите, чтобы записываться и сохранять мастеров.</p>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-[13px] font-medium text-white" style={{ background: "var(--accent)" }}>
              Войти
            </Link>
            <Link href="/signup" className="rounded-full border border-line px-4 py-2 text-[13px] text-ink-soft">
              Регистрация
            </Link>
          </div>
        </div>
      ) : (
        <Link href="/profile/settings" className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full font-serif text-[18px]" style={{ background: "var(--surface-2)", color: "var(--ink)" }}>
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium text-ink">{name}</div>
            <div className="text-[12.5px] text-ink-faint">{user.email}</div>
          </div>
          <ChevronRight size={16} strokeWidth={1.8} color="var(--ink-faint)" />
        </Link>
      )}

      <Link
        href="/master"
        className="flex items-center gap-3 rounded-2xl border p-4"
        style={{ borderColor: "var(--accent)", background: "var(--accent-tint)" }}
      >
        <Sparkles size={18} strokeWidth={1.8} color="var(--accent)" />
        <div className="flex-1">
          <div className="text-[13.5px] font-medium text-ink">Вы мастер?</div>
          <div className="text-[12px] text-ink-soft">Откройте кабинет мастера — записи, календарь, финансы</div>
        </div>
        <ChevronRight size={16} strokeWidth={1.8} color="var(--accent)" />
      </Link>

      <InstallAppButton />

      <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface pb-6">
        {items.map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href} className="flex items-center justify-between px-4 py-3.5 text-left">
            <span className="flex items-center gap-3 text-[13.5px] text-ink">
              <Icon size={16} strokeWidth={1.7} color="var(--ink-soft)" />
              {label}
            </span>
            <ChevronRight size={15} strokeWidth={1.8} color="var(--ink-faint)" />
          </Link>
        ))}
      </div>

      {user ? (
        <form action={signOut}>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3 text-[13.5px] text-ink-soft">
            <LogOut size={15} strokeWidth={1.8} />
            Выйти
          </button>
        </form>
      ) : null}

      <div className="pb-4 text-center text-[11.5px] text-ink-faint">Miora · Ближе к красоте · v0.1</div>
    </div>
  );
}
