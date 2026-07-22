import { requireMaster } from "@/lib/supabase/auth";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
  const { supabase, masterProfile } = await requireMaster();

  const [{ data: bookings }, { data: notes }, { data: portfolio }] = await Promise.all([
    supabase
      .from("bookings")
      .select("client_id, scheduled_at, profiles!client_id(full_name, phone)")
      .eq("master_id", masterProfile.id)
      .not("client_id", "is", null)
      .order("scheduled_at", { ascending: false }),
    supabase.from("client_notes").select("*").eq("master_id", masterProfile.id),
    supabase.from("portfolio_items").select("id, hue, caption").eq("master_id", masterProfile.id).limit(3),
  ]);

  const byClient = new Map<
    string,
    { id: string; name: string; phone: string; totalVisits: number; lastVisit: string }
  >();
  (bookings ?? []).forEach((b) => {
    if (!b.client_id) return;
    const profile = b.profiles as unknown as { full_name: string; phone: string | null } | null;
    const existing = byClient.get(b.client_id);
    if (existing) {
      existing.totalVisits += 1;
    } else {
      byClient.set(b.client_id, {
        id: b.client_id,
        name: profile?.full_name ?? "Клиент",
        phone: profile?.phone ?? "",
        totalVisits: 1,
        lastVisit: new Date(b.scheduled_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }),
      });
    }
  });

  const clients = Array.from(byClient.values());
  const notesMap = Object.fromEntries((notes ?? []).map((n) => [n.client_id, n]));

  return (
    <ClientsClient
      masterId={masterProfile.id}
      clients={clients}
      notesMap={notesMap}
      portfolio={portfolio ?? []}
    />
  );
}
