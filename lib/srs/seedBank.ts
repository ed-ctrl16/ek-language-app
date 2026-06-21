import { CEFR_LEVELS, levelIndex, type CefrLevel } from "@/lib/levels/cefr";
import { freshState } from "./scheduler";
import type { PracticeItem } from "./types";

/**
 * Savings-paradigm seed bank: cloze items a Returner is statistically likely to
 * have learned at each level. Week one is reactivation of old knowledge, not
 * acquisition of new — so we seed at and below the user's peak level. Replaced
 * by adaptive, generated items in a later iteration.
 */
interface SeedItem {
  prompt: string;
  target: string;
  topic: string;
}

const BANK: Record<CefrLevel, SeedItem[]> = {
  A1: [
    { prompt: "Yo me ___ Ana. (introduce yourself)", target: "llamo", topic: "greetings" },
    { prompt: "¿De dónde ___? (you, ser)", target: "eres", topic: "greetings" },
  ],
  A2: [
    { prompt: "Ayer ___ al cine. (ir, yo)", target: "fui", topic: "past" },
    { prompt: "Todos los días ___ café. (beber, yo)", target: "bebo", topic: "routine" },
    { prompt: "¿Me ___ ayudar? (poder, tú)", target: "puedes", topic: "requests" },
  ],
  B1: [
    { prompt: "Cuando era niño, ___ en Madrid. (vivir, yo)", target: "vivía", topic: "past" },
    { prompt: "Espero que ___ bien. (estar, tú)", target: "estés", topic: "wishes" },
    { prompt: "Mañana ___ a llamarte. (ir, yo)", target: "voy", topic: "plans" },
  ],
  B2: [
    { prompt: "Si tuviera tiempo, ___ más. (viajar, yo)", target: "viajaría", topic: "hypothetical" },
    { prompt: "No creo que ___ verdad. (ser, eso)", target: "sea", topic: "opinion" },
    { prompt: "Para cuando llegues, ya ___ comido. (haber, yo)", target: "habré", topic: "future" },
  ],
  C1: [
    { prompt: "Ojalá ___ venido antes. (haber, tú)", target: "hubieras", topic: "regret" },
    { prompt: "Por más que lo ___, no cambia. (intentar, yo)", target: "intente", topic: "concession" },
  ],
  C2: [
    { prompt: "De haberlo ___, habría actuado distinto. (saber)", target: "sabido", topic: "nuance" },
  ],
};

/**
 * Seed practice items at and below the user's peak level, all due now so the
 * first warm-up surfaces them immediately.
 */
export function seedItemsForPeak(
  peakLevel: CefrLevel,
  userId: string,
  now: Date,
): PracticeItem[] {
  const peak = levelIndex(peakLevel);
  const items: PracticeItem[] = [];
  for (const level of CEFR_LEVELS) {
    if (levelIndex(level) > peak) continue;
    for (const [i, seed] of BANK[level].entries()) {
      items.push({
        id: `seed-${level}-${i}`,
        userId,
        itemType: "pattern",
        prompt: seed.prompt,
        target: seed.target,
        topic: seed.topic,
        level,
        recognition: freshState(now, true),
        production: freshState(now, true),
        source: "seeded",
        isSavings: false,
        createdAt: now.toISOString(),
      });
    }
  }
  return items;
}
