import { describe, it, expect } from "vitest";
import { BRIDGE_STEPS, isProductionStep, nextStep } from "./steps";

describe("bridge step machine", () => {
  it("advances Hear → Repeat → Mod → Mix → Make → done", () => {
    expect(nextStep("hear")).toBe("repeat");
    expect(nextStep("repeat")).toBe("mod");
    expect(nextStep("mod")).toBe("mix");
    expect(nextStep("mix")).toBe("make");
    expect(nextStep("make")).toBe("done");
  });

  it("stays done past the end", () => {
    expect(nextStep("done")).toBe("done");
  });

  it("flags only the production steps for the stuck protocol", () => {
    expect(BRIDGE_STEPS.filter(isProductionStep)).toEqual(["mod", "mix", "make"]);
    expect(isProductionStep("hear")).toBe(false);
    expect(isProductionStep("repeat")).toBe(false);
  });
});
