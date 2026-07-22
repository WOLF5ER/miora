"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase/client";

export function useFavorites() {
  const supabase = createClient();
  const router = useRouter();
  const [ids, setIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      if (!data.user) return;
      supabase
        .from("favorites")
        .select("master_id")
        .eq("client_id", data.user.id)
        .then(({ data: rows }) => {
          if (active && rows) setIds(rows.map((r) => r.master_id));
        });
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(
    async (masterId: string) => {
      if (!userId) {
        router.push("/login");
        return;
      }
      const isFav = ids.includes(masterId);
      if (isFav) {
        setIds((prev) => prev.filter((id) => id !== masterId));
        await supabase.from("favorites").delete().eq("client_id", userId).eq("master_id", masterId);
      } else {
        setIds((prev) => [...prev, masterId]);
        await supabase.from("favorites").insert({ client_id: userId, master_id: masterId });
      }
    },
    [ids, userId, supabase, router]
  );

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, isFavorite };
}
