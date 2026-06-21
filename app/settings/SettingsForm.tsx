"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeading } from "@/components/ui/Card";
import type { CorrectionIntensity } from "@/lib/exercises/conversation/types";
import { setCorrectionIntensity } from "./actions";

const OPTIONS: { value: CorrectionIntensity; label: string; blurb: string }[] = [
  { value: "minimal", label: "Minimal", blurb: "Only fixes that block meaning." },
  { value: "standard", label: "Standard", blurb: "Up to 3 key fixes per session." },
  { value: "detailed", label: "Detailed", blurb: "More corrections — for when you want them." },
];

export function SettingsForm({ current }: { current: CorrectionIntensity }) {
  const [value, setValue] = React.useState<CorrectionIntensity>(current);
  const [saved, setSaved] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  return (
    <Card>
      <CardHeading>Correction intensity</CardHeading>
      <p className="mb-6 text-base text-brand">
        How many corrections we surface after a conversation. Fewer can feel less
        discouraging; more if you want the detail.
      </p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className="flex items-start gap-3 rounded border-4 border-ink bg-brand-secondary px-4 py-3 text-brand"
          >
            <input
              type="radio"
              name="intensity"
              value={o.value}
              checked={value === o.value}
              onChange={() => {
                setValue(o.value);
                setSaved(false);
              }}
              className="mt-1 h-6 w-6"
            />
            <span>
              <span className="block text-lg font-bold uppercase">{o.label}</span>
              <span className="block text-base opacity-70">{o.blurb}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Button
          variant="secondary"
          data-testid="settings-save"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await setCorrectionIntensity({ correctionIntensity: value });
              setSaved(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save"}
        </Button>
        {saved ? (
          <span data-testid="settings-saved" className="text-base font-bold text-brand">
            Saved ✓
          </span>
        ) : null}
      </div>
    </Card>
  );
}
