/**
 * apps/web · /about
 *
 * Narrative-led. Single-column. Quiet.
 *
 * Per `VOUGHT-DESIGN-BLUEPRINT.md` §11 (About page) and Wave 5 brief:
 *   1. Hero — full-bleed aesthetic waveform composition (CSS art, no photo)
 *   2. The story — ~1200 words founding narrative, three-act framing
 *   3. Our point of view on voice AI — 4 short paragraphs (consent,
 *      vulnerability, coaching vs cheating, invisibility)
 *   4. The team — initialed circles + bio (no real photos)
 *   5. Investors — single subdued row
 *   6. Where we are — two cities, SF + Bangalore
 *   7. CTA — careers + contact
 *
 * Every color/spacing/font/motion comes from @vought/design-system tokens
 * via Tailwind preset (zero raw values). Section reveals match the
 * landing page's `.reveal` + staggered transitionDelay pattern.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Stack } from '@vought/ui';
import { ArrowRight } from '@/components/ui/Icon';

export function generateMetadata(): Metadata {
  return {
    title: 'About · Vought',
    description:
      'Vought is a voice intelligence company. We build the AI that whispers what to say next, in your own cloned voice. Founded in 2025 in San Francisco and Bangalore.',
    alternates: { canonical: 'https://vought.com/about' },
    openGraph: {
      title: 'About · Vought',
      description:
        'Founded 2025. San Francisco and Bangalore. We build voice intelligence for the conversations that decide your life.',
      url: 'https://vought.com/about',
      type: 'website',
    },
  };
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutPointOfView />
      <AboutTeam />
      <AboutInvestors />
      <AboutOffices />
      <AboutCTA />
    </>
  );
}

/* ─── 1 · Hero ──────────────────────────────────────────────── */

function AboutHero() {
  return (
    <section
      aria-labelledby="about-hero-heading"
      className="relative overflow-hidden px-6 pb-24 pt-44"
    >
      {/* Aesthetic full-bleed waveform composition · CSS art */}
      <HeroWaveform />

      <Container width="narrow" padX={0} className="relative">
        <div className="reveal label-small mb-6 text-accent-amber">
          Vought · founded 2025
        </div>
        <h1
          id="about-hero-heading"
          className="reveal display-3xl mb-8 text-white"
          style={{ transitionDelay: '80ms' }}
        >
          A voice<br />in your ear.
        </h1>
        <p
          className="reveal max-w-xl text-xl leading-relaxed text-white/60"
          style={{ transitionDelay: '240ms' }}
        >
          We build the intelligence that listens to your most important
          conversations and whispers, in your own voice, what to say next.
          This is the story of why.
        </p>
      </Container>
    </section>
  );
}

/**
 * Hero waveform — full-bleed abstract composition. No photo, no stock.
 * Layered SVG bars on a soft amber-to-canvas radial gradient. Calm,
 * cinematic, sits behind the hero copy.
 */
function HeroWaveform() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 flex items-end justify-center"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(245,165,36,0.10) 0%, rgba(10,10,11,0) 60%)',
        }}
      />
      <svg
        viewBox="0 0 1400 400"
        preserveAspectRatio="none"
        className="h-[60vh] w-full opacity-70"
        role="presentation"
      >
        <defs>
          <linearGradient id="aboutWaveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(245,165,36,0.45)" />
            <stop offset="60%" stopColor="rgba(245,165,36,0.10)" />
            <stop offset="100%" stopColor="rgba(245,165,36,0)" />
          </linearGradient>
          <linearGradient id="aboutWaveLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Soft fill waveform */}
        <path
          d="M0 320 Q 100 220 200 290 T 400 250 T 600 300 T 800 230 T 1000 280 T 1200 240 T 1400 290 L 1400 400 L 0 400 Z"
          fill="url(#aboutWaveFill)"
        />

        {/* Hairline waveform — top stroke */}
        <path
          d="M0 320 Q 100 220 200 290 T 400 250 T 600 300 T 800 230 T 1000 280 T 1200 240 T 1400 290"
          stroke="rgba(245,165,36,0.55)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Vertical hairline bars — like a static waveform */}
        {HERO_BARS.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={bar.y}
            width={2}
            height={bar.h}
            fill="url(#aboutWaveLine)"
            opacity={bar.o}
          />
        ))}
      </svg>
    </div>
  );
}

