/**
 * apps/web · /customers
 *
 * Partners page. Replaces the old customer logo wall. The hackathon build
 * stands on three sponsor stacks — ElevenLabs is the lead partner, with
 * Vercel and Render as co-sponsors — and the architecture section credits
 * the frameworks that make the live loop possible. The repo is public; a
 * big GitHub CTA closes the page.
 *
 * Sections:
 *   1. Hero — "Built with ElevenLabs" + repo button
 *   2. ElevenLabs feature — why their Speech Engine is the lead
 *   3. Co-partners — Vercel + Render
 *   4. Architecture — frameworks + service layout
 *   5. GitHub CTA — large repo link
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight, Check } from '@/components/ui/Icon';

const REPO_URL = 'https://github.com/Sushant6095/vought-os';

export function generateMetadata(): Metadata {
  return {
    title: 'Partners · Built with ElevenLabs.',
    description:
      'Vought is built on the ElevenLabs Speech Engine — STT, TTS, turn detection, and voice cloning over one socket. Vercel and Render host the rest. The repo is public.',
    alternates: { canonical: 'https://vought.com/customers' },
    openGraph: {
      title: 'Partners · Built with ElevenLabs.',
      description:
        'ElevenLabs Speech Engine, Vercel, Render. The full stack behind sub-second whispers.',
      url: 'https://vought.com/customers',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought · Built with ElevenLabs.',
      description:
        'Speech Engine, voice clone, sub-second whispers. The full partner stack.',
    },
  };
}

// ---------------------------------------------------------------------------
// Inline brand SVGs · kept small and on-tone instead of importing logo blobs.
// Each is a single optimized path and inherits currentColor.
// ---------------------------------------------------------------------------

function GitHubMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.1c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.13v3.16c0 .3.21.67.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function ElevenLabsMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <rect x="4" y="4" width="6" height="16" rx="1.2" />
      <rect x="14" y="4" width="6" height="16" rx="1.2" />
    </svg>
  );
}

function VercelMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 L23 21 H1 Z" />
    </svg>
  );
}

function RenderMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 1. Hero
// ---------------------------------------------------------------------------

function PartnersHero() {
  return (
    <section
      aria-labelledby="partners-hero-heading"
      className="relative px-6 pb-24 pt-40"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 flex items-center gap-2 text-accent-amber">
          <ElevenLabsMark size={14} />
          <span>Built with ElevenLabs</span>
        </div>

        <h1
          id="partners-hero-heading"
          className="reveal display-1 max-w-[18ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          We didn&rsquo;t build this alone.
        </h1>

        <p
          className="reveal mt-6 max-w-[60ch] text-lg text-text-secondary-dark"
          style={{ transitionDelay: '160ms' }}
        >
          Vought is a thin layer of taste on top of an extraordinary stack.
          ElevenLabs is the engine. Vercel and Render keep it running. The
          source is public — read every line.
        </p>

        <div
          className="reveal mt-10 flex flex-wrap items-center gap-3"
          style={{ transitionDelay: '240ms' }}
        >
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-cta inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-marketing-ink"
          >
            <GitHubMark size={16} />
            <span>View on GitHub</span>
            <ArrowRight size={12} strokeWidth={1.5} />
          </a>
          <Link
            href="/about"
            className="text-sm text-text-secondary-dark transition-colors duration-quick ease-quick hover:text-text-primary-dark"
          >
            Read the architecture →
          </Link>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. ElevenLabs — lead partner
// ---------------------------------------------------------------------------

function ElevenLabsFeature() {
  const advantages: { headline: string; body: string }[] = [
    {
      headline: 'One socket, three jobs.',
      body: 'Speech Engine collapses STT, TTS, and turn detection into a single connection. No round-trips between a transcription vendor, a thinking layer, and a synthesis vendor — the integration tax is gone.',
    },
    {
      headline: 'TTS first byte under 300 ms.',
      body: 'eleven_flash_v2 ships the first audio chunk faster than most pipelines finish thinking. That is the entire reason Vought feels like a whisper instead of a robot.',
    },
    {
      headline: 'Voice cloning from 30 seconds.',
      body: 'The product’s wow moment — the AI speaking in your voice — exists because cloning is a 30-second capture and a single API call, not a multi-week studio session.',
    },
    {
      headline: 'WebRTC, browser-native.',
      body: 'No SIP gateway, no audio bridge, no native client. The same socket runs in a hackathon laptop browser and a production deployment unchanged.',
    },
    {
      headline: 'Zero-retention by default.',
      body: 'Sessions are ephemeral. We opted into retention_days = -1 at engine creation so transcripts and audio never persist on their side. Compliance gets shorter, not longer.',
    },
    {
      headline: 'AbortSignal-aware streams.',
      body: 'When the operator interrupts the whisper, the same AbortController that cancels the LLM also closes the TTS stream cleanly. End-to-end interrupt in under 200 ms.',
    },
  ];

  return (
    <section
      aria-labelledby="elevenlabs-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 flex items-center gap-2 text-accent-amber">
          <ElevenLabsMark size={14} />
          <span>Lead partner</span>
        </div>

        <h2
          id="elevenlabs-heading"
          className="reveal display-2 max-w-[20ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          ElevenLabs Speech Engine is the floor we build on.
        </h2>

        <p
          className="reveal mt-6 max-w-[64ch] text-lg text-text-secondary-dark"
          style={{ transitionDelay: '160ms' }}
        >
          We tried the obvious alternative: a Whisper transcription service, a
          frontier LLM, and a separate TTS vendor stitched together. End-to-end
          latency landed near two seconds. Voices drifted. Interrupting the AI
          mid-sentence required custom plumbing. ElevenLabs Speech Engine
          replaced all three with a single primitive, and the loop dropped to
          well under a second on the first try.
        </p>

        <Grid columns={12} gutter={32} className="mt-16">
          {advantages.map((a, i) => (
            <GridItem
              key={a.headline}
              span={12}
              className="reveal md:!col-span-6"
              style={{ transitionDelay: `${80 + i * 60}ms` }}
            >
              <article className="rounded-2xl border border-hairline-dark/60 bg-elevated-dark p-8">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-accent-amber-soft text-accent-amber">
                  <Check size={14} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary-dark">
                  {a.headline}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary-dark">
                  {a.body}
                </p>
              </article>
            </GridItem>
          ))}
        </Grid>

        <div
          className="reveal mt-16 rounded-2xl border border-hairline-dark/60 bg-surface-dark p-8"
          style={{ transitionDelay: '160ms' }}
        >
          <div className="label-small mb-3 text-text-muted-dark">
            The integration, in five lines
          </div>
          <pre className="overflow-x-auto text-xs leading-relaxed text-text-primary-dark">
{`await elevenlabs.speechEngine.attach(SPEECH_ENGINE_ID, httpServer, '/ws', {
  onTranscript: async (transcript, signal, session) => {
    const stream = await llm.chat({ signal, ... });   // AbortSignal threaded
    await session.sendResponse(stream);                // STT → LLM → TTS
  },
});`}
          </pre>
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-amber transition-colors duration-quick ease-quick hover:text-text-primary-dark"
          >
            elevenlabs.io <ArrowRight size={12} strokeWidth={1.5} />
          </a>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Co-partners — Vercel + Render
// ---------------------------------------------------------------------------

function CoPartners() {
  const partners: {
    name: string;
    role: string;
    body: string;
    mark: React.ReactNode;
    url: string;
  }[] = [
    {
      name: 'Vercel',
      role: 'Marketing site · Product app',
      body: 'Both Next.js apps — the marketing site at vought.com and the product app at app.vought.com — ship to Vercel on every push to main. Preview deployments are how the design review loop stays under five minutes.',
      mark: <VercelMark size={18} />,
      url: 'https://vercel.com',
    },
    {
      name: 'Render',
      role: 'Echo Engine · Diarization sidecar · Postgres · Redis',
      body: 'The Node Echo Engine, the Python diart sidecar, and the managed Postgres + Redis instances all run on Render. One Dockerfile per service, deployed from the same monorepo with zero glue.',
      mark: <RenderMark size={18} />,
      url: 'https://render.com',
    },
  ];

  return (
    <section
      aria-labelledby="copartners-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          Co-partners
        </div>
        <h2
          id="copartners-heading"
          className="reveal display-2 max-w-[22ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          The infra that turns &ldquo;works on my laptop&rdquo; into
          production.
        </h2>

        <Grid columns={12} gutter={32} className="mt-16">
          {partners.map((p, i) => (
            <GridItem
              key={p.name}
              span={12}
              className="reveal md:!col-span-6"
              style={{ transitionDelay: `${80 + i * 80}ms` }}
            >
              <article className="flex h-full flex-col rounded-2xl border border-hairline-dark/60 bg-elevated-dark p-8">
                <div className="mb-6 flex items-center gap-3 text-text-primary-dark">
                  {p.mark}
                  <span className="text-xl font-semibold">{p.name}</span>
                </div>
                <div className="label-small mb-3 text-text-muted-dark">
                  {p.role}
                </div>
                <p className="text-sm leading-relaxed text-text-secondary-dark">
                  {p.body}
                </p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-amber transition-colors duration-quick ease-quick hover:text-text-primary-dark"
                >
                  {p.url.replace('https://', '')}{' '}
                  <ArrowRight size={12} strokeWidth={1.5} />
                </a>
              </article>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. Architecture — frameworks + service structure
// ---------------------------------------------------------------------------

function ArchitectureBlock() {
  const frameworks: { name: string; role: string }[] = [
    { name: 'Next.js 15', role: 'Both apps (App Router)' },
    { name: 'React 18', role: 'UI runtime' },
    { name: 'Tailwind 3', role: 'Design tokens' },
    { name: 'Framer Motion', role: 'The four signature motions' },
    { name: 'Zustand', role: 'Realtime session state' },
    { name: 'Turborepo', role: 'Monorepo orchestration' },
    { name: 'Node.js 20', role: 'Echo Engine runtime' },
    { name: 'Python 3.11 + diart', role: 'Diarization sidecar' },
    { name: 'Postgres 15 + pgvector', role: 'Playbook RAG' },
    { name: 'Redis', role: 'Live session memory' },
  ];

  return (
    <section
      aria-labelledby="architecture-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          Architecture
        </div>
        <h2
          id="architecture-heading"
          className="reveal display-2 max-w-[22ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          Frameworks, services, and where each Dockerfile lives.
        </h2>

        <Grid columns={12} gutter={32} className="mt-16">
          {/* Frameworks list */}
          <GridItem
            span={12}
            className="reveal lg:!col-span-6"
            style={{ transitionDelay: '120ms' }}
          >
            <div className="rounded-2xl border border-hairline-dark/60 bg-elevated-dark p-8">
              <div className="label-small mb-6 text-text-muted-dark">
                Frameworks
              </div>
              <ul className="divide-y divide-hairline-dark/60">
                {frameworks.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-baseline justify-between gap-6 py-3"
                  >
                    <span className="text-sm font-semibold text-text-primary-dark">
                      {f.name}
                    </span>
                    <span className="text-xs text-text-muted-dark">
                      {f.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </GridItem>

          {/* Service tree */}
          <GridItem
            span={12}
            className="reveal lg:!col-span-6"
            style={{ transitionDelay: '200ms' }}
          >
            <div className="rounded-2xl border border-hairline-dark/60 bg-surface-dark p-8">
              <div className="label-small mb-6 text-text-muted-dark">
                Repo · vought-os
              </div>
              <pre className="overflow-x-auto text-xs leading-relaxed text-text-primary-dark">
{`vought-os/
├── apps/
│   ├── web/                  → Vercel (marketing)
│   └── app/                  → Vercel (product)
├── services/
│   ├── echo-engine/          → Render (Node, Dockerfile)
│   └── diarization-sidecar/  → Render (Python, Dockerfile)
├── packages/
│   ├── design-system/        → tokens + global.css
│   ├── motion/               → the four signature motions
│   └── ui/                   → Container, Grid, primitives
├── docker-compose.yml        → local Postgres + Redis
└── turbo.json                → pipelines`}
              </pre>
            </div>
          </GridItem>
        </Grid>

        <p
          className="reveal mt-12 max-w-[60ch] text-sm text-text-muted-dark"
          style={{ transitionDelay: '280ms' }}
        >
          Each service has its own Dockerfile, its own deployment target, and
          its own scaling story. The monorepo glue is Turborepo pipelines and
          a shared design-system package — nothing exotic.
        </p>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. GitHub CTA
// ---------------------------------------------------------------------------

function GitHubCTA() {
  return (
    <section
      aria-labelledby="github-cta-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal flex flex-col items-start gap-8 rounded-3xl border border-hairline-dark/60 bg-elevated-dark p-12 md:p-16">
          <div className="label-small text-accent-amber">Source</div>
          <h2
            id="github-cta-heading"
            className="display-2 max-w-[20ch] text-text-primary-dark"
          >
            Read the code. It&rsquo;s all open.
          </h2>
          <p className="max-w-[56ch] text-lg text-text-secondary-dark">
            The Echo Engine, the diarization sidecar, the live-call screen,
            the voice-clone onboarding, the marketing site — every file is on
            GitHub.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-cta inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-marketing-ink"
          >
            <GitHubMark size={20} />
            <span>github.com/Sushant6095/vought-os</span>
            <ArrowRight size={14} strokeWidth={1.5} />
          </a>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PartnersPage() {
  return (
    <>
      <PartnersHero />
      <ElevenLabsFeature />
      <CoPartners />
      <ArchitectureBlock />
      <GitHubCTA />
    </>
  );
}
