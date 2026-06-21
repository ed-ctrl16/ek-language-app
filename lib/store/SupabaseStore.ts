import { getSupabase } from "@/lib/db/supabase";
import type { Assessment, HablaUser, Store } from "./Store";

/**
 * Supabase-backed store. Used when NEXT_PUBLIC_SUPABASE_* env is set.
 * Maps the camelCase domain types to the snake_case schema (0001_init.sql).
 */
export class SupabaseStore implements Store {
  async getUser(id: string): Promise<HablaUser | null> {
    const { data, error } = await getSupabase()
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      pathway: "returner",
      receptiveLevel: data.receptive_level,
      productiveLevel: data.productive_level,
      confidence: data.confidence ?? "medium",
      peakLevel: data.peak_level,
      yearsSinceActiveUse: data.years_since_active_use ?? 0,
      readsSpanish: data.reads_spanish ?? false,
      goals: data.goals ?? [],
      topics: data.topics ?? [],
      correctionIntensity: data.correction_intensity ?? "standard",
      streakCount: data.streak_count ?? 0,
      createdAt: data.created_at,
    };
  }

  async saveUser(user: HablaUser): Promise<void> {
    const { error } = await getSupabase().from("users").upsert({
      id: user.id,
      pathway: user.pathway,
      receptive_level: user.receptiveLevel,
      productive_level: user.productiveLevel,
      confidence: user.confidence,
      peak_level: user.peakLevel,
      years_since_active_use: user.yearsSinceActiveUse,
      reads_spanish: user.readsSpanish,
      goals: user.goals,
      topics: user.topics,
      correction_intensity: user.correctionIntensity,
      streak_count: user.streakCount,
    });
    if (error) throw error;
  }

  async saveAssessment(a: Assessment): Promise<void> {
    const { error } = await getSupabase().from("assessments").insert({
      id: a.id,
      user_id: a.userId,
      pathway: "returner",
      receptive_estimate: a.receptive,
      productive_estimate: a.productive,
      confidence:
        a.confidence === "high" ? 0.9 : a.confidence === "medium" ? 0.6 : 0.3,
      raw: { gaps: a.gaps, confidence: a.confidence },
    });
    if (error) throw error;
  }

  async listAssessments(userId: string): Promise<Assessment[]> {
    const { data, error } = await getSupabase()
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      receptive: row.receptive_estimate,
      productive: row.productive_estimate,
      confidence: row.raw?.confidence ?? "medium",
      gaps: row.raw?.gaps ?? [],
      createdAt: row.created_at,
    }));
  }
}
