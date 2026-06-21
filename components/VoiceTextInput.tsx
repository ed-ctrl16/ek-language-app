"use client";

import * as React from "react";
import { WebVoiceClient } from "@/lib/voice/WebVoiceClient";

/**
 * Voice-or-text input. Typing is always available (and is the path tests
 * drive); a mic button appears only when the browser supports speech and fills
 * the field from the transcript. Honors "voice from start, text fallback".
 */
export function VoiceTextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [listening, setListening] = React.useState(false);
  const [voice] = React.useState(() => new WebVoiceClient());
  const canSpeak = voice.supportsSpeech();

  async function handleListen() {
    setListening(true);
    try {
      const transcript = await voice.listen();
      onChange(transcript);
    } catch {
      // Swallow recognition errors — the text field remains usable.
    } finally {
      setListening(false);
    }
  }

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-3 block text-base font-semibold uppercase text-heading"
      >
        {label}
      </label>
      <div className="flex items-start gap-3">
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="block w-full rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-lg text-brand shadow-hard-xs placeholder:uppercase placeholder:text-body-subtle focus:border-brand-tertiary focus:outline-none"
        />
        {canSpeak ? (
          <button
            type="button"
            onClick={handleListen}
            aria-label="Speak your answer"
            className="shrink-0 rounded border-4 border-ink bg-brand-quaternary px-4 py-4 text-base font-bold uppercase text-ink shadow-hard-xs"
          >
            {listening ? "…" : "🎤"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
