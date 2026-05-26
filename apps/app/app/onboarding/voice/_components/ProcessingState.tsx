/**
 * ProcessingState — the post-record interstitial.
 *
 * The user hears "Processing… typically 30-60 seconds." The thinking dots
 * (Signature 4) carry the wait. No spinners. No progress bar with fake
 * percent — we will not lie about progress we cannot measure.
 *
 * Screen reader announces the state via aria-live="polite".
 */

'use client';

import { ThinkingDots } from '@vought/motion';

export function ProcessingState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: 'var(--color-accent-amber)' }}
      >
        Cloning your voice
      </div>
      <p
        className="max-w-xs text-base leading-relaxed"
        style={{ color: 'var(--color-text-secondary-dark)' }}
      >
        Building a private voice model. Typically thirty to sixty seconds.
      </p>
      <ThinkingDots label="Processing voice clone" />
    </div>
  );
}
