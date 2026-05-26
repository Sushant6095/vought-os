/**
 * Container · max-width wrapper with consistent horizontal padding.
 *
 * Two width variants from Blueprint §7.2:
 *   - `marketing` — 1180px max
 *   - `app`       — fluid up to 1680px
 *
 * Horizontal padding 24px (token spacing/6).
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';

type ContainerWidth = 'marketing' | 'app' | 'narrow';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  /** Override horizontal padding. Defaults to 24px. */
  padX?: number;
  /** Render as a custom element (e.g. `main`, `section`). Defaults to `div`. */
  as?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
}

const WIDTH_PX: Record<ContainerWidth, number> = {
  marketing: 1180,
  app: 1680,
  narrow: 720,
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { width = 'marketing', padX = 24, as: Tag = 'div', style, children, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      style={{
        width: '100%',
        maxWidth: WIDTH_PX[width],
        marginInline: 'auto',
        paddingInline: padX,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});
