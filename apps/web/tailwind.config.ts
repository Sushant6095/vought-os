/**
 * apps/web · Tailwind configuration.
 *
 * Imports the `@vought/design-system` preset — the single source of
 * truth for colors, spacing, typography, motion, and z-index.
 *
 * Do NOT extend theme values inline here. If a token is missing, add
 * it to `packages/design-system/src/tokens.ts` first.
 */

import type { Config } from 'tailwindcss';
import voughtPreset from '@vought/design-system/tailwind';

const config: Config = {
  presets: [voughtPreset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    // Pull in workspace primitives so their utility classes get tree-shaken correctly.
    // Exclude test, spec, and stories files from scanning — they add no production classes.
    '../../packages/ui/src/**/*.{ts,tsx}',
    '!../../packages/ui/src/**/*.{test,spec,stories}.{ts,tsx}',
    '../../packages/motion/src/**/*.{ts,tsx}',
    '!../../packages/motion/src/**/*.{test,spec,stories}.{ts,tsx}',
  ],
  // Web-only re-skin: the marketing site moved from amber to the premium
  // black/white/electric-blue system. Repointing the accent here flips every
  // `accent-amber*` utility (incl. opacity variants) to blue across all
  // marketing pages without touching the shared design-system or apps/app.
  theme: {
    extend: {
      colors: {
        accent: {
          amber: '#3358ff',
          amberSoft: 'rgba(51, 88, 255, 0.16)',
          amberDark: '#2645d8',
          'amber-soft': 'rgba(51, 88, 255, 0.16)',
          'amber-dark': '#2645d8',
        },
      },
    },
  },
};

export default config;
