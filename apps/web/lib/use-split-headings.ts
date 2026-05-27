/**
 * useSplitHeadings · auto split-text reveal for every page's <h1>.
 *
 * On each route change it finds the page hero <h1>, wraps each word in a
 * staggered `[data-sc]` span (preserving any nested accent <span>s), and
 * reveals on scroll-into-view via the `.split` / `.in` CSS in globals.css.
 *
 * Skips h1s already produced by the <SplitText> component (landing) and
 * skips entirely under prefers-reduced-motion. Server-rendered text stays
 * intact for SEO/no-JS — this only enhances on the client.
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useSplitHeadings(): void {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observers: IntersectionObserver[] = [];

    const raf = requestAnimationFrame(() => {
      const heads = document.querySelectorAll<HTMLElement>('h1');

      heads.forEach((h) => {
        if (h.dataset.split === 'done') return;
        // Already handled by the <SplitText> component — leave it.
        if (h.querySelector('[data-sc]')) {
          h.dataset.split = 'done';
          return;
        }

        let i = 0;
        const wrapTextNode = (node: Text, parent: Node) => {
          const parts = (node.textContent ?? '').split(/(\s+)/);
          const frag = document.createDocumentFragment();
          for (const part of parts) {
            if (part === '' ) continue;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              continue;
            }
            const outer = document.createElement('span');
            outer.style.setProperty('--sc-i', String(i++));
            const inner = document.createElement('span');
            inner.setAttribute('data-sc', '');
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          }
          parent.replaceChild(frag, node);
        };

        // Walk direct children: split top-level text, and the text inside
        // one level of element children (e.g. the accent <span>).
        Array.from(h.childNodes).forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            wrapTextNode(child as Text, h);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as Element;
            Array.from(el.childNodes).forEach((gc) => {
              if (gc.nodeType === Node.TEXT_NODE && gc.textContent?.trim()) {
                wrapTextNode(gc as Text, el);
              }
            });
          }
        });

        h.classList.add('split');
        h.dataset.split = 'done';

        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              h.classList.add('in');
              io.disconnect();
            }
          },
          { threshold: 0.15 },
        );
        io.observe(h);
        observers.push(io);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      observers.forEach((o) => o.disconnect());
    };
  }, [pathname]);
}
