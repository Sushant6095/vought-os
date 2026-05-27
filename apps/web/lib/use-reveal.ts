/**
 * useReveal · adds `.in` to elements with `.reveal` when they intersect.
 *
 * Re-scans on every route change (depends on pathname) so client-side
 * navigation between marketing pages always arms the new page's `.reveal`
 * elements — without this, SPA-navigated pages stay stuck at opacity:0.
 *
 * A rAF defers the scan until the new route's DOM is painted, and a short
 * safety sweep reveals anything already in the viewport so a page can never
 * be left blank.
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const isClient = typeof window !== 'undefined';

export function useReveal(): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!isClient) return;

    let observer: IntersectionObserver | null = null;

    const arm = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>('.reveal:not(.in)'),
      );
      if (elements.length === 0) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach((el) => el.classList.add('in'));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );

      elements.forEach((el) => observer!.observe(el));
    };

    const raf = requestAnimationFrame(arm);

    // Safety net: reveal anything already on-screen shortly after a route
    // change so navigation can never leave a page blank.
    const safety = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('.reveal:not(.in)')
        .forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('in');
          }
        });
    }, 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      observer?.disconnect();
    };
  }, [pathname]);
}
