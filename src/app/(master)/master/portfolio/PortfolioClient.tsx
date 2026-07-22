"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

export default function PortfolioClient({ masterId, initialItems }: { masterId: string; initialItems: PortfolioItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${masterId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);
      if (uploadError) continue;
      const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
      const { data, error } = await supabase
        .from("portfolio_items")
        .insert({ master_id: masterId, image_url: pub.publicUrl, caption: file.name.replace(/\.[^.]+$/, "") })
        .select()
        .single();
      if (!error && data) setItems((prev) => [data, ...prev]);
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] text-ink">Портфолио</h1>
          <p className="mt-1 text-[13px] text-ink-soft">{items.length} работ</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          <Upload size={14} strokeWidth={1.8} />
          {uploading ? "Загружаем…" : "Загрузить фото"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-8 text-center"
      >
        <Upload size={18} strokeWidth={1.6} color="var(--ink-faint)" />
        <p className="text-[13px] text-ink-soft">Перетащите фото сюда или нажмите «Загрузить фото»</p>
        <p className="text-[11.5px] text-ink-faint">Фото сохраняются в Supabase Storage и видны в клиентском профиле</p>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-[13px] text-ink-faint">Пока нет ни одной работы в портфолио</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-xl">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.caption} className="aspect-square w-full object-cover" />
              ) : (
                <div
                  className="aspect-square w-full"
                  style={{ background: `linear-gradient(155deg, hsl(${item.hue} 32% 88%), hsl(${item.hue + 18} 26% 74%) 55%, hsl(${item.hue - 12} 30% 60%))` }}
                />
              )}
              <span className="absolute bottom-2 left-2 right-2 truncate text-[10.5px] font-medium text-white/90 drop-shadow-sm">{item.caption}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
