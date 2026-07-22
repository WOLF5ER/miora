"use client";

import { useSyncExternalStore } from "react";

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

export default function BrandIcon({ size = 28 }: { size?: number }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const src = theme === "dark" ? "/brand/logo-dark.png" : "/brand/logo-light.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-[22%]" style={{ width: size, height: size }} />
  );
}
