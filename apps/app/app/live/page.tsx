/**
 * /live · index — mints a session id and redirects to /live/[sessionId].
 *
 * The live screen lives at /live/[sessionId] so each conversation has
 * a stable URL we can correlate to memory, logs, and the diarization
 * sidecar. Hitting /live directly generates a fresh id server-side.
 */

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LiveIndex({ searchParams }: SearchParams) {
  const params = await searchParams;
  const persona =
    typeof params.persona === 'string' ? params.persona : 'first-date';

  const sessionId = randomUUID();
  redirect(`/live/${sessionId}?persona=${encodeURIComponent(persona)}`);
}
