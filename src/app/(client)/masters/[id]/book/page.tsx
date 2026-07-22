import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BackButton from "@/components/BackButton";
import BookingClient from "./BookingClient";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: master } = await supabase.from("master_public").select("id, name, hue").eq("id", id).single();
  if (!master) notFound();

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[14px] text-ink-soft">Чтобы записаться к {master.name}, сначала войдите в аккаунт.</p>
        <div className="flex gap-2.5">
          <Link href={`/login`} className="rounded-xl px-5 py-2.5 text-[13.5px] font-medium text-white" style={{ background: "var(--accent)" }}>
            Войти
          </Link>
          <Link href={`/signup`} className="rounded-xl border border-line px-5 py-2.5 text-[13.5px] text-ink-soft">
            Регистрация
          </Link>
        </div>
        <BackButton />
      </div>
    );
  }

  const { data: services } = await supabase.from("services").select("*").eq("master_id", id).eq("online_booking", true);

  const weekStart = startOfDay(new Date());
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("scheduled_at")
    .eq("master_id", id)
    .neq("status", "cancelled")
    .gte("scheduled_at", weekStart.toISOString())
    .lt("scheduled_at", weekEnd.toISOString());

  return (
    <BookingClient
      masterId={master.id}
      masterName={master.name}
      services={services ?? []}
      weekStartIso={weekStart.toISOString()}
      takenIso={(existingBookings ?? []).map((b) => b.scheduled_at)}
    />
  );
}
