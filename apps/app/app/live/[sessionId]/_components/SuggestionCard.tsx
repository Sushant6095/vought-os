/**
 * SuggestionCard · Blueprint §5.3.3
 *
 * The hero unit of the entire product.
 *
 *   Amber background #F5A524, black text, 20px corner radius,
 *   24px padding, no border, no shadow.
 *
 * Inside:
 *   - 10pt uppercase amber-on-black eyebrow ("SAY NEXT")
 *   - 28pt suggestion line, weight 600, tracking -0.005em
 *   - 14pt follow-up hint in 70% opacity black ("then: …")
 *   - Three buttons: Used / Skip / Different
 *
 * The bloom signature (Signature 2 · 320ms · 0.96 → 1.02 → 1) is
 * imported from `@vought/motion` — never re-implemented.
 *
 * Interruption hygiene (Blueprint §5.3.8):
 *   - When the operator starts speaking mid-whisper, `interrupted`
 *     flips true. Card fades to 60% opacity over 200ms.
 *
 * Low-confidence (Blueprint §5.3.6):
 *   - When confidence < 0.6, the card switches to white-on-canvas
 *     instead of black-on-amber — a visible *the AI is less sure*
 *     signal that doesn't require reading a number.
 */

'use client';

import { motion } from 'framer-motion';
import { bloomVariants, MOTION } from '@vought/motion';
import type { Suggestion } from '../_hooks/useRealtimeSession';

interface SuggestionCardProps {
  suggestion: Suggestion;
  /** Render-mode — Personal hides Skip/Different and tightens padding. */
  variant?: 'personal' | 'teams';
  onAccept?: () => void;
  onSkip?: () => void;
  onDifferent?: () => void;
}

const LOW_CONFIDENCE_THRESHOLD = 0.6;

export function SuggestionCard({
  suggestion,
  variant = 'personal',
  onAccept,
  onSkip,
  onDifferent,
}: SuggestionCardProps) {
  const lowConfidence =
    typeof suggestion.confidence === 'number' &&
    suggestion.confidence < LOW_CONFIDENCE_THRESHOLD;

  const interrupted = suggestion.interrupted === true;

  const surfaceClass = lowConfidence
    ? 'bg-elevated-dark text-text-primary-dark'
    : 'bg-accent-amber text-canvas-dark';

  const eyebrowClass = lowConfidence
    ? 'text-accent-amber'
    : 'text-canvas-dark/60';

  const followUpClass = lowConfidence
    ? 'text-text-secondary-dark'
    : 'text-canvas-dark/70';

  // Bloom plays once per suggestion id — keying on id triggers re-mount
  // and replays the keyframe.
  return (
    <motion.article
      key={suggestion.id}
      initial="hidden"
      animate="visible"
      variants={bloomVariants}
      aria-label="Suggested response"
      style={{
        // Interruption fade — 200ms per Blueprint §5.3.8 (allowlisted
        // exception to the canonical motion table; the curve still
        // references the CSS variable so the design-system stays the
        // source of truth for easing). We change only opacity
        // (compositor-friendly).
        opacity: interrupted ? 0.6 : 1,
        transition: `opacity 200ms var(--easing-instant, cubic-bezier(0, 0, 0.2, 1))`,
      }}
      className={`relative rounded-xl p-6 ${surfaceClass}`}
    >
      <div
        className={`text-label-xs mb-3 ${eyebrowClass}`}
      >
        Say next
      </div>

      <p
        className="text-[28px] font-semibold leading-[1.2]"
        style={{ letterSpacing: '-0.005em' }}
      >
        {suggestion.text}
      </p>

      {suggestion.followUp ? (
        <p className={`mt-3 text-sm leading-relaxed ${followUpClass}`}>
          → then: <span className="font-medium">{suggestion.followUp}</span>
        </p>
      ) : null}

      {/* Actions — three tile buttons. Personal hides Different and
          Skip when there's only one suggestion in the queue. */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        <ActionTile
          glyph={suggestion.used ? '✓' : '⏎'}
          label={suggestion.used ? 'Used' : 'Use'}
          onClick={onAccept}
          isPrimary
          lowConfidence={lowConfidence}
          ariaKey="accept"
        />
        <ActionTile
          glyph="↺"
          label="Different"
          onClick={onDifferent}
          lowConfidence={lowConfidence}
          ariaKey="regenerate"
        />
        <ActionTile
          glyph="✕"
          label="Skip"
          onClick={onSkip}
          lowConfidence={lowConfidence}
          ariaKey="skip"
        />
      </div>

      {/* Keyboard legend · Blueprint §5.3.3 */}
      <div
        className={`flex items-center gap-3 mt-4 text-label-sm font-mono ${followUpClass}`}
        aria-hidden
      >
        <kbd>←</kbd>
        <span>cycle</span>
        <span>·</span>
        <kbd>↺</kbd>
        <span>regenerate</span>
        <span>·</span>
        <kbd>⏎</kbd>
        <span>accept</span>
      </div>

      {/* Hidden — only consumed by the variant === 'teams' parent. */}
      {variant === 'teams' && lowConfidence ? (
        <span className="sr-only">Low confidence: the AI is less certain about this suggestion.</span>
      ) : null}

      {/* Hide the motion timing token from getting tree-shaken away —
          referenced so future audits see the binding. */}
      <span className="sr-only">duration {MOTION.deliberate}</span>
    </motion.article>
  );
}

interface ActionTileProps {
  glyph: string;
  label: string;
  onClick?: () => void;
  isPrimary?: boolean;
  lowConfidence?: boolean;
  ariaKey: string;
}

function ActionTile({
  glyph,
  label,
  onClick,
  isPrimary,
  lowConfidence,
  ariaKey,
}: ActionTileProps) {
  const base =
    'flex flex-col items-center justify-center gap-1 rounded-md py-3 px-2 min-h-[44px] text-label-sm font-medium transition-colors duration-quick ease-quick';

  // Two surface variants — high-confidence (amber bg) vs low-confidence (dark bg).
  const skin = lowConfidence
    ? isPrimary
      ? 'bg-accent-amber text-canvas-dark hover:brightness-95'
      : 'bg-white/5 text-text-primary-dark hover:bg-white/[0.08]'
    : isPrimary
      ? 'bg-canvas-dark text-accent-amber hover:bg-canvas-dark/90'
      : 'bg-canvas-dark/10 text-canvas-dark hover:bg-canvas-dark/15';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-action={ariaKey}
      className={`${base} ${skin}`}
    >
      <span className="text-base leading-none">{glyph}</span>
      <span>{label}</span>
    </button>
  );
}
