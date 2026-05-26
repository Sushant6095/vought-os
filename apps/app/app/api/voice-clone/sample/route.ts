/**
 * Voice clone sample TTS proxy.
 *
 * GET /api/voice-clone/sample?voiceId=…&text=…
 *
 * Synthesises a short sample sentence in the freshly cloned voice. The
 * cloned voice has just been created, so this is the first time the user
 * hears it speak as them — the "wow" moment. Streamed straight from
 * ElevenLabs' TTS endpoint to the browser as MPEG audio.
 *
 * This route does not store the audio, log the text, or cache the response.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const TTS_TIMEOUT_MS = 15_000;
const MAX_TEXT_LENGTH = 240;

function apiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY not configured');
  return key;
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const voiceId = searchParams.get('voiceId');
  const text = searchParams.get('text');

  if (!voiceId) {
    return NextResponse.json({ error: 'Missing voiceId' }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'Text too long' }, { status: 413 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

  try {
    const upstream = await fetch(
      `${ELEVENLABS_API_BASE}/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey(),
          'content-type': 'application/json',
          accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.2,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!upstream.ok || !upstream.body) {
      const body = await upstream.text().catch(() => '');
      return NextResponse.json(
        { error: `TTS upstream failed: ${upstream.status} ${body}` },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS failed';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
