/**
 * /customers/[slug] · long-form case study. Renders for the known customer
 * slugs linked from the customers grid; notFound() for anything else.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type CaseStudy = {
  name: string;
  industry: string;
  headline: string;
  metric: string;
  metricLabel: string;
  quote: string;
  author: string;
  role: string;
  stats: { value: string; label: string }[];
  body: string[];
};

const CASES: Record<string, CaseStudy> = {
  triplebyte: {
    name: '{tripleByte}',
    industry: 'Technical recruiting',
    headline: 'Whispers that close the technical sell',
    metric: '$1.4M',
    metricLabel: 'incremental pipeline in one quarter',
    quote: 'Reps used to freeze on the deep technical objection. Now the right line lands in their ear before the pause gets awkward — in their own voice.',
    author: 'Dana Okafor',
    role: 'VP Revenue, {tripleByte}',
    stats: [
      { value: '3×', label: 'suggestion acceptance' },
      { value: '12 days', label: 'to first ROI' },
      { value: '412ms', label: 'median whisper latency' },
    ],
    body: [
      '{tripleByte} sells a technical product to technical buyers, and the moment a prospect raised a deep integration objection, even strong reps would stall. The cost of that half-second of hesitation compounded across every deal.',
      'Vought sits on the live call, separates the rep from the prospect, and whispers the next line the instant the objection lands — sourced from the team’s own playbook, rendered in the rep’s cloned voice. The rep hears themselves, calmer, and says it.',
      'Within a quarter, suggestion acceptance tripled and the team attributed $1.4M of incremental pipeline to coached calls.',
    ],
  },
  acme: {
    name: 'acme/',
    industry: 'B2B SaaS',
    headline: 'Onboarding every new rep to top-closer instincts',
    metric: '+38%',
    metricLabel: 'ramp-quarter quota attainment',
    quote: 'New reps sound like our best reps on day one, because the playbook is whispered to them live instead of buried in a wiki.',
    author: 'Marco Reyes',
    role: 'Head of Sales Enablement, acme/',
    stats: [
      { value: '+38%', label: 'new-rep attainment' },
      { value: '−40%', label: 'ramp time' },
      { value: '73%', label: 'whispers accepted' },
    ],
    body: [
      'acme/ was scaling its sales team faster than it could train it. The playbook existed — in a wiki nobody opened mid-call.',
      'Vought turned that playbook into live whispers. New reps now get the proven line at the proven moment, and ramp-quarter attainment rose 38%.',
    ],
  },
  parallel: {
    name: 'PARALLEL',
    industry: 'Financial services',
    headline: 'Compliance lines, never missed',
    metric: '100%',
    metricLabel: 'required-disclosure adherence',
    quote: 'The required disclosures are whispered at exactly the right beat. Our reps stay human and our auditors stay happy.',
    author: 'Priya Nair',
    role: 'Director of Compliance, PARALLEL',
    stats: [
      { value: '100%', label: 'disclosure adherence' },
      { value: '0', label: 'audio retained' },
      { value: '· 412ms', label: 'whisper latency' },
    ],
    body: [
      'In regulated sales, a missed disclosure is a real liability. PARALLEL needed every required line said, every call, without making reps sound like robots.',
      'Vought enforces the script through whispers, not scolding — the disclosure arrives in the rep’s ear at the right moment, and Vought never overlaps the customer’s voice.',
    ],
  },
  cobalt: {
    name: 'Cobalt.',
    industry: 'Customer support',
    headline: 'De-escalation, in real time',
    metric: '+18',
    metricLabel: 'CSAT point lift on hard calls',
    quote: 'On the calls that used to spiral, Vought whispers the acknowledgement first. Agents recover the conversation instead of losing it.',
    author: 'Jordan Wells',
    role: 'VP Customer Experience, Cobalt.',
    stats: [
      { value: '+18', label: 'CSAT points' },
      { value: '−27%', label: 'escalations' },
      { value: '3×', label: 'acceptance' },
    ],
    body: [
      'Cobalt.’s hardest support calls turned on the first ten seconds. Agents who led with a fix instead of an acknowledgement lost the room.',
      'Vought now whispers the de-escalation move — acknowledge, then pivot — and the spiral calls recover. CSAT on those calls rose 18 points.',
    ],
  },
  northwind: {
    name: '▲ Northwind',
    industry: 'Real estate',
    headline: 'Every inbound lead, answered live',
    metric: '11 min',
    metricLabel: 'saved per qualifying call',
    quote: 'Agents get the buying-signal nudge and the next question without breaking eye contact with the client.',
    author: 'Sam Doyle',
    role: 'Managing Broker, Northwind',
    stats: [
      { value: '11 min', label: 'saved per call' },
      { value: '+22%', label: 'qualified leads' },
      { value: '73%', label: 'acceptance' },
    ],
    body: [
      'Northwind’s agents juggle context across dozens of listings. The right follow-up question is the difference between a tour and a dead lead.',
      'Vought surfaces the buying signal and the next question live, so agents stay present with the client and still ask the thing that moves the deal.',
    ],
  },
  runway: {
    name: 'runway',
    industry: 'Growth startup',
    headline: 'A whole sales motion, in one earbud',
    metric: '2.4×',
    metricLabel: 'demo-to-close conversion',
    quote: 'We don’t have a sales-enablement team. Vought is it — the playbook, live, in everyone’s ear.',
    author: 'Lena Park',
    role: 'Co-founder, runway',
    stats: [
      { value: '2.4×', label: 'demo→close' },
      { value: '$19/mo', label: 'per rep' },
      { value: '· 412ms', label: 'latency' },
    ],
    body: [
      'runway is small and fast and had no time to build sales training. Founders were closing on instinct and hoping reps would absorb it.',
      'Vought encodes that instinct into live whispers, so the whole team closes like the founders — and demo-to-close conversion went 2.4×.',
    ],
  },
  'lakeshore-dental': {
    name: 'Lakeshore Dental',
    industry: 'Dental · Receptionist',
    headline: 'Answering every call, even at 2am',
    metric: '+31%',
    metricLabel: 'booked appointments from inbound',
    quote: 'Vought Receptionist books the appointment, answers the FAQ, and never sends a caller to voicemail. It paid for itself in a week.',
    author: 'Dr. Camila Mendez',
    role: 'Owner, Lakeshore Dental',
    stats: [
      { value: '+31%', label: 'bookings' },
      { value: '0', label: 'missed calls' },
      { value: '$0.20/min', label: 'cost' },
    ],
    body: [
      'Lakeshore Dental lost patients to voicemail every time the front desk was busy or closed. Each missed call was a missed appointment.',
      'Vought Receptionist now answers every inbound call autonomously — greets, qualifies, and books straight into the calendar — and booked appointments rose 31%.',
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(CASES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) return { title: 'Customer story · Vought' };
  return {
    title: `${c.name} · ${c.headline} · Vought`,
    description: c.quote,
    alternates: { canonical: `https://vought.com/customers/${slug}` },
    openGraph: {
      title: `${c.name} · ${c.headline}`,
      description: c.quote,
      url: `https://vought.com/customers/${slug}`,
      type: 'article',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.name} · ${c.headline}`,
      description: c.quote,
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${c.name} · ${c.headline}`,
    description: c.quote,
    url: `https://vought.com/customers/${slug}`,
    author: { '@type': 'Person', name: c.author, jobTitle: c.role },
    publisher: { '@type': 'Organization', name: 'Vought', url: 'https://vought.com' },
  };

  return (
    <div className="text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <section className="px-6 pt-44 pb-16">
        <div className="mx-auto max-w-[860px]">
          <Link href="/customers" className="ob-eyebrow mb-8 inline-flex items-center gap-2 text-white/40 transition-colors hover:text-white">
            ← All customers
          </Link>
          <p className="ob-eyebrow mb-4">{c.industry}</p>
          <div className="mb-6 text-2xl font-semibold text-white/70">{c.name}</div>
          <h1 className="ob-serif ob-h2 mb-8 text-white">{c.headline}</h1>
          <div className="mb-10 flex items-baseline gap-4">
            <span className="ob-serif text-[64px] leading-none ob-accent">{c.metric}</span>
            <span className="max-w-[16ch] text-white/55">{c.metricLabel}</span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[860px]">
          <div className="ob-card grid gap-px overflow-hidden p-0 sm:grid-cols-3" style={{ background: 'var(--ob-line)' }}>
            {c.stats.map((s) => (
              <div key={s.label} className="bg-[#0c0e14] p-6 text-center">
                <div className="ob-serif text-[40px] leading-none text-white">{s.value}</div>
                <div className="mt-2 text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[860px]">
          <blockquote className="ob-serif border-l-2 pl-6 text-[28px] font-light italic leading-snug text-white" style={{ borderColor: 'var(--ob-blue)' }}>
            “{c.quote}”
          </blockquote>
          <div className="mt-4 pl-6 text-sm text-white/55">
            <span className="font-semibold text-white">{c.author}</span> · {c.role}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px] space-y-5">
          {c.body.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-white/65">{p}</p>
          ))}
        </div>
      </section>

      <section className="ob-hero-bg px-6 py-24 text-center">
        <h2 className="ob-serif ob-h3 mx-auto max-w-[18ch] text-white">
          See it in your own <span className="ob-accent italic">voice</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/demo" className="ob-btn-lime px-8 py-4 text-[15px]">Get a demo</Link>
          <Link href="/customers" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">More stories</Link>
        </div>
      </section>
    </div>
  );
}
