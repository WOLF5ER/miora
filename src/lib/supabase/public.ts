import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// No cookies, no per-request session — safe to call from statically
// rendered / ISR pages that only need publicly-readable data (RLS already
// makes these rows public regardless of who's asking). This is what lets
// Next cache and serve these pages instantly instead of cold-starting a
// function and round-tripping to Supabase on every single visit.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
