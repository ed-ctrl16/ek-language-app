"use client";

import * as React from "react";
import { WebVoiceClient } from "@/lib/voice/WebVoiceClient";

/**
 * Voice-or-text input. Typing is always available (and is the path tests
 * drive); a mic button appears only when the browser supports speech. While
 * listening it shows live interim text and a Stop control; if recognition
 * fails it surfaces the reason inline (never silently). Honors "voice from
 * start, text fallback".
 */
export function VoiceTextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  const [listening, setListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [voice] = React.useState(() => new WebVoiceClient());
  const canSpeak = voice.supportsSpeech();

  async function handleListen() {
    setError(null);
    setListening(true);
    try {
      const transcript = await voice.listen({ onPartial: (t) => onChange(t) });
      if (transcript) onChange(transcript);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setListening(false);
    }
  }

  return (
    <div className="w-full">
      {/* Lives on a white card → brand-colored text (heading token is white). */}
      <label
        htmlFor={id}
        className="mb-1 block text-base font-semibold uppercase text-brand"
      >
        {label}
      </label>
      {helper ? (
        <p className="mb-3 text-sm text-brand opacity-70">{helper}</p>
      ) : null}
      <div className="flex items-start gap-3">
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="block w-full rounded border-4 border-ink bg-brand-secondary px-5 py-4 text-lg text-brand shadow-hard-xs placeholder:text-brand placeholder:opacity-40 focus:border-brand-tertiary focus:outline-none"
        />
        {canSpeak ? (
          <button
            type="button"
            onClick={listening ? () => voice.stop() : handleListen}
            aria-label={listening ? "Stop recording" : "Speak your answer instead of typing"}
            title={listening ? "Stop recording" : "Speak instead of typing"}
            className={
              "shrink-0 rounded border-4 border-ink px-4 py-4 text-base font-bold uppercase shadow-hard-xs " +
              (listening
                ? "bg-danger text-white"
                : "bg-brand-quaternary text-ink")
            }
          >
            {listening ? "STOP" : "🎤"}
          </button>
        ) : null}
      </div>
      {listening ? (
        <p className="mt-2 text-sm font-semibold uppercase text-brand">
          ● Listening — speak now, then tap Stop
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-danger">{error}</p>
      ) : null}
      {!canSpeak ? (
        <p className="mt-2 text-sm text-brand opacity-60">
          Voice input isn&apos;t available in this browser — just type your
          answer.
        </p>
      ) : null}
    </div>
  );
}
