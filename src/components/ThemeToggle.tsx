"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const EVENT = "miora-theme-changed";

function getSnapshot(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("miora-theme", next);
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-sm transition-colors hover:text-ink ${className}`}
    >
      {theme === "dark" ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
    </button>
  );
}
