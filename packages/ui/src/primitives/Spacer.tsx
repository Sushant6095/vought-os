/**
 * Spacer · explicit empty box for vertical or horizontal spacing.
 *
 * Use sparingly — prefer `<Stack gap>` / `<Cluster gap>` for normal
 * rhythm. Spacer is for asymmetric layouts where gap can't reach.
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';

type SpacerSize = 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80 | 96 | 128;
type SpacerAxis = 'vertical' | 'horizontal';

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  size: SpacerSize;
  axis?: SpacerAxis;
}

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(function Spacer(
  { size, axis = 'vertical', style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: axis === 'horizontal' ? size : '100%',
        height: axis === 'vertical' ? size : '100%',
        ...style,
      }}
      {...rest}
    />
  );
});
