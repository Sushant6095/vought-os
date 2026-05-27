/**
 * Scene 4 · Three pillars
 *
 * Receptionist (dark surface), Copilot (amber-edged · flagship),
 * Insights (dark surface). Copilot is the middle card and is
 * deliberately differentiated through border + flagship tag.
 */

import Link from 'next/link';
import { Container } from '@vought/ui';
import { ArrowRight, Check, User, Headphones, ChartBars } from '@/components/ui/Icon';
import type { ReactNode } from 'react';

interface Pillar {
  title: string;
  description: string;
  bullets: string[];
  cta: { label: string; href: string };
  /** Visual variant; "flagship" is the amber Copilot card. */
  variant: 'standard' | 'flagship';
  icon: ReactNode;
  /** Transition delay in ms — staggers the reveal across the row. */
  delayMs: number;
}

const PILLARS: Pillar[] = [
  {
    title: 'Vought Receptionist',
    description:
      'Cut costs, not quality, with autonomous AI agents handling inbound calls 24/7. Books appointments, qualifies leads, escalates urgents.',
    bullets: [
      'Always on, never sleeps',
      'Calendar + CRM native',
      'Sub-second latency',
    ],
    cta: { label: 'Explore Receptionist', href: '/receptionist' },
    variant: 'standard',
    icon: <User size={20} className="text-white" />,
    delayMs: 0,
  },
  {
    title: 'Vought Copilot',
    description:
      'Real-time whisper coaching for every operator, in their own cloned voice. Acknowledge → reframe → ask. The Cyrano of revenue.',
    bullets: [
      'Whispers in your own voice',
      'Playbook-aware RAG',
      'AirPods or desktop',
    ],
    cta: { label: 'Explore Copilot', href: '/copilot' },
    variant: 'flagship',
    icon: <Headphones size={20} className="text-marketing-ink" />,
    delayMs: 80,
  },
  {
    title: 'Vought Insights',
    description:
      'Discover and act on the true drivers of exceptional revenue. Every objection, every deal, every coaching opportunity surfaced.',
    bullets: [
      'Auto-summaries per call',
      'Natural-language AI Analyst™',
      'Manager coaching workflows',
    ],
    cta: { label: 'Explore Insights', href: '/insights' },
    variant: 'standard',
    icon: <ChartBars size={20} className="text-white" />,
    delayMs: 240,
  },
];

export function PillarCards() {
  return (
    <section
      aria-label="Product pillars"
      className="mb-24 px-6 py-12"
    >
      <Container width="marketing" padX={0}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <PillarCard key={pillar.title} pillar={pillar} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const isFlagship = pillar.variant === 'flagship';
  return (
    <article
      className={[
        'reveal group relative overflow-hidden rounded-2xl border p-8 transition-colors duration-quick ease-quick',
        isFlagship
          ? 'border-accent-amber/30 hover:border-accent-amber/60'
          : 'border-white/[0.08] bg-surface-dark hover:border-white/20',
      ].join(' ')}
      style={{
        transitionDelay: `${pillar.delayMs}ms`,
        ...(isFlagship && {
          background:
            'linear-gradient(to bottom, #0c1230 0%, #131316 100%)',
        }),
      }}
    >
      {isFlagship && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent-amber px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-marketing-ink">
          Flagship
        </div>
      )}
      <div
        className={[
          'mb-6 flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-quick ease-quick',
          isFlagship
            ? 'bg-accent-amber'
            : 'bg-white/5 group-hover:bg-info-azure/20',
        ].join(' ')}
      >
        {pillar.icon}
      </div>
      <h3 className="mb-3 text-2xl font-bold text-white">{pillar.title}</h3>
      <p
        className={[
          'mb-7 text-sm leading-relaxed',
          isFlagship ? 'text-white/70' : 'text-white/60',
        ].join(' ')}
      >
        {pillar.description}
      </p>
      <ul
        className={[
          'mb-8 space-y-2 text-sm',
          isFlagship ? 'text-white/80' : 'text-white/70',
        ].join(' ')}
      >
        {pillar.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <Check size={14} className="mt-0.5 flex-none text-accent-amber" />
            {bullet}
          </li>
        ))}
      </ul>
      <Link
        href={pillar.cta.href}
        className={[
          'inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-quick ease-quick group-hover:gap-2.5',
          isFlagship ? 'text-accent-amber' : 'text-white',
        ].join(' ')}
      >
        {pillar.cta.label}
        <ArrowRight size={14} />
      </Link>
    </article>
  );
}
