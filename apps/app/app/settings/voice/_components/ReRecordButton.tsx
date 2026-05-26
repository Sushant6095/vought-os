/**
 * ReRecordButton — restarts the onboarding voice flow.
 *
 * No state is destroyed here; the new clone replaces the old one on
 * success. The previous voiceId remains intact until the onboarding flow
 * completes and writes the new id back to localStorage.
 */

'use client';

import { useRouter } from 'next/navigation';

export function ReRecordButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/onboarding/voice')}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-quick ease-quick"
      style={{
        backgroundColor: 'transparent',
        border: '1px solid var(--color-hairline-dark)',
        color: 'var(--color-text-primary-dark)',
      }}
    >
      Re-record voice
    </button>
  );
}
