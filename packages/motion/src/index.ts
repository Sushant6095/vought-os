/**
 * @vought/motion
 *
 * The four signature motions and the canonical timing/easing
 * constants. Nothing else lives here.
 */

export { useBreathTimer, subscribeBreath } from './breath';
export {
  BLOOM_DURATION_MS,
  BLOOM_EASING,
  bloomCss,
  bloomVariants,
  bloomTransition,
} from './bloom';
export { WordStream } from './word-stream';
export type { WordStreamProps } from './word-stream';
export { ThinkingDots } from './thinking-dots';
export type { ThinkingDotsProps } from './thinking-dots';

/**
 * The seven canonical durations. Match `tokens.motion` from
 * `@vought/design-system`. Re-exported here so motion consumers
 * don't need to import both packages.
 *
 * Reference: Blueprint §6.2, Vault: Motion · Timing Table.
 */
export const MOTION = {
  instant: '80ms',
  quick: '150ms',
  standard: '240ms',
  deliberate: '360ms',
  cinematic: '640ms',
  breath: '2000ms',
  wave: '4000ms',
} as const;

export const EASING = {
  instant: 'cubic-bezier(0, 0, 0.2, 1)',
  quick: 'cubic-bezier(0.4, 0, 0.2, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  deliberate: 'cubic-bezier(0.32, 0.72, 0, 1)',
  cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
  breath: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  wave: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
} as const;

export const SPRING = {
  default: { stiffness: 400, damping: 30 },
} as const;
