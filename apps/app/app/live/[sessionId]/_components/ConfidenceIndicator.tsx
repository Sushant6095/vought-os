/**
 * ConfidenceIndicator · Blueprint §5.3.6
 *
 * Thin horizontal bar beneath the suggestion card. Amber fill width
 * equals confidence percentage. Teams only — Personal hides this.
 *
 * Below ~60% confidence, the *card* (not this bar) flips to a darker
 * surface to telegraph that the AI is less sure. This component just
 * shows the precise number.
 */

'use client';

import { motion } from 'framer-motion';

interface ConfidenceIndicatorProps {
  /** 0..1 — clamped silently. */
  confidence: number;
  /** Render the numeric callout to the right of the bar. */
  showLabel?: boolean;
}

const TRANSITION_MS = 240;

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const clamped = Math.max(0, Math.min(1, confidence));
  const pct = Math.round(clamped * 100);

  return (
    <div className="flex items-center gap-3" aria-label={`Confidence ${pct} percent`}>
      <div className="flex-1 h-[3px] rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: TRANSITION_MS / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="h-full bg-accent-amber rounded-full"
          aria-hidden
        />
      </div>
      {showLabel ? (
        <span className="text-label-xs font-mono text-text-muted-dark min-w-[36px] text-right">
          {pct}%
        </span>
      ) : null}
    </div>
  );
}
