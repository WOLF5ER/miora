"use client";

import BrandIcon from "@/components/BrandIcon";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <BrandIcon size={32} />
      <div>
        <h1 className="font-serif text-[20px] text-ink">Нет соединения</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-soft">
          Похоже, вы offline. Проверьте подключение и попробуйте снова.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl px-5 py-2.5 text-[13.5px] font-medium text-white"
        style={{ background: "var(--accent)" }}
      >
        Повторить
      </button>
    </div>
  );
}
