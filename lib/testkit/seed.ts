/**
 * Seeded Returner profile + practice items for deterministic test runs and
 * the Iteration 0 dashboard placeholder. Replaced by real onboarding output
 * in Iteration 1; the shape mirrors the eventual `users` / `practice_items`.
 */
export interface SeedReturnerProfile {
  pathway: "returner";
  receptiveBand: string;
  productiveBand: string;
  /** 0–100 positions for the gap visual (receptive >= productive). */
  receptivePct: number;
  productivePct: number;
  goals: string[];
  topics: string[];
  streakCount: number;
}

export const SEED_RETURNER: SeedReturnerProfile = {
  pathway: "returner",
  receptiveBand: "B1–B2",
  productiveBand: "A2",
  receptivePct: 65,
  productivePct: 35,
  goals: ["travel", "family"],
  topics: ["food", "small talk"],
  streakCount: 0,
};

export interface SeedPracticeItem {
  id: string;
  itemType: "vocab" | "pattern" | "move";
  prompt: string;
  target: string;
  topic: string;
  level: string;
  isSavings: boolean;
}

export const SEED_PRACTICE_ITEMS: SeedPracticeItem[] = [
  {
    id: "seed-1",
    itemType: "pattern",
    prompt: "Say what you usually do on Sundays.",
    target: "Los domingos suelo ...",
    topic: "routine",
    level: "A2",
    isSavings: false,
  },
  {
    id: "seed-2",
    itemType: "move",
    prompt: "Explain that you're running late.",
    target: "Voy a llegar tarde, lo siento.",
    topic: "small talk",
    level: "A2",
    isSavings: false,
  },
];
