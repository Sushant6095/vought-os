/**
 * useCountUp · animates a numeric display from 0 to a target value
 * once the element enters the viewport. Eased cubic-out.
 *
 * Renders to a ref-supplied <span>. Cubic-out easing matches the mockup.
 * Honors `prefers-reduced-motion` by jumping straight to the final value.
 */

'use client';

import { useEffect, useRef, type RefObject } from 'react';

interface UseCountUpOptions {
  target: number;
  prefix?: string;
  suffix?: string;
  /** Total duration in ms. Default 1400. */
  durationMs?: number;
  /** Decimals for non-integer targets. Default 1. */
  decimals?: number;
}

const isClient = typeof window !== 'undefined';

function format(
  value: number,
  isInteger: boolean,
  decimals: number,
  prefix: string,
  suffix: string,
): string {
  const digits = isInteger ? Math.floor(value).toString() : value.toFixed(decimals);
  return `${prefix}${digits}${suffix}`;
}

export function useCountUp({
  target,
  prefix = '',
  suffix = '',
  durationMs = 1400,
  decimals = 1,
}: UseCountUpOptions): RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!isClient || !el) return;

    const isInteger = Number.isInteger(target);

    // Initial paint should never show "$0B" flashing — start at the resting zero.
    el.textContent = format(0, isInteger, decimals, prefix, suffix);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = format(target, isInteger, decimals, prefix, suffix);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = format(value, isInteger, decimals, prefix, suffix);
            if (progress < 1) {
              window.requestAnimationFrame(animate);
            } else {
              el.textContent = format(target, isInteger, decimals, prefix, suffix);
            }
          };

          window.requestAnimationFrame(animate);
        });
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, prefix, suffix, durationMs, decimals]);

  return ref;
}
