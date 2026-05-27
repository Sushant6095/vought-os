/**
 * /copilot · Vought Copilot product page
 *
 * Wave 5 build. Per VOUGHT-DESIGN-BLUEPRINT.md §4.1 (/copilot) and
 * §7. The page is composed inline (no new marketing components added
 * to the shared library — this is a single-page surface). It reuses
 * existing primitives from @vought/ui, motion patterns from
 * @vought/motion, the global .reveal observer wired by MarketingRoot,
 * and the brand utility classes from globals.css.
 *
 * Sections (per blueprint, hackathon-trimmed):
 *   1. Hero — "The whisper that closes."
 *   2. Use case strip — 4 cards
 *   3. The five-step loop — vertical (no scroll-jack)
 *   4. Voice clone deep-dive — 60-second demo block
 *   5. Playbook RAG — PDF → chunks → context
 *   6. Integration logos — hover expands
 *   7. Customer quotes — TripleByte + two
 *   8. Pricing pointer + CTA — $99/seat/mo
 *
 * Brand rules honored:
 *   - Numbers in mono with "· 412ms" callsign treatment
 *   - One accent (amber), live state in emerald only
 *   - No "AI-powered" / "supercharge" / "10x" / generic spinners
 *   - Single CTA per logical block, declarative copy
 *   - Hex/rgba already used by existing marketing components are
 *     mirrored here for cohesion; tokens live in design-system.
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
  Brain,
  Doc,
  Bars,
  Headphones,
  Play,
} from '@/components/ui/Icon';
import { CountUp } from '@/components/ui/CountUp';
import { WordStream, ThinkingDots, bloomCss } from '@vought/motion';

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export function generateMetadata(): Metadata {
  return {
    title: 'Vought Copilot · The whisper that closes.',
    description:
      'Real-time whisper coaching for revenue teams. Vought hears the call, finds the line, and whispers it in your own cloned voice — in 412ms.',
    alternates: { canonical: 'https://vought.com/copilot' },
    openGraph: {
      title: 'Vought Copilot · The whisper that closes.',
      description:
        'Real-time whisper coaching for sales, support, and negotiation. In your own cloned voice, under one second.',
      url: 'https://vought.com/copilot',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought Copilot · The whisper that closes.',
      description: 'Real-time whisper coaching for sales, support, and negotiation. In your own cloned voice, under one second.',
    },
  };
}

// Scoped keyframe + integration-card hover expand (CSS only — keeps
// the page tree fully server-rendered).
const COPILOT_PAGE_STYLES = `
  @keyframes vought-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .integration-card {
    min-height: 110px;
    transition:
      background-color var(--motion-standard) var(--easing-cinematic),
      min-height var(--motion-standard) var(--easing-cinematic);
  }
  .integration-card:hover {
    min-height: 210px;
  }
  .integration-card__blurb {
    opacity: 0;
    transform: translateY(4px);
    transition:
      opacity var(--motion-standard) var(--easing-cinematic),
      transform var(--motion-standard) var(--easing-cinematic);
    transition-delay: 80ms;
  }
  .integration-card:hover .integration-card__blurb {
    opacity: 1;
    transform: translateY(0);
  }
  .integration-card__hint {
    opacity: 1;
    transition: opacity var(--motion-quick) var(--easing-quick);
  }
  .integration-card:hover .integration-card__hint {
    opacity: 0;
  }
  .integration-card__label {
    transition: color var(--motion-quick) var(--easing-quick);
  }
  .integration-card:hover .integration-card__label {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const COPILOT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Vought Copilot',
  description: 'Real-time whisper coaching for revenue teams. In your own cloned voice. Sub-second latency.',
  url: 'https://vought.com/copilot',
  brand: { '@type': 'Brand', name: 'Vought' },
  offers: {
    '@type': 'Offer',
    price: '99',
    priceCurrency: 'USD',
    priceSpecification: { '@type': 'UnitPriceSpecification', priceType: 'https://schema.org/SRP', unitText: 'seat/month' },
    url: 'https://vought.com/pricing',
    availability: 'https://schema.org/InStock',
  },
};

export default function CopilotPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(COPILOT_SCHEMA) }}
      />
      <style>{bloomCss}</style>
      <style>{COPILOT_PAGE_STYLES}</style>
      <CopilotHero />
      <UseCaseStrip />
      <FiveStepLoop />
      <VoiceCloneDeepDive />
      <PlaybookRag />
      <IntegrationLogos />
      <CopilotQuotes />
      <PricingPointer />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 1 · Hero — "The whisper that closes."
// ─────────────────────────────────────────────────────────────────────

function CopilotHero() {
  return (
    <section
      aria-labelledby="copilot-hero-heading"
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
                  Copilot · for revenue teams
                </span>
              </div>

              <h1
                id="copilot-hero-heading"
                className="reveal display-3xl mb-7 text-white"
                style={{ transitionDelay: '80ms' }}
              >
                The whisper<br />that closes.
              </h1>

              <p
                className="reveal mb-10 max-w-xl text-xl leading-relaxed text-white/60"
                style={{ transitionDelay: '240ms' }}
              >
                Real-time whisper coaching for sales, support, and negotiation.
                Vought hears the call, finds the line your top closer would
                have said, whispers it in your own voice — under one second,
                from your AirPods or desktop.
              </p>

              <div
                className="reveal mb-12 flex flex-wrap items-center gap-4"
                style={{ transitionDelay: '360ms' }}
              >
                <Link
                  href="/demo"
                  className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
                >
                  Book a demo
                  <ArrowRight size={14} className="text-marketing-ink" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    <Play size={10} className="text-white" />
                  </span>
                  Watch a 90-second tour
                </Link>
              </div>

              <div
                className="reveal flex flex-wrap items-center gap-10 text-xs text-white/40"
                style={{ transitionDelay: '640ms' }}
              >
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={73} suffix="%" />
                  </div>
                  <div>suggestion acceptance</div>
                </div>
                <div aria-hidden className="h-12 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={2.4} suffix="×" decimals={1} />
                  </div>
                  <div>deal velocity vs control</div>
                </div>
                <div aria-hidden className="h-12 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-3xl font-medium text-white">
                    <CountUp target={412} suffix="ms" />
                  </div>
                  <div>whisper latency</div>
                </div>
              </div>
            </Stack>
          </GridItem>

          {/* Right column — live Copilot preview */}
          <GridItem span={12} className="relative lg:!col-span-4 lg:!col-start-9">
            <CopilotLivePreview />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function CopilotLivePreview() {
  return (
    <div className="relative">
      <div
        className="float-anim relative"
        style={{ transformOrigin: 'center' }}
      >
        <div className="absolute -left-3 -top-5 z-raised">
          <div className="pulse-amber inline-flex items-center gap-2 rounded-full bg-accent-amber px-4 py-1.5 text-marketing-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-marketing-ink" />
            <span className="label-tiny text-marketing-ink">Whispering</span>
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/[0.08] bg-surface-dark p-5"
          style={{
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="label-tiny text-white/40">Discovery · 09:21</div>
            <span className="mono text-[10px] text-accent-amber">· 388ms</span>
          </div>

          <div className="label-tiny mb-1.5 text-white/40">They just said</div>
          <p className="mb-4 text-xs italic leading-relaxed text-white/50">
            “…honestly, our reps love the rep we have now. Why switch?”
          </p>

          <div className="bloom mb-4 rounded-xl bg-accent-amber p-4">
            <div className="label-tiny mb-2 text-marketing-ink/60">Say next</div>
            <p className="mb-2 text-base font-semibold leading-snug text-marketing-ink">
              “Totally — and that loyalty is the asset. What is the one thing
              your reps wish your current system did for them?”
            </p>
            <p className="text-[10px] text-marketing-ink/50">
              → then: pivot to workflow pain
            </p>
          </div>

          <div className="mb-3 flex items-center justify-between text-[10px] text-white/40">
            <span>Playbook · Loyalty objection v2</span>
            <span className="text-live-emerald">accepted</span>
          </div>

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

        <div
          className="absolute -bottom-8 -right-6 w-44 rounded-xl border border-white/[0.08] bg-elevated-dark p-3 shadow-xl"
          style={{ transform: 'rotate(-2deg)' }}
        >
          <div className="label-tiny mb-1 text-white/40">Buying signal</div>
          <div className="mb-1 text-xs font-semibold text-white">
            ↑ rep mentioned “wish”
          </div>
          <div className="text-[10px] text-white/40">Opens workflow pain</div>
        </div>
      </div>
    </div>
  );
}

const WAVE_BARS: { height: number; amber: string }[] = [
  { height: 30, amber: 'rgba(51, 88, 255,0.6)' },
  { height: 60, amber: 'rgba(51, 88, 255,0.8)' },
  { height: 90, amber: 'rgba(51, 88, 255,1)' },
  { height: 70, amber: 'rgba(51, 88, 255,1)' },
  { height: 100, amber: 'rgba(51, 88, 255,1)' },
  { height: 60, amber: 'rgba(51, 88, 255,1)' },
  { height: 80, amber: 'rgba(51, 88, 255,0.8)' },
  { height: 50, amber: 'rgba(51, 88, 255,0.6)' },
  { height: 40, amber: 'rgba(51, 88, 255,0.4)' },
  { height: 30, amber: 'rgba(51, 88, 255,0.3)' },
  { height: 55, amber: 'rgba(51, 88, 255,0.5)' },
  { height: 75, amber: 'rgba(51, 88, 255,0.7)' },
  { height: 90, amber: 'rgba(51, 88, 255,1)' },
  { height: 65, amber: 'rgba(51, 88, 255,0.8)' },
  { height: 45, amber: 'rgba(51, 88, 255,0.6)' },
];

// ─────────────────────────────────────────────────────────────────────
// 2 · Use case strip — 4 cards (Sales discovery / Objection / Support
//     de-escalation / Negotiation). Each clickable to its anchor.
// ─────────────────────────────────────────────────────────────────────

interface UseCase {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  metric: { value: ReactNode; label: string };
  delayMs: number;
}

const USE_CASES: UseCase[] = [
  {
    id: 'sales',
    eyebrow: 'Sales',
    title: 'Discovery',
    body:
      'Open the question that opens the deal. Vought hears the gap and whispers the follow-up your best AE would have asked.',
    metric: { value: <CountUp target={31} suffix="%" />, label: 'deeper qualification' },
    delayMs: 0,
  },
  {
    id: 'objection',
    eyebrow: 'Sales',
    title: 'Objection handling',
    body:
      'Pricing, timing, competitor, status quo. Vought matches the objection to the playbook line that closed the last twenty.',
    metric: { value: <CountUp target={2.4} suffix="×" decimals={1} />, label: 'close on objections' },
    delayMs: 80,
  },
  {
    id: 'support',
    eyebrow: 'Support',
    title: 'Customer de-escalation',
    body:
      'When tone turns. Vought hears the sentiment shift and whispers the acknowledgement that lowers the temperature.',
    metric: { value: <CountUp target={42} suffix="%" />, label: 'first-call resolution' },
    delayMs: 240,
  },
  {
    id: 'negotiation',
    eyebrow: 'Revenue',
    title: 'Negotiation',
    body:
      'Held lines. Vought tracks the give-and-get in real time and whispers the trade that protects margin.',
    metric: { value: <CountUp target={6.8} suffix="%" decimals={1} />, label: 'higher ACV' },
    delayMs: 360,
  },
];

function UseCaseStrip() {
  return (
    <section
      aria-labelledby="usecase-heading"
      className="px-6 py-24"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-12">
          <div className="label-small mb-5 text-accent-amber">Where Copilot runs</div>
          <h2
            id="usecase-heading"
            className="display-lg max-w-2xl text-white"
          >
            Four motions. One whisper.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <Link
              key={u.id}
              href={`#${u.id}`}
              className="reveal group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark p-7 transition-colors duration-quick ease-quick hover:border-accent-amber/40"
              style={{ transitionDelay: `${u.delayMs}ms` }}
            >
              <div className="label-tiny mb-3 text-white/40">{u.eyebrow}</div>
              <h3 className="mb-3 text-xl font-bold text-white">{u.title}</h3>
              <p className="mb-7 text-sm leading-relaxed text-white/60">
                {u.body}
              </p>
              <div className="mb-1 mono text-2xl font-bold text-white">
                {u.metric.value}
              </div>
              <div className="text-[11px] text-white/50">{u.metric.label}</div>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent-amber transition-all duration-quick ease-quick group-hover:gap-2.5">
                See it run
                <ArrowRight size={12} className="text-accent-amber" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3 · The five-step loop — vertical cards (no scroll-jack)
// ─────────────────────────────────────────────────────────────────────

interface LoopStep {
  num: string;
  title: string;
  body: string;
  duration: string;
  icon: ReactNode;
  mini: ReactNode;
}

const LOOP_STEPS: LoopStep[] = [
  {
    num: '01',
    title: 'They talk.',
    body:
      'The other side speaks. The speaker timeline lights azure. Nothing is whispered yet — the room has the floor.',
    duration: '· 0ms',
    icon: <Mic size={20} className="text-white" />,
    mini: <MiniSpeakerTimeline active="them" />,
  },
  {
    num: '02',
    title: 'We listen.',
    body:
      'ElevenLabs STT word-streams the transcript as the sentence forms. Tokens arrive in your column at 60ms intervals.',
    duration: '· 60ms / token',
    icon: <Waves size={20} className="text-white" color="currentColor" />,
    mini: <MiniWordStream />,
  },
  {
    num: '03',
    title: 'We separate.',
    body:
      'Diart isolates their voice from yours in real time. Two labeled streams. No bleed. Built on pyannote-audio.',
    duration: '· 80ms',
    icon: <Bars size={20} className="text-white" color="currentColor" />,
    mini: <MiniDiarization />,
  },
  {
    num: '04',
    title: 'We think.',
    body:
      'The amber dot turns to thinking dots. The LLM streams a candidate line against your playbook RAG and tone profile.',
    duration: '· 220ms',
    icon: <Brain size={20} className="text-white" color="currentColor" />,
    mini: <MiniThinking />,
  },
  {
    num: '05',
    title: 'We whisper.',
    body:
      'ElevenLabs TTS renders the line in your own cloned voice. It blooms onto the card and into your earbud.',
    duration: '· 412ms',
    icon: <Headphones size={20} className="text-white" />,
    mini: <MiniWhisperBloom />,
  },
];

function FiveStepLoop() {
  return (
    <section
      aria-labelledby="loop-heading"
      className="px-6 py-28"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mx-auto mb-20 max-w-2xl text-center">
          <div className="label-small mb-5 text-accent-amber">The five-step loop</div>
          <h2
            id="loop-heading"
            className="display-xl mb-5 text-white"
          >
            From their sentence<br />to your whisper.
          </h2>
          <p
            className="text-lg leading-relaxed text-white/60"
            style={{ transitionDelay: '80ms' }}
          >
            One loop. Five jobs. Under half a second from the last word of
            their question to the first word in your ear.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-5">
          {LOOP_STEPS.map((step, i) => (
            <article
              key={step.num}
              className="reveal relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <Grid columns={12} gutter={0} className="items-stretch">
                <GridItem span={12} className="border-b border-white/5 p-8 md:!col-span-7 md:border-b-0 md:border-r">
                  <div className="mb-5 flex items-center gap-4">
                    <span className="mono text-xs text-white/30">{step.num}</span>
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-white/10"
                    />
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
                <GridItem span={12} className="bg-elevated-dark/60 p-8 md:!col-span-5">
                  {step.mini}
                </GridItem>
              </Grid>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Mini diagrams (kept lightweight — no canvas, no images) ────────

function MiniSpeakerTimeline({ active }: { active: 'them' | 'you' }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">Speaker timeline</div>
      <div className="flex h-9 items-end gap-px overflow-hidden rounded-md">
        <div
          className={`h-full ${active === 'them' ? 'bg-info-azure' : 'bg-info-azure/40'}`}
          style={{ width: '34%' }}
        />
        <div className="h-full" style={{ width: '2%' }} />
        <div className="h-full bg-info-azure/60" style={{ width: '12%' }} />
        <div className="h-full" style={{ width: '2%' }} />
        <div className="h-full bg-accent-amber/30" style={{ width: '18%' }} />
        <div className="h-full" style={{ width: '2%' }} />
        <div className="h-full bg-info-azure/80" style={{ width: '30%' }} />
      </div>
      <div className="mono mt-2 flex justify-between text-[10px] text-white/30">
        <span>−60s</span>
        <span>now</span>
      </div>
    </div>
  );
}

function MiniWordStream() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">06:12 · Jenna</div>
      <div className="text-sm text-white/70">
        <WordStream
          text={[
            '“…honestly, ',
            'our ',
            'reps ',
            'love ',
            'the ',
            'rep ',
            'we ',
            'have ',
            'now.”',
          ]}
          staggerMs={80}
          durationMs={120}
        />
      </div>
    </div>
  );
}

function MiniDiarization() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div>
        <div className="label-tiny mb-1.5 text-info-azure">Speaker · them</div>
        <div className="flex h-6 items-end gap-0.5">
          {[40, 70, 55, 80, 60, 90, 50, 35, 60, 75, 45, 30].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded"
              style={{
                height: `${h}%`,
                background: 'rgba(91, 143, 249, 0.7)',
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="label-tiny mb-1.5 text-accent-amber">Speaker · you</div>
        <div className="flex h-6 items-end gap-0.5">
          {[20, 28, 22, 30, 18, 24, 26, 32, 20, 18, 24, 22].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded"
              style={{
                height: `${h}%`,
                background: 'rgba(51, 88, 255, 0.35)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniThinking() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="label-tiny mb-3 text-white/40">Composing whisper</div>
      <div className="inline-flex items-center gap-2">
        <span className="label-tiny text-accent-amber">Thinking</span>
        <ThinkingDots />
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="h-1.5 w-32 rounded bg-white/10" />
        <div className="h-1.5 w-44 rounded bg-white/10" />
        <div className="h-1.5 w-28 rounded bg-white/5" />
      </div>
    </div>
  );
}

function MiniWhisperBloom() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="bloom rounded-xl bg-accent-amber p-4">
        <div className="label-tiny mb-2 text-marketing-ink/60">Say next</div>
        <p className="text-sm font-semibold leading-snug text-marketing-ink">
          “Totally — that loyalty is the asset. What is the one thing your
          reps wish your current system did?”
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-marketing-ink/50">
          <span>In your voice</span>
          <span className="font-bold">· 412ms</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4 · Voice clone deep-dive — 60-second static demo block
// ─────────────────────────────────────────────────────────────────────

function VoiceCloneDeepDive() {
  return (
    <section
      aria-labelledby="voice-clone-heading"
      className="relative px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={48} className="items-center">
          <GridItem span={12} className="reveal lg:!col-span-5">
            <div className="label-small mb-5 text-accent-amber">Voice clone</div>
            <h2
              id="voice-clone-heading"
              className="display-xl mb-7 text-white"
            >
              In your voice.<br />Not a stranger’s.
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white/60">
              Read one passage. Sixty seconds. Vought clones the prosody,
              the pace, the breath of your voice and uses it as the whisper
              channel — so the line in your ear sounds like a thought, not
              a robot.
            </p>
            <ul className="mb-10 space-y-3 text-sm text-white/70">
              {[
                'One 60-second passage. Clone in under 90 seconds.',
                'You own your clone. Delete in one click, server-wiped.',
                'Voiceprint stays in your tenant. No cross-customer model.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check size={14} className="mt-1 flex-none text-accent-amber" />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/demo"
              className="pill-cta inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
            >
              Clone your voice on a demo
              <ArrowRight size={14} className="text-marketing-ink" />
            </Link>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-6 lg:!col-start-7"
            style={{ transitionDelay: '80ms' }}
          >
            <VoiceCloneCard />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function VoiceCloneCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark p-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="pulse-amber h-1.5 w-1.5 rounded-full bg-accent-amber" />
          <span className="label-tiny text-white/60">Recording · passage 1 / 1</span>
        </div>
        <span className="mono text-[11px] text-white/50">00:42 / 01:00</span>
      </div>

      <div className="mb-7 rounded-xl border border-white/[0.06] bg-elevated-dark p-5">
        <div className="label-tiny mb-2 text-white/40">Read aloud</div>
        <p className="text-base leading-relaxed text-white/80">
          “The lighthouse keeper paused. The fog had thickened, the harbor
          was quiet, and somewhere out past the rocks a single bell rang,
          steady, unhurried, as if it had nowhere else to be.”
        </p>
      </div>

      {/* Waveform */}
      <div className="mb-6">
        <div className="label-tiny mb-3 text-white/40">Waveform · you</div>
        <div className="flex h-14 items-end gap-0.5">
          {WAVE_BARS_LONG.map((h, i) => (
            <span
              key={i}
              className="wave-bar w-1 rounded"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 60}ms`,
                background:
                  i < 28
                    ? 'rgba(51, 88, 255,0.9)'
                    : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
        <div>
          <div className="label-tiny mb-1 text-white/40">Quality</div>
          <div className="text-sm font-bold text-live-emerald">Studio</div>
        </div>
        <div>
          <div className="label-tiny mb-1 text-white/40">Sample rate</div>
          <div className="mono text-sm text-white">48 kHz</div>
        </div>
        <div>
          <div className="label-tiny mb-1 text-white/40">Clone time</div>
          <div className="mono text-sm text-white">· 78s</div>
        </div>
      </div>
    </div>
  );
}

const WAVE_BARS_LONG = [
  20, 35, 55, 70, 85, 95, 100, 88, 70, 55, 60, 78, 90, 95, 80, 65,
  55, 70, 85, 95, 90, 78, 60, 50, 65, 80, 92, 88,
  18, 14, 10, 12, 16, 14, 10, 12, 14, 12, 10, 8,
];

// ─────────────────────────────────────────────────────────────────────
// 5 · Playbook RAG — PDF → chunks → suggestion
// ─────────────────────────────────────────────────────────────────────

function PlaybookRag() {
  return (
    <section
      aria-labelledby="playbook-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mx-auto mb-16 max-w-3xl text-center">
          <div className="label-small mb-5 text-accent-amber">Playbook RAG</div>
          <h2
            id="playbook-heading"
            className="display-xl mb-5 text-white"
          >
            Your top closer’s lines.<br />Every rep’s mouth.
          </h2>
          <p
            className="text-lg leading-relaxed text-white/60"
            style={{ transitionDelay: '80ms' }}
          >
            Upload the playbook your manager wrote at 2am after the last QBR.
            Vought chunks it, indexes it, and quotes from it live — so every
            rep on the team sounds like the one rep who already gets it.
          </p>
        </div>

        <Grid columns={12} gutter={24}>
          <GridItem span={12} className="reveal md:!col-span-4">
            <RagPipelineCard
              step="01"
              title="The PDF"
              icon={<Doc size={20} className="text-white" color="currentColor" />}
              body={
                <div className="space-y-2">
                  {PLAYBOOK_PAGES.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border border-white/5 bg-elevated-dark px-3 py-2 text-[11px] text-white/60"
                    >
                      <span className="mono text-white/30">{p.page}</span>
                      <span className="truncate">{p.title}</span>
                    </div>
                  ))}
                </div>
              }
              meta="240 pages · 1.4 MB"
            />
          </GridItem>

          <GridItem
            span={12}
            className="reveal md:!col-span-4"
            style={{ transitionDelay: '80ms' }}
          >
            <RagPipelineCard
              step="02"
              title="The chunks"
              icon={<Bars size={20} className="text-white" color="currentColor" />}
              body={
                <div className="space-y-1.5">
                  {CHUNKS.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md bg-elevated-dark px-3 py-2"
                      style={{
                        borderLeft:
                          i === 2 ? '2px solid #3358ff' : '2px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span className="mono text-[10px] text-white/30">
                        {c.id}
                      </span>
                      <span
                        className={`truncate text-[11px] ${i === 2 ? 'text-accent-amber' : 'text-white/50'}`}
                      >
                        {c.snippet}
                      </span>
                    </div>
                  ))}
                </div>
              }
              meta="1,840 chunks · pgvector"
            />
          </GridItem>

          <GridItem
            span={12}
            className="reveal md:!col-span-4"
            style={{ transitionDelay: '240ms' }}
          >
            <RagPipelineCard
              step="03"
              title="The whisper"
              icon={<Headphones size={20} className="text-white" />}
              body={
                <div className="bloom rounded-xl bg-accent-amber p-4">
                  <div className="label-tiny mb-2 text-marketing-ink/60">Say next</div>
                  <p className="text-sm font-semibold leading-snug text-marketing-ink">
                    “Most teams we work with already pay for the system —
                    what they bought was the logging, not the closing. Where
                    is that costing you today?”
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-marketing-ink/50">
                    <span>Quoting · CH-1142</span>
                    <span className="font-bold">· 412ms</span>
                  </div>
                </div>
              }
              meta="Cited · top-3 chunk match"
            />
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

const PLAYBOOK_PAGES = [
  { page: 'p. 12', title: 'Cold open · Q4 winners' },
  { page: 'p. 47', title: 'Salesforce stack objection' },
  { page: 'p. 88', title: 'Procurement timeline pushback' },
  { page: 'p. 161', title: 'Multi-thread the buyer' },
];

const CHUNKS = [
  { id: 'CH-0027', snippet: 'Open with the cost of the status quo, not the…' },
  { id: 'CH-0921', snippet: 'When they say “loyalty”, ask what the rep wishes…' },
  { id: 'CH-1142', snippet: 'Most teams we work with already pay for the…' },
  { id: 'CH-1538', snippet: 'Reframe budget as a question of timing, not size…' },
];

interface RagPipelineCardProps {
  step: string;
  title: string;
  icon: ReactNode;
  body: ReactNode;
  meta: string;
}

function RagPipelineCard({ step, title, icon, body, meta }: RagPipelineCardProps) {
  return (
    <article className="h-full rounded-2xl border border-white/[0.08] bg-surface-dark p-7">
      <div className="mb-5 flex items-center justify-between">
        <span className="mono text-xs text-white/30">{step}</span>
        <span className="label-tiny text-white/40">{meta}</span>
      </div>
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
        {icon}
      </div>
      <h3 className="mb-5 text-xl font-bold text-white">{title}</h3>
      <div>{body}</div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 6 · Integration logos — hover expands
// ─────────────────────────────────────────────────────────────────────

interface Integration {
  label: string;
  className: string;
  blurb: string;
  style?: React.CSSProperties;
}

const INTEGRATIONS: Integration[] = [
  {
    label: 'salesforce',
    className: 'text-2xl font-bold italic',
    blurb: 'Two-way sync. Opportunity context piped into every live call. Logging written back the second the call ends.',
  },
  {
    label: 'HUBSPOT',
    className: 'text-2xl font-black',
    style: { letterSpacing: '0.04em' },
    blurb: 'Deal stage, last touch, owner. Vought pulls context live; suggestions cite the most recent property changes.',
  },
  {
    label: 'zoom.',
    className: 'text-2xl font-black italic',
    blurb: 'Whisper layered on top of Zoom audio. Native Zoom App. Works on web, desktop, and Zoom Phone.',
  },
  {
    label: 'RingCentral',
    className: 'text-xl font-bold',
    style: { letterSpacing: '-0.01em' },
    blurb: 'Live coaching on every dialed call. SIP-level integration. No additional rep install.',
  },
  {
    label: 'aircall',
    className: 'text-xl font-extrabold',
    style: { letterSpacing: '-0.04em' },
    blurb: 'One-click connect. Power-dial cohorts pull through to the live screen with rep load distribution.',
  },
  {
    label: 'slack',
    className: 'text-2xl font-black italic',
    style: { letterSpacing: '-0.03em' },
    blurb: 'Coaching moments piped to the deal channel. Managers triage with one-click escalations.',
  },
  {
    label: 'Calendar',
    className: 'text-xl font-bold',
    blurb: 'Google + Microsoft. Meeting briefs land in the rep’s ear three minutes before the call.',
  },
];

function IntegrationLogos() {
  return (
    <section
      aria-labelledby="integrations-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-14 max-w-3xl">
          <div className="label-small mb-5 text-accent-amber">Integrations</div>
          <h2
            id="integrations-heading"
            className="display-lg text-white"
          >
            Plugs into the stack you already pay for.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {INTEGRATIONS.map((i, idx) => (
            <IntegrationCard key={i.label} integration={i} delayMs={idx * 60} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function IntegrationCard({
  integration,
  delayMs,
}: {
  integration: Integration;
  delayMs: number;
}) {
  const labelStyle: CSSProperties = {
    ...integration.style,
  };
  return (
    <div
      className="integration-card reveal group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark p-5 hover:bg-elevated-dark"
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div
        className={[
          'integration-card__label flex h-12 items-center justify-center text-white/40',
          integration.className,
        ].join(' ')}
        style={labelStyle}
      >
        {integration.label}
      </div>
      <p className="integration-card__blurb mt-4 text-[11px] leading-relaxed text-white/70">
        {integration.blurb}
      </p>
      <div className="integration-card__hint absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/30">
        hover for detail
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7 · Customer quotes — TripleByte + two stubs
// ─────────────────────────────────────────────────────────────────────

interface Quote {
  body: string;
  name: string;
  role: string;
  company: string;
  monoBadge: string;
  delayMs: number;
}

const QUOTES: Quote[] = [
  {
    body:
      '“Cresta lived on a screen. Vought lives in the AirPod. Our reps stopped reading prompts and started selling. Acceptance tripled in three weeks.”',
    name: 'Jenna Cole',
    role: 'VP RevOps',
    company: 'TripleByte',
    monoBadge: '{tripleByte}',
    delayMs: 0,
  },
  {
    body:
      '“The whisper is in my voice. My SDR has six weeks on the floor and sounds like she has two years. Nothing else got close.”',
    name: 'Marcus Devlin',
    role: 'Head of Sales',
    company: 'Cobalt',
    monoBadge: 'Cobalt.',
    delayMs: 80,
  },
  {
    body:
      '“We onboarded 38 reps in nine days. Every one of them ramped on the playbook the founder wrote — without ever opening the PDF.”',
    name: 'Priya Anand',
    role: 'Director, Revenue Enablement',
    company: 'Northwind',
    monoBadge: '▲ Northwind',
    delayMs: 240,
  },
];

function CopilotQuotes() {
  return (
    <section
      aria-labelledby="quotes-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal mb-16 text-center">
          <div className="label-small mb-5 text-accent-amber">From the floor</div>
          <h2
            id="quotes-heading"
            className="display-xl text-white"
          >
            What revenue leaders say.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {QUOTES.map((q) => (
            <article
              key={q.company}
              className="reveal flex flex-col rounded-2xl border border-white/[0.08] bg-surface-dark p-8"
              style={{ transitionDelay: `${q.delayMs}ms` }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="mono text-base text-white/40">{q.monoBadge}</div>
              </div>
              <blockquote className="mb-8 text-lg font-medium leading-snug text-white">
                {q.body}
              </blockquote>
              <div className="mt-auto flex items-center gap-3 border-t border-white/5 pt-5">
                <div aria-hidden className="h-10 w-10 rounded-full bg-white/10" />
                <div>
                  <div className="text-sm font-bold text-white">{q.name}</div>
                  <div className="text-[11px] text-white/50">
                    {q.role} · {q.company}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 8 · Pricing pointer + CTA
// ─────────────────────────────────────────────────────────────────────

function PricingPointer() {
  return (
    <section
      aria-labelledby="pricing-cta-heading"
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
        <div className="reveal mx-auto max-w-2xl text-center">
          <div className="label-small mb-5 text-accent-amber">Copilot pricing</div>
          <h2
            id="pricing-cta-heading"
            className="display-2xl mb-7 text-white"
          >
            $99 / seat / month.<br />Volume above 50 seats.
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-white/60">
            Includes Copilot, Insights, playbook RAG, manager dashboard, and
            every supported integration. Voice clone is included. No
            conversation rationing.
          </p>

          <div className="mb-12 grid grid-cols-3 gap-4 rounded-2xl border border-white/[0.08] bg-surface-dark p-6 text-left">
            <PricePill label="per seat / mo" value="$99" />
            <PricePill label="minutes / seat" value="∞" />
            <PricePill label="rollout" value="48h" />
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-4"
            style={{ transitionDelay: '80ms' }}
          >
            <Link
              href="/demo"
              className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
            >
              Book a demo
              <ArrowRight size={14} className="text-marketing-ink" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white transition-colors duration-quick ease-quick hover:border-white/30"
            >
              See full pricing
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PricePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-elevated-dark p-4">
      <div className="mono mb-1 text-3xl font-bold text-white">{value}</div>
      <div className="text-[11px] text-white/50">{label}</div>
    </div>
  );
}

// End of /copilot.
