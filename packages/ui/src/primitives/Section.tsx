/**
 * Section · vertical rhythm wrapper for marketing and app pages.
 *
 * From Blueprint §7.2:
 *   - Marketing section padding: 96-128px top/bottom (`top`) or
 *     64-80px (`compressed`).
 *   - Application section padding: 24-40px (`app`).
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';

type SectionSize = 'top' | 'compressed' | 'app';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
  /** Label for screen readers (aria-labelledby pattern handled by caller). */
  as?: 'section' | 'div' | 'article';
}

const PADDING_Y: Record<SectionSize, number> = {
  top: 128,
  compressed: 80,
  app: 32,
};

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { size = 'compressed', as: Tag = 'section', style, children, ...rest },
  ref,
) {
  const padY = PADDING_Y[size];
  return (
    <Tag
      ref={ref as never}
      style={{
        paddingBlock: padY,
        ...style,
      }}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Tag>
  );
});
