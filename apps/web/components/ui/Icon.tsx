/**
 * Icon · the small set of inline SVGs the marketing site needs.
 *
 * Every icon ships at a single canonical viewBox and inherits stroke
 * from `currentColor` so it picks up the token-driven text color.
 *
 * Why local SVGs instead of an icon library: every glyph is hand-tuned
 * to the brand (rounded caps, 1.5–2 stroke), and bringing in lucide for
 * eight icons would balloon the bundle.
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 14 14',
    fill: 'none',
    className,
    'aria-hidden': true,
    focusable: false,
  } as const;
}

export function ArrowRight({ size = 14, className, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M3 7h8M7 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ size = 14, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M3 7l3 3 5-6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Play({ size = 10, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M3 2l5 3-5 3z" />
    </svg>
  );
}

export function Wordmark({ size = 13, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M3 3l5 10 5-10"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Mic({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="7" y="3" width="6" height="10" rx="3" stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M4 10a6 6 0 0012 0M10 16v2"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Waves({ size = 20, className, color = 'currentColor' }: IconProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M3 10c0-4 3-7 7-7s7 3 7 7" stroke={color} strokeWidth={1.5} />
      <path d="M5 13l2-2 3 3 5-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function Brain({ size = 20, className, color = 'currentColor' }: IconProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="10" cy="10" r="6" stroke={color} strokeWidth={1.5} />
      <circle cx="10" cy="10" r="2" fill={color} />
    </svg>
  );
}

export function Doc({ size = 20, className, color = 'currentColor' }: IconProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M5 8h10M5 12h7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <rect x="3" y="4" width="14" height="12" rx="2" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

export function Bars({ size = 20, className, color = 'currentColor' }: IconProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M4 7v6M7 5v10M10 8v4M13 5v10M16 7v6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function User({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="11" cy="7" r="3.5" stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M3 19c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Headphones({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M5 10c0-3 2.5-5.5 5.5-5.5S16 7 16 10"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <ellipse cx="5" cy="13" rx="2" ry="3" fill="currentColor" />
      <ellipse cx="17" cy="13" rx="2" ry="3" fill="currentColor" />
    </svg>
  );
}

export function ChartBars({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M4 18V11M9 18V5M14 18v-8M19 18v-4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PauseSquare({ size = 8, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="2" y="1" width="1.5" height="6" />
      <rect x="4.5" y="1" width="1.5" height="6" />
    </svg>
  );
}

export function ChevronDown({ size = 10, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XMark({ size = 14, className, color = 'white' }: IconProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill={color}
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M11 1H13L8.5 6L14 13H10L7 9L3.5 13H1.5L6.5 7.5L1 1H5L7.5 4.5L11 1Z" />
    </svg>
  );
}

export function LinkedIn({ size = 14, className, color = 'white' }: IconProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill={color}
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="1" y="4" width="2" height="9" />
      <rect x="1" y="1" width="2" height="2" />
      <path d="M5 4h2v1.3c.5-.8 1.5-1.3 2.5-1.3 1.9 0 3.5 1.6 3.5 3.5V13h-2V7.5C11 6.7 10.3 6 9.5 6S8 6.7 8 7.5V13H6V4z" />
    </svg>
  );
}
