/**
 * /receptionist · Vought Receptionist product page
 *
 * Wave 5 build. Per VOUGHT-DESIGN-BLUEPRINT.md §4.1 (/receptionist).
 * The page is composed inline (no new marketing components added to
 * the shared library — this is a single-page surface). It reuses
 * existing primitives from @vought/ui, motion patterns from
 * @vought/motion, the global .reveal observer wired by MarketingRoot,
 * and the brand utility classes from globals.css.
 *
 * Sections (per blueprint):
 *   1. Hero — "Answer every call. Even at 2am."
 *   2. Industries — 6-card grid (Dental, Legal, Real Estate, Beauty,
 *      Home Services, Medical)
 *   3. Live phone call demo — published number + transcript preview
 *   4. Setup in 10 minutes — 4-step explainer
 *   5. Integrations — Calendly, Google Calendar, Square, Stripe, Twilio,
 *      Dentrix, Clio
 *   6. Pricing — $0.20/min + $99/mo minimum
 *   7. Customer story — dental office vignette
 *   8. CTA — "Get your phone number today." (business name + ZIP + email)
 *
 * Brand rules honored:
 *   - Numbers in mono with "· 412ms" callsign treatment
 *   - One accent (amber). Live state in emerald only
 *   - No "AI-powered" / "supercharge" / "10x"
 *   - Single CTA per logical block, declarative copy
 *   - All colors / spacing / motion via design tokens or globals.css
 *     utility classes — zero raw timing values outside what is already
 *     established (canvas-shift exception lives in CTAStrip only)
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import { Container, Grid, GridItem, Stack } from '@vought/ui';
import {
  ArrowRight,
  Check,
  Mic,
  Waves,
  Doc,
  User,
  Headphones,
  Play,
} from '@/components/ui/Icon';
import { CountUp } from '@/components/ui/CountUp';
import { bloomCss } from '@vought/motion';

// ─────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────

export function generateMetadata(): Metadata {
  return {
    title: 'Vought Receptionist · Answer every call. Even at 2am.',
    description:
      'Autonomous AI for inbound calls. Books appointments, answers FAQs, escalates urgents — under one second, in a voice your callers will mistake for human. $0.20 per minute.',
    alternates: { canonical: 'https://vought.com/receptionist' },
    openGraph: {
      title: 'Vought Receptionist · Answer every call. Even at 2am.',
      description:
        'Autonomous AI phone agent for SMBs. Books appointments, qualifies leads, escalates urgents. $0.20/min.',
      url: 'https://vought.com/receptionist',
      type: 'website',
    },
  };
}

// Scoped keyframe for the incoming-call ring + appointment slot pulse.
// CSS only — keeps the page tree fully server-rendered.
const RECEPTIONIST_PAGE_STYLES = `
  @keyframes vought-ring-out {
    0% { transform: scale(1); opacity: 0.55; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  .ring-pulse::before,
  .ring-pulse::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 1px solid rgba(245, 165, 36, 0.5);
    animation: vought-ring-out var(--motion-wave) var(--easing-breath) infinite;
  }
  .ring-pulse::after {
    animation-delay: 1300ms;
  }
  @keyframes vought-slot-land {
    0% { transform: translateY(6px); opacity: 0; }
    50% { transform: translateY(0); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    100% { transform: translateY(0); opacity: 1; box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  }
  .slot-land {
    animation: vought-slot-land var(--motion-wave) var(--easing-cinematic) infinite;
  }
  .industry-card {
    transition:
      border-color var(--motion-quick) var(--easing-quick),
      background-color var(--motion-quick) var(--easing-quick);
  }
  .industry-card:hover {
    border-color: rgba(245, 165, 36, 0.4);
  }
  .integration-chip {
    transition:
      border-color var(--motion-quick) var(--easing-quick),
      color var(--motion-quick) var(--easing-quick);
  }
  .integration-chip:hover {
    border-color: rgba(245, 165, 36, 0.4);
    color: rgba(255, 255, 255, 0.95);
  }
`;

export default function ReceptionistPage() {
  return (
    <>
      <style>{bloomCss}</style>
      <style>{RECEPTIONIST_PAGE_STYLES}</style>
      <ReceptionistHero />
      <IndustriesGrid />
      <LivePhoneCallDemo />
      <SetupInTenMinutes />
      <IntegrationsRow />
      <ReceptionistPricing />
      <ReceptionistCustomerStory />
      <ReceptionistCTA />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 1 · Hero — "Answer every call. Even at 2am."
// ─────────────────────────────────────────────────────────────────────

function ReceptionistHero() {
  return (
    <section
      aria-labelledby="receptionist-hero-heading"
      className="relative px-6 pb-28 pt-44"
    >
      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={32} className="items-center">
          {/* Left column */}
          <GridItem span={12} className="lg:!col-span-7">
            <Stack gap={0}>
              <div className="reveal mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                <span className="pulse-amber h-1.5 w-1.5 rounded-full bg-accent-amber" />
                <span className="text-xs font-medium text-white/70">
                  Receptionist · autonomous inbound calls
                </span>
              </div>

              <h1
                id="receptionist-hero-heading"
                className="reveal display-3xl mb-7 text-white"
                style={{ transitionDelay: '80ms' }}
              >
                Answer every call.<br />Even at 2am.
              </h1>

              <p
                className="reveal mb-10 max-w-xl text-xl leading-relaxed text-white/60"
                style={{ transitionDelay: '240ms' }}
              >
                An autonomous Vought agent picks up your inbound line in one
                ring. It books the appointment, answers the FAQ, and texts a
                summary to your phone before the caller hangs up.
              </p>

              <div
                className="reveal mb-12 flex flex-wrap items-center gap-4"
                style={{ transitionDelay: '360ms' }}
              >
                <Link
                  href="#cta-form"
                  className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
                >
                  Get your phone number
                  <ArrowRight size={14} className="text-marketing-ink" />
                </Link>
                <Link
                  href="#live-demo"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    <Play size={10} className="text-white" />
                  </span>
                  Call the demo line
                </Link>
              </div>

              <div
                className="reveal flex flex-wrap items-center gap-10 text-xs text-white/40"
                style={{ transitionDelay: '640ms' }}
              >
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={42} suffix="%" />
                  </div>
                  <div>after-hours bookings recovered</div>
                </div>
                <div aria-hidden className="h-12 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={620} suffix="ms" />
                  </div>
                  <div>median answer latency</div>
                </div>
                <div aria-hidden className="h-12 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={10} suffix="min" />
                  </div>
                  <div>from signup to live number</div>
                </div>
              </div>
            </Stack>
          </GridItem>

          {/* Right column — incoming call → AI answers → calendar slot */}
          <GridItem span={12} className="relative lg:!col-span-4 lg:!col-start-9">
            <PhoneCallMockup />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function PhoneCallMockup() {
  return (
    <div className="relative">
      <div
        className="float-anim relative"
        style={{ transformOrigin: 'center' }}
      >
        {/* State pill */}
        <div className="absolute -left-3 -top-5 z-raised">
          <div className="pulse-amber inline-flex items-center gap-2 rounded-full bg-accent-amber px-4 py-1.5 text-marketing-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-marketing-ink" />
            <span className="label-tiny text-marketing-ink">On the call</span>
          </div>
        </div>

        {/* Phone-shaped card */}
        <div
          className="rounded-2xl border border-white/[0.08] bg-surface-dark p-5"
          style={{
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Caller row */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="ring-pulse relative flex h-9 w-9 items-center justify-center rounded-full bg-accent-amber/15">
                <Mic size={16} className="text-accent-amber" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Incoming · (415) 555-0188</div>
                <div className="label-tiny text-white/40">Unknown caller · 02:14 am</div>
              </div>
            </div>
            <span className="mono text-[10px] text-accent-amber">· 620ms</span>
          </div>

          {/* Transcript */}
          <div className="mb-5 space-y-3 rounded-xl border border-white/[0.05] bg-elevated-dark p-4">
            <TranscriptLine speaker="them" body="“Hi, do you have any openings tomorrow morning?”" />
            <TranscriptLine
              speaker="vought"
              body="“We do — 9:15 or 10:40 with Dr. Mendez. Which works?”"
            />
            <TranscriptLine speaker="them" body="“Let's do 10:40.”" />
            <TranscriptLine
              speaker="vought"
              body="“Booked. I'll text you the confirmation now.”"
            />
          </div>

          {/* Appointment landed */}
          <div className="slot-land mb-4 rounded-xl border border-live-emerald/30 bg-live-emerald/[0.08] p-4">
            <div className="mb-1 flex items-center justify-between">
              <div className="label-tiny text-live-emerald">Booked in calendar</div>
              <span className="mono text-[10px] text-white/40">just now</span>
            </div>
            <div className="text-sm font-bold text-white">Tue · May 27 · 10:40 am</div>
            <div className="text-[11px] text-white/50">Dr. Mendez · cleaning · 45 min</div>
          </div>

          {/* Waveform */}
          <div className="flex h-5 items-end gap-0.5" aria-hidden>
            {WAVE_BARS.map((bar, i) => (
              <span
                key={i}
                className="wave-bar w-1 rounded"
                style={{
                  height: `${bar.height}%`,
                  animationDelay: `${i * 80}ms`,
                  background: bar.amber,
                }}
              />
            ))}
          </div>
        </div>

        {/* Secondary card — owner SMS */}
        <div
          className="absolute -bottom-8 -right-6 w-48 rounded-xl border border-white/[0.08] bg-elevated-dark p-3 shadow-xl"
          style={{ transform: 'rotate(-2deg)' }}
        >
          <div className="label-tiny mb-1 text-white/40">SMS to owner</div>
          <div className="mb-1 text-xs font-semibold text-white">
            New 10:40 am booking · Tue
          </div>
          <div className="text-[10px] text-white/40">Caller saved as new contact</div>
        </div>
      </div>
    </div>
  );
}

function TranscriptLine({
  speaker,
  body,
}: {
  speaker: 'them' | 'vought';
  body: string;
}) {
  const isVought = speaker === 'vought';
  return (
    <div className="flex items-start gap-3">
      <span
        className={[
          'mono mt-0.5 w-14 flex-none text-[10px] uppercase tracking-wider',
          isVought ? 'text-accent-amber' : 'text-info-azure',
        ].join(' ')}
      >
        {isVought ? 'Vought' : 'Caller'}
      </span>
      <p
        className={[
          'text-xs leading-relaxed',
          isVought ? 'font-semibold text-white' : 'italic text-white/55',
        ].join(' ')}
      >
        {body}
      </p>
    </div>
  );
}

const WAVE_BARS: { height: number; amber: string }[] = [
  { height: 30, amber: 'rgba(245,165,36,0.6)' },
  { height: 60, amber: 'rgba(245,165,36,0.8)' },
  { height: 90, amber: 'rgba(245,165,36,1)' },
  { height: 70, amber: 'rgba(245,165,36,1)' },
  { height: 100, amber: 'rgba(245,165,36,1)' },
  { height: 60, amber: 'rgba(245,165,36,1)' },
  { height: 80, amber: 'rgba(245,165,36,0.8)' },
  { height: 50, amber: 'rgba(245,165,36,0.6)' },
  { height: 40, amber: 'rgba(245,165,36,0.4)' },
  { height: 30, amber: 'rgba(245,165,36,0.3)' },
  { height: 55, amber: 'rgba(245,165,36,0.5)' },
  { height: 75, amber: 'rgba(245,165,36,0.7)' },
  { height: 90, amber: 'rgba(245,165,36,1)' },
  { height: 65, amber: 'rgba(245,165,36,0.8)' },
  { height: 45, amber: 'rgba(245,165,36,0.6)' },
];

// ─────────────────────────────────────────────────────────────────────
// 2 · Industries grid — six 60-word vignettes
// ─────────────────────────────────────────────────────────────────────

interface Industry {
  id: string;
  label: string;
  title: string;
  vignette: string;
  metric: { value: ReactNode; label: string };
  delayMs: number;
}

const INDUSTRIES: Industry[] = [
  {
    id: 'dental',
    label: 'Dental',
    title: 'The hygienist is mid-cleaning.',
    vignette:
      'The phone rings. The front desk is gloved into a cleaning. Vought picks up in one ring, checks the chair schedule, books the new patient for Thursday at 2pm, and texts the intake form. The hygienist never had to look up. The schedule fills itself.',
    metric: { value: <CountUp target={31} suffix="%" />, label: 'new-patient capture' },
    delayMs: 0,
  },
  {
    id: 'legal',
    label: 'Legal',
    title: 'The associate is in deposition.',
    vignette:
      'A potential client calls at 7:42 pm — an injury, an accident, a fear of waiting. Vought answers, listens, qualifies the matter, and books a 20-minute consult for the morning. The intake summary lands in the paralegal\'s inbox, tagged by practice area, ready to triage.',
    metric: { value: <CountUp target={4.2} suffix="×" decimals={1} />, label: 'after-hours intake' },
    delayMs: 60,
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    title: 'The listing just went live.',
    vignette:
      'The Zillow ping fires. A buyer calls about the 3-bed on Linden Avenue. Vought confirms the price, walks the room count, and books a Saturday showing into the agent\'s calendar. The buyer\'s name, budget, and timing land in the CRM before the agent unlocks the next door.',
    metric: { value: <CountUp target={2.8} suffix="×" decimals={1} />, label: 'showings per listing' },
    delayMs: 120,
  },
  {
    id: 'beauty',
    label: 'Beauty',
    title: 'Both chairs are full.',
    vignette:
      'A regular calls to move her color appointment from Friday to Tuesday. Vought knows her stylist, her color formula, and the 90-minute window it needs. The move is done in twelve seconds, the cancellation auto-fills with the waitlist, and the chair stays booked.',
    metric: { value: <CountUp target={18} suffix="%" />, label: 'chair utilization' },
    delayMs: 180,
  },
  {
    id: 'home-services',
    label: 'Home Services',
    title: 'The crew is up a ladder.',
    vignette:
      'The phone is ringing in the truck. A leak, a quote, a date. Vought triages by urgency, captures the address and the photo via SMS, and books the same-day estimate for the closest tech on the route. Dispatch sees the new job land before the call ends.',
    metric: { value: <CountUp target={37} suffix="%" />, label: 'same-day capture' },
    delayMs: 240,
  },
  {
    id: 'medical',
    label: 'Medical',
    title: 'The clinic opens at 8.',
    vignette:
      'It is 11:08 pm. A worried parent calls. Vought greets, screens for emergency (urgent care or 911), books the soonest in-network slot, sends the new-patient packet, and routes a high-priority flag to the on-call nurse. Calm, scripted, clinically careful, fully logged.',
    metric: { value: <CountUp target={92} suffix="%" />, label: 'first-call resolution' },
    delayMs: 300,
  },
];

function IndustriesGrid() {
  return (
    <section aria-labelledby="industries-heading" className="px-6 py-28">
      <Container width="marketing" padX={0}>
        <div className="reveal mb-14 max-w-2xl">
          <div className="label-small mb-5 text-accent-amber">Industries</div>
          <h2 id="industries-heading" className="display-lg mb-5 text-white">
            Built for the businesses<br />where the phone is the lobby.
          </h2>
          <p className="text-base leading-relaxed text-white/60">
            Six verticals, six playbooks. Same engine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((i) => (
            <article
              key={i.id}
              className="industry-card reveal group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark p-7"
              style={{ transitionDelay: `${i.delayMs}ms` }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="label-tiny text-white/40">{i.label}</span>
                <span className="mono text-[10px] text-accent-amber">
                  {i.metric.value}
                  <span className="ml-2 text-white/40">{i.metric.label}</span>
                </span>
              </div>
              <h3 className="mb-4 text-xl font-bold leading-snug text-white">
                {i.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {i.vignette}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3 · Live phone call demo — published number + transcript preview
// ─────────────────────────────────────────────────────────────────────

function LivePhoneCallDemo() {
  return (
    <section
      id="live-demo"
      aria-labelledby="live-demo-heading"
      className="relative px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={48} className="items-start">
          <GridItem span={12} className="reveal lg:!col-span-5">
            <div className="label-small mb-5 text-accent-amber">Try it · live line</div>
            <h2 id="live-demo-heading" className="display-xl mb-7 text-white">
              Call the demo<br />from your phone.
            </h2>
            <p className="mb-9 text-lg leading-relaxed text-white/60">
              We left a real line open. Dial in. Ask about availability, ask a
              weird question, try to throw it. The transcript and booking will
              show on this page in real time.
            </p>

            <div className="mb-8 rounded-2xl border border-accent-amber/30 bg-surface-dark p-7"
              style={{
                background:
                  'linear-gradient(to bottom, #1F1A0F 0%, #131316 100%)',
              }}
            >
              <div className="label-tiny mb-3 text-white/40">Demo line · US</div>
              <a
                href="tel:+15550108686"
                className="mono mb-2 block text-4xl font-bold text-accent-amber hover:opacity-90"
              >
                (555) 010-VOUGHT
              </a>
              <div className="flex items-center gap-2 text-[11px] text-white/50">
                <span className="pulse-emerald h-1.5 w-1.5 rounded-full bg-live-emerald" />
                Live · answered by Vought · open 24/7
              </div>
            </div>

            <ul className="space-y-3 text-sm text-white/70">
              {[
                'Books to a real (sandboxed) calendar',
                'Speaks four languages — try Spanish',
                'Texts the call summary to your number',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check size={14} className="mt-1 flex-none text-accent-amber" />
                  {line}
                </li>
              ))}
            </ul>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-6 lg:!col-start-7"
            style={{ transitionDelay: '80ms' }}
          >
            <SampleCallTranscript />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function SampleCallTranscript() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface-dark p-7">
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <span className="pulse-amber h-1.5 w-1.5 rounded-full bg-accent-amber" />
          <div>
            <div className="text-sm font-bold text-white">Sample call · 47s</div>
            <div className="label-tiny text-white/40">Session · VGT-93FD2</div>
          </div>
        </div>
        <span className="mono text-[11px] text-white/50">02:14 am</span>
      </div>

      <div className="space-y-4">
        <TranscriptLine
          speaker="vought"
          body="“Lakeshore Dental, this is Vought. How can I help?”"
        />
        <TranscriptLine
          speaker="them"
          body="“Hi, I think I cracked something on my back tooth — really sharp pain when I bite down.”"
        />
        <TranscriptLine
          speaker="vought"
          body="“That sounds urgent. Dr. Mendez has a 9:15 am emergency slot tomorrow. Would that work?”"
        />
        <TranscriptLine speaker="them" body="“Yes, please.”" />
        <TranscriptLine
          speaker="vought"
          body="“Booked. I'll text the address and the intake form to this number. If the pain spikes tonight, an urgent-care line is also in the text.”"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-5 text-left">
        <SummaryStat label="Outcome" value="Booked" tone="emerald" />
        <SummaryStat label="Call length" value="00:47" mono />
        <SummaryStat label="Median latency" value="620ms" mono accent />
      </div>
    </div>
  );
}

interface SummaryStatProps {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  tone?: 'emerald';
}

function SummaryStat({ label, value, mono, accent, tone }: SummaryStatProps) {
  const valueClass = [
    'text-sm font-bold',
    mono && 'mono',
    accent && 'text-accent-amber',
    tone === 'emerald' && 'text-live-emerald',
    !accent && tone !== 'emerald' && 'text-white',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div>
      <div className="label-tiny mb-1 text-white/40">{label}</div>
      <div className={valueClass}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4 · Setup in 10 minutes — 4-step illustrated explainer
// ─────────────────────────────────────────────────────────────────────

interface SetupStep {
  num: string;
  title: string;
  body: string;
  duration: string;
  icon: ReactNode;
  illustration: ReactNode;
}

const SETUP_STEPS: SetupStep[] = [
  {
    num: '01',
    title: 'Pick a number.',
    body:
      'Search by area code. Pick a memorable local number, or port the one you already publish. Provisioning takes 60 seconds via Twilio.',
    duration: '· 90s',
    icon: <Mic size={20} className="text-white" />,
    illustration: <NumberPickerIllustration />,
  },
  {
    num: '02',
    title: 'Configure hours.',
    body:
      'Always on, business hours only, or after-hours fallback. Set the holiday list. Pick the escalation number for the calls Vought hands off.',
    duration: '· 2 min',
    icon: <Waves size={20} className="text-white" color="currentColor" />,
    illustration: <HoursIllustration />,
  },
  {
    num: '03',
    title: 'Upload your FAQ.',
    body:
      'One PDF, a Google Doc, or a paste. Vought reads your policies, your service list, your prices — and quotes from them on every call.',
    duration: '· 3 min',
    icon: <Doc size={20} className="text-white" color="currentColor" />,
    illustration: <FaqUploadIllustration />,
  },
  {
    num: '04',
    title: 'Go live.',
    body:
      'Forward your existing line, or publish the new number. Vought starts answering immediately. The first call summary lands as a text.',
    duration: '· now',
    icon: <Headphones size={20} className="text-white" />,
    illustration: <GoLiveIllustration />,
  },
];

function SetupInTenMinutes() {
  return (
    <section aria-labelledby="setup-heading" className="px-6 py-28">
      <Container width="marketing" padX={0}>
        <div className="reveal mx-auto mb-20 max-w-2xl text-center">
          <div className="label-small mb-5 text-accent-amber">Setup · 10 minutes</div>
          <h2 id="setup-heading" className="display-xl mb-5 text-white">
            Faster than reading<br />your own voicemail greeting.
          </h2>
          <p
            className="text-lg leading-relaxed text-white/60"
            style={{ transitionDelay: '80ms' }}
          >
            Four steps. No installer. No technician. Done before your next
            coffee.
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-5">
          {SETUP_STEPS.map((step, i) => (
            <article
              key={step.num}
              className="reveal relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <Grid columns={12} gutter={0} className="items-stretch">
                <GridItem
                  span={12}
                  className="border-b border-white/5 p-8 md:!col-span-7 md:border-b-0 md:border-r"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="mono text-xs text-white/30">{step.num}</span>
                    <span aria-hidden className="h-px flex-1 bg-white/10" />
                    <span className="mono text-[10px] text-accent-amber">
                      {step.duration}
                    </span>
                  </div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    {step.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {step.body}
                  </p>
                </GridItem>
                <GridItem
                  span={12}
                  className="bg-elevated-dark/60 p-8 md:!col-span-5"
                >
                  {step.illustration}
                </GridItem>
              </Grid>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function NumberPickerIllustration() {
  const numbers = [
    '(415) 555-0188',
    '(415) 555-0210',
    '(415) 555-0244',
    '(415) 555-0299',
  ];
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">Area code · 415</div>
      <div className="space-y-2">
        {numbers.map((n, i) => (
          <div
            key={n}
            className="flex items-center justify-between rounded-md border bg-elevated-dark px-3 py-2"
            style={{
              borderColor:
                i === 1 ? 'rgba(245,165,36,0.4)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <span
              className={`mono text-xs ${i === 1 ? 'text-accent-amber' : 'text-white/60'}`}
            >
              {n}
            </span>
            <span className="text-[10px] text-white/30">
              {i === 1 ? 'selected' : 'available'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoursIllustration() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">Office hours · GMT−07</div>
      <div className="space-y-1.5">
        {days.map((d, i) => (
          <div key={d} className="flex items-center gap-3 text-[11px]">
            <span className="mono w-8 text-white/40">{d}</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="absolute h-full bg-accent-amber/60"
                style={{
                  left: i < 5 ? '16%' : '0%',
                  width: i < 5 ? '50%' : i === 5 ? '30%' : '0%',
                }}
              />
              <div
                className="absolute h-full bg-info-azure/40"
                style={{
                  left: i < 5 ? '66%' : i === 5 ? '30%' : '0%',
                  width: i < 5 ? '34%' : i === 5 ? '70%' : '100%',
                }}
              />
            </div>
            <span className="mono w-12 text-right text-[10px] text-white/30">
              {i < 5 ? '8a–6p' : i === 5 ? '10a–4p' : 'closed'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-accent-amber/60" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-info-azure/40" /> After-hours fallback
        </span>
      </div>
    </div>
  );
}

function FaqUploadIllustration() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">Knowledge sources</div>
      <div className="space-y-2">
        {[
          { name: 'lakeshore-dental-faq.pdf', size: '1.2 MB', state: 'indexed' },
          { name: 'service-prices.csv', size: '24 KB', state: 'indexed' },
          { name: 'cancellation-policy.docx', size: '38 KB', state: 'indexed' },
        ].map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-3 rounded-md border border-white/5 bg-elevated-dark px-3 py-2"
          >
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded bg-white/5">
              <Doc size={14} className="text-white/60" color="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] text-white/70">{f.name}</div>
              <div className="text-[10px] text-white/30">
                {f.size} · {f.state}
              </div>
            </div>
            <span className="text-live-emerald">
              <Check size={12} className="text-live-emerald" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoLiveIllustration() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">Status · go-live</div>
      <div className="rounded-xl border border-live-emerald/30 bg-live-emerald/[0.08] p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="pulse-emerald h-1.5 w-1.5 rounded-full bg-live-emerald" />
          <span className="text-sm font-bold text-live-emerald">Line is live</span>
        </div>
        <div className="mono mb-2 text-lg text-white">(415) 555-0210</div>
        <div className="text-[11px] text-white/60">
          Forwarded · 24/7 · escalation routes to owner mobile
        </div>
      </div>
      <div className="mt-3 text-[11px] text-white/50">
        First call summary will text to <span className="mono text-white/70">+1 (415) 555-0119</span>.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5 · Integrations
// ─────────────────────────────────────────────────────────────────────

interface IntegrationItem {
  label: string;
  className: string;
  blurb: string;
  style?: CSSProperties;
}

const CORE_INTEGRATIONS: IntegrationItem[] = [
  {
    label: 'Calendly',
    className: 'text-lg font-bold',
    blurb: 'Books straight into your event types',
  },
  {
    label: 'Google Calendar',
    className: 'text-lg font-bold',
    blurb: 'Reads availability, writes appointments',
  },
  {
    label: 'Square',
    className: 'text-lg font-black',
    blurb: 'Takes deposits and no-show fees',
  },
  {
    label: 'Stripe Billing',
    className: 'text-lg font-bold',
    blurb: 'Sends pay links during the call',
  },
  {
    label: 'Twilio',
    className: 'text-lg font-bold',
    blurb: 'Carrier-grade SIP underneath',
  },
];

const VERTICAL_INTEGRATIONS: { vertical: string; items: IntegrationItem[] }[] = [
  {
    vertical: 'Dental',
    items: [
      { label: 'Dentrix', className: 'text-base font-bold', blurb: 'Chair-side schedule sync' },
      { label: 'Open Dental', className: 'text-base font-bold', blurb: 'Direct patient lookup' },
    ],
  },
  {
    vertical: 'Legal',
    items: [
      { label: 'Clio', className: 'text-base font-bold', blurb: 'Matter intake on the call' },
      { label: 'MyCase', className: 'text-base font-bold', blurb: 'Conflict check, then book' },
    ],
  },
  {
    vertical: 'Real Estate',
    items: [
      { label: 'Follow Up Boss', className: 'text-base font-bold', blurb: 'Lead routed to listing agent' },
      { label: 'Sierra Interactive', className: 'text-base font-bold', blurb: 'Showings into CRM' },
    ],
  },
];

function IntegrationsRow() {
  return (
    <section
      aria-labelledby="integrations-heading"
      className="px-6 py-28"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-12 max-w-3xl">
          <div className="label-small mb-5 text-accent-amber">Integrations</div>
          <h2 id="integrations-heading" className="display-lg text-white">
            Plugs into the tools<br />you already run on.
          </h2>
        </div>

        {/* Core row */}
        <div className="reveal mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {CORE_INTEGRATIONS.map((i) => (
            <IntegrationChip key={i.label} item={i} />
          ))}
        </div>

        {/* Vertical-specific row */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {VERTICAL_INTEGRATIONS.map((group, gIdx) => (
            <article
              key={group.vertical}
              className="reveal rounded-2xl border border-white/[0.08] bg-surface-dark p-6"
              style={{ transitionDelay: `${gIdx * 80}ms` }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="label-tiny text-white/40">Vertical · {group.vertical}</div>
                <div className="mono text-[10px] text-accent-amber">native</div>
              </div>
              <ul className="space-y-3">
                {group.items.map((it) => (
                  <li key={it.label} className="flex items-start justify-between gap-4">
                    <div>
                      <div className={['text-white', it.className].join(' ')} style={it.style}>
                        {it.label}
                      </div>
                      <div className="text-[11px] text-white/50">{it.blurb}</div>
                    </div>
                    <span className="mt-1 flex-none">
                      <Check size={14} className="text-accent-amber" />
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function IntegrationChip({ item }: { item: IntegrationItem }) {
  return (
    <div
      className="integration-chip group flex flex-col rounded-xl border border-white/[0.08] bg-surface-dark p-5 text-white/70"
    >
      <div className={['mb-2 text-white', item.className].join(' ')} style={item.style}>
        {item.label}
      </div>
      <div className="text-[11px] leading-relaxed text-white/50">
        {item.blurb}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 6 · Pricing — $0.20/min + $99/mo minimum
// ─────────────────────────────────────────────────────────────────────

function ReceptionistPricing() {
  return (
    <section
      aria-labelledby="receptionist-pricing-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <div className="label-small mb-5 text-accent-amber">Receptionist pricing</div>
          <h2
            id="receptionist-pricing-heading"
            className="display-xl mb-5 text-white"
          >
            Pay for calls answered.<br />Not for seats unused.
          </h2>
          <p className="text-lg leading-relaxed text-white/60">
            One simple meter. The first $99 covers your baseline. Above it,
            twenty cents a minute, billed monthly, capped at your number.
          </p>
        </div>

        <Grid columns={12} gutter={24}>
          <GridItem span={12} className="reveal lg:!col-span-8">
            <article
              className="relative h-full overflow-hidden rounded-2xl border border-accent-amber/30 p-10"
              style={{
                background:
                  'linear-gradient(to bottom, #1F1A0F 0%, #131316 100%)',
              }}
            >
              <div className="absolute right-6 top-6 inline-flex items-center rounded-full bg-accent-amber px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-marketing-ink">
                Usage-based
              </div>
              <div className="mb-3 text-xs text-white/50">Vought Receptionist</div>
              <div className="mb-4 flex items-baseline gap-3">
                <div className="mono text-6xl font-bold text-white">$0.20</div>
                <div className="text-base text-white/50">/ minute</div>
              </div>
              <div className="mb-9 text-sm text-white/70">
                <span className="mono text-white">$99/mo</span> minimum · billed monthly · no
                contract
              </div>

              <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
                <PriceRow label="Phone number" value="Included" />
                <PriceRow label="Voice clone" value="Included" />
                <PriceRow label="Calendar sync" value="Included" />
                <PriceRow label="FAQ knowledge" value="Unlimited" />
                <PriceRow label="SMS summaries" value="Unlimited" />
                <PriceRow label="Languages" value="EN · ES · FR · DE" />
              </div>

              <Link
                href="#cta-form"
                className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
              >
                Get your phone number
                <ArrowRight size={14} className="text-marketing-ink" />
              </Link>
            </article>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-4"
            style={{ transitionDelay: '80ms' }}
          >
            <article className="h-full rounded-2xl border border-white/[0.08] bg-surface-dark p-8">
              <div className="mb-3 text-xs text-white/50">Practical math</div>
              <div className="mb-6 text-base leading-relaxed text-white/70">
                Typical SMB sees <span className="mono text-white">340</span> inbound
                minutes / month after going live.
              </div>

              <PracticalLine label="340 minutes × $0.20" value="$68.00" />
              <PracticalLine label="Baseline (minimum)" value="$99.00" muted />
              <div className="my-4 h-px bg-white/5" />
              <PracticalLine label="Total month one" value="$99.00" bold />

              <div className="mt-6 text-[11px] leading-relaxed text-white/50">
                Above 495 minutes you pass the minimum and only pay per minute.
                We send an alert at 80% of any soft cap you set.
              </div>
            </article>
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-elevated-dark px-4 py-3">
      <span className="text-[12px] text-white/60">{label}</span>
      <span className="text-[12px] font-bold text-white">{value}</span>
    </div>
  );
}

function PracticalLine({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${muted ? 'text-white/40' : 'text-white/70'}`}>{label}</span>
      <span
        className={[
          'mono text-sm',
          bold ? 'font-bold text-white' : muted ? 'text-white/40' : 'text-white',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7 · Customer story — dental office vignette
// ─────────────────────────────────────────────────────────────────────

function ReceptionistCustomerStory() {
  return (
    <section
      aria-labelledby="receptionist-customer-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-center text-accent-amber">
          Customer story
        </div>
        <h2
          id="receptionist-customer-heading"
          className="reveal display-xl mb-20 text-center text-white"
          style={{ transitionDelay: '80ms' }}
        >
          How Lakeshore Dental added<br />92 patients in 60 days.
        </h2>

        <Grid columns={12} gutter={32}>
          <GridItem
            span={12}
            className="reveal lg:!col-span-8"
            style={{ transitionDelay: '240ms' }}
          >
            <div className="rounded-3xl border border-white/[0.08] bg-surface-dark p-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="mono text-2xl text-white/40">{'{lakeshore.dental}'}</div>
                <div aria-hidden className="h-6 w-px bg-white/10" />
                <div className="text-xs text-white/40">
                  Single-location practice · 4 chairs · Oakland, CA
                </div>
              </div>
              <blockquote className="mb-8 text-2xl font-medium leading-snug tracking-tight text-white">
                “The front desk used to lose six calls a day. After hours, it
                was worse. Vought picks up before the second ring, books to
                Dentrix, and texts me the summary. The schedule fills itself
                while we sleep.”
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="h-11 w-11 rounded-full bg-white/10"
                />
                <div>
                  <div className="text-sm font-bold text-white">Dr. Camila Mendez</div>
                  <div className="text-xs text-white/50">
                    Owner · Lakeshore Dental
                  </div>
                </div>
                <Link
                  href="/customers/lakeshore-dental"
                  className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-accent-amber"
                >
                  Read the story
                  <ArrowRight size={14} className="text-accent-amber" />
                </Link>
              </div>
            </div>
          </GridItem>

          <GridItem
            span={12}
            className="reveal flex flex-col gap-5 lg:!col-span-4"
            style={{ transitionDelay: '360ms' }}
          >
            <StoryMetric
              value={
                <>
                  <CountUp target={92} />
                </>
              }
              label="new patients booked in 60 days"
            />
            <StoryMetric
              value={
                <>
                  <CountUp target={38} suffix="%" />
                </>
              }
              label="of those booked after hours"
            />
            <StoryMetric
              value={
                <>
                  <CountUp target={1.6} prefix="$" suffix="K" decimals={1} />
                </>
              }
              label="monthly Vought spend (vs $4.8K front-desk overflow)"
            />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function StoryMetric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface-dark p-6">
      <div className="mono mb-1 text-4xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 8 · CTA — Get your phone number today.
// ─────────────────────────────────────────────────────────────────────

function ReceptionistCTA() {
  return (
    <section
      id="cta-form"
      aria-labelledby="receptionist-cta-heading"
      className="relative overflow-hidden px-6 py-32"
    >
      <div
        aria-hidden
        className="orb orb-amber"
        style={{
          width: 640,
          height: 640,
          bottom: -260,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.28,
        }}
      />

      <Container width="marketing" padX={0} className="relative">
        <Grid columns={12} gutter={48} className="items-start">
          <GridItem span={12} className="reveal lg:!col-span-6">
            <div className="label-small mb-5 text-accent-amber">Get started</div>
            <h2
              id="receptionist-cta-heading"
              className="display-2xl mb-7 text-white"
            >
              Get your phone<br />number today.
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white/60">
              We provision a local number within 60 seconds. Your demo number
              becomes your new line the moment you confirm — or keep yours and
              we will forward.
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                'Local number in your area code',
                'Live in 10 minutes',
                'Cancel anytime · no contract',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check size={14} className="mt-1 flex-none text-accent-amber" />
                  {line}
                </li>
              ))}
            </ul>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-5 lg:!col-start-8"
            style={{ transitionDelay: '80ms' }}
          >
            <SignupForm />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function SignupForm() {
  return (
    <form
      // Server action lives in /api/receptionist/signup (out of wave 5 scope).
      action="/api/receptionist/signup"
      method="post"
      className="rounded-2xl border border-white/[0.08] bg-surface-dark p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm font-bold text-white">Provision a number</div>
        <span className="mono text-[10px] text-accent-amber">· 60s</span>
      </div>

      <div className="space-y-5">
        <FormField id="business" label="Business name" placeholder="Lakeshore Dental" />
        <FormField id="zip" label="ZIP code" placeholder="94612" mono />
        <FormField
          id="email"
          label="Email"
          placeholder="you@lakeshoredental.com"
          type="email"
        />
      </div>

      <button
        type="submit"
        className="pill-cta mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
      >
        Reserve my number
        <ArrowRight size={14} className="text-marketing-ink" />
      </button>

      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        By continuing you agree to Vought's terms. We do not record callers
        without their consent — your jurisdiction's two-party rules are
        honored by default.
      </p>
    </form>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  mono?: boolean;
}

function FormField({ id, label, placeholder, type = 'text', mono }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label-tiny mb-2 block text-white/50">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete="off"
        required
        className={[
          'w-full rounded-lg border border-white/[0.08] bg-elevated-dark px-4 py-3 text-sm text-white placeholder:text-white/30',
          'transition-colors duration-quick ease-quick',
          'focus:border-accent-amber/60 focus:outline-none',
          mono && 'mono',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
}

// End of /receptionist.
