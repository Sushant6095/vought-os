/**
 * DeleteVoiceDialog — destructive action behind a typed confirmation gate.
 *
 * The user must type the word "delete" exactly. We do not show a spinner;
 * the button label changes to "Deleting…" while the request is in flight.
 * On success we call ElevenLabs again to verify the voice 404s, then close
 * the modal and notify the parent.
 *
 * Accessibility:
 *   • role="dialog", aria-modal="true", aria-labelledby
 *   • focus trap is intentional but minimal — the cancel/confirm buttons
 *     are the only interactive elements besides the text input
 *   • Escape closes
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface DeleteVoiceDialogProps {
  open: boolean;
  voiceId: string | null;
  onClose: () => void;
  onDeleted: () => void;
}

const CONFIRM_WORD = 'delete';

export function DeleteVoiceDialog({
  open,
  voiceId,
  onClose,
  onDeleted,
}: DeleteVoiceDialogProps) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTyped('');
      setError(null);
      // Defer to next frame so the dialog mounts first.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const canConfirm = typed.trim().toLowerCase() === CONFIRM_WORD && !busy && Boolean(voiceId);

  const confirm = async () => {
    if (!voiceId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/voice-clone?voiceId=${encodeURIComponent(voiceId)}`,
        { method: 'DELETE' },
      );
      const body = (await res.json().catch(() => ({}))) as {
        deleted?: boolean;
        verified?: boolean;
        error?: string;
      };

      if (!res.ok || !body.deleted) {
        throw new Error(body.error ?? 'Delete failed');
      }
      if (!body.verified) {
        // The DELETE succeeded but verification GET did not 404. Surface
        // the warning but proceed — local state is the user's truth.
        setError('Delete acknowledged but verification pending.');
      }

      try {
        window.localStorage.removeItem('vought.voiceId');
      } catch {
        // ignore
      }
      onDeleted();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-voice-title"
      className="fixed inset-0 z-modal flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-hairline-dark)',
        }}
      >
        <h2
          id="delete-voice-title"
          className="text-display-md font-display"
          style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Delete voice clone
        </h2>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          Your cloned voice will be removed from ElevenLabs. Live calls will
          fall back to a generic voice until you record a new one. This
          cannot be undone.
        </p>

        <label
          htmlFor="delete-confirm"
          className="mt-6 block text-xs"
          style={{ color: 'var(--color-text-secondary-dark)' }}
        >
          Type the word <strong>delete</strong> to confirm.
        </label>
        <input
          ref={inputRef}
          id="delete-confirm"
          type="text"
          value={typed}
          onChange={(event) => setTyped(event.currentTarget.value)}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
          aria-describedby={error ? 'delete-error' : undefined}
          className="mt-2 w-full rounded-md px-3 py-2 font-mono text-sm outline-none transition-colors duration-quick ease-quick"
          style={{
            backgroundColor: 'var(--color-elevated-dark)',
            border: '1px solid var(--color-hairline-dark)',
            color: 'var(--color-text-primary-dark)',
          }}
        />

        {error && (
          <p
            id="delete-error"
            className="mt-3 text-xs"
            style={{ color: 'var(--color-risk-coral) ' }}
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="min-h-[44px] rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-quick ease-quick disabled:opacity-40"
            style={{
              border: '1px solid var(--color-hairline-dark)',
              color: 'var(--color-text-primary-dark)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={!canConfirm}
            className="min-h-[44px] rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-quick ease-quick disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-risk-coral)',
              color: 'var(--color-canvas-dark)',
            }}
          >
            {busy ? 'Deleting…' : 'Delete voice'}
          </button>
        </div>
      </div>
    </div>
  );
}
