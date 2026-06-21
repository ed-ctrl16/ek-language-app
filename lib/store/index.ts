import { isTestMode } from "@/lib/testkit/testMode";
import { InMemoryStore } from "./InMemoryStore";
import type { Store } from "./Store";

export type { Store, HablaUser, Assessment } from "./Store";

let supabaseSingleton: Store | null = null;

// The in-memory store lives on globalThis so it's a true singleton even though
// Next bundles server actions and pages into separate server chunks (each
// otherwise gets its own module instance). Without this, data written by an
// action isn't visible to the page that reads it.
const globalForStore = globalThis as unknown as {
  __hablaMemoryStore?: InMemoryStore;
};

function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Resolve the store. In-memory in test mode and when Supabase isn't configured
 * (so the app runs locally with zero setup); Supabase-backed when env is set.
 * Singletons so the in-memory data survives across requests in one process.
 */
export async function getStore(): Promise<Store> {
  if (isTestMode() || !isSupabaseConfigured()) {
    if (!globalForStore.__hablaMemoryStore) {
      globalForStore.__hablaMemoryStore = new InMemoryStore();
    }
    return globalForStore.__hablaMemoryStore;
  }
  if (!supabaseSingleton) {
    const { SupabaseStore } = await import("./SupabaseStore");
    supabaseSingleton = new SupabaseStore();
  }
  return supabaseSingleton;
}
