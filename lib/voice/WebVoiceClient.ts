"use client";

import type { VoiceClient } from "./VoiceClient";

/**
 * Browser voice client. STT via the Web Speech API, TTS via speechSynthesis.
 * Client-only. iOS Safari / unsupported browsers report supportsSpeech()=false
 * so callers fall back to the text path automatically (never a dead end).
 *
 * Iteration 0 provides a minimal working shell; richer config (language,
 * interim results, premium TTS) arrives with the conversation iterations.
 */
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export class WebVoiceClient implements VoiceClient {
  constructor(private readonly lang = "es-ES") {}

  supportsSpeech(): boolean {
    return (
      getRecognitionCtor() !== null &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    );
  }

  async speak(text: string): Promise<void> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.lang;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  async listen(): Promise<string> {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      throw new Error("WebVoiceClient.listen: speech recognition unavailable");
    }
    const recognition = new Ctor();
    recognition.lang = this.lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    return new Promise<string>((resolve, reject) => {
      recognition.onresult = (event) => {
        resolve(event.results[0]?.[0]?.transcript ?? "");
      };
      recognition.onerror = (event) => reject(new Error(event.error));
      recognition.start();
    });
  }
}
