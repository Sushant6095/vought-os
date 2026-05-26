/**
 * Scene 5 · Live demo block
 *
 * Two columns:
 *   - Left: eyebrow + headline + lede + "open the live demo" CTA.
 *   - Right: the 90-second interactive simulator with state pill,
 *     word-streamed transcript, thinking dots, suggestion bloom, and
 *     a speaker timeline strip.
 *
 * The simulator auto-plays muted via a sequence of `setTimeout`s. The
 * user can tap to restart. There is no audio element — the brand
 * deliberately avoids autoplaying sound; "Tap to hear" reveals voice
 * on click only.
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight, PauseSquare } from '@/components/ui/Icon';
import { WordStream, ThinkingDots, bloomCss } from '@vought/motion';

type Phase = 'listening' | 'thinking' | 'whispering';

const TURN_WORDS = [
  '“…we ', 'already ', 'pay ', 'for ', 'Salesforce, ',
  'not ', 'sure ', 'we ', 'need ', 'another ', 'system.”',
];
const TRANSCRIPT_DURATION_MS = TURN_WORDS.length * 80 + 100;
const THINKING_DURATION_MS = 800;
const LOOP_RESET_MS = 6000;

export function LiveDemoBlock() {
  const [phase, setPhase] = useState<Phase>('listening');
  const [hearVisible, setHearVisible] = useState(true);

  // Autoplay loop. Reset on a single setInterval-driven sequence.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setPhase('listening');
      setTimeout(() => !cancelled && setPhase('thinking'), TRANSCRIPT_DURATION_MS);
      setTimeout(
        () => !cancelled && setPhase('whispering'),
        TRANSCRIPT_DURATION_MS + THINKING_DURATION_MS,
      );
    };
    run();
    const id = setInterval(run, LOOP_RESET_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <section
      aria-labelledby="live-demo-heading"
      className="relative px-6 py-32"
    >
      {/* The bloom keyframes are scoped here so this section's suggestion card animates. */}
      <style>{bloomCss}</style>

      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={48} className="items-center">
          <GridItem span={12} className="reveal lg:!col-span-5">
            <div className="label-small mb-5 text-accent-amber">
              Watch it work · live
            </div>
            <h2
              id="live-demo-heading"
              className="display-xl mb-7 text-white"
            >
              This actually happens<br />
              in <span className="text-accent-amber">412 milliseconds</span>.
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-white/60">
              Vought hears what they say. Separates their voice from yours.
              Finds the line your top closer would have said. Whispers it in
              your voice, in your ear. All under one second.
            </p>
            <Link
              href="/demo"
              className="pill-cta inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
            >
              Open the live demo
              <ArrowRight size={14} className="text-marketing-ink" />
            </Link>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-6 lg:!col-start-7"
            style={{ transitionDelay: '80ms' }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark p-6 shadow-2xl">
              {/* Top bar */}
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="pulse-emerald h-1.5 w-1.5 rounded-full bg-live-emerald" />
                  <span className="label-tiny text-white/60">Listening · live</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Pause demo"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 hover:bg-white/5"
                  >
                    <PauseSquare size={8} className="text-white" />
                  </button>
                  <span className="mono text-[10px] text-white/40">00:14 / 01:30</span>
                </div>
              </div>

              {/* Transcript */}
              <div className="mb-5 space-y-4">
                <div>
                  <div className="label-tiny mb-1 text-white/40">06:12 · Jenna</div>
                  <div className="text-sm text-white/70" key={phase /* re-streams on phase reset */}>
                    <WordStream
                      text={TURN_WORDS}
                      staggerMs={80}
                      durationMs={120}
                    />
                  </div>
                </div>

                {phase !== 'listening' && (
                  <div className="flex items-center gap-2 py-1">
                    <span className="label-tiny text-accent-amber">Thinking</span>
                    <ThinkingDots />
                  </div>
                )}

                {phase === 'whispering' && (
                  <div className="bloom rounded-xl bg-accent-amber p-5">
                    <div className="label-tiny mb-2 text-marketing-ink/60">
                      Say next · in your voice
                    </div>
                    <p className="text-base font-semibold leading-snug text-marketing-ink">
                      “Totally hear you on stack fatigue. What’s the thing your
                      reps spend most of their day actually doing in Salesforce?”
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[10px] text-marketing-ink/50">
                      <span>Playbook · Salesforce objection v3</span>
                      <span className="font-bold">· 412ms</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Speaker timeline */}
              <div className="border-t border-white/5 pt-4">
                <div className="label-tiny mb-2 text-white/40">
                  Speaker timeline · last 60s
                </div>
                <div className="flex h-7 items-end gap-px overflow-hidden rounded-md">
                  <div className="h-full bg-accent-amber/50" style={{ width: '20%' }} />
                  <div className="h-full" style={{ width: '2%' }} />
                  <div className="h-full bg-info-azure/50" style={{ width: '35%' }} />
                  <div className="h-full" style={{ width: '2%' }} />
                  <div className="h-full bg-accent-amber/50" style={{ width: '12%' }} />
                  <div className="h-full" style={{ width: '2%' }} />
                  <div className="h-full bg-info-azure/50" style={{ width: '27%' }} />
                </div>
                <div className="mono mt-2 flex justify-between text-[10px] text-white/30">
                  <span>−60s</span>
                  <span>−30s</span>
                  <span>now</span>
                </div>
              </div>

              {/* Tap-to-hear overlay button */}
              {hearVisible && (
                <button
                  type="button"
                  onClick={() => setHearVisible(false)}
                  className="absolute right-4 top-4 z-raised inline-flex items-center gap-2 rounded-full border border-white/15 bg-elevated-dark/80 px-3 py-1.5 text-[10px] font-semibold text-white/80 backdrop-blur hover:text-white"
                  aria-label="Tap to hear the audio sample"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
                  Tap to hear
                </button>
              )}
            </div>
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}
