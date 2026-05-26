/**
 * Signature 2 · The whisper bloom
 *
 * The suggestion card's appearance. 320ms scale overshoot
 * (0.96 → 1.02 → 1.0) with opacity 0 → 1. Background saturation locks
 * in at ~80ms so the text is briefly readable on a pale background
 * before amber takes over — the suggestion feels *spoken into existence*.
 *
 * Reference: Blueprint §6.4, Signature 2.
 *
 * Consumers have three options:
 *   1. CSS class `bloom` — drop on an element, animation runs once.
 *   2. `bloomKeyframes` + `bloomTransition` — for Framer Motion.
 *   3. `bloomVariants` — drop-in Framer Motion `variants` prop.
 */

export const BLOOM_DURATION_MS = 320;
export const BLOOM_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Inline CSS string for cases where the consumer prefers raw style.
 * Respects prefers-reduced-motion by collapsing to a quick fade.
 */
export const bloomCss = `
@keyframes vought-bloom {
  0%   { transform: scale(0.96); opacity: 0; }
  70%  { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
}
.bloom { animation: vought-bloom ${BLOOM_DURATION_MS}ms ${BLOOM_EASING} forwards; }

@media (prefers-reduced-motion: reduce) {
  .bloom { animation: none; opacity: 1; transform: none; }
}
`.trim();

/**
 * Framer Motion variants. Drop on any <motion.div>.
 *
 * Example:
 *   <motion.div initial="hidden" animate="visible" variants={bloomVariants}>
 */
export const bloomVariants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: {
    scale: [0.96, 1.02, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: BLOOM_DURATION_MS / 1000,
      times: [0, 0.7, 1],
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

/**
 * Same overshoot expressed as a transition spec for Framer Motion's
 * `transition` prop — useful when controlling animation imperatively.
 */
export const bloomTransition = {
  duration: BLOOM_DURATION_MS / 1000,
  ease: [0.16, 1, 0.3, 1] as const,
};