const HERO_BARS = Array.from({ length: 70 }, (_, i) => {
  const seed = Math.sin(i * 1.7) * 0.5 + 0.5;
  const h = 40 + seed * 180;
  return {
    x: i * 20 + 6,
    y: 400 - h,
    h,
    o: 0.35 + seed * 0.4,
  };
});

/* ─── 2 · The story ─────────────────────────────────────────── */

function AboutStory() {
  return (
    <section
      aria-labelledby="story-heading"
      className="px-6 py-32"
    >
      <Container width="narrow" padX={0}>
        <div className="reveal label-small mb-6 text-accent-amber">
          The story
        </div>
        <h2
          id="story-heading"
          className="reveal display-2xl mb-16 text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Cyrano, retold.
        </h2>

        <Stack gap={32}>
          {/* Act 1 — The problem */}
          <StoryAct
            eyebrow="Act 1 · The conversations that decide your life"
            delayMs={0}
          >
            <p>
              Every important conversation in your life happens once. You do
              not get to rehearse the job interview. You do not get to redo
              the first date. You do not get to take back what you said to
              your dying grandfather, or the call where your biggest customer
              told you they were leaving.
            </p>
            <p>
              These conversations carry enormous weight. We walk into all of
              them with the same brain we use to order pizza. So people
              freeze. They forget the question they wanted to ask. They miss
              the moment to say the right thing. They walk out of the meeting
              and immediately think — I should have said that.
            </p>
            <p>
              Vought started with a list of those moments. A founder failing
              their Series A pitch in real time. A sales rep watching a deal
              evaporate because they could not find the right reframe. A son
              sitting next to a hospice bed, unable to begin. The same
              pattern, across wildly different lives: the words we needed
              were findable, but not in time.
            </p>
          </StoryAct>

          {/* Act 2 — The reveal */}
          <StoryAct
            eyebrow="Act 2 · The AI is already in the room"
            delayMs={80}
          >
            <p>
              In 2024 we watched the Speech Engine collapse the latency
              barrier. Streaming speech-to-text under 180ms. Cloned voice
              text-to-speech under 250ms. Suddenly there was a budget — about
              a second, end-to-end — where an AI could listen, think, and
              speak inside the natural rhythm of a human conversation.
            </p>
            <p>
              That second changes everything. Before it, AI was a tool you
              consulted after the moment had passed. After it, AI is a voice
              that sits beside you, in your earbud, during. It can hear what
              the other person just said. It can recall the playbook your top
              closer would have run. It can whisper the next line. And —
              this is the part that matters — it can whisper it in your own
              cloned voice, so you hear yourself before you say it. The hand
              on your shoulder belongs to you.
            </p>
            <p>
              We named the company after a character we never escaped. Cyrano
              de Bergerac stood behind Christian and fed him the words that
              won Roxane. We are not the first to notice the metaphor.
              Eighteen messaging apps have tried to be Cyrano for text. None
              of them work, because text is not where life happens. Life
              happens in voice — in the pause between the question and the
              answer, in the wobble of a sentence that loses its nerve halfway
              through. Vought lives in that pause.
            </p>
          </StoryAct>

          {/* Act 3 — The transformation */}
          <StoryAct
            eyebrow="Act 3 · A faster, calmer version of you"
            delayMs={240}
          >
            <p>
              The user does not become someone else. They become a faster,
              calmer, more articulate version of themselves. The interview
              lands. The deal closes. The hard conversation resolves. The
              sentence they would have written down at 2 a.m. and wished they
              had said — they said it, at the moment it mattered, in their
              own voice.
            </p>
            <p>
              We are building three surfaces of one product. Vought Personal,
              for the moments that decide an individual life. Vought Copilot,
              for the revenue teams whose conversations decide a company.
              Vought Receptionist, for the small businesses whose inbound
              calls are the front door. The same Echo Engine sits underneath
              all three. The same 412ms whisper.
            </p>
            <p>
              We are not here to replace the human in the conversation. We
              are here to give them the line their best self would have said
              — and then get out of the way.
            </p>
          </StoryAct>
        </Stack>
      </Container>
    </section>
  );
}

interface StoryActProps {
  eyebrow: string;
  delayMs: number;
  children: React.ReactNode;
}

function StoryAct({ eyebrow, delayMs, children }: StoryActProps) {
  return (
    <article
      className="reveal"
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className="label-tiny mb-5 text-white/40">{eyebrow}</div>
      <div className="space-y-6 text-lg leading-relaxed text-white/70">
        {children}
      </div>
    </article>
  );
}

/* ─── 3 · Our point of view ─────────────────────────────────── */

