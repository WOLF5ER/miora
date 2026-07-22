import { requireMaster } from "@/lib/supabase/auth";
import PortfolioClient from "./PortfolioClient";

export default async function MasterPortfolioPage() {
  const { supabase, masterProfile } = await requireMaster();

  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("master_id", masterProfile.id)
    .order("created_at", { ascending: false });

  return <PortfolioClient masterId={masterProfile.id} initialItems={items ?? []} />;
}
