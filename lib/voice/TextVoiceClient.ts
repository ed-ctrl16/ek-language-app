import type { VoiceClient } from "./VoiceClient";

/**
 * Text-fallback voice client. `speak` is a no-op; `listen` returns queued
 * transcripts (what the user typed). This is the path tests drive.
 */
export class TextVoiceClient implements VoiceClient {
  private readonly transcripts: string[];

  constructor(transcripts: string[] = []) {
    this.transcripts = [...transcripts];
  }

  supportsSpeech(): boolean {
    return false;
  }

  async speak(_text: string): Promise<void> {
    // Intentionally silent — text fallback shows the text on screen instead.
  }

  async listen(): Promise<string> {
    if (this.transcripts.length === 0) {
      throw new Error(
        "TextVoiceClient.listen: no queued transcript. Provide one via the constructor or push() before listening.",
      );
    }
    return this.transcripts.shift()!;
  }

  /** Queue a transcript the next listen() call will return (test helper). */
  push(transcript: string): void {
    this.transcripts.push(transcript);
  }
}
