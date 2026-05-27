/**
 * Vought · Tailwind preset
 *
 * Every value here is sourced from `src/tokens.ts`. Zero raw values.
 * Apps consume this as `presets: [voughtPreset]` in their own
 * tailwind.config.
 */

import type { Config } from 'tailwindcss';
import {
  color,
  fontFamily,
  fontSize,
  spacing,
  radius,
  shadow,
  motion,
  easing,
  container,
  z,
} from './src/tokens';

const preset: Partial<Config> = {
  // Apps own their own `content`. We only provide the theme preset.
  content: [],
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: color.canvas.dark,
          light: color.canvas.light,
        },
        surface: {
          dark: color.surface.dark,
          light: color.surface.light,
        },
        elevated: {
          dark: color.elevated.dark,
        },
        hairline: {
          dark: color.hairline.dark,
          light: color.hairline.light,
        },
        glass: {
          dark: color.glass.dark,
        },
        text: {
          'primary-dark': color.text.primaryDark,
          'primary-light': color.text.primaryLight,
          'secondary-dark': color.text.secondaryDark,
          'secondary-light': color.text.secondaryLight,
          'muted-dark': color.text.mutedDark,
          'muted-light': color.text.mutedLight,
        },
        accent: {
          amber: color.accent.amber,
          'amber-soft': color.accent.amberSoft,
        },
        live: {
          emerald: color.live.emerald,
        },
        risk: {
          coral: color.risk.coral,
        },
        info: {
          azure: color.info.azure,
        },
        marketing: {
          ink: color.marketing.ink,
        },
      },

      fontFamily: {
        display: [...fontFamily.display],
        sans: [...fontFamily.ui],
        mono: [...fontFamily.mono],
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fontSize: fontSize as any,

      spacing,

      maxWidth: {
        marketing: container.marketing,
        app: container.app,
      },

      borderRadius: {
        none: radius.none,
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        full: radius.full,
      },

      boxShadow: {
        none: shadow.none,
        card: shadow.card,
        'amber-glow': shadow.amberGlow,
      },

      transitionDuration: {
        instant: motion.instant,
        quick: motion.quick,
        standard: motion.standard,
        deliberate: motion.deliberate,
        cinematic: motion.cinematic,
        breath: motion.breath,
        wave: motion.wave,
      },

      transitionTimingFunction: {
        instant: easing.instant,
        quick: easing.quick,
        standard: easing.standard,
        deliberate: easing.deliberate,
        cinematic: easing.cinematic,
        breath: easing.breath,
        wave: easing.wave,
      },

      zIndex: {
        base: String(z.base),
        raised: String(z.raised),
        sticky: String(z.sticky),
        nav: String(z.nav),
        overlay: String(z.overlay),
        modal: String(z.modal),
        toast: String(z.toast),
      },

      keyframes: {
        // Signature 1 — The breath. The CSS animation reads
        // --breath-phase from :root (driven by useBreathTimer) when
        // available, but this self-contained keyframe is a fallback
        // for environments where the timer hook isn't mounted.
        breath: {
          '0%, 100%': { backgroundColor: color.canvas.dark },
          '50%': { backgroundColor: '#0E0E10' },
        },
        // Signature 2 — Whisper bloom.
        bloom: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '70%': { transform: 'scale(1.02)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Signature 3 — Per-word fade-in.
        'word-in': {
          from: { opacity: '0', transform: 'translateY(2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Signature 4 — Thinking dot pulse.
        'dot-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        // Idle waveform traveling wave.
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        // Skeleton shimmer.
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        breath: `breath ${motion.breath} ${easing.breath} infinite`,
        bloom: `bloom 320ms ${easing.cinematic} forwards`,
        'word-in': `word-in ${motion.instant} ${easing.instant} forwards`,
        'dot-pulse': `dot-pulse 1200ms ${easing.breath} infinite`,
        wave: `wave 1200ms ${easing.breath} infinite`,
        shimmer: `shimmer ${motion.breath} linear infinite`,
      },
    },
  },
};

export default preset;
