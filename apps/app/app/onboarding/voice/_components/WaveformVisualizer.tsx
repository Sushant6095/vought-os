/**
 * WaveformVisualizer — real-time amplitude bars.
 *
 * Renders one bar per amplitude sample, scaled vertically. The bars use
 * transform: scaleY so we stay on compositor-friendly properties (never
 * animate height). 60fps comes from the parent hook driving amplitudes.
 *
 * Reduced motion: collapses to a single static bar and exposes a textual
 * amplitude readout so screen-reader users still get state feedback.
 */

'use client';

import { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  amplitudes: Float32Array;
  peak: number;
  active: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefers(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return prefers;
}

export function WaveformVisualizer({ amplitudes, peak, active }: WaveformVisualizerProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    const pct = Math.round(Math.min(1, peak) * 100);
    return (
      <div
        className="flex h-24 w-full items-end justify-center"
        role="img"
        aria-label={`Input amplitude ${pct}%`}
      >
        <div
          className="w-2 origin-bottom rounded-full"
          style={{
            height: '100%',
            backgroundColor: active
              ? 'var(--color-accent-amber)'
              : 'var(--color-hairline-dark)',
            transform: `scaleY(${Math.max(0.04, Math.min(1, peak))})`,
            transition: 'transform var(--motion-instant) linear',
          }}
        />
        <span
          className="sr-only"
          aria-live="off"
          style={{ position: 'absolute', left: '-9999px' }}
        >
          {pct}%
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex h-24 w-full items-center justify-center gap-1"
      aria-hidden="true"
    >
      {Array.from(amplitudes).map((amp, i) => {
        // Boost the floor so silence still shows a sliver of presence.
        const scaled = Math.max(0.04, Math.min(1, amp * 1.6));
        const opacity =
          0.4 +
          0.6 * Math.min(1, Math.abs(i - amplitudes.length / 2) / (amplitudes.length / 2 + 1));
        return (
          <span
            key={i}
            className="w-1 origin-center rounded-full"
            style={{
              height: '100%',
              backgroundColor: active
                ? 'var(--color-accent-amber)'
                : 'var(--color-hairline-dark)',
              opacity: active ? 1 - opacity * 0.4 : 0.6,
              transform: `scaleY(${scaled})`,
              transition: 'transform var(--motion-instant) linear',
            }}
          />
        );
      })}
    </div>
  );
}
