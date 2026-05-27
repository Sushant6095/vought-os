'use client';

/**
 * SmoothScroll · Lenis-powered buttery scroll + a scroll-driven background.
 *
 * - Drives Lenis with one rAF loop.
 * - On every scroll, writes `--scroll-progress` (0–1) to :root and
 *   interpolates the fixed #scroll-bg layer's colour across three stops
 *   (ink → deep electric blue → ink) for the "colour smoothly changing"
 *   effect. Hero3D reads window.scrollY independently for parallax.
 * - Honors prefers-reduced-motion (skips smoothing).
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STOPS: [number, number, number][] = [
  [6, 7, 11], // ink
  [13, 22, 58], // deep electric blue
  [4, 5, 9], // near-black
];

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function colorAt(p: number): string {
  // p in [0,1] across two segments of the 3-stop ramp
  const seg = p < 0.5 ? 0 : 1;
  const t = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
  const a = STOPS[seg];
  const b = STOPS[seg + 1];
  return `rgb(${lerp(a[0], b[0], t)}, ${lerp(a[1], b[1], t)}, ${lerp(a[2], b[2], t)})`;
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const bg = document.getElementById('scroll-bg');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const apply = (p: number) => {
      const c = Math.min(1, Math.max(0, p));
      root.style.setProperty('--scroll-progress', c.toFixed(4));
      if (bg) bg.style.backgroundColor = colorAt(c);
    };
    const onProgress = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      apply(max > 0 ? window.scrollY / max : 0);
    };

    let raf = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: { raf: (t: number) => void; on: (e: string, cb: (...args: any[]) => void) => void; destroy: () => void } | null = null;
    let cancelled = false;

    // Always track native scroll too — Lenis updates real scrollTop, and this
    // guarantees the colour shift fires even if Lenis's event timing varies.
    window.addEventListener('scroll', onProgress, { passive: true });

    if (reduce) {
      onProgress();
    } else {
      import('lenis').then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        }) as unknown as typeof lenis;
        // Lenis emits { progress } — use it directly (authoritative under Lenis).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lenis!.on('scroll', (e: any) => {
          const prog = (e as { progress?: number })?.progress;
          if (typeof prog === 'number') apply(prog);
          else onProgress();
        });
        const loop = (time: number) => {
          lenis!.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        onProgress();
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onProgress);
      lenis?.destroy();
    };
  }, [pathname]);

  return <div id="scroll-bg" aria-hidden />;
}
