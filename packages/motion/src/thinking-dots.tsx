/**
 * Signature 4 · The thinking dots
 *
 * Three amber dots beneath the state pill. Staggered pulse: dot 1 at
 * t=0, dot 2 at t=140ms, dot 3 at t=280ms. All return to 40% by
 * t=600ms. Loops until first LLM token arrives.
 *
 * This is the *only* loading animation in the entire product. We
 * never use spinners.
 *
 * Reference: Blueprint §6.4, Signature 4.
 */

'use client';

import { CSSProperties } from 'react';

export interface ThinkingDotsProps {
  /** Dot color. Default `accent/amber`. */
  color?: string;
  /** Dot diameter in px. Default 6. */
  size?: number;
  /** Gap between dots in px. Default 6. */
  gap?: number;
  /** className applied to the outer container. */
  className?: string;
  /** Inline style for the outer container. */
  style?: CSSProperties;
  /** Accessible label. Default "Thinking". */
  label?: string;
}

const DOT_DURATION_MS = 1200;
const DOT_STAGGER_MS = 140;

// One inline <style> block per app — keys are deduped by browser.
const STYLE_BLOCK = `
@keyframes vought-dot-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.15); }
}
@media (prefers-reduced-motion: reduce) {
  .vought-thinking-dot { animation: none !important; opacity: 0.6 !important; }
}
`.trim();

export function ThinkingDots({
  color = '#F5A524',
  size = 6,
  gap = 6,
  className,
  style,
  label = 'Thinking',
}: ThinkingDotsProps) {
  const dotStyle = (delayMs: number): CSSProperties => ({
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    transformOrigin: 'center',
    animation: `vought-dot-pulse ${DOT_DURATION_MS}ms cubic-bezier(0.45, 0.05, 0.55, 0.95) ${delayMs}ms infinite`,
  });

  return (
    <span
      role="status"
      aria-label={label}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        ...style,
      }}
    >
      <style>{STYLE_BLOCK}</style>
      <span className="vought-thinking-dot" style={dotStyle(0)} />
      <span className="vought-thinking-dot" style={dotStyle(DOT_STAGGER_MS)} />
      <span className="vought-thinking-dot" style={dotStyle(DOT_STAGGER_MS * 2)} />
    </span>
  );
}
