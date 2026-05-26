/**
 * DealContextPanel · Blueprint §5.4
 *
 * Left rail. Vertical stack of context tiles pulled from CRM at
 * session start. Teams only — Personal hides this rail entirely.
 *
 * Tiles:
 *  - Company (name, employee count, funding stage, industry)
 *  - Last touch (type + timestamp)
 *  - Buying signals (AI-detected patterns)
 *  - Sentiment (directional)
 *
 * Each tile is dismissible. The whole panel collapses with Cmd+. for
 * focus mode (orchestrated by the page).
 */

'use client';

import type { ReactNode } from 'react';

export interface DealContext {
  company?: {
    name: string;
    employees?: number;
    stage?: string;
    industry?: string;
  };
  lastTouch?: {
    kind: string;
    when: string;
  };
  buyingSignals?: Array<{
    id: string;
    label: string;
    direction?: 'up' | 'down' | 'flat';
  }>;
  sentiment?: {
    direction: 'warming' | 'cool' | 'hostile';
    note?: string;
  };
}

interface DealContextPanelProps {
  context: DealContext | null;
  collapsed?: boolean;
}

export function DealContextPanel({ context, collapsed }: DealContextPanelProps) {
  if (collapsed) return null;

  if (!context) {
    return (
      <aside className="w-full" aria-label="Deal context">
        <SectionHeader>Deal Context</SectionHeader>
        <Tile>
          <div className="text-label-sm text-text-muted-dark italic">
            No CRM record linked.
          </div>
        </Tile>
      </aside>
    );
  }

  const sentimentColor =
    context.sentiment?.direction === 'warming'
      ? 'text-live-emerald'
      : context.sentiment?.direction === 'hostile'
        ? 'text-risk-coral'
        : 'text-text-secondary-dark';

  return (
    <aside className="w-full space-y-3" aria-label="Deal context">
      <SectionHeader>Deal Context</SectionHeader>

      {context.company ? (
        <Tile>
          <div className="text-sm font-semibold text-text-primary-dark">
            {context.company.name}
          </div>
          <div className="text-label-sm text-text-muted-dark mt-1 space-x-1.5">
            {context.company.stage ? <span>{context.company.stage}</span> : null}
            {context.company.employees ? (
              <span>· {context.company.employees} employees</span>
            ) : null}
            {context.company.industry ? (
              <span>· {context.company.industry}</span>
            ) : null}
          </div>
        </Tile>
      ) : null}

      {context.lastTouch ? (
        <Tile>
          <Eyebrow>Last touch</Eyebrow>
          <div className="text-xs text-text-primary-dark">
            {context.lastTouch.kind}
            <span className="text-text-muted-dark"> · {context.lastTouch.when}</span>
          </div>
        </Tile>
      ) : null}

      {context.buyingSignals && context.buyingSignals.length > 0 ? (
        <Tile>
          <Eyebrow>Buying signals</Eyebrow>
          <ul className="space-y-1">
            {context.buyingSignals.map((signal) => (
              <li
                key={signal.id}
                className="text-xs text-text-primary-dark flex items-center gap-1.5"
              >
                <span aria-hidden className="text-accent-amber">
                  {signal.direction === 'up' ? '↑' : signal.direction === 'down' ? '↓' : '·'}
                </span>
                <span>{signal.label}</span>
              </li>
            ))}
          </ul>
        </Tile>
      ) : null}

      {context.sentiment ? (
        <Tile>
          <Eyebrow>Sentiment</Eyebrow>
          <div className={`text-xs ${sentimentColor}`}>
            {context.sentiment.direction}
            {context.sentiment.note ? (
              <span className="text-text-muted-dark"> · {context.sentiment.note}</span>
            ) : null}
          </div>
        </Tile>
      ) : null}
    </aside>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="text-label-xs text-text-muted-dark mb-2">
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-label-xs text-text-muted-dark mb-1">
      {children}
    </div>
  );
}

function Tile({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-hairline-dark bg-white/[0.02] p-3">
      {children}
    </div>
  );
}
