/**
 * ConsentDisclosure — the privacy contract, displayed before recording.
 *
 * The brand promise is trust. The user must read and accept this before the
 * record button enables. We do not bury it behind a tooltip and we do not
 * pre-check the box.
 */

'use client';

interface ConsentDisclosureProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}

export function ConsentDisclosure({ accepted, onChange }: ConsentDisclosureProps) {
  return (
    <label
      className="flex w-full cursor-pointer items-start gap-3 rounded-xl p-4"
      style={{
        backgroundColor: 'var(--color-elevated-dark)',
        border: '1px solid var(--color-hairline-dark)',
      }}
    >
      <span className="relative mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onChange(event.currentTarget.checked)}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded border outline-none transition-colors duration-quick ease-quick"
          style={{
            borderColor: accepted
              ? 'var(--color-accent-amber)'
              : 'var(--color-hairline-dark)',
            backgroundColor: accepted ? 'var(--color-accent-amber)' : 'transparent',
          }}
          aria-describedby="voice-consent-text"
        />
        {accepted && (
          <svg
            className="pointer-events-none absolute"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 5l2 2 4-4"
              stroke="var(--color-canvas-dark)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span id="voice-consent-text" className="text-sm leading-relaxed">
        <span
          className="block font-semibold"
          style={{ color: 'var(--color-text-primary-dark)' }}
        >
          Your voice is yours.
        </span>
        <span
          className="mt-1 block"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          We send 30 seconds of audio to ElevenLabs to create a private voice
          model. The cloned voice is yours alone. We discard the raw audio
          after processing. Delete the cloned voice at any time from settings.
        </span>
      </span>
    </label>
  );
}
