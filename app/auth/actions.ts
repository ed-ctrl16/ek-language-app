"use server";

import { redirect } from "next/navigation";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/db/supabase";

/** Sign out (real mode) and return to the login screen. */
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await getServerSupabase().auth.signOut();
  }
  redirect("/login");
}
