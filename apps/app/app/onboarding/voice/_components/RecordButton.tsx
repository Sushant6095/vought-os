/**
 * RecordButton — the large circular mic button with the amber pulse-ring.
 *
 * Three states:
 *   • idle       — black canvas, ghost amber ring, "Tap to record" affordance
 *   • recording  — solid amber fill, soft outward pulse synced to --breath-phase
 *   • stopped    — amber-soft fill, square stop glyph, "Recording captured"
 *
 * Amber is reserved for the AI/recording active state. The pulse-ring is the
 * only place the canvas breath manifests on this surface — everything else
 * stays still so the waveform reads clearly.
 */

'use client';

import { motion } from 'framer-motion';
import { MOTION } from '@vought/motion';

// Framer Motion takes seconds; @vought/motion exports CSS-friendly ms strings.
const BREATH_SECONDS = parseInt(MOTION.breath, 10) / 1000;

type RecordState = 'idle' | 'recording' | 'stopped';

interface RecordButtonProps {
  state: RecordState;
  disabled?: boolean;
  onClick: () => void;
}

export function RecordButton({ state, disabled, onClick }: RecordButtonProps) {
  const isRecording = state === 'recording';
  const label =
    state === 'idle'
      ? 'Start recording'
      : state === 'recording'
        ? 'Stop recording'
        : 'Recording captured';

  return (
    <div className="relative inline-flex items-center justify-center">
      {/*
       * Pulse-ring: only present while recording. Two layered rings — one
       * driven by Framer Motion (the slower deliberate pulse), one driven by
       * --breath-phase via the CSS variable for sub-frame phase-sync.
       */}
      {isRecording && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-[-12px] rounded-full"
            style={{
              backgroundColor: 'rgba(245, 165, 36, 0.18)',
              transform: 'scale(calc(1 + var(--breath-phase, 0) * 0.06))',
              transition: 'transform var(--motion-instant) linear',
            }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute inset-[-24px] rounded-full"
            style={{ border: '1px solid rgba(245, 165, 36, 0.45)' }}
            initial={{ opacity: 0.6, scale: 0.95 }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [0.95, 1.15, 0.95] }}
            transition={{
              duration: BREATH_SECONDS,
              repeat: Infinity,
              // Framer needs a numeric cubic-bezier array, not the CSS string.
              ease: [0.45, 0.05, 0.55, 0.95],
            }}
          />
        </>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={isRecording}
        aria-label={label}
        className="relative inline-flex h-28 w-28 items-center justify-center rounded-full transition-transform duration-quick ease-quick disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isRecording
            ? 'var(--color-accent-amber)'
            : state === 'stopped'
              ? 'var(--color-accent-amber-soft)'
              : 'var(--color-elevated-dark)',
          border: isRecording
            ? '1px solid var(--color-accent-amber)'
            : '1px solid var(--color-hairline-dark)',
          boxShadow: isRecording
            ? '0 0 0 6px rgba(245, 165, 36, 0.10)'
            : 'none',
        }}
      >
        {/* Glyph */}
        {state === 'idle' && (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="10"
              y="4"
              width="8"
              height="14"
              rx="4"
              stroke="var(--color-accent-amber)"
              strokeWidth="1.6"
            />
            <path
              d="M6 14a8 8 0 0016 0"
              stroke="var(--color-accent-amber)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M14 22v3"
              stroke="var(--color-accent-amber)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
        {state === 'recording' && (
          <span
            className="block h-7 w-7 rounded-sm"
            style={{ backgroundColor: 'var(--color-canvas-dark)' }}
            aria-hidden="true"
          />
        )}
        {state === 'stopped' && (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path
              d="M8 14l4 4 8-8"
              stroke="var(--color-accent-amber)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
