/**
 * Voice seam. Every spoken interaction goes through this interface and ALWAYS
 * has a text-equivalent path (TextVoiceClient). The text path is what the
 * automated tests drive — no microphone required.
 */
export interface VoiceClient {
  /** True if real speech recognition/synthesis is available in this context. */
  supportsSpeech(): boolean;
  /** Text-to-speech. No-op in the text fallback. */
  speak(text: string): Promise<void>;
  /** Speech-to-text → transcript. In the text fallback, the typed text IS the transcript. */
  listen(): Promise<string>;
}
