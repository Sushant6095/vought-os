/**
 * Signature 3 · The word stream
 *
 * Live transcript renders word-by-word. Each word fades in over 80ms
 * with a 2px upward translation. Default cadence is 80ms per word
 * (~200 WPM) — calibrated to actual ASR token rate when driven from
 * a live stream.
 *
 * Words older than the soft fade threshold (8s) drop to 75% opacity,
 * fading into the background rather than scrolling away.
 *
 * Reference: Blueprint §6.4, Signature 3.
 */

'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

export interface WordStreamProps {
  /** Full text to stream, or pre-tokenized words. */
  text: string | string[];
  /** Per-word stagger in ms. Default 80 (matches Signature 3). */
  staggerMs?: number;
  /** Per-word fade-in duration in ms. Default 80. */
  durationMs?: number;
  /** Soft-fade threshold — words older than this drop to 75% opacity. */
  softFadeMs?: number;
  /** className applied to the outer span. */
  className?: string;
  /** Inline style applied to the outer span. */
  style?: CSSProperties;
  /** Render-completed callback. */
  onComplete?: () => void;
}

const DEFAULT_STAGGER = 80;
const DEFAULT_DURATION = 80;
const DEFAULT_SOFT_FADE = 8000;

const isClient = typeof window !== 'undefined';

function prefersReducedMotion(): boolean {
  if (!isClient) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function tokenize(input: string | string[]): string[] {
  if (Array.isArray(input)) return input;
  // Preserve whitespace by splitting on whitespace and keeping a
  // separator word between every token.
  return input.split(/(\s+)/).filter((w) => w.length > 0);
}

export function WordStream({
  text,
  staggerMs = DEFAULT_STAGGER,
  durationMs = DEFAULT_DURATION,
  softFadeMs = DEFAULT_SOFT_FADE,
  className,
  style,
  onComplete,
}: WordStreamProps) {
  const words = useMemo(() => tokenize(text), [text]);
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const completedRef = useRef(false);

  const [now, setNow] = useState<number>(() => (isClient ? performance.now() : 0));
  const startRef = useRef<number>(now);

  // Drive a soft-fade timer for old words. Once all words have been
  // shown and we are past the softFade window, the rAF stops.
  useEffect(() => {
    if (!isClient || reducedMotion) return;

    startRef.current = performance.now();
    let raf = 0;

    const loop = () => {
      setNow(performance.now());
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    return () => window.cancelAnimationFrame(raf);
  }, [reducedMotion, words.length]);

  // Fire onComplete once all words have fully appeared.
  useEffect(() => {
    if (completedRef.current) return;
    const totalMs = words.length * staggerMs + durationMs;
    if (now - startRef.current >= totalMs) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [now, words.length, staggerMs, durationMs, onComplete]);

  if (reducedMotion) {
    return (
      <span className={className} style={style}>
        {words.join('')}
      </span>
    );
  }

  return (
    <span className={className} style={style} aria-live="polite">
      {words.map((word, i) => {
        const isWhitespace = /^\s+$/.test(word);
        const delay = i * staggerMs;
        const age = now - startRef.current - delay;
        const opacity = age <= 0 ? 0 : age < softFadeMs ? 1 : 0.75;
        const translateY = age <= 0 ? 2 : 0;

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px)`,
              transition: `opacity ${durationMs}ms cubic-bezier(0, 0, 0.2, 1), transform ${durationMs}ms cubic-bezier(0, 0, 0.2, 1)`,
              whiteSpace: isWhitespace ? 'pre' : 'normal',
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
