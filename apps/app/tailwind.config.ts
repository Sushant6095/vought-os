/**
 * apps/app · Tailwind configuration.
 *
 * Consumes the `@vought/design-system` preset — the single source of
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
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/motion/src/**/*.{ts,tsx}',
  ],
};

export default config;
