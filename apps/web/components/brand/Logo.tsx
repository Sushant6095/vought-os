'use client';

/**
 * Logo · Vought brand lockup (chrome "V" emblem + wordmark).
 *
 * An original metallic emblem: a faceted "V" monogram — two beveled planes
 * meeting at a centre fold so the two halves catch light differently — set
 * inside a hexagonal chrome ring. Vertical + diagonal silver gradients give
 * the brushed-metal sheen; hover lifts and brightens the badge (240ms
 * standard tier). Styling/motion live in `globals.css` under
 * "Brand logo · chrome V emblem".
 *
 * Single source of truth for the nav, footer, and favicon family.
 */

import { useId } from 'react';
import Link from 'next/link';

interface LogoProps {
  /** Extra classes for the root link (e.g. `mb-5` in the footer). */
  className?: string;
  /** Render the mark only, without the VOUGHT wordmark. */
  markOnly?: boolean;
  /** Link target. Defaults to the home page. */
  href?: string;
}

export function Logo({ className = '', markOnly = false, href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Vought home"
      className={`vought-logo group flex items-center gap-2.5 ${className}`.trim()}
    >
      <LogoMark />
      {!markOnly && (
        <span className="text-[19px] font-bold tracking-tight text-white">
          VOUGHT
        </span>
      )}
    </Link>
  );
}

/** The standalone chrome "V" emblem. Unique gradient ids per instance. */
export function LogoMark({ size = 28 }: { size?: number }) {
  const uid = useId();
  const ring = `${uid}-ring`;
  const facetL = `${uid}-fl`;
  const facetR = `${uid}-fr`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden
      className="vought-logo-badge"
    >
      <defs>
        {/* Vertical brushed-chrome sheen for the hexagonal ring. */}
        <linearGradient id={ring} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.16" stopColor="#dfe3ea" />
          <stop offset="0.42" stopColor="#9aa1ad" />
          <stop offset="0.5" stopColor="#767d89" />
          <stop offset="0.58" stopColor="#a7adb8" />
          <stop offset="0.8" stopColor="#eceff4" />
          <stop offset="1" stopColor="#848a95" />
        </linearGradient>
        {/* Left facet — lit from upper-left. */}
        <linearGradient id={facetL} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#c2c7d0" />
          <stop offset="1" stopColor="#7f858f" />
        </linearGradient>
        {/* Right facet — darker, lit from upper-right. */}
        <linearGradient id={facetR} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8cdd6" />
          <stop offset="0.5" stopColor="#888e99" />
          <stop offset="1" stopColor="#5f656f" />
        </linearGradient>
      </defs>

      {/* Hexagonal chrome ring (outer hex minus inner hex). */}
      <path
        fillRule="evenodd"
        fill={`url(#${ring})`}
        stroke="#2a2e36"
        strokeWidth="1"
        d="M64 6 L114.2 35 L114.2 93 L64 122 L13.8 93 L13.8 35 Z
           M64 19 L102.9 41.5 L102.9 86.5 L64 109 L25.1 86.5 L25.1 41.5 Z"
      />

      {/* "V" monogram — two metal facets meeting at a centre fold. */}
      <path fill={`url(#${facetL})`} d="M40 44 L54 44 L64 74 L64 94 Z" />
      <path fill={`url(#${facetR})`} d="M64 74 L74 44 L88 44 L64 94 Z" />
      {/* Centre-fold highlight. */}
      <path stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.1" d="M64 75 L64 93" />
    </svg>
  );
}
