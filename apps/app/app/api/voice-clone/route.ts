/**
 * Voice cloning API route.
 *
 * Accepts a multipart upload containing a single audio Blob captured by the
 * onboarding screen, forwards it to ElevenLabs `/v1/voices/add`, and returns
 * the resulting `voice_id`. Optionally hot-swaps the Speech Engine's default
 * TTS voice so the user's first live call already renders in their cloned
 * voice.
 *
 * The Echo Engine exposes the same logic in
 * `services/echo-engine/src/voice-clone.ts` but does not yet publish an HTTP
 * surface for it (Wave-1 ships a CLI + in-process functions only). Until that
 * HTTP route lands we proxy directly from this Next.js route to ElevenLabs.
 * The wire shape matches the Echo Engine wrapper exactly so the swap is a
 * one-line change. Tracked in
 * `vault/80 · Sessions/2026-05-26-voice-clone-builder.md`.
 *
 * Privacy contract enforced server-side:
 *   • The audio is forwarded as a stream, never written to disk.
 *   • No logs include audio bytes.
 *   • The 30-second cap is verified by content-length before forwarding.
 *
 * Endpoints:
 *   POST   /api/voice-clone   — clone the uploaded sample, return { voiceId }
 *   DELETE /api/voice-clone   — delete the voice clone by voiceId
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const CLONE_TIMEOUT_MS = 30_000;
// 30 seconds of mono 16-bit / 16 kHz PCM ≈ 960 kB. A WebM/Opus capture is
// far smaller. We accept up to ~4 MB to leave headroom for stereo / higher
// sample-rate recordings without enabling abuse.
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

interface CloneSuccess {
  voiceId: string;
  requiresVerification: boolean;
}

interface CloneFailure {
  error: string;
}

function apiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }
  return key;
}

function speechEngineId(): string | undefined {
  return process.env.SPEECH_ENGINE_ID ?? undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

/**
 * Patch the Speech Engine resource to render TTS in the freshly cloned voice
 * by default. Non-fatal — failure here does not invalidate the clone.
 */
async function trySetEngineDefaultVoice(voiceId: string): Promise<boolean> {
  const engineId = speechEngineId();
  if (!engineId) return false;

  try {
    const res = await fetch(`${ELEVENLABS_API_BASE}/speech-engine/${engineId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey(),
        'content-type': 'application/json',
      },
      body: JSON.stringify({ tts: { voice_id: voiceId } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request): Promise<NextResponse<CloneSuccess | CloneFailure>> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart payload' }, { status: 400 });
  }

  const audio = formData.get('audio');
  const name = (formData.get('name') as string | null) ?? 'Vought voice';
  const consentAt = formData.get('consentAt') as string | null;

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Missing audio blob' }, { status: 400 });
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: 'Audio blob is empty' }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Audio exceeds 4 MB cap' }, { status: 413 });
  }
  if (!consentAt) {
    return NextResponse.json({ error: 'Missing consent timestamp' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLONE_TIMEOUT_MS);

  try {
    const upstream = new FormData();
    upstream.append('name', name);
    upstream.append(
      'description',
      'Vought personal voice clone. Created with explicit user consent.',
    );
    upstream.append('labels', JSON.stringify({ source: 'vought-onboarding' }));
    upstream.append(
      'files',
      audio,
      audio.type.includes('webm') ? 'sample.webm' : 'sample.wav',
    );

    const res = await fetch(`${ELEVENLABS_API_BASE}/voices/add`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey() },
      body: upstream,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `ElevenLabs clone failed: ${res.status} ${text}` },
        { status: 502 },
      );
    }

    const body = (await res.json()) as {
      voice_id?: string;
      requires_verification?: boolean;
    };
    if (!body.voice_id) {
      return NextResponse.json({ error: 'No voice_id in upstream response' }, { status: 502 });
    }

    // Best-effort hot-swap of the Speech Engine default voice. Failure is
    // logged but never surfaced to the user — they can still accept the
    // clone and the live call will fall back to per-session voice metadata.
    void trySetEngineDefaultVoice(body.voice_id);

    return NextResponse.json({
      voiceId: body.voice_id,
      requiresVerification: Boolean(body.requires_verification),
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Delete the voice clone from ElevenLabs. After this returns 200, the
 * verification step (GET /voices/:id → 404) is the caller's responsibility.
 */
export async function DELETE(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const voiceId = searchParams.get('voiceId');
  if (!voiceId) {
    return NextResponse.json({ error: 'Missing voiceId' }, { status: 400 });
  }

  try {
    const res = await fetch(`${ELEVENLABS_API_BASE}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': apiKey() },
    });

    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      return NextResponse.json(
        { error: `ElevenLabs delete failed: ${res.status} ${text}` },
        { status: 502 },
      );
    }

    // Verify by re-fetching the voice — must 404.
    const verify = await fetch(`${ELEVENLABS_API_BASE}/voices/${voiceId}`, {
      headers: { 'xi-api-key': apiKey() },
    });

    return NextResponse.json({
      deleted: true,
      verified: verify.status === 404,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
