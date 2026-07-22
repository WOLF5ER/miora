import { requireMaster } from "@/lib/supabase/auth";
import FinanceClient from "./FinanceClient";

export default async function FinancePage() {
  const { supabase, masterProfile } = await requireMaster();
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [{ data: bookings }, { data: expenses }] = await Promise.all([
    supabase
      .from("bookings")
      .select("price, scheduled_at, status")
      .eq("master_id", masterProfile.id)
      .neq("status", "cancelled")
      .gte("scheduled_at", rangeStart.toISOString()),
    supabase
      .from("expenses")
      .select("*")
      .eq("master_id", masterProfile.id)
      .gte("occurred_on", rangeStart.toISOString().slice(0, 10))
      .order("occurred_on", { ascending: false }),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", ""), income: 0, expenses: 0 };
  });
  (bookings ?? []).forEach((b) => {
    const d = new Date(b.scheduled_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.income += b.price;
  });
  (expenses ?? []).forEach((e) => {
    const d = new Date(e.occurred_on);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.expenses += e.amount;
  });

  return <FinanceClient masterId={masterProfile.id} months={months} expenses={expenses ?? []} />;
}
