/**
 * WordStreamTranscript · Blueprint §5.3.2 + Signature 3
 *
 * The "they just said" line above the suggestion card. Renders word-by-word
 * via `@vought/motion`'s WordStream component — 80ms stagger, 2px upward
 * translate per word, words older than 8s fade to 75% opacity.
 *
 * Aria: `aria-live="polite"` is set inside WordStream itself.
 */

'use client';

import { WordStream } from '@vought/motion';

interface WordStreamTranscriptProps {
  /** The most recent utterance the operator should be aware of. */
  text: string | null;
  /** Optional label above the stream. Default "They just said". */
  label?: string;
}

export function WordStreamTranscript({
  text,
  label = 'They just said',
}: WordStreamTranscriptProps) {
  if (!text || text.length === 0) {
    return (
      <div className="opacity-60">
        <div className="text-label-xs text-text-muted-dark mb-1.5">
          {label}
        </div>
        <p className="text-sm italic text-text-muted-dark">…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-label-xs text-text-muted-dark mb-1.5">
        {label}
      </div>
      <WordStream
        // Re-key on text so a brand-new utterance restarts the stream
        // cleanly instead of layering on the previous one.
        key={text}
        text={text}
        staggerMs={80}
        durationMs={80}
        softFadeMs={8000}
        className="text-sm italic text-text-secondary-dark leading-relaxed"
      />
    </div>
  );
}
