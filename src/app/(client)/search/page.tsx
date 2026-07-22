import { createPublicClient } from "@/lib/supabase/public";
import SearchClient from "./SearchClient";

export const revalidate = 30;

export default async function SearchPage() {
  const supabase = createPublicClient();

  const [{ data: masters }, { data: services }] = await Promise.all([
    supabase.from("master_public").select("*"),
    supabase.from("services").select("master_id, category"),
  ]);

  const categoriesByMaster: Record<string, string[]> = {};
  (services ?? []).forEach((s) => {
    if (!categoriesByMaster[s.master_id]) categoriesByMaster[s.master_id] = [];
    if (!categoriesByMaster[s.master_id].includes(s.category)) categoriesByMaster[s.master_id].push(s.category);
  });

  return <SearchClient masters={masters ?? []} categoriesByMaster={categoriesByMaster} />;
}
