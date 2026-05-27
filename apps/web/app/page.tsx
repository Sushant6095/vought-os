/**
 * apps/web · landing page (vought.com)
 *
 * Observe.ai-style direction: pure-black canvas, editorial serif display,
 * lime accent, bento-grid product surfaces. Self-contained — does not use
 * the older amber marketing components (those still serve the other routes).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero3D } from '@/components/fx/Hero3D';
import { SplitText } from '@/components/fx/SplitText';
// IntegrationsFlow is below-fold and carries Three.js + simple-icons.
// The lazy wrapper code-splits it so it does not land in the initial JS bundle.
import { IntegrationsFlowLazy as IntegrationsFlow } from '@/components/fx/IntegrationsFlowLazy';

export function generateMetadata(): Metadata {
  return {
    title: 'Vought · Intelligence for live conversations.',
    description:
      'Vought listens to your live conversations and whispers the next line in your ear — in your own cloned voice. Sub-second latency on ElevenLabs Speech Engine.',
    alternates: { canonical: 'https://vought.com/' },
    openGraph: {
      title: 'Vought · Intelligence for live conversations.',
      description:
        'Real-time voice intelligence for revenue teams and individuals. Whispers in your own cloned voice. Sub-second latency.',
      url: 'https://vought.com/',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought · Intelligence for live conversations.',
      description: 'Real-time voice intelligence for revenue teams and individuals. Whispers in your own cloned voice. Sub-second latency.',
    },
  };
}

export default function LandingPage() {
  return (
    <div className="text-white">
      <Hero />
      <LogoMarquee />
      <ComprehensionBento />
      <ActionBento />
      <IntegrationsSection />
      <OutcomesRow />
      <ReliabilityBento />
      <CoachingBento />
      <ClosingHero />
    </div>
  );
}

/* ─────────────────────────────────────────────  HERO  ── */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-44 text-center">
      <Hero3D />
      <div className="relative z-10 mx-auto max-w-[1000px]">
        <span className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
          <span className="ob-eyebrow !tracking-[0.18em] text-white/70">
            Agentic voice for live conversations
          </span>
        </span>

        <h1 className="ob-serif ob-h1 mx-auto max-w-[14ch] text-white">
          <SplitText text="Intelligence That Handles The Conversation" />{' '}
          <SplitText text="Live" className="ob-accent italic" />
        </h1>

        <p
          className="reveal mx-auto mt-8 max-w-[58ch] text-lg leading-relaxed text-white/60 md:text-xl"
          style={{ transitionDelay: '200ms' }}
        >
          Vought listens to your live calls, separates every speaker, and
          whispers the next line into your ear in real time — in your own
          cloned voice, in under a second.
        </p>

        <div
          className="reveal mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ transitionDelay: '320ms' }}
        >
          <Link href="/contact" className="ob-btn-lime px-8 py-4 text-[15px]">
            Get a demo
          </Link>
          <Link href="/copilot" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">
            Watch it work
          </Link>
        </div>
      </div>

      {/* Floating hero bento preview */}
      <div
        className="reveal relative z-10 mx-auto mt-16 grid max-w-[1100px] gap-4 px-2 md:grid-cols-[1.1fr_1fr_1fr]"
        style={{ transitionDelay: '440ms' }}
      >
        <PreviewWhisperCard />
        <PreviewSpeakerCard />
        <PreviewMetricCard />
      </div>
    </section>
  );
}

function PreviewWhisperCard() {
  return (
    <div className="ob-card ob-card-hover flex flex-col gap-4 p-6 text-left">
      <div className="flex items-center justify-between">
        <span className="ob-eyebrow">Live · 14:22</span>
        <span className="font-[var(--font-mono)] text-xs text-[var(--ob-lime)]">
          · 412ms
        </span>
      </div>
      <p className="text-sm italic leading-relaxed text-white/45">
        “We already pay for Salesforce — not sure we need another system.”
      </p>
      <div className="rounded-2xl p-4" style={{ background: 'var(--ob-blue)' }}>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
          Say next
        </div>
        <p className="text-[15px] font-semibold leading-snug text-white">
          “Totally hear you on stack fatigue. What do your reps actually spend
          their day doing inside Salesforce?”
        </p>
      </div>
      <Waveform />
    </div>
  );
}

function PreviewSpeakerCard() {
  return (
    <div className="ob-card ob-card-hover flex flex-col gap-4 p-6 text-left">
      <span className="ob-eyebrow">Speaker timeline</span>
      <div className="flex flex-col gap-3">
        {[
          { who: 'You', w: '38%', lime: true },
          { who: 'Prospect', w: '62%', lime: false },
          { who: 'You', w: '24%', lime: true },
          { who: 'Prospect', w: '70%', lime: false },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-white/45">{r.who}</span>
            <span
              className="h-2.5 rounded-full"
              style={{
                width: r.w,
                background: r.lime ? 'var(--ob-lime)' : 'rgba(255,255,255,0.22)',
              }}
            />
          </div>
        ))}
      </div>
      <p className="mt-auto text-sm leading-relaxed text-white/45">
        Real-time diarization on a single mic — Vought always knows who is
        speaking before it speaks.
      </p>
    </div>
  );
}

