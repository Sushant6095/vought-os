/**
 * useReveal · adds `.in` to elements with `.reveal` when they intersect.
 *
 * Mount once near the marketing root. Uses IntersectionObserver so it's
 * cheap and scroll-handler-free.
 *
 * Threshold matches the mockup: 20% of the element visible triggers reveal.
 * Items unobserve after the first reveal so the observer footprint stays small.
 */

'use client';

import { useEffect } from 'react';

const isClient = typeof window !== 'undefined';

export function useReveal(): void {
  useEffect(() => {
    if (!isClient) return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal'),
    );
    if (elements.length === 0) return;

    // Honor reduced-motion by revealing everything immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
