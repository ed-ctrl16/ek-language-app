import type { CefrLevel } from "@/lib/levels/cefr";

/**
 * Static onboarding content for Iteration 1. The diagnostic prompts are sent
 * (with the user's answers) to the AI assessor; Claude judges holistically, so
 * we don't store "correct" answers here. Adaptive item selection comes later.
 */
export const PEAK_LEVEL_OPTIONS: { value: CefrLevel; label: string }[] = [
  { value: "A2", label: "A2 — basic conversations" },
  { value: "B1", label: "B1 — got around comfortably" },
  { value: "B2", label: "B2 — fairly fluent" },
  { value: "C1", label: "C1 — advanced / near-fluent" },
];

export const LEARNING_CONTEXTS = [
  "school",
  "university",
  "immersion / living abroad",
  "app / self-study",
] as const;

export const GOAL_OPTIONS = [
  "travel",
  "family",
  "work",
  "culture",
  "living abroad",
] as const;

export const TOPIC_OPTIONS = [
  "food",
  "small talk",
  "directions",
  "work",
  "family life",
  "current affairs",
] as const;

/** Short diagnostic: a few cloze items + a couple of open conversation turns. */
export const DIAGNOSTIC_CLOZE: string[] = [
  "Fill the gap: “Ayer ____ (ir) al cine con mis amigos.”",
  "Fill the gap: “Si tuviera más tiempo, ____ (viajar) por Sudamérica.”",
  "Fill the gap: “Espero que ____ (estar, tú) bien hoy.”",
];

export const DIAGNOSTIC_CONVERSATION: string[] = [
  "In Spanish, tell me a little about your weekend.",
  "In Spanish, why do you want to get your Spanish back?",
];

export const FIRST_WIN_OPENER =
  "Cuéntame: ¿por qué aprendiste español la primera vez?";
