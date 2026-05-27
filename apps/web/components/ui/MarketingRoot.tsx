/**
 * MarketingRoot · client-only providers for the marketing site.
 *
 * Mounts:
 *   - The shared breath timer (Signature 1) once at the document root.
 *   - The reveal-on-scroll observer for `.reveal` elements.
 *
 * Both honor `prefers-reduced-motion` internally — no extra branching needed.
 */

'use client';

import { useReveal } from '@/lib/use-reveal';
import { useSplitHeadings } from '@/lib/use-split-headings';
import { SmoothScroll } from '@/components/fx/SmoothScroll';
import type { ReactNode } from 'react';

interface MarketingRootProps {
  children: ReactNode;
}

export function MarketingRoot({ children }: MarketingRootProps) {
  useReveal();
  useSplitHeadings();
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
