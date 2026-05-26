/**
 * Scene 10 · Pricing tease
 *
 * Three plan cards. Middle (Teams) is the flagship — same amber
 * border treatment as the Copilot pillar so the visual lineage is
 * obvious.
 */

import Link from 'next/link';
import { Container } from '@vought/ui';

interface PricingTier {
  eyebrow: string;
  title: string;
  price: React.ReactNode;
  description: string;
  cta: { label: string; href: string };
  variant: 'standard' | 'flagship' | 'enterprise';
  delayMs: number;
}

const TIERS: PricingTier[] = [
  {
    eyebrow: 'For individuals',
    title: 'Vought Personal',
    price: (
      <>
        $19<span className="text-base text-white/40">/mo</span>
      </>
    ),
    description: 'All consumer personas · 30 hours / month · Voice clone',
    cta: { label: 'Start trial', href: '/signup' },
    variant: 'standard',
    delayMs: 0,
  },
  {
    eyebrow: 'For revenue teams',
    title: 'Vought for Teams',
    price: (
      <>
        $99<span className="text-base text-white/40">/seat/mo</span>
      </>
    ),
    description:
      'Copilot + Insights · playbook RAG · manager dashboard · integrations',
    cta: { label: 'Book a demo', href: '/demo' },
    variant: 'flagship',
    delayMs: 80,
  },
  {
    eyebrow: '50+ seats',
    title: 'Enterprise',
    price: <>Custom</>,
    description:
      'SOC 2 · SCIM · on-prem LLM · data residency · custom voice workflows',
    cta: { label: 'Talk to sales', href: '/contact' },
    variant: 'enterprise',
    delayMs: 240,
  },
];

export function PricingTease() {
  return (
    <section
      aria-labelledby="pricing-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <div className="label-small mb-5 text-accent-amber">Pricing</div>
          <h2 id="pricing-heading" className="display-xl mb-5 text-white">
            Transparent pricing.<br />No conversation rationing.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <PricingCard key={tier.title} tier={tier} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  const isFlagship = tier.variant === 'flagship';
  return (
    <article
      className={[
        'reveal relative rounded-2xl border p-8',
        isFlagship
          ? 'border-accent-amber/30'
          : 'border-white/[0.08] bg-surface-dark',
      ].join(' ')}
      style={{
        transitionDelay: `${tier.delayMs}ms`,
        ...(isFlagship && {
          background: 'linear-gradient(to bottom, #1F1A0F 0%, #131316 100%)',
        }),
      }}
    >
      {isFlagship && (
        <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-accent-amber px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-marketing-ink">
          Most popular
        </div>
      )}
      <div className="mb-2 text-xs text-white/40">{tier.eyebrow}</div>
      <div className="mb-3 text-xl font-bold text-white">{tier.title}</div>
      <div className="mono mb-2 text-5xl text-white">{tier.price}</div>
      <p className="mb-6 text-sm text-white/50">{tier.description}</p>
      <Link
        href={tier.cta.href}
        className={[
          'pill-cta block rounded-full py-3 text-center text-sm font-bold',
          tier.variant === 'standard' && 'bg-white text-marketing-ink hover:opacity-90',
          tier.variant === 'flagship' && 'bg-accent-amber text-marketing-ink hover:opacity-90',
          tier.variant === 'enterprise' &&
            'border border-white/15 bg-white/5 text-white hover:bg-white/10',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {tier.cta.label}
      </Link>
    </article>
  );
}
