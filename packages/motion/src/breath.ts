'use client';

/**
 * Signature 1 · The breath
 *
 * A single shared 2000ms canvas-brightness pulse. One requestAnimationFrame
 * loop drives a `--breath-phase` custom property on the document root. Every
 * surface that wants to phase-sync reads that variable from CSS — there are
 * no per-component animations and no drift.
 *
 * Reference: Blueprint §6.4, Signature 1.
 */

import { useEffect } from 'react';

const BREATH_DURATION_MS = 2000;

interface BreathState {
  /** Number of consumers currently subscribed. */
  count: number;
  /** rAF handle. Non-null while the loop is active. */
  raf: number | null;
  /** Monotonic start time used to compute phase. */
  startTime: number;
}

const state: BreathState = {
  count: 0,
  raf: null,
  startTime: 0,
};

const isClient = typeof window !== 'undefined';

function prefersReducedMotion(): boolean {
  if (!isClient) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function tick(now: number): void {
  // Phase in [0, 1] using a sinusoidal curve so the surface eases in
  // and out without a hard bounce at the midpoint.
  const elapsed = (now - state.startTime) % BREATH_DURATION_MS;
  const t = elapsed / BREATH_DURATION_MS;
  const phase = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);

  document.documentElement.style.setProperty('--breath-phase', phase.toFixed(4));

  state.raf = window.requestAnimationFrame(tick);
}

function start(): void {
  if (state.raf !== null || !isClient) return;
  state.startTime = performance.now();
  state.raf = window.requestAnimationFrame(tick);
}

function stop(): void {
  if (state.raf !== null && isClient) {
    window.cancelAnimationFrame(state.raf);
    state.raf = null;
  }
  if (isClient) {
    document.documentElement.style.setProperty('--breath-phase', '0');
  }
}

/**
 * Subscribe a component to the shared breath timer. Mount this once
 * near the app root (e.g. in the marketing/app layout). Multiple
 * mounts are reference-counted and safe.
 */
export function useBreathTimer(): void {
  useEffect(() => {
    if (!isClient) return;

    if (prefersReducedMotion()) {
      // Honor the user's preference — leave the breath at 0.
      document.documentElement.style.setProperty('--breath-phase', '0');
      return;
    }

    state.count += 1;
    if (state.count === 1) start();

    return () => {
      state.count = Math.max(0, state.count - 1);
      if (state.count === 0) stop();
    };
  }, []);
}

/**
 * Imperative starter for non-React contexts (e.g. layout scripts).
 * Returns an unsubscribe function. Reference-counted with the hook.
 */
export function subscribeBreath(): () => void {
  if (!isClient) return () => undefined;

  if (prefersReducedMotion()) {
    document.documentElement.style.setProperty('--breath-phase', '0');
    return () => undefined;
  }

  state.count += 1;
  if (state.count === 1) start();

  return () => {
    state.count = Math.max(0, state.count - 1);
    if (state.count === 0) stop();
  };
}
