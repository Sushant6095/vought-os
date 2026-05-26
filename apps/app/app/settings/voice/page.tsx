/**
 * /settings/voice — voice profile management.
 *
 * Shows the current cloned voice, a one-tap sample, and the two destructive
 * actions: Re-record (which restarts the onboarding flow) and Delete (gated
 * behind a typed-confirmation dialog). Blueprint §4 "/voices" surface.
 *
 * If no voice is cloned yet, we route the user straight to /onboarding/voice
 * instead of rendering an empty state — Blueprint §16: the cloned voice is
 * the product's promise; without one this page has nothing to manage.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { bloomVariants, useBreathTimer } from '@vought/motion';

import { VoiceSample } from './_components/VoiceSample';
import { ReRecordButton } from './_components/ReRecordButton';
import { DeleteVoiceDialog } from './_components/DeleteVoiceDialog';

export default function SettingsVoicePage() {
  useBreathTimer();
  const router = useRouter();

  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hackathon scope: read voiceId from localStorage. Production reads from
  // the authenticated user record server-side.
  useEffect(() => {
    setHydrated(true);
    try {
      const stored = window.localStorage.getItem('vought.voiceId');
      setVoiceId(stored);
    } catch {
      setVoiceId(null);
    }
  }, []);

  // If hydration completed and there is still no voice, push to onboarding.
  useEffect(() => {
    if (!hydrated) return;
    if (!voiceId) {
      router.replace('/onboarding/voice');
    }
  }, [hydrated, voiceId, router]);

  const onDeleted = () => {
    setVoiceId(null);
    setConfirmOpen(false);
  };

  if (!hydrated || !voiceId) {
    // Either we are still hydrating or the redirect is in flight. Render
    // nothing to avoid a flash of empty state.
    return null;
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10"
      style={{ color: 'var(--color-text-primary-dark)' }}
    >
      <header className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          ← Settings
        </Link>
        <span
          className="font-mono text-[11px]"
          style={{ color: 'var(--color-text-muted-dark)' }}
        >
          Voice
        </span>
      </header>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={bloomVariants}
        className="flex flex-col gap-8"
      >
        <div>
          <h1
            className="text-display-md font-display"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Your voice
          </h1>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary-dark)' }}
          >
            Vought whispers in this voice during every live call.
          </p>
        </div>

        <VoiceSample voiceId={voiceId} />

        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: 'var(--color-elevated-dark)',
            border: '1px solid var(--color-hairline-dark)',
          }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: 'var(--color-text-secondary-dark)' }}
          >
            Voice ID
          </div>
          <div
            className="mt-1 break-all font-mono text-xs"
            style={{ color: 'var(--color-text-primary-dark)' }}
          >
            {voiceId}
          </div>
        </div>

        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{
            backgroundColor: 'var(--color-surface-dark)',
            border: '1px solid var(--color-hairline-dark)',
            color: 'var(--color-text-secondary-dark)',
          }}
        >
          We send 30 seconds of audio to ElevenLabs to create a private voice
          model. The cloned voice is yours alone. We discard the raw audio
          after processing. Delete the cloned voice at any time from here.
        </div>

        <div className="flex flex-col gap-3">
          <ReRecordButton />
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-quick ease-quick"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(242, 109, 91, 0.32)',
              color: 'var(--color-risk-coral)',
            }}
          >
            Delete voice clone
          </button>
        </div>
      </motion.section>

      <DeleteVoiceDialog
        open={confirmOpen}
        voiceId={voiceId}
        onClose={() => setConfirmOpen(false)}
        onDeleted={onDeleted}
      />
    </main>
  );
}
