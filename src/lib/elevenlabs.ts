/**
 * Server-side ElevenLabs client for Speech-to-Text.
 * Use only in server components and server actions.
 * Requires ELEVENLABS_API_KEY in environment.
 */

const ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text";

export interface TranscribeResult {
  text: string;
  language_code?: string;
  language_probability?: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    type: string;
    speaker_id?: string;
    logprob?: number;
  }>;
}

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  return apiKey;
}

/**
 * Transcribe an audio file using ElevenLabs Scribe v2 (batch Speech-to-Text).
 * Accepts Blob, File, or Buffer. Supports common formats (webm, mp3, wav, etc.).
 */
export async function transcribeAudio(
  file: Blob | File | Buffer,
  options?: {
    modelId?: "scribe_v1" | "scribe_v2";
    languageCode?: string | null;
    tagAudioEvents?: boolean;
  }
): Promise<TranscribeResult> {
  const apiKey = getApiKey();
  const modelId = options?.modelId ?? "scribe_v2";

  const formData = new FormData();
  formData.append("model_id", modelId);
  if (options?.languageCode) {
    formData.append("language_code", options.languageCode);
  }
  if (options?.tagAudioEvents !== undefined) {
    formData.append("tag_audio_events", String(options.tagAudioEvents));
  }

  const blob =
    file instanceof Buffer
      ? new Blob([new Uint8Array(file)], { type: "audio/webm" })
      : (file as Blob);
  const name =
    file instanceof File ? file.name : "recording.webm";
  formData.append("file", blob, name);

  const response = await fetch(ELEVENLABS_STT_URL, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `ElevenLabs STT failed: ${response.status}`;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.detail?.message) message = parsed.detail.message;
      else if (parsed.message) message = parsed.message;
    } catch {
      if (errBody) message += ` ${errBody.slice(0, 200)}`;
    }
    throw new Error(message);
  }

  const data = (await response.json()) as TranscribeResult;
  return data;
}

/** Default voice (Rachel) if ELEVENLABS_VOICE_ID is not set. */
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

const ELEVENLABS_TTS_URL = (voiceId: string) =>
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

/**
 * Synthesize speech from text using ElevenLabs TTS.
 * Returns raw audio bytes (MP3).
 */
export async function synthesizeSpeech(
  text: string,
  options?: {
    voiceId?: string;
    modelId?: string;
  }
): Promise<ArrayBuffer> {
  const apiKey = getApiKey();
  const voiceId =
    options?.voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
  const modelId = options?.modelId ?? "eleven_multilingual_v2";

  const response = await fetch(ELEVENLABS_TTS_URL(voiceId), {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: modelId,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `ElevenLabs TTS failed: ${response.status}`;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.detail?.message) message = parsed.detail.message;
      else if (parsed.message) message = parsed.message;
    } catch {
      if (errBody) message += ` ${errBody.slice(0, 200)}`;
    }
    throw new Error(message);
  }

  return response.arrayBuffer();
}
