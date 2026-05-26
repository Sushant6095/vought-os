/**
 * SpeakerTimeline · Blueprint §5.3.4
 *
 * Horizontal strip showing the last 60 seconds of audio segmented by
 * speaker. Two colors: you (amber-soft) and them (azure-50). Each
 * segment is a soft-edged horizontal bar; the timeline scrolls right
 * as the conversation progresses.
 *
 * This is the visual proof that diarization works.
 *
 * Implementation notes:
 *  - We render as a single row of segments laid out via flex with
 *    `flex-basis` proportional to duration. No layout-bound animation —
 *    new segments fade in via opacity only.
 *  - Width is purely percentage so the panel resizes responsively.
 *  - Tooltip on hover shows duration + speaker label.
 */

'use client';

import { useEffect, useState } from 'react';
import type { SpeakerSegment } from '../_hooks/useRealtimeSession';

interface SpeakerTimelineProps {
  segments: SpeakerSegment[];
  /** Rolling window in ms. Default 60_000. */
  windowMs?: number;
}

const DEFAULT_WINDOW = 60_000;

export function SpeakerTimeline({
  segments,
  windowMs = DEFAULT_WINDOW,
}: SpeakerTimelineProps) {
  // Tick once a second so the gap between the last segment and
  // "now" grows visibly — gives the timeline a live feel even when
  // diart hasn't pushed a label recently.
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const windowStart = now - windowMs;

  // Clip segments to the visible window and discard anything fully
  // outside it.
  const clipped = segments
    .filter((s) => s.tEnd >= windowStart)
    .map((s) => ({
      ...s,
      tStart: Math.max(s.tStart, windowStart),
      tEnd: Math.min(s.tEnd, now),
    }))
    .sort((a, b) => a.tStart - b.tStart);

  if (clipped.length === 0) {
    return (
      <div className="rounded-md border border-hairline-dark bg-white/[0.02] p-3">
        <div className="text-label-xs text-text-muted-dark mb-2">
          Speakers
        </div>
        <div className="h-6 rounded-sm bg-white/[0.02]" aria-hidden />
        <div className="mt-2 text-label-sm text-text-muted-dark">
          Calibrating diarization…
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-md border border-hairline-dark bg-white/[0.02] p-3"
      aria-label="Speaker timeline · last 60 seconds"
      role="img"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-label-xs text-text-muted-dark">
          Speakers
        </div>
        <div className="text-label-xs font-mono text-text-muted-dark flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-accent-amber/70" />
            You
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-info-azure/70" />
            Them
          </span>
        </div>
      </div>

      <div className="relative h-6 flex items-stretch gap-0.5 overflow-hidden rounded-sm">
        {clipped.map((segment) => {
          const widthPct =
            ((segment.tEnd - segment.tStart) / windowMs) * 100;
          if (widthPct <= 0) return null;

          // We carry a small `flex-basis` and rely on `flex-grow: 0` so
          // segments hold their proportional width regardless of total
          // segment count.
          return (
            <div
              key={segment.id}
              title={formatSegmentLabel(segment, now)}
              style={{
                flexBasis: `${widthPct}%`,
                transition:
                  'background-color var(--motion-standard) var(--easing-standard)',
              }}
              className={`flex-grow-0 flex-shrink-0 h-full rounded-sm ${
                segment.isSelf
                  ? 'bg-accent-amber/35 hover:bg-accent-amber/55'
                  : 'bg-info-azure/30 hover:bg-info-azure/50'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function formatSegmentLabel(segment: SpeakerSegment, now: number): string {
  const ageS = Math.round((now - segment.tStart) / 1000);
  const durS = Math.max(1, Math.round((segment.tEnd - segment.tStart) / 1000));
  const who = segment.isSelf ? 'You' : 'Them';
  return `${who} · ${durS}s · ${ageS}s ago`;
}
