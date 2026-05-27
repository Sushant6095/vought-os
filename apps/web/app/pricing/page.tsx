/**
 * /pricing · Observe-style direction.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return {
    title: 'Pricing · Transparent, no conversation rationing',
    description:
      'Vought Personal at $19/mo, Teams at $99/seat/mo, Enterprise custom, and Receptionist at $0.20/min. Voice cloning included on every plan.',
    alternates: { canonical: 'https://vought.com/pricing' },
    openGraph: {
      title: 'Vought Pricing · Transparent, no conversation rationing',
      description: 'Personal $19 · Teams $99/seat · Enterprise custom · Receptionist $0.20/min. Voice cloning included.',
      url: 'https://vought.com/pricing',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought Pricing · Transparent, no conversation rationing',
      description: 'Personal $19 · Teams $99/seat · Enterprise custom · Receptionist $0.20/min. Voice cloning included.',
    },
  };
}

const TIERS = [
  {
    name: 'Personal',
    price: '$19',
    unit: '/month',
    blurb: 'For the conversations that matter most.',
    cta: 'Start trial',
    href: '/contact',
    features: ['Voice clone included', '30 hours of live whisper / mo', 'Personal personas', 'Zero-retention by default'],
    featured: false,
  },
  {
    name: 'Teams',
    price: '$99',
    unit: '/seat/month',
    blurb: 'Whisper coaching + insights for revenue teams.',
    cta: 'Book a demo',
    href: '/contact',
    features: ['Everything in Personal', 'Playbook RAG + manager dashboard', 'Deal context from your CRM', 'Source-attributed suggestions', 'Integrations: Salesforce, Slack, Zoom'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: '',
    blurb: 'For 50+ seats with security review.',
    cta: 'Talk to sales',
    href: '/contact',
    features: ['Everything in Teams', 'SSO / SCIM', 'On-prem or regional LLM', 'Data residency: US / EU / India', 'SOC 2 + dedicated support'],
    featured: false,
  },
];

const COMPARE = [
  ['Voice clone', true, true, true],
  ['Live whisper coaching', true, true, true],
  ['Playbook RAG', false, true, true],
  ['Manager dashboard', false, true, true],
  ['CRM deal context', false, true, true],
  ['Source attribution', false, true, true],
  ['SSO / SCIM', false, false, true],
  ['On-prem LLM', false, false, true],
  ['Data residency controls', false, false, true],
] as const;

const FAQ = [
  ['Can I switch tiers anytime?', 'Yes — upgrade or downgrade instantly. Changes are prorated to the day.'],
  ['Do you charge extra for the voice clone?', 'No. Voice cloning is included on every plan, including Personal.'],
  ['How does Receptionist billing work?', 'Usage-based: $0.20 per minute of handled call time, with a $99/mo minimum.'],
  ['Can I export my data?', 'Always. Transcripts, analytics, and recordings (if you enabled retention) export on demand.'],
  ['Is there a free trial?', 'Personal includes a trial. Teams is sold via a 20-minute demo where we clone your voice live.'],
  ['What happens if I exceed my hours?', 'Personal whisper hours soft-cap and prompt an upgrade — we never cut a live call mid-sentence.'],
  ['Do you offer education discounts?', 'Yes, for accredited institutions. Reach out via the contact page.'],
  ['What is the contract length?', 'Personal is monthly. Teams is annual or monthly. Enterprise is negotiated per MSA.'],
];

const PRICING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function PricingPage() {
  return (
    <div className="bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_SCHEMA) }}
      />
      {/* Hero */}
      <section className="ob-hero-bg px-6 pb-16 pt-44 text-center">
        <p className="ob-eyebrow mb-6">Pricing</p>
        <h1 className="ob-serif ob-h1 mx-auto max-w-[16ch] text-white">
          Transparent pricing. No conversation <span className="ob-accent italic">rationing</span>.
        </h1>
      </section>

      {/* Tiers */}
      <section className="px-6 pb-12">
        <div className="mx-auto grid max-w-[1100px] gap-4 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`ob-card relative flex flex-col p-8 ${t.featured ? '' : 'ob-card-hover'}`}
              style={t.featured ? { borderColor: 'var(--ob-lime)' } : undefined}
            >
              {t.featured && (
                <span className="absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-black" style={{ background: 'var(--ob-lime)' }}>
                  MOST POPULAR
                </span>
              )}
              <h3 className="ob-serif text-[28px] text-white">{t.name}</h3>
              <p className="mt-1 text-sm text-white/50">{t.blurb}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="ob-serif text-[52px] leading-none text-white">{t.price}</span>
                <span className="text-sm text-white/45">{t.unit}</span>
              </div>
              <Link
                href={t.href}
                className={`mt-6 w-full rounded-full px-6 py-3.5 text-center text-[15px] font-semibold ${t.featured ? 'ob-btn-lime' : 'ob-btn-ghost'}`}
              >
                {t.cta}
              </Link>
              <ul className="mt-7 space-y-3 border-t border-white/8 pt-6">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-white/60">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Receptionist */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="ob-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
            <div>
              <p className="ob-eyebrow mb-2">Vought Receptionist</p>
              <h3 className="ob-serif text-[26px] text-white">Pay for the calls it handles</h3>
              <p className="mt-2 max-w-md text-white/55">Autonomous inbound call handling, billed by the minute. No per-seat fee.</p>
            </div>
            <div className="text-right">
              <div className="ob-serif text-[44px] leading-none text-white">
                $0.20<span className="text-lg text-white/45"> / min</span>
              </div>
              <p className="mt-1 text-sm text-white/45">$99 / mo minimum</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="ob-serif ob-h3 mb-8 text-white">Compare every plan</h2>
          <div className="ob-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-white/50">
                  <th className="p-4 font-medium">Feature</th>
                  <th className="p-4 text-center font-medium">Personal</th>
                  <th className="p-4 text-center font-medium ob-accent">Teams</th>
                  <th className="p-4 text-center font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row[0] as string} className={i % 2 ? 'bg-white/[0.015]' : ''}>
                    <td className="p-4 text-white/70">{row[0]}</td>
                    {[row[1], row[2], row[3]].map((v, j) => (
                      <td key={j} className="p-4 text-center">
                        {v ? <span className="inline-flex"><Check /></span> : <span className="text-white/20">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[820px]">
          <h2 className="ob-serif ob-h2 mb-10 text-white">Questions</h2>
          <div className="divide-y divide-white/8">
            {FAQ.map(([q, a]) => (
              <div key={q} className="py-6">
                <h3 className="mb-2 text-lg font-semibold text-white">{q}</h3>
                <p className="leading-relaxed text-white/55">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ob-hero-bg px-6 py-24 text-center">
        <h2 className="ob-serif ob-h2 mx-auto max-w-[16ch] text-white">
          See Vought in your own <span className="ob-accent italic">voice</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-white/55">
          20-minute demo. We&rsquo;ll clone your voice on the call and coach you live.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="ob-btn-lime px-8 py-4 text-[15px]">Book a demo</Link>
          <Link href="/contact" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">Talk to sales</Link>
        </div>
      </section>
    </div>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-0.5 shrink-0">
      <path d="M3 8.5l3 3 7-7" stroke="var(--ob-lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
