/**
 * apps/web · /security
 *
 * Buyer's confidence builder. Long-form, calmly written.
 *
 * Built per VOUGHT-DESIGN-BLUEPRINT.md §11 (Security page detail) and §4.1
 * (/security route spec). Layout follows the landing's cinematic dark
 * surface, with longer paragraphs and denser tables — the page is read by
 * legal and security teams, not skimmed.
 *
 * Section order:
 *   1. Hero
 *   2. Executive statement (founder-signed, ~200 words)
 *   3. Certifications grid (SOC 2 Type II, HIPAA, GDPR, ISO 27001 — honest status)
 *   4. Architecture data flow with retention annotations
 *   5. Sub-processor table
 *   6. Data residency (US / EU / India)
 *   7. Public contacts (security email · bug bounty · trust center)
 *   8. CTA strip (security-specific, not the landing's)
 *
 * Reuses primitives (Container, Grid, GridItem), icons, and the marketing
 * `.reveal` / `.bloom` / mono / orb classes shipped with the landing.
 * No new components in components/marketing/ — this is a single-route page
 * with section-specific markup unique to /security.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Grid, GridItem } from '@vought/ui';
import {
  ArrowRight,
  Check,
  Mic,
  Waves,
  Brain,
  Doc,
  Bars,
} from '@/components/ui/Icon';

export function generateMetadata(): Metadata {
  return {
    title: 'Security · Built for the conversations that can’t leak.',
    description:
      'Vought is ephemeral by default. Nothing is stored unless you opt in. Read our data handling philosophy, sub-processors, data residency options, and certification status.',
    alternates: { canonical: 'https://vought.com/security' },
    openGraph: {
      title: 'Security · Built for the conversations that can’t leak.',
      description:
        'Ephemeral by default. Sub-processor list, data residency in US, EU, and India, founder-signed data handling statement.',
      url: 'https://vought.com/security',
      type: 'website',
    },
  };
}

// ---------------------------------------------------------------------------
// 1. Hero
// ---------------------------------------------------------------------------

function SecurityHero() {
  return (
    <section
      aria-labelledby="security-hero-heading"
      className="relative px-6 pb-24 pt-40"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          Trust architecture
        </div>
        <h1
          id="security-hero-heading"
          className="reveal display-3xl mb-7 max-w-4xl text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Built for the conversations<br />that can’t leak.
        </h1>
        <p
          className="reveal max-w-2xl text-xl leading-relaxed text-white/60"
          style={{ transitionDelay: '240ms' }}
        >
          Vought processes audio ephemerally by default. Nothing is stored
          unless you turn it on. Our security model is built for revenue
          teams, healthcare operators, and legal reviewers who treat every
          conversation as privileged.
        </p>

        <div
          className="reveal mt-16 flex flex-wrap items-center gap-10 text-xs text-white/40"
          style={{ transitionDelay: '360ms' }}
        >
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <span className="mono">0</span>
            </div>
            <div>seconds of audio retained by default</div>
          </div>
          <div aria-hidden className="h-12 w-px bg-white/10" />
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <span className="mono">3</span>
            </div>
            <div>data residency regions</div>
          </div>
          <div aria-hidden className="h-12 w-px bg-white/10" />
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <span className="mono">5</span>
            </div>
            <div>named sub-processors</div>
          </div>
          <div aria-hidden className="h-12 w-px bg-white/10" />
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <span className="mono">412</span>
              <span className="text-base text-white/60">ms</span>
            </div>
            <div>median whisper latency</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Executive statement (founder-signed)
// ---------------------------------------------------------------------------

function ExecutiveStatement() {
  return (
    <section
      aria-labelledby="executive-heading"
      className="border-t border-white/5 px-6 py-32"
    >
      <Container width="narrow" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          A note from the founder
        </div>
        <h2
          id="executive-heading"
          className="reveal display-xl mb-10 text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Our position on your data.
        </h2>

        <div
          className="reveal space-y-6 text-lg leading-relaxed text-white/70"
          style={{ transitionDelay: '240ms' }}
        >
          <p>
            Vought is a real-time system. It listens to your live audio for
            the length of a conversation and forgets it as soon as that
            conversation ends. This is not a feature flag. It is the default.
          </p>
          <p>
            Audio leaves the operator’s device, transits a TLS 1.3 tunnel
            to ElevenLabs for transcription, and arrives at our Echo Engine
            already as text. The Echo Engine holds the live session in memory
            for the duration of the call and discards it at session close.
            We never write raw audio to disk. We never train models on
            customer conversations. We never share, sell, or surface a
            recording outside the account that produced it.
          </p>
          <p>
            If you opt in to call recordings or transcripts — for
            coaching, compliance, or analytics — we store only what you
            asked us to store, in the region you asked us to store it, and
            we delete it on the schedule you set. You can turn it off in one
            click. We will not warn you, persuade you, or ask why.
          </p>
          <p>
            This is the only model that makes a whisper system honest.
          </p>
        </div>

        <div
          className="reveal mt-10 flex items-center gap-4"
          style={{ transitionDelay: '360ms' }}
        >
          <div className="h-10 w-10 rounded-full bg-white/10" aria-hidden />
          <div>
            <div className="text-sm font-semibold text-white">
              Adithya Rao
            </div>
            <div className="text-xs text-white/50">
              Co-founder &amp; CEO, Vought Inc.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Certifications grid
// ---------------------------------------------------------------------------

interface Certification {
  eyebrow: string;
  title: string;
  status: 'In progress' | 'Live' | 'Aligned';
  statusTone: 'amber' | 'emerald' | 'white';
  detail: string;
  target: string;
  delayMs: number;
}

const CERTS: Certification[] = [
  {
    eyebrow: 'Certification',
    title: 'SOC 2 Type II',
    status: 'In progress',
    statusTone: 'amber',
    detail:
      'Type I report under Drata. Type II observation window opened Q1 2026, independent audit by Prescient Assurance.',
    target: 'Target attestation · Q3 2026',
    delayMs: 0,
  },
  {
    eyebrow: 'Compliance',
    title: 'HIPAA',
    status: 'Aligned',
    statusTone: 'white',
    detail:
      'BAA available on request for healthcare-grade conversations. Ephemeral processing mode required for PHI workloads.',
    target: 'BAA on Receptionist Enterprise',
    delayMs: 80,
  },
  {
    eyebrow: 'Privacy',
    title: 'GDPR',
    status: 'Live',
    statusTone: 'emerald',
    detail:
      'EU data residency available. Article 28 DPA, sub-processor disclosure, and 30-day deletion SLA. Standard Contractual Clauses on file.',
    target: 'DPA · vought.com/legal/dpa',
    delayMs: 240,
  },
  {
    eyebrow: 'Certification',
    title: 'ISO 27001',
    status: 'In progress',
    statusTone: 'amber',
    detail:
      'Statement of Applicability drafted. Internal audit completed Q4 2025. Stage 1 certification body engagement scheduled Q2 2026.',
    target: 'Target certification · Q4 2026',
    delayMs: 360,
  },
];

function CertificationsGrid() {
  return (
    <section
      aria-labelledby="certs-heading"
      className="border-y border-white/5 px-6 py-32"
      style={{ background: '#0C0C0E' }}
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-16 max-w-2xl">
          <div className="label-small mb-5 text-accent-amber">
            Certifications &amp; compliance
          </div>
          <h2 id="certs-heading" className="display-xl mb-5 text-white">
            Honest status, not theatre.
          </h2>
          <p className="text-lg text-white/60">
            Where Vought is certified, we say so. Where we are in progress,
            we say so. No badge appears on this page that we have not earned
            or are not actively earning.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CERTS.map((cert) => (
            <CertificationCard key={cert.title} cert={cert} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function CertificationCard({ cert }: { cert: Certification }) {
  const statusClass =
    cert.statusTone === 'emerald'
      ? 'text-live-emerald'
      : cert.statusTone === 'amber'
        ? 'text-accent-amber'
        : 'text-white/70';
  const dotClass =
    cert.statusTone === 'emerald'
      ? 'bg-live-emerald pulse-emerald'
      : cert.statusTone === 'amber'
        ? 'bg-accent-amber pulse-amber'
        : 'bg-white/70';

  return (
    <article
      className="reveal flex h-full flex-col rounded-xl border border-white/[0.08] bg-surface-dark p-6"
      style={{ transitionDelay: `${cert.delayMs}ms` }}
    >
      <div className="label-tiny mb-3 text-white/40">{cert.eyebrow}</div>
      <div className="mb-4 text-xl font-bold text-white">{cert.title}</div>

      <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
        <span
          aria-hidden
          className={['h-1.5 w-1.5 rounded-full', dotClass].join(' ')}
        />
        <span className={['text-xs font-medium', statusClass].join(' ')}>
          {cert.status}
        </span>
      </div>

      <p className="mb-5 flex-1 text-sm leading-relaxed text-white/55">
        {cert.detail}
      </p>

      <div className="border-t border-white/[0.06] pt-4 text-xs text-white/40">
        {cert.target}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// 4. Architecture data flow with retention annotations
// ---------------------------------------------------------------------------

interface DataLeg {
  label: string;
  icon: React.ReactNode;
  emphasis: boolean;
  retention: string;
  retentionDetail: string;
  delayMs: number;
}

const LEGS: DataLeg[] = [
  {
    label: 'Operator device',
    icon: <Mic size={20} className="text-white" />,
    emphasis: false,
    retention: 'In memory only',
    retentionDetail:
      'Audio buffer held in the browser tab. Nothing written to disk. Cleared on tab close.',
    delayMs: 0,
  },
  {
    label: 'ElevenLabs STT',
    icon: <Waves size={20} color="#F5A524" />,
    emphasis: true,
    retention: 'Transit only',
    retentionDetail:
      'TLS 1.3 tunnel. ElevenLabs processes audio, returns text. Zero-retention agreement in place.',
    delayMs: 80,
  },
  {
    label: 'Echo Engine',
    icon: <Brain size={20} color="#FFFFFF" />,
    emphasis: false,
    retention: 'Session memory',
    retentionDetail:
      'Live transcript held in Redis for the call. Cleared at session close — typically within 90 seconds.',
    delayMs: 240,
  },
  {
    label: 'LLM provider',
    icon: <Doc size={20} color="#F5A524" />,
    emphasis: true,
    retention: 'Inference only',
    retentionDetail:
      'OpenAI and Anthropic on zero-retention enterprise tier. No training, no logging beyond 30 days for abuse review.',
    delayMs: 360,
  },
  {
    label: 'ElevenLabs TTS',
    icon: <Bars size={20} color="#F5A524" />,
    emphasis: true,
    retention: 'Transit only',
    retentionDetail:
      'Cloned-voice audio synthesized and streamed back to the operator. Not stored at ElevenLabs or Vought.',
    delayMs: 480,
  },
];

function ArchitectureDataFlow() {
  return (
    <section
      aria-labelledby="dataflow-heading"
      className="border-y border-white/5 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="mb-16 max-w-2xl">
          <div className="reveal label-small mb-5 text-accent-amber">
            Where your data lives
          </div>
          <h2
            id="dataflow-heading"
            className="reveal display-xl mb-5 text-white"
            style={{ transitionDelay: '80ms' }}
          >
            Five legs. One ephemeral loop.
          </h2>
          <p
            className="reveal text-lg text-white/60"
            style={{ transitionDelay: '240ms' }}
          >
            Each hop is annotated with what is held, where it is held, and
            for how long. The default end-to-end retention is the duration
            of the call.
          </p>
        </div>

        <div
          className="reveal rounded-2xl border border-white/[0.08] bg-surface-dark p-8"
          style={{ transitionDelay: '360ms' }}
        >
          {/* Nodes row */}
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto]">
            {LEGS.map((leg, i) => (
              <LegNode
                key={leg.label}
                leg={leg}
                isLast={i === LEGS.length - 1}
                wireDelayMs={i * 240}
              />
            ))}
          </div>

          {/* Annotations grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-white/5 pt-8 md:grid-cols-5">
            {LEGS.map((leg) => (
              <div key={leg.label}>
                <div className="label-tiny mb-2 text-white/40">
                  {leg.label}
                </div>
                <div className="mono mb-2 text-sm text-accent-amber">
                  · {leg.retention}
                </div>
                <div className="text-xs leading-relaxed text-white/55">
                  {leg.retentionDetail}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom statement */}
          <div className="mt-8 rounded-xl border border-accent-amber/20 bg-accent-amber/[0.06] p-5">
            <div className="label-tiny mb-2 text-accent-amber">Default</div>
            <p className="text-sm leading-relaxed text-white/80">
              End-to-end retention for an unmodified Vought session is
              <span className="mono text-white"> · 0s </span>
              after the call ends. Recording is an explicit, per-workspace
              opt-in.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function LegNode({
  leg,
  isLast,
  wireDelayMs,
}: {
  leg: DataLeg;
  isLast: boolean;
  wireDelayMs: number;
}) {
  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={[
            'mb-2 flex h-14 w-14 items-center justify-center rounded-xl border',
            leg.emphasis
              ? 'border-accent-amber/30 bg-accent-amber/[0.15]'
              : 'border-white/10 bg-white/5',
          ].join(' ')}
        >
          {leg.icon}
        </div>
        <div className="text-center text-[10px] font-medium text-white/60">
          {leg.label}
        </div>
      </div>
      {!isLast && (
        <svg
          className="hidden md:block"
          height={2}
          viewBox="0 0 60 2"
          aria-hidden
        >
          <line
            x1="0"
            y1="1"
            x2="60"
            y2="1"
            stroke="#F5A524"
            strokeWidth={1.5}
            className="wire-active"
            style={{ animationDelay: `${wireDelayMs}ms` }}
          />
        </svg>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 5. Sub-processor list
// ---------------------------------------------------------------------------

interface SubProcessor {
  vendor: string;
  purpose: string;
  dataType: string;
  region: string;
}

const SUBPROCESSORS: SubProcessor[] = [
  {
    vendor: 'ElevenLabs',
    purpose: 'Speech-to-text and text-to-speech (cloned voice)',
    dataType: 'Live audio (transit only) · voice embeddings',
    region: 'US · EU',
  },
  {
    vendor: 'OpenAI',
    purpose: 'LLM inference (gpt-4o-mini, default)',
    dataType: 'Transcript text · system prompt',
    region: 'US',
  },
  {
    vendor: 'Anthropic',
    purpose: 'LLM inference (Claude Haiku, alternate)',
    dataType: 'Transcript text · system prompt',
    region: 'US',
  },
  {
    vendor: 'Amazon Web Services',
    purpose: 'Compute, storage, networking for Echo Engine',
    dataType: 'Account data · opt-in transcripts · logs',
    region: 'US · EU · IN',
  },
  {
    vendor: 'Cloudflare',
    purpose: 'Edge networking, DDoS, WAF, TLS termination',
    dataType: 'Request metadata · IP · headers',
    region: 'Global',
  },
];

function SubProcessorList() {
  return (
    <section
      aria-labelledby="subprocessors-heading"
      className="border-y border-white/5 px-6 py-32"
      style={{ background: '#0C0C0E' }}
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-16 max-w-2xl">
          <div className="label-small mb-5 text-accent-amber">
            Sub-processors
          </div>
          <h2
            id="subprocessors-heading"
            className="display-xl mb-5 text-white"
          >
            Five vendors. Each named.
          </h2>
          <p className="text-lg text-white/60">
            We do not use sub-processors we cannot name on a public page.
            This list is the contractual list. Updates are announced
            thirty days before they take effect.
          </p>
        </div>

        <div
          className="reveal overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark"
          style={{ transitionDelay: '80ms' }}
        >
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-white/[0.06] px-6 py-4">
            <div className="label-tiny col-span-3 text-white/40">Vendor</div>
            <div className="label-tiny col-span-4 text-white/40">Purpose</div>
            <div className="label-tiny col-span-3 text-white/40">
              Data type
            </div>
            <div className="label-tiny col-span-2 text-white/40">Region</div>
          </div>

          {/* Rows */}
          {SUBPROCESSORS.map((row, i) => (
            <div
              key={row.vendor}
              className={[
                'grid grid-cols-12 gap-4 px-6 py-5 text-sm',
                i < SUBPROCESSORS.length - 1
                  ? 'border-b border-white/[0.04]'
                  : '',
              ].join(' ')}
            >
              <div className="col-span-12 font-semibold text-white md:col-span-3">
                {row.vendor}
              </div>
              <div className="col-span-12 text-white/70 md:col-span-4">
                {row.purpose}
              </div>
              <div className="col-span-12 text-white/55 md:col-span-3">
                {row.dataType}
              </div>
              <div className="col-span-12 md:col-span-2">
                <span className="mono text-xs text-accent-amber">
                  {row.region}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p
          className="reveal mt-6 text-xs text-white/40"
          style={{ transitionDelay: '240ms' }}
        >
          Last updated 2026-05-26 · Subscribe to changes at{' '}
          <Link
            href="mailto:trust@vought.com"
            className="text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            trust@vought.com
          </Link>
        </p>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. Data residency
// ---------------------------------------------------------------------------

interface Region {
  code: string;
  name: string;
  cloud: string;
  body: string;
  delayMs: number;
}

const REGIONS: Region[] = [
  {
    code: 'US',
    name: 'United States',
    cloud: 'AWS us-east-1 · us-west-2',
    body: 'Default region for new accounts. All Echo Engine compute, Redis live state, and opt-in transcript storage stays within the continental United States. Backups replicate to us-west-2 for disaster recovery.',
    delayMs: 0,
  },
  {
    code: 'EU',
    name: 'European Union',
    cloud: 'AWS eu-central-1 · Frankfurt',
    body: 'Full data residency within the EU for GDPR-aligned customers. ElevenLabs requests route to the European inference endpoint. Sub-processor disclosure and Standard Contractual Clauses cover any incidental transit through the US.',
    delayMs: 80,
  },
  {
    code: 'IN',
    name: 'India',
    cloud: 'AWS ap-south-1 · Mumbai',
    body: 'In-country residency for Indian enterprise customers. Echo Engine and opt-in storage run entirely in Mumbai. LLM inference for the India region is contractually pinned to AWS Bedrock to keep transcripts in-region end-to-end.',
    delayMs: 240,
  },
];

function DataResidency() {
  return (
    <section
      aria-labelledby="residency-heading"
      className="border-y border-white/5 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="mb-16 max-w-2xl">
          <div className="reveal label-small mb-5 text-accent-amber">
            Data residency
          </div>
          <h2
            id="residency-heading"
            className="reveal display-xl mb-5 text-white"
            style={{ transitionDelay: '80ms' }}
          >
            Three regions.<br />Pinned at the workspace.
          </h2>
          <p
            className="reveal text-lg text-white/60"
            style={{ transitionDelay: '240ms' }}
          >
            Residency is chosen at workspace creation and is immutable for
            the life of the workspace. Migration between regions is a
            manual, audited process — we will not move your data on
            our own initiative.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {REGIONS.map((region) => (
            <article
              key={region.code}
              className="reveal flex flex-col rounded-2xl border border-white/[0.08] bg-surface-dark p-7"
              style={{ transitionDelay: `${region.delayMs}ms` }}
            >
              <div className="mb-6 flex items-baseline gap-3">
                <span className="mono text-3xl font-medium text-accent-amber">
                  {region.code}
                </span>
                <span className="text-sm text-white/50">{region.name}</span>
              </div>
              <div className="label-tiny mb-2 text-white/40">
                Underlying infra
              </div>
              <div className="mb-6 text-sm text-white/70">{region.cloud}</div>
              <p className="text-sm leading-relaxed text-white/60">
                {region.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 7. Public contacts
// ---------------------------------------------------------------------------

interface Contact {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  delayMs: number;
}

const CONTACTS: Contact[] = [
  {
    eyebrow: 'Security email',
    title: 'security@vought.com',
    body: 'For incident reports, responsible disclosure, and customer security review correspondence. PGP key on file. Response within one business day, faster for active incidents.',
    cta: { label: 'Email security', href: 'mailto:security@vought.com' },
    delayMs: 0,
  },
  {
    eyebrow: 'Bug bounty',
    title: 'Disclose with HackerOne',
    body: 'Public program. Payouts range from · $100 for accepted low-severity reports to · $5,000 for critical authentication or data-exposure findings. Safe-harbor language matches the HackerOne Vulnerability Disclosure Guidelines.',
    cta: { label: 'Open the program', href: 'https://hackerone.com/vought' },
    delayMs: 80,
  },
  {
    eyebrow: 'Trust center',
    title: 'Live documents portal',
    body: 'SOC 2 report (under NDA), penetration test summary, sub-processor change log, status page, and the data processing addendum. Self-serve, no sales gate.',
    cta: { label: 'Open trust center', href: 'https://trust.vought.com' },
    delayMs: 240,
  },
];

function PublicContacts() {
  return (
    <section
      aria-labelledby="contacts-heading"
      className="border-y border-white/5 px-6 py-32"
      style={{ background: '#0C0C0E' }}
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-16 max-w-2xl">
          <div className="label-small mb-5 text-accent-amber">
            Talk to the team
          </div>
          <h2 id="contacts-heading" className="display-xl mb-5 text-white">
            Public contacts.<br />Real humans on the other end.
          </h2>
          <p className="text-lg text-white/60">
            Three channels, each scoped to a specific kind of question. No
            ticketing forms, no chatbot triage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CONTACTS.map((contact) => (
            <article
              key={contact.title}
              className="reveal flex flex-col rounded-2xl border border-white/[0.08] bg-surface-dark p-7"
              style={{ transitionDelay: `${contact.delayMs}ms` }}
            >
              <div className="label-tiny mb-3 text-white/40">
                {contact.eyebrow}
              </div>
              <div className="mono mb-5 text-lg font-semibold text-white">
                {contact.title}
              </div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60">
                {contact.body}
              </p>
              <Link
                href={contact.cta.href}
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent-amber transition-colors duration-quick ease-quick hover:text-white"
              >
                {contact.cta.label}
                <ArrowRight size={14} className="text-current" />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. CTA strip
// ---------------------------------------------------------------------------

function SecurityCTA() {
  return (
    <section
      aria-labelledby="security-cta-heading"
      className="relative overflow-hidden px-6 py-32"
    >
      <div
        aria-hidden
        className="orb orb-amber"
        style={{
          width: 700,
          height: 700,
          bottom: -300,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.25,
        }}
      />

      <Container width="marketing" padX={0} className="relative">
        <Grid columns={12} gutter={32} className="items-center">
          <GridItem span={12} className="reveal lg:!col-span-7">
            <h2
              id="security-cta-heading"
              className="display-2xl mb-4 leading-tight text-white"
            >
              Reviewing Vought<br />for your team?
            </h2>
            <p className="max-w-lg text-lg text-white/60">
              Send the one-pager to your security and legal reviewers. Book
              time with our team when they have questions.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-amber/15">
                  <Check size={12} className="text-accent-amber" />
                </span>
                Pre-filled vendor security questionnaire (SIG Lite · CAIQ)
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-amber/15">
                  <Check size={12} className="text-accent-amber" />
                </span>
                Latest penetration test executive summary
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-amber/15">
                  <Check size={12} className="text-accent-amber" />
                </span>
                Sub-processor change subscription
              </li>
            </ul>
          </GridItem>

          <GridItem
            span={12}
            className="reveal flex flex-wrap justify-start gap-3 lg:!col-span-5 lg:justify-end"
            style={{ transitionDelay: '80ms' }}
          >
            <Link
              href="/security/vought-security-one-pager.pdf"
              className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
            >
              Download one-pager
              <ArrowRight size={14} className="text-marketing-ink" />
            </Link>
            <Link
              href="mailto:legal@vought.com"
              className="rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white transition-colors duration-quick ease-quick hover:border-white/30"
            >
              Talk to legal
            </Link>
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function SecurityPage() {
  return (
    <>
      <SecurityHero />
      <ExecutiveStatement />
      <CertificationsGrid />
      <ArchitectureDataFlow />
      <SubProcessorList />
      <DataResidency />
      <PublicContacts />
      <SecurityCTA />
    </>
  );
}
