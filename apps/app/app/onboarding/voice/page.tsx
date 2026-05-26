/**
 * /onboarding/voice — the 30-second voice clone capture screen.
 *
 * The single most magical interaction in the product. The user reads the
 * brand passage aloud for thirty seconds; ElevenLabs returns a voice_id;
 * the user hears a sample of Vought speaking *in their own voice*; they
 * accept. From then on, every live whisper sounds like them.
 *
 * State machine:
 *
 *   consent          ─ disclosure must be accepted to proceed
 *      ▼
 *   ready            ─ mic permission idle, record button armed
 *      ▼ start
 *   recording        ─ 30s timer + 60fps waveform + amber pulse-ring
 *      ▼ stop (auto at 30s or user-stop)
 *   stopped          ─ user reviews; can re-record or submit
 *      ▼ submit
 *   processing       ─ thinking dots; POST /api/voice-clone
 *      ▼ on voiceId
 *   sample           ─ "Hi, this is your voice." plays; accept or re-record
 *      ▼ accept
 *   done             ─ router.push('/onboarding/persona' or wherever next)
 *
 * Privacy: the audio Blob lives only in the useMicCapture hook's closure.
 * We never write it to localStorage, IndexedDB, or any server beyond the
 * single /api/voice-clone POST that forwards it to ElevenLabs.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { bloomVariants, useBreathTimer, MOTION } from '@vought/motion';

// Framer Motion takes seconds; @vought/motion exports the canonical
// CSS-friendly ms strings.
const QUICK_SECONDS = parseInt(MOTION.quick, 10) / 1000;

import { useMicCapture } from './_hooks/useMicCapture';
import { RecordButton } from './_components/RecordButton';
import { CountdownTimer } from './_components/CountdownTimer';
import { WaveformVisualizer } from './_components/WaveformVisualizer';
import { ConsentDisclosure } from './_components/ConsentDisclosure';
import { ProcessingState } from './_components/ProcessingState';

const MAX_DURATION_MS = 30_000;
const MIN_DURATION_MS = 8_000;

// The brand passage. Sourced from `vault/10 · Strategy/Brand Voice.md` —
// declarative, dry, specific. Roughly 30 seconds at a steady cadence.
const BRAND_PASSAGE = `I've always believed that the best conversations happen when you're a little uncomfortable. The questions you're afraid to ask are the ones worth asking. The truths you'd rather not say are usually the ones that need to be said. Quiet honesty. Specific words. The line you would not have written, said in the voice that closes the deal.`;

const SAMPLE_LINE = 'Hi, this is your voice. Vought will whisper as me from now on.';

type Phase =
  | 'consent'
  | 'ready'
  | 'recording'
  | 'stopped'
  | 'processing'
  | 'sample'
  | 'done'
  | 'error';

export default function OnboardingVoicePage() {
  useBreathTimer();
  const router = useRouter();

  const [consented, setConsented] = useState(false);
  const [phase, setPhase] = useState<Phase>('consent');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);

  const capture = useMicCapture({ maxDurationMs: MAX_DURATION_MS });

  // Sample playback owns its own audio element so we can replay on demand.
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const [samplePlaying, setSamplePlaying] = useState(false);

  // Lift mic-state transitions into the page state machine.
  useEffect(() => {
    if (capture.state === 'recording' && phase !== 'recording') setPhase('recording');
    if (capture.state === 'stopped' && phase === 'recording') setPhase('stopped');
    if (capture.state === 'error') {
      setErrorMessage(capture.error ?? 'Microphone error');
      setPhase('error');
    }
  }, [capture.state, capture.error, phase]);

  // Once consent flips true, advance from consent → ready.
  useEffect(() => {
    if (consented && phase === 'consent') setPhase('ready');
    if (!consented && phase === 'ready') setPhase('consent');
  }, [consented, phase]);

  const submit = async () => {
    if (!capture.blob) return;
    setPhase('processing');
    setErrorMessage(null);

    try {
      const form = new FormData();
      form.append(
        'audio',
        capture.blob,
        capture.blob.type.includes('webm') ? 'sample.webm' : 'sample.wav',
      );
      form.append('name', 'Vought voice clone');
      form.append('consentAt', new Date().toISOString());

      const res = await fetch('/api/voice-clone', { method: 'POST', body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({ error: 'Clone failed' }))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Clone failed (${res.status})`);
      }

      const { voiceId: vid } = (await res.json()) as { voiceId: string };
      setVoiceId(vid);

      // Stash on the client so the settings page can read it. Production
      // moves this server-side; for hackathon scope localStorage is fine.
      try {
        window.localStorage.setItem('vought.voiceId', vid);
      } catch {
        // ignore — non-fatal
      }
      setPhase('sample');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Clone failed';
      setErrorMessage(message);
      setPhase('error');
    }
  };

  const playSample = async () => {
    if (!voiceId) return;
    setSamplePlaying(true);
    try {
      // Build a streaming URL against ElevenLabs TTS. The browser hits this
      // through a future `/api/tts-sample` proxy in production; for the
      // hackathon we rely on the cloned voice being reachable via the
      // Speech Engine first-message on /live. The settings page exposes the
      // same sample via the dedicated player component.
      const url = `/api/voice-clone/sample?voiceId=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(SAMPLE_LINE)}`;
      const audio = sampleAudioRef.current ?? new Audio();
      sampleAudioRef.current = audio;
      audio.src = url;
      audio.onended = () => setSamplePlaying(false);
      audio.onerror = () => setSamplePlaying(false);
      await audio.play();
    } catch {
      setSamplePlaying(false);
    }
  };

  const accept = () => {
    setPhase('done');
    // Onboarding step 2 of N — next step is persona pick. Production wires
    // this to /onboarding/persona; for hackathon we go to home.
    router.push('/');
  };

  const reRecord = () => {
    capture.discard();
    setVoiceId(null);
    setErrorMessage(null);
    setPhase('ready');
  };

  const recordingTooShort = useMemo(
    () => capture.elapsedMs > 0 && capture.elapsedMs < MIN_DURATION_MS,
    [capture.elapsedMs],
  );

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10"
      style={{ color: 'var(--color-text-primary-dark)' }}
    >
      <header className="mb-8">
        <div
          className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          Step 2 of 4
        </div>
        <h1
          className="text-display-md font-display"
          style={{ letterSpacing: '-0.02em', lineHeight: 1.05 }}
        >
          Read this aloud,
          <br />
          for thirty seconds.
        </h1>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          We build a private voice model so Vought can whisper as you.
        </p>
      </header>

      {/* Brand passage card */}
      <section
        aria-label="Read this passage aloud"
        className="mb-8 rounded-xl p-5 text-base leading-relaxed"
        style={{
          backgroundColor: 'var(--color-elevated-dark)',
          border: '1px solid var(--color-hairline-dark)',
          color: 'var(--color-text-primary-dark)',
        }}
      >
        <span
          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          The passage
        </span>
        {BRAND_PASSAGE}
      </section>

      <AnimatePresence mode="wait">
        {(phase === 'consent' || phase === 'ready') && (
          <motion.section
            key="ready"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: QUICK_SECONDS } }}
            variants={bloomVariants}
            className="flex flex-col items-center gap-6"
          >
            <ConsentDisclosure accepted={consented} onChange={setConsented} />
            <RecordButton
              state="idle"
              disabled={!consented}
              onClick={() => void capture.start()}
            />
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted-dark)' }}
            >
              {consented ? 'Tap to begin' : 'Accept the consent above to begin'}
            </p>
          </motion.section>
        )}

        {phase === 'recording' && (
          <motion.section
            key="recording"
            initial="hidden"
            animate="visible"
            variants={bloomVariants}
            className="flex flex-col items-center gap-8"
            aria-live="polite"
          >
            <WaveformVisualizer
              amplitudes={capture.amplitudes}
              peak={capture.peak}
              active
            />
            <RecordButton state="recording" onClick={capture.stop} />
            <CountdownTimer elapsedMs={capture.elapsedMs} totalMs={MAX_DURATION_MS} />
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted-dark)' }}
              role="status"
            >
              Recording. Keep reading.
            </p>
          </motion.section>
        )}

        {phase === 'stopped' && (
          <motion.section
            key="stopped"
            initial="hidden"
            animate="visible"
            variants={bloomVariants}
            className="flex flex-col items-center gap-6"
          >
            <WaveformVisualizer
              amplitudes={capture.amplitudes}
              peak={capture.peak}
              active={false}
            />
            <CountdownTimer elapsedMs={capture.elapsedMs} totalMs={MAX_DURATION_MS} />
            {recordingTooShort ? (
              <p
                className="max-w-xs text-center text-sm"
                style={{ color: 'var(--color-risk-coral)' }}
              >
                A clean clone needs at least eight seconds. Try again.
              </p>
            ) : (
              <p
                className="max-w-xs text-center text-sm"
                style={{ color: 'var(--color-text-secondary-dark)' }}
              >
                Ready to clone. This sends thirty seconds to ElevenLabs.
              </p>
            )}
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={reRecord}
                className="flex-1 rounded-xl py-3 text-sm font-medium transition-colors duration-quick ease-quick"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-hairline-dark)',
                  color: 'var(--color-text-secondary-dark)',
                }}
              >
                Re-record
              </button>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={recordingTooShort}
                className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors duration-quick ease-quick disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-accent-amber)',
                  color: 'var(--color-canvas-dark)',
                }}
              >
                Clone my voice
              </button>
            </div>
          </motion.section>
        )}

        {phase === 'processing' && (
          <motion.section
            key="processing"
            initial="hidden"
            animate="visible"
            variants={bloomVariants}
          >
            <ProcessingState />
          </motion.section>
        )}

        {phase === 'sample' && (
          <motion.section
            key="sample"
            initial="hidden"
            animate="visible"
            variants={bloomVariants}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'var(--color-accent-amber)' }}
            >
              Your voice
            </div>
            <p
              className="text-xl leading-relaxed"
              style={{ color: 'var(--color-text-primary-dark)' }}
            >
              {SAMPLE_LINE}
            </p>
            <button
              type="button"
              onClick={() => void playSample()}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-quick ease-quick"
              style={{
                backgroundColor: 'var(--color-accent-amber-soft)',
                color: 'var(--color-accent-amber)',
                border: '1px solid rgba(245, 165, 36, 0.35)',
              }}
              aria-label="Play sample of your cloned voice"
            >
              <span aria-hidden="true">{samplePlaying ? '◼' : '▶'}</span>
              {samplePlaying ? 'Playing…' : 'Play sample'}
            </button>
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={reRecord}
                className="flex-1 rounded-xl py-3 text-sm font-medium"
                style={{
                  border: '1px solid var(--color-hairline-dark)',
                  color: 'var(--color-text-secondary-dark)',
                }}
              >
                Re-record
              </button>
              <button
                type="button"
                onClick={accept}
                className="flex-1 rounded-xl py-3 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-accent-amber)',
                  color: 'var(--color-canvas-dark)',
                }}
              >
                That&apos;s me
              </button>
            </div>
          </motion.section>
        )}

        {phase === 'error' && (
          <motion.section
            key="error"
            initial="hidden"
            animate="visible"
            variants={bloomVariants}
            className="flex flex-col items-center gap-4 text-center"
            role="alert"
          >
            <p
              className="text-base"
              style={{ color: 'var(--color-risk-coral)' }}
            >
              {errorMessage ?? 'Something went wrong.'}
            </p>
            <button
              type="button"
              onClick={reRecord}
              className="rounded-xl px-6 py-3 text-sm font-semibold"
              style={{
                backgroundColor: 'var(--color-accent-amber)',
                color: 'var(--color-canvas-dark)',
              }}
            >
              Try again
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <footer
        className="mt-auto pt-10 text-center font-mono text-[11px]"
        style={{ color: 'var(--color-text-muted-dark)' }}
      >
        <span
          aria-hidden="true"
          className="mr-2 inline-block h-1 w-1 rounded-full align-middle"
          style={{ backgroundColor: 'var(--color-accent-amber)' }}
        />
        Audio held in browser memory until submit
      </footer>
    </main>
  );
}
