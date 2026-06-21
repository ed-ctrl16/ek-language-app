import { CEFR_LEVELS, levelIndex, type CefrLevel } from "@/lib/levels/cefr";
import { MAX_TURNS } from "./recap";
import type { ConversationMission } from "./types";

/**
 * Seeded guided-conversation missions — concrete real-life scenarios with a
 * target pattern and a clear win (scope §4: structured pressure, not open chat).
 * Picked by the user's productive level and goals. Generated/personalised
 * missions come later.
 */
const MISSIONS: Omit<ConversationMission, "maxTurns">[] = [
  {
    id: "late-suegra",
    scenario: "Tell your mother-in-law you'll arrive about 20 minutes late.",
    opener: "¡Hola! ¿A qué hora llegáis? Tengo la comida casi lista.",
    targetPattern: "running late + giving a reason (voy a llegar tarde porque...)",
    level: "A2",
  },
  {
    id: "weekend-plans",
    scenario: "Chat about what you usually do at the weekend.",
    opener: "Oye, ¿y tú qué sueles hacer los fines de semana?",
    targetPattern: "habitual present (suelo..., normalmente...)",
    level: "B1",
  },
  {
    id: "past-trip",
    scenario: "Tell a friend about a trip you took recently.",
    opener: "¡Cuánto tiempo! Cuéntame, ¿qué tal tu último viaje?",
    targetPattern: "preterite for a finished trip (fui, visité, me gustó)",
    level: "B1",
  },
  {
    id: "recommend-restaurant",
    scenario: "Recommend a restaurant and say why you like it.",
    opener: "Busco un sitio bueno para cenar esta noche. ¿Qué me recomiendas?",
    targetPattern: "giving opinions + reasons (me gusta porque..., lo mejor es...)",
    level: "B2",
  },
];

/** Pick a mission at or just below the user's productive level. */
export function pickMission(level: CefrLevel): ConversationMission {
  const target = levelIndex(level);
  const eligible = MISSIONS.filter((m) => levelIndex(m.level) <= target);
  const chosen = (eligible.length > 0 ? eligible : MISSIONS).reduce((best, m) =>
    levelIndex(m.level) > levelIndex(best.level) ? m : best,
  );
  return { ...chosen, maxTurns: MAX_TURNS };
}

export { CEFR_LEVELS };