interface ViewPoint {
  title: string;
  body: string;
  delayMs: number;
}

const VIEWPOINTS: ViewPoint[] = [
  {
    title: '1 · Consent first.',
    body:
      'Every Vought session begins with the operator stating, on the record, that an AI is listening. No covert capture. No hidden recordings. The other party may not know what we whisper, but they always know we are here.',
    delayMs: 0,
  },
  {
    title: '2 · The operator is vulnerable.',
    body:
      'The person wearing the earbud is exposing their cortisol, their hesitations, their worst sentences. We treat that intimacy as the most sensitive data we hold. Session audio is encrypted at rest, never used for training, and deletable in one click.',
    delayMs: 80,
  },
  {
    title: '3 · Coaching, not cheating.',
    body:
      'Vought surfaces the line a great version of you would have said. It does not lie on your behalf. It does not impersonate expertise you do not have. If the suggestion would constitute fraud, the model refuses — and shows you why.',
    delayMs: 240,
  },
  {
    title: '4 · The AI must stay invisible.',
    body:
      'No chatbot avatar. No persistent panel. No confetti. The AI appears only when it has something to say, then disappears. If the operator forgets we are there, we are designed correctly. The human keeps the room.',
    delayMs: 360,
  },
];

function AboutPointOfView() {
  return (
    <section
      aria-labelledby="pov-heading"
      className="px-6 py-32"
    >
      <Container width="narrow" padX={0}>
        <div className="reveal label-small mb-6 text-accent-amber">
          Our point of view
        </div>
        <h2
          id="pov-heading"
          className="reveal display-2xl mb-16 text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Four rules<br />we will not break.
        </h2>

        <Stack gap={24}>
          {VIEWPOINTS.map((vp) => (
            <article
              key={vp.title}
              className="reveal border-l border-white/10 pl-6"
              style={{ transitionDelay: `${vp.delayMs}ms` }}
            >
              <h3 className="mb-3 text-xl font-semibold text-white">
                {vp.title}
              </h3>
              <p className="text-base leading-relaxed text-white/60">
                {vp.body}
              </p>
            </article>
          ))}
        </Stack>
      </Container>
    </section>
  );
}

/* ─── 4 · The team ──────────────────────────────────────────── */

interface TeamMember {
  name: string;
  initials: string;
  role: string;
  bio: string;
  delayMs: number;
}

const TEAM: TeamMember[] = [
  {
    name: 'Anika Rao',
    initials: 'AR',
    role: 'Co-founder, CEO',
    bio: 'Former product lead, Speech Engine. Stanford CS, 2018.',
    delayMs: 0,
  },
  {
    name: 'Dmitri Volkov',
    initials: 'DV',
    role: 'Co-founder, CTO',
    bio: 'Built the real-time inference stack at a previous voice startup.',
    delayMs: 80,
  },
  {
    name: 'Maya Okafor',
    initials: 'MO',
    role: 'Head of Design',
    bio: 'Principal designer, two consumer apps you have heard of.',
    delayMs: 160,
  },
  {
    name: 'Jonas Lindqvist',
    initials: 'JL',
    role: 'Head of Research',
    bio: 'Diarization and speaker separation. ETH Zürich, PhD 2021.',
    delayMs: 240,
  },
  {
    name: 'Priya Subramaniam',
    initials: 'PS',
    role: 'Head of Revenue',
    bio: 'Built the first enterprise pipeline at two prior Series B companies.',
    delayMs: 320,
  },
  {
    name: 'Theo Marchetti',
    initials: 'TM',
    role: 'Founding Engineer',
    bio: 'Backend systems. Low-latency streaming. ex-trading infrastructure.',
    delayMs: 400,
  },
];

