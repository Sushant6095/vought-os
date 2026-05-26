/**
 * Cluster · horizontal flex with gap and wrap.
 *
 * Use for inline groups (CTA pairs, metric strips, pill rows).
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';

type ClusterGap = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64;
type ClusterAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
type ClusterJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface ClusterProps extends HTMLAttributes<HTMLDivElement> {
  gap?: ClusterGap;
  align?: ClusterAlign;
  justify?: ClusterJustify;
  wrap?: boolean;
  as?: 'div' | 'ul' | 'ol' | 'nav';
}

const ALIGN_MAP: Record<ClusterAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  baseline: 'baseline',
  stretch: 'stretch',
};

const JUSTIFY_MAP: Record<ClusterJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
};

export const Cluster = forwardRef<HTMLDivElement, ClusterProps>(function Cluster(
  {
    gap = 16,
    align = 'center',
    justify = 'start',
    wrap = true,
    as: Tag = 'div',
    style,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap,
        alignItems: ALIGN_MAP[align],
        justifyContent: JUSTIFY_MAP[justify],
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});
