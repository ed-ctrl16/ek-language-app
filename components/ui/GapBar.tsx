import * as React from "react";

export interface GapBarProps {
  /** What the user understands (band label, e.g. "B1–B2"). */
  receptiveLabel: string;
  /** What the user can say (band label, e.g. "A2"). */
  productiveLabel: string;
  /** Productive position 0–100 (the filled "can say" portion). */
  productivePct: number;
  /** Receptive position 0–100 (>= productivePct; the gap is the difference). */
  receptivePct: number;
}

/**
 * The headline visual: how much the user can already say (filled) vs the gap
 * still to close (hot-pink), within what they understand. This is the product.
 */
export function GapBar({
  receptiveLabel,
  productiveLabel,
  productivePct,
  receptivePct,
}: GapBarProps) {
  const said = Math.max(0, Math.min(100, productivePct));
  const gap = Math.max(0, Math.min(100, receptivePct)) - said;

  return (
    <div className="w-full">
      {/* GapBar renders inside a white card, so text uses the brand color
          (white heading/body tokens would be invisible here). */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold uppercase text-brand opacity-70">
            You can say
          </div>
          <div className="text-3xl font-bold uppercase text-brand">
            {productiveLabel}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold uppercase text-brand opacity-70">
            You understand
          </div>
          <div className="text-3xl font-bold uppercase text-brand">
            {receptiveLabel}
          </div>
        </div>
      </div>

      <div
        className="flex h-8 w-full overflow-hidden rounded border-4 border-ink bg-brand-secondary shadow-hard-xs"
        role="img"
        aria-label={`You can say ${productiveLabel}; you understand ${receptiveLabel}. The pink segment is the gap left to close.`}
      >
        <div className="h-full bg-brand-strong" style={{ width: `${said}%` }} />
        <div
          className="h-full bg-brand-quaternary"
          style={{ width: `${gap}%` }}
        />
      </div>

      <div className="mt-2 text-sm uppercase text-brand opacity-70">
        The pink stretch is the gap we&apos;re closing.
      </div>
    </div>
  );
}
