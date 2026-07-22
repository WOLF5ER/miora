import { requireMaster } from "@/lib/supabase/auth";
import CalendarClient from "./CalendarClient";

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function CalendarPage() {
  const { supabase, masterProfile } = await requireMaster();

  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [{ data: bookings }, { data: services }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("master_id", masterProfile.id)
      .neq("status", "cancelled")
      .gte("scheduled_at", weekStart.toISOString())
      .lt("scheduled_at", weekEnd.toISOString())
      .order("scheduled_at", { ascending: true }),
    supabase.from("services").select("*").eq("master_id", masterProfile.id),
  ]);

  return (
    <CalendarClient
      masterId={masterProfile.id}
      weekStartIso={weekStart.toISOString()}
      initialBookings={bookings ?? []}
      services={services ?? []}
    />
  );
}
