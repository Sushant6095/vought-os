/**
 * Stack · vertical flex with consistent gap.
 *
 * Gap must come from the 4px spacing scale. Default 16px.
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';

type StackGap = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128;
type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: StackGap;
  align?: StackAlign;
  as?: 'div' | 'ul' | 'ol' | 'section' | 'article';
}

const ALIGN_MAP: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = 16, align = 'stretch', as: Tag = 'div', style, children, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        alignItems: ALIGN_MAP[align],
        ...style,
      }}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Tag>
  );
});
