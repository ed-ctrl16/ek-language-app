import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (single-user simplified for the MVP). Constructed lazily so
 * the app boots without credentials in test mode. Queries should still scope
 * by user_id even in single-user mode so multi-user is a config change later.
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).",
    );
  }

  cached = createClient(url, anonKey);
  return cached;
}
