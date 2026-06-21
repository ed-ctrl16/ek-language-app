import { cookies } from "next/headers";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import { isTestMode } from "@/lib/testkit/testMode";

/**
 * User identity. Two modes:
 *  - Real mode (Supabase configured): the logged-in Supabase auth user.
 *  - Test mode / local dev without Supabase: a cookie (no login friction),
 *    which keeps the deterministic test harness working with no backend.
 */
const COOKIE = "habla_uid";

function usesCookieAuth(): boolean {
  return isTestMode() || !isSupabaseConfigured();
}

export async function getCurrentUserId(): Promise<string | null> {
  if (usesCookieAuth()) {
    return cookies().get(COOKIE)?.value ?? null;
  }
  const { data } = await getServerSupabase().auth.getUser();
  return data.user?.id ?? null;
}

/** Where to send a request with no identity: login (real) vs onboarding (cookie mode). */
export function authRedirectPath(): string {
  return usesCookieAuth() ? "/onboarding" : "/login";
}

/** Cookie-mode only (test / local dev). No-op concept under real auth. */
export function setCurrentUserId(id: string): void {
  cookies().set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
