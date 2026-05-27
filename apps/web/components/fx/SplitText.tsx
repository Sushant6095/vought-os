'use client';

/**
 * SplitText · word-level reveal. Splits children into per-word spans, each
 * staggered via `--sc-i`, and toggles `.in` when the block scrolls into
 * view (IntersectionObserver). The CSS in globals.css drives the motion.
 *
 * Word-level (not char-level) keeps the DOM light and screen-readers happy —
 * the full string stays in an aria-label; the animated spans are aria-hidden.
 */

import { useEffect, useRef, type ElementType } from 'react';

interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** ms between words; default 22 (matches the CSS calc base). */
  delayStep?: number;
}

export function SplitText({ text, as: Tag = 'span', className = '' }: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden style={{ ['--sc-i' as string]: i }}>
          <span data-sc>{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
