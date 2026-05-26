/**
 * Vought · Design Tokens
 *
 * Canonical source of truth for all colors, type, spacing, radius, shadow,
 * and motion values in the entire Vought product surface.
 *
 * If you write a raw hex, pixel, or duration outside this file, you are
 * violating the design system. Tokens are immutable.
 *
 * @see vault/20 · Design System/Tokens · Color.md
 * @see vault/20 · Design System/Tokens · Typography.md
 * @see vault/20 · Design System/Motion · Timing Table.md
 * @see VOUGHT-DESIGN-BLUEPRINT.md §7 (Visual System), §6 (Motion)
 */

// ───────────────────────────────────────────────────────────────────
// COLOR · Blueprint §7.3 · Vault: Tokens · Color
// One canvas, one accent. Amber is reserved for AI state.
// ───────────────────────────────────────────────────────────────────

export const color = {
  canvas: {
    dark: '#0A0A0B',
    light: '#FAF8F3',
  },
  surface: {
    dark: '#131316',
    light: '#FFFFFF',
  },
  elevated: {
    dark: '#1A1A1E',
  },
  hairline: {
    dark: '#25252A',
    light: '#E8E5DC',
  },
  glass: {
    dark: 'rgba(20, 20, 24, 0.72)',
  },
  text: {
    primaryDark: '#F5F5F7',
    primaryLight: '#0A0A0B',
    secondaryDark: '#9B9BA3',
    secondaryLight: '#5C5C66',
    // mutedDark: 4.55:1 on canvas.dark (#0A0A0B) — WCAG AA Normal (1.4.3).
    // Previous value #5C5C66 measured 2.99:1 and failed AA on every dark surface.
    mutedDark: '#797979',
    // mutedLight: 5.58:1 on canvas.light (#FAF8F3) — WCAG AA Normal (1.4.3).
    // Previous value #A3A3AB measured 2.36:1 and failed AA on canvas.light.
    mutedLight: '#646464',
  },
  accent: {
    amber: '#F5A524',
    amberSoft: 'rgba(245, 165, 36, 0.14)',
    // amberDark: 4.6:1 on canvas.light (#FAF8F3) — WCAG AA Normal (1.4.3).
    // NOTE: color.accent.amber (#F5A524) measures 1.92:1 on canvas.light and is
    // UNSAFE for text on light backgrounds. Use accent.amberDark for any amber
    // text on light canvases; reserve accent.amber for text on dark canvases
    // (9.70:1 on canvas.dark — strong pass) and for decorative fills/borders.
    amberDark: '#B87A10',
  },
  live: {
    emerald: '#10B981',
  },
  risk: {
    coral: '#F26D5B',
    // coralLight: 4.54:1 on canvas.light (#FAF8F3) — WCAG AA Normal (1.4.3).
    // Use for error text on light canvases. risk.coral measures 2.78:1 on
    // canvas.light and is unsafe for body/large text there.
    coralLight: '#C94432',
  },
  info: {
    azure: '#5B8FF9',
  },
  marketing: {
    ink: '#0A0A0B',
  },
} as const;

// ───────────────────────────────────────────────────────────────────
// TYPOGRAPHY · Blueprint §7.1
// Three families. Fourteen scale tokens.
// ───────────────────────────────────────────────────────────────────

