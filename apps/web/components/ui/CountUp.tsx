/**
 * CountUp · numeric display that animates from 0 to a target value
 * when it enters the viewport. Always renders mono numerals.
 */

'use client';

import React from 'react';
import { useCountUp } from '@/lib/use-count-up';

interface CountUpProps {
  target: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function CountUp({ target, prefix, suffix, className, decimals }: CountUpProps) {
  const ref = useCountUp({ target, prefix, suffix, decimals });
  return <span ref={ref as React.RefObject<HTMLSpanElement>} className={`mono ${className ?? ''}`.trim()} />;
}
