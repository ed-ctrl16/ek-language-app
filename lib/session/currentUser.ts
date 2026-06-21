import { cookies } from "next/headers";

/**
 * Single-user identity for the MVP: a cookie holding the user id. No auth
 * friction now; swapping in real auth later is a change here + RLS, not a
 * rewrite (queries already scope by user id).
 */
const COOKIE = "habla_uid";

export function getCurrentUserId(): string | null {
  return cookies().get(COOKIE)?.value ?? null;
}

/** Settable only from a server action or route handler. */
export function setCurrentUserId(id: string): void {
  cookies().set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
