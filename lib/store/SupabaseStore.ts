import { getSupabase } from "@/lib/db/supabase";
import type { Assessment, Attempt, HablaUser, PracticeItem, Store } from "./Store";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToItem(row: any): PracticeItem {
  return {
    id: row.id,
    userId: row.user_id,
    itemType: row.item_type,
    prompt: row.prompt,
    target: row.target,
    topic: row.topic,
    level: row.level,
    recognition: {
      intervalDays: row.recognition_interval_days,
      streak: row.recognition_streak,
      nextDue: row.recognition_next_due,
    },
    production: {
      intervalDays: row.production_interval_days,
      streak: row.production_streak,
      nextDue: row.production_next_due,
    },
    source: row.source,
    isSavings: row.is_savings,
    createdAt: row.created_at,
  };
}

function itemToRow(item: PracticeItem) {
  return {
    id: item.id,
    user_id: item.userId,
    item_type: item.itemType,
    prompt: item.prompt,
    target: item.target,
    topic: item.topic,
    level: item.level,
    recognition_interval_days: item.recognition.intervalDays,
    recognition_next_due: item.recognition.nextDue,
    recognition_streak: item.recognition.streak,
    production_interval_days: item.production.intervalDays,
    production_next_due: item.production.nextDue,
    production_streak: item.production.streak,
    source: item.source,
    is_savings: item.isSavings,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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

  async listItems(userId: string): Promise<PracticeItem[]> {
    const { data, error } = await getSupabase()
      .from("practice_items")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map(rowToItem);
  }

  async saveItems(items: PracticeItem[]): Promise<void> {
    if (items.length === 0) return;
    const { error } = await getSupabase()
      .from("practice_items")
      .upsert(items.map(itemToRow));
    if (error) throw error;
  }

  async updateItem(item: PracticeItem): Promise<void> {
    const { error } = await getSupabase()
      .from("practice_items")
      .upsert(itemToRow(item));
    if (error) throw error;
  }

  async saveAttempt(a: Attempt): Promise<void> {
    const { error } = await getSupabase().from("attempts").insert({
      id: a.id,
      user_id: a.userId,
      session_id: a.sessionId,
      practice_item_id: a.practiceItemId,
      prompt_shown: a.promptShown,
      expected_target: a.expectedTarget,
      user_transcript: a.userTranscript,
      latency_ms: a.latencyMs,
      completed: a.completed,
      correction: a.correction,
      should_reappear: a.shouldReappear,
    });
    if (error) throw error;
  }

  async listAttempts(userId: string): Promise<Attempt[]> {
    const { data, error } = await getSupabase()
      .from("attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (data ?? []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      practiceItemId: row.practice_item_id,
      promptShown: row.prompt_shown,
      expectedTarget: row.expected_target,
      userTranscript: row.user_transcript,
      latencyMs: row.latency_ms,
      completed: row.completed,
      correction: row.correction,
      shouldReappear: row.should_reappear,
      createdAt: row.created_at,
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}