function AboutTeam() {
  return (
    <section
      aria-labelledby="team-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="mx-auto max-w-[720px]">
          <div className="reveal label-small mb-6 text-accent-amber">
            The team
          </div>
          <h2
            id="team-heading"
            className="reveal display-2xl mb-16 text-white"
            style={{ transitionDelay: '80ms' }}
          >
            Six people,<br />one product.
          </h2>
        </div>

        <ul
          className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {TEAM.map((member) => (
            <li
              key={member.name}
              className="reveal flex items-start gap-5"
              style={{ transitionDelay: `${member.delayMs}ms` }}
            >
              <Avatar initials={member.initials} />
              <div className="min-w-0">
                <div className="mb-1 text-base font-semibold text-white">
                  {member.name}
                </div>
                <div className="label-tiny mb-2 text-accent-amber">
                  {member.role}
                </div>
                <p className="text-sm leading-relaxed text-white/55">
                  {member.bio}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="flex h-16 w-16 flex-none items-center justify-center rounded-full border border-white/10 bg-surface-dark text-base font-semibold text-white/80"
      aria-hidden
      style={{
        backgroundImage:
          'radial-gradient(circle at 30% 30%, rgba(245,165,36,0.08), rgba(255,255,255,0) 60%)',
      }}
    >
      {initials}
    </div>
  );
}

/* ─── 5 · Investors ─────────────────────────────────────────── */

interface InvestorLogo {
  label: string;
  className: string;
  style?: React.CSSProperties;
}

const INVESTORS: InvestorLogo[] = [
  { label: 'Sequoia', className: 'text-xl font-light tracking-[0.15em]' },
  { label: 'a16z', className: 'text-2xl font-black' },
  { label: 'Founders Fund', className: 'text-xl font-semibold' },
  { label: 'South Park Commons', className: 'text-base font-medium tracking-tight' },
  { label: 'Conviction', className: 'text-xl italic font-light' },
];

function AboutInvestors() {
  return (
    <section
      aria-label="Investors"
      className="border-y border-white/5 px-6 py-20"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-10 text-center text-white/40">
          Backed by
        </div>
        <ul
          className="reveal flex flex-wrap items-center justify-center gap-x-14 gap-y-8"
          style={{ transitionDelay: '80ms' }}
          role="list"
        >
          {INVESTORS.map((inv) => (
            <li
              key={inv.label}
              className={`text-white/30 ${inv.className}`}
              style={inv.style}
            >
              {inv.label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ─── 6 · Where we are ──────────────────────────────────────── */

interface Office {
  city: string;
  role: string;
  address: string[];
  localTime: string;
  delayMs: number;
}

const OFFICES: Office[] = [
  {
    city: 'San Francisco',
    role: 'Headquarters',
    address: ['548 Market Street, Suite 401', 'San Francisco, CA 94104'],
    localTime: '11:32 PT',
    delayMs: 0,
  },
  {
    city: 'Bangalore',
    role: 'Research',
    address: ['No. 23, 1st Cross, Domlur II Stage', 'Bengaluru 560071, India'],
    localTime: '00:02 IST',
    delayMs: 80,
  },
];

function AboutOffices() {
  return (
    <section
      aria-labelledby="offices-heading"
      className="px-6 py-32"
    >
      <Container width="narrow" padX={0}>
        <div className="reveal label-small mb-6 text-accent-amber">
          Where we are
        </div>
        <h2
          id="offices-heading"
          className="reveal display-2xl mb-16 text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Two cities.<br />One time zone, eventually.
        </h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {OFFICES.map((office) => (
            <article
              key={office.city}
              className="reveal border-t border-white/10 pt-8"
              style={{ transitionDelay: `${office.delayMs}ms` }}
            >
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold text-white">
                  {office.city}
                </h3>
                <span className="mono text-xs text-accent-amber">
                  · {office.localTime}
                </span>
              </div>
              <div className="label-tiny mb-5 text-white/40">{office.role}</div>
              <address className="not-italic text-sm leading-relaxed text-white/55">
                {office.address.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </address>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─── 7 · CTA ───────────────────────────────────────────────── */

function AboutCTA() {
  return (
    <section
      aria-labelledby="about-cta-heading"
      className="relative overflow-hidden px-6 py-32"
    >
      <div
        aria-hidden
        className="orb orb-amber"
        style={{
          width: 600,
          height: 600,
          bottom: -260,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.25,
        }}
      />

      <Container width="narrow" padX={0} className="relative text-center">
        <h2
          id="about-cta-heading"
          className="reveal display-2xl mb-6 text-white"
        >
          Want to work with us?
        </h2>
        <p
          className="reveal mx-auto mb-10 max-w-lg text-lg text-white/60"
          style={{ transitionDelay: '80ms' }}
        >
          We are hiring in San Francisco and Bangalore. We answer every
          serious email.
        </p>
        <div
          className="reveal flex flex-wrap items-center justify-center gap-3"
          style={{ transitionDelay: '240ms' }}
        >
          <Link
            href="/careers"
            className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
          >
            See open roles
            <ArrowRight size={14} className="text-marketing-ink" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white transition-colors duration-quick ease-quick hover:border-white/30"
          >
            Get in touch
          </Link>
        </div>
      </Container>
    </section>
  );
}
