/**
 * StatePill · Blueprint §5.3.1
 *
 * The user's only anchor for AI state. Five distinct visual variants.
 * The pill itself wraps in bloom on transition into "whispering" so
 * the visual eye-flick that draws the operator's attention happens
 * here, not on the suggestion card.
 *
 * Rules:
 *  - One color signal per state (emerald = live, amber = AI, neutral = off).
 *  - No spinners — Signature 4 (thinking dots) is the only loader.
 *  - When whispering, the pill takes the amber background; the dot
 *    inverts to black. Everywhere else, only the dot carries color.
 */

'use client';

import { motion } from 'framer-motion';
import { ThinkingDots, bloomVariants } from '@vought/motion';
import type { AgentState } from '../_hooks/useRealtimeSession';

interface StatePillProps {
  state: AgentState;
  personaLabel?: string;
  /** Pause reason — shown on the "paused" variant only. */
  pauseReason?: string;
}

interface StateConfig {
  label: string;
  /** dot color class — only relevant on non-whispering variants */
  dotClass: string;
  /** Pulse rhythm on the dot. */
  pulse: 'none' | 'live' | 'amber';
  /** Background variant. */
  surface: 'glass' | 'amber';
}

const CONFIGS: Record<AgentState, StateConfig> = {
  idle: {
    label: 'Idle',
    dotClass: 'bg-text-muted-dark',
    pulse: 'none',
    surface: 'glass',
  },
  connecting: {
    label: 'Connecting',
    dotClass: 'bg-accent-amber',
    pulse: 'amber',
    surface: 'glass',
  },
  listening: {
    label: 'Listening',
    dotClass: 'bg-live-emerald',
    pulse: 'live',
    surface: 'glass',
  },
  thinking: {
    label: 'Thinking',
    dotClass: 'bg-accent-amber',
    pulse: 'amber',
    surface: 'glass',
  },
  whispering: {
    label: 'Whispering in your ear',
    dotClass: 'bg-canvas-dark',
    pulse: 'none',
    surface: 'amber',
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-text-muted-dark',
    pulse: 'none',
    surface: 'glass',
  },
};

export function StatePill({ state, personaLabel, pauseReason }: StatePillProps) {
  const cfg = CONFIGS[state];
  const isAmber = cfg.surface === 'amber';

  // Pulse animation — emerald is the 1.5s live pulse per spec.
  // Amber is the gentler 1.8s breath used on the "thinking" dot.
  const pulseClass =
    cfg.pulse === 'live'
      ? 'after:absolute after:inset-0 after:rounded-full after:bg-live-emerald after:opacity-50 after:animate-[ping_1500ms_cubic-bezier(0,0,0.2,1)_infinite]'
      : cfg.pulse === 'amber'
        ? 'after:absolute after:inset-0 after:rounded-full after:bg-accent-amber after:opacity-40 after:animate-[ping_1800ms_cubic-bezier(0.45,0.05,0.55,0.95)_infinite]'
        : '';

  const surfaceClass = isAmber
    ? 'bg-accent-amber text-canvas-dark'
    : 'bg-white/[0.04] text-text-primary-dark border border-hairline-dark';

  // The pill itself blooms when we enter "whispering" so the operator's
  // peripheral vision catches it. AnimatePresence is intentionally not
  // used — we want this to play on every entry to whispering, not just
  // mount.
  return (
    <motion.div
      key={state}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      initial={isAmber ? 'hidden' : false}
      animate={isAmber ? 'visible' : undefined}
      variants={isAmber ? bloomVariants : undefined}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${surfaceClass}`}
    >
      <span className="relative inline-flex items-center justify-center">
        <span className={`relative w-1.5 h-1.5 rounded-full ${cfg.dotClass} ${pulseClass}`} />
      </span>

      <span className="leading-none">
        {cfg.label}
        {state === 'paused' && pauseReason ? (
          <span className="text-text-secondary-dark ml-1.5">· {pauseReason}</span>
        ) : null}
        {personaLabel && state !== 'whispering' ? (
          <span className="text-text-secondary-dark ml-1.5">· {personaLabel}</span>
        ) : null}
      </span>

      {state === 'thinking' ? (
        <ThinkingDots
          className="ml-1"
          size={4}
          gap={4}
          label="Thinking — assembling suggestion"
        />
      ) : null}
    </motion.div>
  );
}