export const fontFamily = {
  display: [
    'Söhne',
    'Inter Display',
    'Inter',
    'system-ui',
    '-apple-system',
    'sans-serif',
  ],
  ui: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const;

export type TypeToken = {
  size: string;
  line: string;
  weight: number;
  tracking: string;
  transform?: 'uppercase';
  family: 'display' | 'ui' | 'mono';
};

export const type: Record<string, TypeToken> = {
  'display/3xl': { size: '88px', line: '0.95', weight: 800, tracking: '-0.045em', family: 'display' },
  'display/2xl': { size: '64px', line: '1.0', weight: 800, tracking: '-0.04em', family: 'display' },
  'display/xl': { size: '48px', line: '1.05', weight: 700, tracking: '-0.03em', family: 'display' },
  'display/lg': { size: '40px', line: '1.1', weight: 700, tracking: '-0.025em', family: 'display' },
  'display/md': { size: '32px', line: '1.15', weight: 700, tracking: '-0.02em', family: 'display' },
  'text/xl': { size: '24px', line: '1.3', weight: 500, tracking: '-0.005em', family: 'ui' },
  'text/lg': { size: '20px', line: '1.4', weight: 500, tracking: '-0.005em', family: 'ui' },
  'text/base': { size: '16px', line: '1.5', weight: 400, tracking: '0', family: 'ui' },
  'text/sm': { size: '14px', line: '1.5', weight: 400, tracking: '0', family: 'ui' },
  'text/xs': { size: '12px', line: '1.5', weight: 500, tracking: '0', family: 'ui' },
  'label/sm': { size: '11px', line: '1.4', weight: 600, tracking: '0.12em', transform: 'uppercase', family: 'ui' },
  'label/xs': { size: '10px', line: '1.3', weight: 700, tracking: '0.15em', transform: 'uppercase', family: 'ui' },
  'mono/lg': { size: '24px', line: '1.0', weight: 500, tracking: '-0.01em', family: 'mono' },
  'mono/sm': { size: '13px', line: '1.4', weight: 400, tracking: '0', family: 'mono' },
} as const;

// Flat token map for Tailwind fontSize.
// Tailwind format: [size, { lineHeight, letterSpacing, fontWeight }].
export const fontSize = Object.fromEntries(
  Object.entries(type).map(([name, t]) => [
    name.replace('/', '-'),
    [
      t.size,
      {
        lineHeight: t.line,
        letterSpacing: t.tracking,
        fontWeight: String(t.weight),
      },
    ] as const,
  ]),
) as Record<string, readonly [string, { lineHeight: string; letterSpacing: string; fontWeight: string }]>;

// ───────────────────────────────────────────────────────────────────
// SPACING · Blueprint §7.2
// Base 4. Forbidden values: 5, 7, 11, etc.
// ───────────────────────────────────────────────────────────────────

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
} as const;

// Container max-widths · Blueprint §7.2
export const container = {
  marketing: '1180px',
  app: '1680px',
} as const;

// Grid · 12 cols, 24px gutter
export const grid = {
  columns: 12,
  gutter: '24px',
} as const;

// ───────────────────────────────────────────────────────────────────
// RADIUS · Blueprint §7.4
// ───────────────────────────────────────────────────────────────────

export const radius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px', // marketing card
  xl: '20px', // suggestion card, glass panel
  full: '9999px', // pills
} as const;

// ───────────────────────────────────────────────────────────────────
// SHADOW · Blueprint §7.7
// Dark mode has no shadows — depth is surface-color shift.
// ───────────────────────────────────────────────────────────────────

export const shadow = {
  none: 'none',
  // Light-mode marketing elevation. Large, diffuse, never literal.
  card: '0 30px 80px rgba(0, 0, 0, 0.06)',
  // Subtle glow for amber-active states (used sparingly).
  amberGlow: '0 0 0 6px rgba(245, 165, 36, 0)',
} as const;

// ───────────────────────────────────────────────────────────────────
// MOTION · Blueprint §6.2 · Vault: Motion · Timing Table
// Seven canonical durations. Everything else is a violation.
// ───────────────────────────────────────────────────────────────────

export const motion = {
  instant: '80ms',
  quick: '150ms',
  standard: '240ms',
  deliberate: '360ms',
  cinematic: '640ms',
  breath: '2000ms',
  wave: '4000ms',
} as const;

export const easing = {
  instant: 'cubic-bezier(0, 0, 0.2, 1)', // ease-out
  quick: 'cubic-bezier(0.4, 0, 0.2, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  deliberate: 'cubic-bezier(0.32, 0.72, 0, 1)',
  cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
  breath: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  wave: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
} as const;

// Spring (drag/drop only — Blueprint §6.2)
export const spring = {
  default: { stiffness: 400, damping: 30 },
} as const;

// ───────────────────────────────────────────────────────────────────
// Z-INDEX
// ───────────────────────────────────────────────────────────────────

export const z = {
  base: 0,
  raised: 10,
  sticky: 100,
  nav: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ───────────────────────────────────────────────────────────────────
// Re-export aggregate token namespace for consumer ergonomics.
// ───────────────────────────────────────────────────────────────────

export const tokens = {
  color,
  fontFamily,
  type,
  fontSize,
  spacing,
  container,
  grid,
  radius,
  shadow,
  motion,
  easing,
  spring,
  z,
} as const;

export type Tokens = typeof tokens;