function PreviewMetricCard() {
  return (
    <div className="ob-card flex flex-col justify-between gap-4 p-6 text-left">
      <span className="ob-eyebrow">This quarter</span>
      <div>
        <div className="ob-serif text-[72px] leading-none text-white">73%</div>
        <p className="mt-2 text-sm text-white/45">of whispers accepted on the call</p>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        <Stat value="$2.3B" label="revenue influenced" />
        <Stat value="412ms" label="median latency" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-[var(--font-mono)] text-lg text-white">{value}</div>
      <div className="text-[11px] text-white/40">{label}</div>
    </div>
  );
}

function Waveform({ accent = false }: { accent?: boolean }) {
  const bars = [30, 55, 80, 60, 95, 70, 100, 65, 45, 75, 90, 50, 70, 85, 40];
  return (
    <div className="flex h-8 items-center gap-1" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className="ob-wave-bar w-1 rounded-full"
          style={{
            height: `${h}%`,
            animationDelay: `${i * 80}ms`,
            background: accent ? 'var(--ob-lime)' : 'rgba(255,255,255,0.5)',
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────  LOGOS  ── */

function LogoMarquee() {
  const logos = ['acme', 'PARALLEL', 'Cobalt.', '▲ Northwind', '{tripleByte}', 'runway', 'Helio', 'Vantage'];
  const row = [...logos, ...logos];
  return (
    <section className="border-y border-white/5 py-12">
      <p className="ob-eyebrow mb-8 text-center">Trusted by the teams scaling fastest</p>
      <div className="relative overflow-hidden">
        <div className="ob-marquee flex w-max items-center gap-16 whitespace-nowrap">
          {row.map((l, i) => (
            <span key={i} className="text-xl font-semibold text-white/30">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────  COMPREHENSION  ── */

function ComprehensionBento() {
  return (
    <Section eyebrow="Understand" title={<>Comprehension built for the <span className="ob-accent italic">real world</span></>}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ob-card ob-card-hover flex flex-col gap-6 p-8">
          <div className="ob-card-3 flex items-center gap-4 rounded-2xl p-5" style={{ background: 'var(--ob-card-3)' }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">▶</span>
            <Waveform />
          </div>
          <div>
            <h3 className="ob-serif ob-h3 ob-accent mb-3">Hears the messy call</h3>
            <p className="max-w-md leading-relaxed text-white/55">
              Capture intent, entities, and meaning from noisy, multi-speaker
              conversations with interruptions, overtalk, and imperfect audio.
            </p>
          </div>
        </div>

        <div className="ob-card ob-card-hover flex flex-col gap-6 p-8">
          <h3 className="ob-serif ob-h3 ob-accent">Follows every step, every time</h3>
          <p className="max-w-md leading-relaxed text-white/55">
            Enforce the playbook — discovery, objection handling, compliance
            disclosures — through structured, auditable suggestion flow.
          </p>
          <div className="rounded-2xl border border-white/8 p-5" style={{ background: 'var(--ob-card-3)' }}>
            <div className="mb-3 text-sm">
              <span className="ob-accent font-semibold">Playbook</span>
              <span className="text-white/45"> · Salesforce objection v3</span>
            </div>
            <ol className="space-y-2 text-sm text-white/55">
              <li>1. Acknowledge the stack-fatigue concern</li>
              <li>2. Reframe around daily rep workflow</li>
              <li className="text-white/30">3. Surface the logging pain point</li>
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────────────────────────  ACTION  ── */

function ActionBento() {
  const metrics = [
    { label: 'Latency', value: '412ms' },
    { label: 'Accept rate', value: '73%' },
    { label: 'Interrupt cancel', value: '<200ms' },
    { label: 'Calls coached', value: '225.9k' },
    { label: 'Containment', value: '82%' },
    { label: 'CSAT lift', value: '+18%' },
  ];
  return (
    <Section eyebrow="Act" title={<>Take action, <span className="ob-accent italic">deliver outcomes</span></>}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ob-card flex flex-col gap-6 p-8">
          <p className="leading-relaxed text-white/55">
            Vought routes the live transcript through the persona, the playbook,
            and memory — then streams the line back before the moment passes.
          </p>
          <div className="flex flex-col items-center gap-3">
            <FlowNode label="Hear the turn" tag="LIVE PCM" />
            <Arrow />
            <FlowNode label="Assemble + retrieve" tag="PERSONA · RAG" />
            <Arrow />
            <FlowNode label="Whisper the line" tag="CLONED VOICE" accent />
          </div>
        </div>

        <div className="ob-card p-8">
          <h3 className="ob-serif ob-h3 ob-accent mb-2">Evaluate every interaction</h3>
          <p className="mb-6 leading-relaxed text-white/55">
            Verify latency, acceptance, and step adherence on every single call
            with built-in evaluation.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/8 p-4" style={{ background: 'var(--ob-card-3)' }}>
                <div className="mb-1 text-[11px] text-white/40">{m.label}</div>
                <div className="font-[var(--font-mono)] text-xl text-white">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function FlowNode({ label, tag, accent }: { label: string; tag: string; accent?: boolean }) {
  return (
    <div
      className="flex w-full max-w-sm items-center justify-between rounded-2xl border px-5 py-4"
      style={{
        background: 'var(--ob-card-3)',
        borderColor: accent ? 'var(--ob-lime)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <span className="font-medium text-white">{label}</span>
      <span
        className="rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.12em]"
        style={{
          background: accent ? 'var(--ob-blue)' : 'rgba(255,255,255,0.06)',
          color: accent ? '#fff' : 'rgba(255,255,255,0.5)',
        }}
      >
        {tag}
      </span>
    </div>
  );
}

function Arrow() {
  return <span className="text-white/25">↓</span>;
}

/* ───────────────────────────────────────  INTEGRATIONS  ── */

function IntegrationsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="reveal mb-4 text-center">
          <p className="ob-eyebrow mb-4">Integrations</p>
          <h2 className="ob-serif ob-h2 mx-auto max-w-[18ch] text-white">
            Plugs into the stack you <span className="ob-accent italic">already run</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-lg leading-relaxed text-white/55">
            Vought sits between your telephony and your systems of record —
            listening on the line, whispering through your CRM, and rendering
            every word on the ElevenLabs Speech Engine.
          </p>
        </div>
        <div className="reveal" style={{ transitionDelay: '120ms' }}>
          <IntegrationsFlow />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────  OUTCOMES  ── */

function OutcomesRow() {
  const cols = [
    {
      title: 'Close more, faster',
      body: 'Reps land the right line at the right moment, so more conversations convert and deal cycles compress.',
      icon: <IconFlow />,
    },
    {
      title: 'Return human capacity',
      body: 'Offload the script-following and note-taking so people focus on the parts of the call only they can do.',
      icon: <IconAgent />,
    },
    {
      title: 'Impact your bottom line',
      body: 'Automate high-volume inbound and enable proactive outreach to cut cost per interaction and lift revenue.',
      icon: <IconChart />,
    },
  ];
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
        {cols.map((c, i) => (
          <div
            key={c.title}
            className="reveal ob-card ob-card-hover flex flex-col gap-5 p-8"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span className="text-white/45">{c.icon}</span>
            <h3 className="ob-serif text-[30px] leading-tight text-white">{c.title}</h3>
            <p className="leading-relaxed text-white/55">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────  RELIABILITY  ── */

function ReliabilityBento() {
  return (
    <Section eyebrow="Trust" title={<>Reliable enough to use in front of a <span className="ob-accent italic">customer</span></>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <FeatureCard title="Voice-native accuracy" dim>
            Handles background noise, interruptions, and multiple speakers while
            still capturing intent and the critical data.
          </FeatureCard>
          <FeatureCard title="Enforced reliability">
            Monitors every interaction for failures, missed steps, and policy
            violations with guardrails that prevent drift.
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-[88%]" style={{ background: 'var(--ob-lime)' }} />
            </div>
          </FeatureCard>
          <FeatureCard title="Ensure compliance" dim>
            Operates within strict security and privacy standards — SOC 2, HIPAA,
            GDPR, and zero-retention by default.
          </FeatureCard>
        </div>

        <div className="ob-card p-8">
          <div className="mb-5 inline-flex rounded-full px-4 py-2 text-sm" style={{ background: 'var(--ob-card-3)' }}>
            <span className="ob-accent font-semibold">Task</span>
            <span className="text-white/55"> · Update account information</span>
          </div>
          <div className="mb-5 rounded-2xl border border-white/8 p-5" style={{ background: 'var(--ob-card-3)' }}>
            <p className="mb-3 text-sm">
              <span className="ob-accent font-semibold">Goal</span>
              <span className="text-white/70"> Help the caller update their record</span>
            </p>
            <ol className="space-y-2 text-sm text-white/55">
              <li>1. Confirm account number and trigger 2FA</li>
              <li>2. Verify via the authentication tool</li>
              <li>3. Capture the updated address or billing info</li>
              <li>4. Write the change back to the record</li>
            </ol>
          </div>
          <div className="space-y-4">
            <Meter label="Guardrail adherence" value="100%" />
            <Meter label="Caller satisfaction" value="100%" />
            <Meter label="Step completion" value="100%" />
          </div>
        </div>
      </div>
    </Section>
  );
}

function FeatureCard({ title, children, dim }: { title: string; children: React.ReactNode; dim?: boolean }) {
  return (
    <div className="ob-card ob-card-hover p-7">
      <h3 className={`ob-serif text-[26px] leading-tight ${dim ? 'text-white/70' : 'ob-accent'}`}>{title}</h3>
      <div className="mt-3 leading-relaxed text-white/55">{children}</div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-44 shrink-0 text-sm text-white">{label}</span>
      <span className="h-px flex-1" style={{ background: 'var(--ob-lime)' }} />
      <span className="font-[var(--font-mono)] text-sm ob-accent">{value}</span>
    </div>
  );
}

/* ───────────────────────────────────────────  COACH  ── */

function CoachingBento() {
  return (
    <Section eyebrow="Improve" title={<>Autonomous coaching <span className="ob-accent italic">at scale</span></>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="ob-card p-8">
          <div className="rounded-2xl border border-white/8 p-5" style={{ background: 'var(--ob-card-3)' }}>
            <div className="mb-3 text-center text-sm text-white/55">
              648 calls analyzed · 30 days
            </div>
            <div className="mb-4 text-center">
              <span className="ob-accent text-sm">Average score: 92%</span>
            </div>
            <div className="mb-4 flex h-20 items-end gap-1.5">
              {[40, 55, 35, 70, 50, 85, 60, 95, 75, 65, 90, 80].map((h, i) => (
                <span key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
            <div className="text-xs text-white/40">Coaching plan</div>
            <ul className="mt-2 space-y-1.5 text-sm text-white/60">
              <li>· Sharpen your opening and control the call early</li>
              <li>· Focus on what the customer is trying to solve</li>
            </ul>
          </div>
          <h3 className="ob-serif ob-h3 ob-accent mt-6">From data to coaching, automatically</h3>
        </div>

        <div className="ob-card p-8">
          <h3 className="ob-serif ob-h3 ob-accent mb-2">Insight to action, instantly</h3>
          <p className="mb-6 leading-relaxed text-white/55">
            Vought surfaces root causes and triggers the next step so teams
            resolve operational issues the moment they appear.
          </p>
          <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'var(--ob-card-3)' }}>
            <div className="mb-4"><Waveform accent /></div>
            <div className="grid grid-cols-3 gap-3">
              {['Coaching plan', 'Emerging trend', 'Procedure update'].map((t) => (
                <div key={t} className="rounded-xl border border-white/8 p-3 text-center text-xs ob-accent">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ────────────────────────────────────  CLOSING HERO  ── */

function ClosingHero() {
  const cards = [
    { title: 'Complete call coverage', body: 'Coach and evaluate every interaction instead of a 2% sample — consistent and objective.' },
    { title: 'Real-time behavior change', body: 'Surface the right move mid-call and trigger coaching the instant a pattern appears.' },
    { title: 'Autonomous pattern detection', body: 'Vought finds the root causes across thousands of calls so you act before they cost you.' },
  ];
  return (
    <section className="px-6 py-28 text-center">
      <p className="ob-eyebrow mb-6">Built for live conversation</p>
      <h2 className="ob-serif ob-h2 mx-auto max-w-[16ch] text-white">
        <SplitText text="Run live conversations at" />{' '}
        <SplitText text="full scale" className="ob-accent italic" />
      </h2>
      <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-white/55">
        Vought listens, separates, thinks, and whispers — so every call goes the
        way your best closer would have run it.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/contact" className="ob-btn-lime px-8 py-4 text-[15px]">
          Get a demo
        </Link>
        <Link href="/pricing" className="ob-btn-ghost px-8 py-4 text-[15px] font-medium">
          See pricing
        </Link>
      </div>

      <div className="mx-auto mt-16 grid max-w-[1100px] gap-4 text-left md:grid-cols-3">
        {cards.map((c, i) => (
          <div
            key={c.title}
            className="reveal ob-card ob-card-hover p-8"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <h3 className="ob-serif text-[28px] leading-tight text-white">{c.title}</h3>
            <p className="mt-3 leading-relaxed text-white/55">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────  SHARED  ── */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="reveal mb-12 max-w-[20ch]">
          <p className="ob-eyebrow mb-4">{eyebrow}</p>
          <h2 className="ob-serif ob-h2 text-white">{title}</h2>
        </div>
        <div className="reveal" style={{ transitionDelay: '120ms' }}>
          {children}
        </div>
      </div>
    </section>
  );
}

function IconFlow() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="4" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="16" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="26" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 10h4v11M18 31h4V20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconAgent() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M6 30l8-9 7 5 11-13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 13h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
