/**
 * The exercise registry. Adding a new exercise type to the daily session is a
 * new entry here (+ its component), not an orchestrator rewrite (scope §4).
 */
export type ExerciseId = "reactivation" | "bridge" | "conversation";

export interface ExerciseSpec {
  id: ExerciseId;
  label: string;
  estimatedMinutes: number;
  href: string;
}

export const EXERCISES: ExerciseSpec[] = [
  { id: "reactivation", label: "Reactivation warm-up", estimatedMinutes: 4, href: "/warmup" },
  { id: "bridge", label: "Bridge drill", estimatedMinutes: 5, href: "/bridge" },
  { id: "conversation", label: "Conversation", estimatedMinutes: 6, href: "/conversation" },
];
