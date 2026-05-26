/**
 * useMicCapture — MediaRecorder + Web Audio analyser wrapper.
 *
 * Owns the entire microphone lifecycle for the voice clone capture:
 *   1. getUserMedia → MediaStream
 *   2. MediaRecorder → audio Blob (held in memory, never persisted client-side)
 *   3. AudioContext + AnalyserNode → real-time amplitude samples for the
 *      waveform visualiser at 60fps
 *
 * The hook is intentionally framework-agnostic — it returns plain primitives
 * and an imperative API. The onboarding page composes the UI on top.
 *
 * Privacy contract: the captured audio lives in a closed-over Blob until the
 * caller explicitly invokes `submit()`. `discard()` clears it. Component
 * unmount clears it. There is no event that exfiltrates the buffer.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_MAX_DURATION_MS = 30_000;
const DEFAULT_BAR_COUNT = 32;

type CaptureState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

interface UseMicCaptureArgs {
  /** Hard cap on recording duration. Default 30 s. */
  maxDurationMs?: number;
  /** Number of amplitude bars to expose. Default 32. */
  barCount?: number;
}

interface UseMicCaptureResult {
  state: CaptureState;
  /** 0..maxDurationMs elapsed during the current recording. */
  elapsedMs: number;
  /** Float32 array of normalised amplitudes, one entry per bar. */
  amplitudes: Float32Array;
  /** Peak amplitude across the current frame (0..1). */
  peak: number;
  /** Captured audio blob, available after `stop()`. */
  blob: Blob | null;
  /** Error message if state === 'error'. */
  error: string | null;

  start: () => Promise<void>;
  stop: () => void;
  discard: () => void;
}

/**
 * Pick the first supported MediaRecorder MIME type. WebM/Opus is preferred
 * because every modern browser supports it and ElevenLabs accepts it.
 */
function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return 'audio/webm';
}

export function useMicCapture({
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  barCount = DEFAULT_BAR_COUNT,
}: UseMicCaptureArgs = {}): UseMicCaptureResult {
  const [state, setState] = useState<CaptureState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [amplitudes, setAmplitudes] = useState<Float32Array>(() => new Float32Array(barCount));
  const [peak, setPeak] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  /**
   * Releases the mic, analyser, and rAF. Safe to call multiple times.
   */
  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore — already inactive
      }
    }
    recorderRef.current = null;

    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current = null;

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      void audioCtxRef.current.close();
    }
    audioCtxRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /**
   * Render loop. Samples the analyser at 60fps and exposes downsampled
   * amplitudes for the visualiser. Auto-stops at maxDurationMs.
   */
  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buffer);

    // Downsample to `barCount` bins. Each bin reports the peak absolute
    // deviation from the 128 midline, normalised to 0..1.
    const next = new Float32Array(barCount);
    const stride = Math.max(1, Math.floor(buffer.length / barCount));
    let framePeak = 0;
    for (let i = 0; i < barCount; i++) {
      let binPeak = 0;
      const start = i * stride;
      const end = Math.min(buffer.length, start + stride);
      for (let j = start; j < end; j++) {
        const v = Math.abs(buffer[j] - 128) / 128;
        if (v > binPeak) binPeak = v;
      }
      next[i] = binPeak;
      if (binPeak > framePeak) framePeak = binPeak;
    }
    setAmplitudes(next);
    setPeak(framePeak);

    const elapsed = performance.now() - startTimeRef.current;
    setElapsedMs(Math.min(elapsed, maxDurationMs));

    if (elapsed >= maxDurationMs) {
      // Stop without recursion — call the stable cleanup path.
      const rec = recorderRef.current;
      if (rec && rec.state !== 'inactive') {
        try {
          rec.stop();
        } catch {
          // ignore
        }
      }
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [barCount, maxDurationMs]);

  const start = useCallback(async () => {
    if (state === 'recording' || state === 'requesting') return;
    setError(null);
    setBlob(null);
    setElapsedMs(0);
    setAmplitudes(new Float32Array(barCount));
    setPeak(0);
    chunksRef.current = [];

    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Analyser graph
      const AudioContextCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      sourceRef.current = source;
      analyserRef.current = analyser;

      // Recorder
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: mimeType });
        setBlob(finalBlob);
        setState('stopped');
        // Stop all tracks so the OS recording indicator goes away — we have
        // the audio in memory; the live mic stream is no longer needed.
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
      recorder.onerror = (event) => {
        const err = (event as unknown as { error?: { message?: string } }).error;
        setError(err?.message ?? 'Recorder error');
        setState('error');
      };

      recorder.start(250); // 250 ms timeslice keeps chunks small
      startTimeRef.current = performance.now();
      setState('recording');
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not access microphone';
      setError(message);
      setState('error');
      cleanup();
    }
  }, [barCount, cleanup, state, tick]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === 'recording') {
      try {
        rec.stop();
      } catch {
        // ignore — the onstop handler runs cleanup
      }
    }
  }, []);

  const discard = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    setBlob(null);
    setElapsedMs(0);
    setAmplitudes(new Float32Array(barCount));
    setPeak(0);
    setError(null);
    setState('idle');
  }, [barCount, cleanup]);

  return { state, elapsedMs, amplitudes, peak, blob, error, start, stop, discard };
}
