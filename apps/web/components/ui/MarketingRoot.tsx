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

import { useBreathTimer } from '@vought/motion';
import { useReveal } from '@/lib/use-reveal';
import type { ReactNode } from 'react';

interface MarketingRootProps {
  children: ReactNode;
}

export function MarketingRoot({ children }: MarketingRootProps) {
  useBreathTimer();
  useReveal();
  return <>{children}</>;
}
