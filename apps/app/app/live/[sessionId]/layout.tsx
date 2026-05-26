/**
 * Live mode layout — Blueprint §5.2.
 *
 * Full-bleed canvas. No top bar, no sidebar. The breath timer mounts
 * once here so every surface beneath it can phase-sync via the
 * `--breath-phase` custom property.
 *
 * Aria-app: this whole layout is one role="application" region so
 * screen readers know to enter direct-keypress mode for the keyboard
 * shortcuts (← cycle, ↺ regenerate, ⏎ accept).
 */

'use client';

import { useBreathTimer } from '@vought/motion';
import type { ReactNode } from 'react';

interface LiveLayoutProps {
  children: ReactNode;
}

export default function LiveLayout({ children }: LiveLayoutProps) {
  // Single shared rAF drives --breath-phase on :root. Safe to mount
  // multiple times — ref-counted internally.
  useBreathTimer();

  return (
    <div
      role="application"
      aria-label="Vought live conversation"
      className="min-h-screen w-full bg-canvas-dark text-text-primary-dark relative overflow-hidden"
    >
      {/* Ambient orb — subtle warm amber radial in the upper-right. Not
          decorative motion — it phase-syncs with the breath via
          --breath-phase (opacity multiplier). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,165,36,0.10) 0%, transparent 70%)',
          opacity: 'calc(0.6 + var(--breath-phase) * 0.4)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-32 w-[480px] h-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,165,36,0.06) 0%, transparent 70%)',
          opacity: 'calc(0.5 + var(--breath-phase) * 0.5)',
        }}
      />

      {children}
    </div>
  );
}
