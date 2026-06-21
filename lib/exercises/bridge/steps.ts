import type { BridgeStep } from "./types";

/** The fixed ladder order. */
export const BRIDGE_STEPS: BridgeStep[] = ["hear", "repeat", "mod", "make"];

/** Next step in the ladder; "make" → "done". Pure. */
export function nextStep(step: BridgeStep): BridgeStep {
  const i = BRIDGE_STEPS.indexOf(step);
  if (i < 0 || i >= BRIDGE_STEPS.length - 1) return "done";
  return BRIDGE_STEPS[i + 1]!;
}

/** Mod and Make are the production steps where the stuck protocol applies. */
export function isProductionStep(step: BridgeStep): boolean {
  return step === "mod" || step === "make";
}
