/**
 * VoiceSample — play a short sample in the user's cloned voice.
 *
 * Used on the settings page so the user can verify "still me" before they
 * decide to re-record or delete. Uses the /api/voice-clone/sample TTS
 * proxy so the page never holds an audio file — it streams.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface VoiceSampleProps {
  voiceId: string | null;
  text?: string;
}

const DEFAULT_TEXT = 'Hi, this is your voice. Vought whispers as me.';

export function VoiceSample({ voiceId, text = DEFAULT_TEXT }: VoiceSampleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = async () => {
    if (!voiceId) return;
    setError(null);
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }

    try {
      audio.src = `/api/voice-clone/sample?voiceId=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(text)}`;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        setError('Could not play sample');
      };
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError('Could not play sample');
    }
  };

  if (!voiceId) {
    return (
      <p
        className="text-sm"
        style={{ color: 'var(--color-text-secondary-dark)' }}
      >
        No voice cloned yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-3 rounded-xl p-4"
        style={{
          backgroundColor: 'var(--color-elevated-dark)',
          border: '1px solid var(--color-hairline-dark)',
        }}
      >
        <button
          type="button"
          onClick={() => void toggle()}
          aria-label={playing ? 'Stop sample' : 'Play sample'}
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full transition-colors duration-quick ease-quick"
          style={{
            backgroundColor: 'var(--color-accent-amber)',
            color: 'var(--color-canvas-dark)',
          }}
        >
          <span aria-hidden="true">{playing ? '◼' : '▶'}</span>
        </button>
        <div className="min-w-0">
          <div
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary-dark)' }}
          >
            Your cloned voice
          </div>
          <div
            className="truncate text-xs"
            style={{ color: 'var(--color-text-muted-dark)' }}
          >
            {text}
          </div>
        </div>
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--color-risk-coral)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
