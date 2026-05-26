/**
 * DisclosureFooter · Blueprint §5.6
 *
 * Always-visible privacy footer. Tiny shield glyph + the line
 * "No audio recorded · zero retention mode". For Personal users
 * (who do not see the Source Attribution panel) the latency callsign
 * also lives here so the brand pattern stays visible.
 */

'use client';

import { LatencyCallsign } from './SourceAttributionPanel';

interface DisclosureFooterProps {
  /** Personal variant shows latency callsign inline; Teams hides it
   *  here because the right rail already carries it. */
  variant: 'personal' | 'teams';
  latencyMs?: number | null;
}

export function DisclosureFooter({ variant, latencyMs }: DisclosureFooterProps) {
  return (
    <footer
      className="flex items-center justify-between gap-4 text-label-sm text-text-muted-dark"
      role="contentinfo"
      aria-label="Privacy disclosure"
    >
      <div className="inline-flex items-center gap-1.5">
        <ShieldGlyph />
        <span>No audio recorded</span>
        <span aria-hidden>·</span>
        <span>zero retention mode</span>
      </div>

      {variant === 'personal' ? <LatencyCallsign latencyMs={latencyMs} /> : null}
    </footer>
  );
}

function ShieldGlyph() {
  // 12px shield mark — outlined, single stroke. No emoji.
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="text-text-muted-dark"
    >
      <path
        d="M6 1L1.5 2.5V6c0 2.5 1.8 4.4 4.5 5 2.7-.6 4.5-2.5 4.5-5V2.5L6 1Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
