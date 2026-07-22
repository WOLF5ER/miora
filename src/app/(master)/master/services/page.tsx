import { requireMaster } from "@/lib/supabase/auth";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const { supabase, masterProfile } = await requireMaster();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("master_id", masterProfile.id)
    .order("category", { ascending: true });

  return <ServicesClient masterId={masterProfile.id} initialServices={services ?? []} />;
}
