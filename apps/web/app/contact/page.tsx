/**
 * /contact · marketing
 *
 * Per VOUGHT-DESIGN-BLUEPRINT.md §11 — deliberately short. Three options,
 * three cards, ~600vh of total height. Not a long form.
 *
 * Reuse: hero pattern + reveal motion + three-card grid from PillarCards
 * (Copilot card variant used for the primary "Book a demo" option). The
 * shared NavPill + Footer are already mounted in the root layout.
 *
 * Brand voice rules:
 *   - Declarative sentences. No hedging.
 *   - Numbers in mono — but this page intentionally has none; the
 *     specificity comes from the 24-hour response promise instead.
 *   - Single accent (amber) reserved for the primary CTA card border
 *     and the demo pill.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Stack } from '@vought/ui';
import { ArrowRight, Check } from '@/components/ui/Icon';

export function generateMetadata(): Metadata {
  return {
    title: 'Contact · Vought',
    description:
      'Three ways to reach Vought. Book a 20-minute demo, email sales, or email support. We respond to every email within 24 hours.',
    alternates: { canonical: 'https://vought.com/contact' },
    openGraph: {
      title: 'Contact Vought',
      description:
        'Book a 20-minute demo, email sales, or email support. 24-hour response promise.',
      url: 'https://vought.com/contact',
      type: 'website',
    },
  };
}

interface ContactCard {
  variant: 'flagship' | 'standard';
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  cta: { label: string; href: string };
  delayMs: number;
}

const CARDS: ContactCard[] = [
  {
    variant: 'flagship',
    eyebrow: 'Demo',
    title: 'Book a demo',
    description:
      "20 minutes. We'll clone your voice on the call and coach you live.",
    bullets: [
      'Live voice clone in 90 seconds',
      'Whisper coaching on your own pitch',
      'You leave with a working prototype',
    ],
    cta: { label: 'Book a demo', href: '/demo' },
    delayMs: 0,
  },
  {
    variant: 'standard',
    eyebrow: 'Sales',
    title: 'Email sales',
    description: 'For pricing, procurement, MSAs.',
    bullets: [
      'Volume + seat pricing',
      'Security questionnaires',
      'Custom MSA + DPA',
    ],
    cta: { label: 'sales@vought.com', href: 'mailto:sales@vought.com' },
    delayMs: 80,
  },
  {
    variant: 'standard',
    eyebrow: 'Support',
    title: 'Email support',
    description: 'For customers. 24-hour response promise.',
    bullets: [
      'Incident response',
      'Voice + integration help',
      'Account changes',
    ],
    cta: { label: 'support@vought.com', href: 'mailto:support@vought.com' },
    delayMs: 240,
  },
];

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactCards />
      <OfficeBlock />
      <SecurityNote />
    </>
  );
}

function ContactHero() {
  return (
    <section
      aria-labelledby="contact-heading"
      className="relative px-6 pb-20 pt-44"
    >
      <Container width="marketing" padX={0}>
        <Stack gap={0}>
          <div className="reveal label-small mb-5 text-accent-amber">
            Contact
          </div>
          <h1
            id="contact-heading"
            className="reveal display-3xl max-w-3xl text-white"
            style={{ transitionDelay: '80ms' }}
          >
            How can we help?
          </h1>
        </Stack>
      </Container>
    </section>
  );
}

function ContactCards() {
  return (
    <section aria-label="Contact options" className="px-6 pb-20">
      <Container width="marketing" padX={0}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CARDS.map((card) => (
            <ContactOptionCard key={card.title} card={card} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ContactOptionCard({ card }: { card: ContactCard }) {
  const isFlagship = card.variant === 'flagship';
  return (
    <article
      className={[
        'reveal group relative flex flex-col overflow-hidden rounded-2xl border p-8 transition-colors duration-quick ease-quick',
        isFlagship
          ? 'border-accent-amber/30 hover:border-accent-amber/60'
          : 'border-white/[0.08] bg-surface-dark hover:border-white/20',
      ].join(' ')}
      style={{
        transitionDelay: `${card.delayMs}ms`,
        ...(isFlagship && {
          background:
            'linear-gradient(to bottom, #1F1A0F 0%, #131316 100%)',
        }),
      }}
    >
      {isFlagship && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent-amber px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-marketing-ink">
          Primary
        </div>
      )}

      <div className="label-tiny mb-5 text-white/30">{card.eyebrow}</div>

      <h2 className="mb-3 text-2xl font-bold text-white">{card.title}</h2>
      <p
        className={[
          'mb-7 text-sm leading-relaxed',
          isFlagship ? 'text-white/70' : 'text-white/60',
        ].join(' ')}
      >
        {card.description}
      </p>

      <ul
        className={[
          'mb-10 space-y-2 text-sm',
          isFlagship ? 'text-white/80' : 'text-white/70',
        ].join(' ')}
      >
        {card.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <Check size={14} className="mt-0.5 flex-none text-accent-amber" />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isFlagship ? (
          <Link
            href={card.cta.href}
            className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-6 py-3 text-sm font-bold text-marketing-ink hover:opacity-90"
          >
            {card.cta.label}
            <ArrowRight size={14} className="text-marketing-ink" />
          </Link>
        ) : (
          <Link
            href={card.cta.href}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white transition-all duration-quick ease-quick group-hover:gap-2.5"
          >
            {card.cta.label}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}

function OfficeBlock() {
  return (
    <section aria-label="Office and response promise" className="px-6 pb-20">
      <Container width="marketing" padX={0}>
        <div className="grid grid-cols-1 gap-12 border-t border-white/5 pt-16 md:grid-cols-12">
          <div className="reveal md:col-span-5">
            <div className="label-tiny mb-4 text-white/30">San Francisco</div>
            <address className="not-italic text-sm leading-relaxed text-white/70">
              Vought Inc.<br />
              548 Market Street, Suite 32619<br />
              San Francisco, CA 94104<br />
              United States
            </address>
          </div>
          <div
            className="reveal md:col-span-7"
            style={{ transitionDelay: '80ms' }}
          >
            <p className="max-w-xl text-lg leading-relaxed text-white/70">
              We respond to every email within 24 hours. We do not auto-reply
              with chatbots.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SecurityNote() {
  return (
    <section aria-label="Security disclosures" className="px-6 pb-32">
      <Container width="marketing" padX={0}>
        <div className="reveal border-t border-white/5 pt-8 text-xs text-white/40">
          For security disclosures, see{' '}
          <Link
            href="/security"
            className="text-white/70 transition-colors duration-quick ease-quick hover:text-white"
          >
            /security
          </Link>
          .
        </div>
      </Container>
    </section>
  );
}
