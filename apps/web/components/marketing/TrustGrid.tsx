/**
 * Scene 9 · Trust + security
 *
 * Four equal-weight tiles. SOC 2, HIPAA, GDPR, Zero retention.
 * Each tile follows the same internal hierarchy: tiny eyebrow, large
 * proper noun, small note.
 */

import { Container } from '@vought/ui';

interface TrustItem {
  eyebrow: string;
  title: string;
  note: string;
  delayMs: number;
}

const ITEMS: TrustItem[] = [
  {
    eyebrow: 'Certification',
    title: 'SOC 2 Type II',
    note: 'Independent audit · annual',
    delayMs: 0,
  },
  {
    eyebrow: 'Compliance',
    title: 'HIPAA',
    note: 'For healthcare conversations',
    delayMs: 80,
  },
  {
    eyebrow: 'Privacy',
    title: 'GDPR',
    note: 'EU data residency available',
    delayMs: 240,
  },
  {
    eyebrow: 'Default',
    title: 'Zero retention',
    note: 'Audio discarded on session close',
    delayMs: 360,
  },
];

export function TrustGrid() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="border-y border-white/5 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <div className="label-small mb-5 text-accent-amber">
            Trust architecture
          </div>
          <h2 id="trust-heading" className="display-xl mb-5 text-white">
            Built for the conversations<br />that can’t leak.
          </h2>
          <p className="text-lg text-white/60">
            Vought processes ephemerally by default. No audio is stored unless
            you turn it on.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="reveal rounded-xl border border-white/[0.08] bg-surface-dark p-6"
              style={{ transitionDelay: `${item.delayMs}ms` }}
            >
              <div className="label-tiny mb-3 text-white/40">{item.eyebrow}</div>
              <div className="mb-2 text-xl font-bold text-white">{item.title}</div>
              <div className="text-xs text-white/50">{item.note}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
