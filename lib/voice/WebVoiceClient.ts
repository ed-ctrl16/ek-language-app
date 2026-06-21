"use client";

import type { ListenOptions, VoiceClient } from "./VoiceClient";

/**
 * Browser voice client. STT via the Web Speech API, TTS via speechSynthesis.
 * Client-only. iOS Safari / unsupported browsers report supportsSpeech()=false
 * so callers fall back to the text path automatically (never a dead end).
 *
 * Note: Chrome's Web Speech API streams audio to Google's servers, so it needs
 * a network connection and a granted mic permission. Failures surface with a
 * friendly message (see mapRecognitionError) — never silently. Full, reliable
 * voice (iOS Whisper fallback, quality, scoring) is the Iteration 4 deep-dive.
 */
type AlternativeLike = { transcript: string };
type ResultLike = { isFinal: boolean; length: number; [i: number]: AlternativeLike };
type ResultListLike = { length: number; [i: number]: ResultLike };
type RecognitionEventLike = { results: ResultListLike };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEventLike) => void) | null;
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

function mapRecognitionError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow the mic in your browser, or just type.";
    case "audio-capture":
      return "No microphone was found. Plug one in, or type instead.";
    case "network":
      return "Voice needs an internet connection (Chrome sends audio to Google). Type instead if offline.";
    case "aborted":
      return "Recording stopped.";
    default:
      return `Couldn't record (${code}). You can type your answer instead.`;
  }
}

export class WebVoiceClient implements VoiceClient {
  private active: SpeechRecognitionLike | null = null;

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

  async listen(opts?: ListenOptions): Promise<string> {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      throw new Error(
        "Speech recognition isn't available in this browser. Please type your answer.",
      );
    }

    const recognition = new Ctor();
    this.active = recognition;
    recognition.lang = this.lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalText = "";

    return new Promise<string>((resolve, reject) => {
      let pendingError: Error | null = null;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]!;
          const transcript = result[0]?.transcript ?? "";
          if (result.isFinal) finalText += transcript;
          else interim += transcript;
        }
        opts?.onPartial?.((finalText + interim).trim());
      };

      recognition.onerror = (event) => {
        // "no-speech" isn't a real failure — let onend resolve with what we have.
        if (event.error !== "no-speech") {
          pendingError = new Error(mapRecognitionError(event.error));
        }
      };

      recognition.onend = () => {
        this.active = null;
        if (pendingError) reject(pendingError);
        else resolve(finalText.trim());
      };

      try {
        recognition.start();
      } catch {
        this.active = null;
        reject(new Error("Couldn't start recording. Please type your answer."));
      }
    });
  }

  /** Stop the in-flight recognition (resolves listen() with the text so far). */
  stop(): void {
    this.active?.stop();
  }
}
