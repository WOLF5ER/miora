"use client";

import { useCallback, useSyncExternalStore } from "react";
import BackButton from "@/components/BackButton";

type Prefs = { emailReminders: boolean; favoriteMasterNews: boolean };
const KEY = "miora-notification-prefs";
const EVENT = "miora-notification-prefs-changed";
const DEFAULTS: Prefs = { emailReminders: true, favoriteMasterNews: false };

let cachedRaw: string | null | undefined = undefined;
let cachedPrefs: Prefs = DEFAULTS;

function readPrefs(): Prefs {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return DEFAULTS;
  }
  if (raw === cachedRaw) return cachedPrefs;
  cachedRaw = raw;
  try {
    cachedPrefs = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    cachedPrefs = DEFAULTS;
  }
  return cachedPrefs;
}

function writePrefs(next: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(next));
  cachedRaw = undefined; // force readPrefs to re-parse on next call
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getServerSnapshot(): Prefs {
  return DEFAULTS;
}

export default function NotificationsPage() {
  const prefs = useSyncExternalStore(subscribe, readPrefs, getServerSnapshot);

  const toggle = useCallback((key: keyof Prefs) => {
    const current = readPrefs();
    writePrefs({ ...current, [key]: !current[key] });
  }, []);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="font-serif text-[22px] text-ink">Уведомления</h1>
      </div>

      <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
        <Toggle
          label="Напоминания о записи"
          hint="Письмо за день и за пару часов до визита"
          checked={prefs.emailReminders}
          onChange={() => toggle("emailReminders")}
        />
        <Toggle
          label="Новости от избранных мастеров"
          hint="Когда мастер добавляет новые работы в портфолио"
          checked={prefs.favoriteMasterNews}
          onChange={() => toggle("favoriteMasterNews")}
        />
      </div>

      <p className="text-[12px] text-ink-faint">Настройки сохраняются на этом устройстве.</p>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="min-w-0">
        <div className="text-[13.5px] text-ink">{label}</div>
        <div className="mt-0.5 text-[12px] text-ink-faint">{hint}</div>
      </div>
      <button
        onClick={onChange}
        aria-label={label}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? "var(--accent)" : "var(--line-strong)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
        />
      </button>
    </div>
  );
}
