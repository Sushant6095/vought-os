/**
 * Token endpoint.
 *
 * Issues a short-lived WebRTC conversation token from ElevenLabs so the
 * browser can connect without exposing the API key. Also mints a fresh
 * sessionId used to correlate the diarization sidecar's WebSocket
 * channel with the Echo Engine's Speech Engine session.
 *
 * Body:
 *   {
 *     personaId?: string,                     // default "first-date"
 *     userId?: string,                        // default "demo-user"
 *     variables?: Record<string, string>      // persona-substitution vars
 *   }
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY ?? '',
});

interface TokenRequestBody {
  personaId?: string;
  userId?: string;
  variables?: Record<string, string>;
}

interface TokenResponseBody {
  token: string;
  sessionId: string;
  personaId: string;
  userId: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json().catch(() => ({}))) as TokenRequestBody;
    const personaId = body.personaId ?? 'first-date';
    const userId = body.userId ?? 'demo-user';

    const speechEngineId = process.env.SPEECH_ENGINE_ID;
    if (!speechEngineId) {
      return NextResponse.json(
        { error: 'SPEECH_ENGINE_ID not configured' },
        { status: 500 },
      );
    }

    const response = await elevenlabs.conversationalAi.conversations.getWebrtcToken({
      agentId: speechEngineId,
    });

    const payload: TokenResponseBody = {
      token: response.token,
      sessionId: randomUUID(),
      personaId,
      userId,
    };

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to issue token';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
