/**
 * Voice cloning.
 *
 * Accepts an audio Buffer (any ElevenLabs-supported format: wav / mp3 /
 * webm), uploads it to the ElevenLabs voice cloning endpoint, returns the
 * resulting `voice_id`.
 *
 * Also exposes `setUserVoice(userId, voiceId)` which updates the active
 * Speech Engine resource so all subsequent TTS for that user renders in
 * the cloned voice. We do this by patching the engine's `tts.voiceId` for
 * the relevant session — in V2 this becomes a per-session override carried
 * in session metadata.
 *
 * The ElevenLabs JS SDK exposes voice cloning via `voices.ivc.create` and
 * `voices.add`; we use a direct multipart POST so we don't have to chase
 * SDK shape changes.
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import FormData from "form-data";
import { logger } from "./log.js";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";
const CLONE_TIMEOUT_MS = 30_000;

export interface CloneVoiceArgs {
  name: string;
  audio: Buffer;
  /** Mime type for the audio buffer, e.g. "audio/wav" or "audio/webm". */
  mimeType?: string;
  /** Optional filename for the multipart part. */
  filename?: string;
  description?: string;
  labels?: Record<string, string>;
}

export interface CloneVoiceResult {
  voiceId: string;
  requiresVerification: boolean;
}

function apiKey(): string {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("Missing ELEVENLABS_API_KEY");
  return k;
}

/**
 * Upload a single audio sample and return the new voice_id.
 *
 * For best results the sample should be 30+ seconds, mono, 16kHz+, no
 * background music, clean room tone. ElevenLabs docs:
 * https://elevenlabs.io/docs/api-reference/voices/add
 */
export async function cloneVoice(args: CloneVoiceArgs): Promise<CloneVoiceResult> {
  const { name, audio, mimeType = "audio/wav", filename = "sample.wav", description, labels } = args;

  logger.info({ stage: "voice_clone_start", name, bytes: audio.length }, "voice clone: start");

  const form = new FormData();
  form.append("name", name);
  if (description) form.append("description", description);
  if (labels) form.append("labels", JSON.stringify(labels));
  form.append("files", audio, { filename, contentType: mimeType });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLONE_TIMEOUT_MS);

  try {
    const res = await fetch(`${ELEVENLABS_API_BASE}/voices/add`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey(),
        ...form.getHeaders(),
      },
      // node 20+ fetch accepts form-data via the @ts-expect-error path
      body: form as unknown as BodyInit,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ElevenLabs clone failed: ${res.status} ${text}`);
    }

    const body = (await res.json()) as { voice_id: string; requires_verification?: boolean };
    if (!body.voice_id) throw new Error("ElevenLabs clone: no voice_id in response");

    logger.info(
      { stage: "voice_clone_done", voiceId: body.voice_id },
      "voice clone: done",
    );

    return {
      voiceId: body.voice_id,
      requiresVerification: Boolean(body.requires_verification),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Map of userId → voiceId, used by the live session attach to pick the
 * right TTS voice. In production this comes from the `users` table; for
 * the hackathon we keep it in memory.
 */
const userVoiceMap = new Map<string, string>();

export function setUserVoice(userId: string, voiceId: string): void {
  userVoiceMap.set(userId, voiceId);
  logger.info({ userId, voiceId }, "voice-clone: user voice set");
}

export function getUserVoice(userId: string): string | undefined {
  return userVoiceMap.get(userId);
}

/**
 * Update the Speech Engine resource's default TTS voice. Useful for global
 * defaults (e.g. when the engine is dedicated to a single user). For
 * per-session voices, prefer attaching the voice via session metadata.
 */
export async function setEngineDefaultVoice(
  speechEngineId: string,
  voiceId: string,
): Promise<void> {
  const client = new ElevenLabsClient({ apiKey: apiKey() });
  // The SDK shape evolves; use the loose `any` here so we don't pin to a
  // single minor version. Falls back to a raw PATCH if the SDK method is
  // missing.
  const se = (client as unknown as {
    speechEngine?: {
      update?: (id: string, body: unknown) => Promise<unknown>;
    };
  }).speechEngine;

  if (se?.update) {
    await se.update(speechEngineId, { tts: { voiceId } });
    logger.info({ speechEngineId, voiceId }, "voice-clone: engine voice updated via sdk");
    return;
  }

  const res = await fetch(`${ELEVENLABS_API_BASE}/speech-engine/${speechEngineId}`, {
    method: "PATCH",
    headers: {
      "xi-api-key": apiKey(),
      "content-type": "application/json",
    },
    body: JSON.stringify({ tts: { voice_id: voiceId } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Speech Engine update failed: ${res.status} ${text}`);
  }
  logger.info({ speechEngineId, voiceId }, "voice-clone: engine voice updated via http");
}
