/**
 * CountdownTimer — 30 → 0 elapsed-time readout + progress bar.
 *
 * Display: `· 00:18 / 00:30` with amber dot prefix and mono digits — the
 * brand call-sign. The progress bar fills amber from 0 → 100% as the
 * recording elapses. The fill animates transform: scaleX, never width.
 */

'use client';

interface CountdownTimerProps {
  elapsedMs: number;
  totalMs: number;
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const ss = (total % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CountdownTimer({ elapsedMs, totalMs }: CountdownTimerProps) {
  const ratio = Math.min(1, Math.max(0, elapsedMs / totalMs));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="inline-flex items-center gap-2 font-mono"
        style={{ fontSize: '13px', color: 'var(--color-text-secondary-dark)' }}
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: 'var(--color-accent-amber)' }}
        />
        <span>{format(elapsedMs)}</span>
        <span style={{ color: 'var(--color-text-muted-dark)' }}>/</span>
        <span style={{ color: 'var(--color-text-muted-dark)' }}>{format(totalMs)}</span>
      </div>

      <div
        role="progressbar"
        aria-label="Recording progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalMs / 1000)}
        aria-valuenow={Math.round(elapsedMs / 1000)}
        className="relative h-1 w-48 overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--color-hairline-dark)' }}
      >
        <span
          className="absolute inset-y-0 left-0 right-0 origin-left rounded-full"
          style={{
            backgroundColor: 'var(--color-accent-amber)',
            transform: `scaleX(${ratio})`,
            transition: 'transform var(--motion-instant) linear',
          }}
        />
      </div>
    </div>
  );
}
