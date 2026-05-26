/**
 * Grid · 12-column grid with 24px gutter.
 *
 * From Blueprint §7.2:
 *   - 12 columns, 24px gutter.
 *   - Common spans: 4, 6, 8, 12.
 *   - Forbidden spans: 5, 7, 11.
 *
 * Compose with `<GridItem span={6} />` to lay out cells.
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns. Default 12. */
  columns?: number;
  /** Gutter in px. Default 24. */
  gutter?: number;
  /** Row gap. Defaults to gutter. */
  rowGap?: number;
  as?: 'div' | 'ul' | 'section';
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns = 12, gutter = 24, rowGap, as: Tag = 'div', style, children, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        columnGap: gutter,
        rowGap: rowGap ?? gutter,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});

type AllowedSpan = 1 | 2 | 3 | 4 | 6 | 8 | 9 | 10 | 12;

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns spanned. Allowed: 1, 2, 3, 4, 6, 8, 9, 10, 12. */
  span?: AllowedSpan;
  /** Optional start column (1-based). */
  start?: number;
  as?: 'div' | 'li' | 'article';
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem(
  { span = 12, start, as: Tag = 'div', style, children, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      style={{
        gridColumn: start ? `${start} / span ${span}` : `span ${span} / span ${span}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});
