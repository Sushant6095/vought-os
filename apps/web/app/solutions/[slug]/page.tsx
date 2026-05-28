/**
 * /solutions/[slug] · industry-specific solution pages.
 *
 * One dynamic route, seven hand-written industry stories. Every page tells
 * its own vignette, names its own earbud setup, and points at the
 * ElevenLabs capability that lands hardest in that vertical — not a generic
 * "we use AI" reskin of the same template.
 *
 * Pages are SSG via generateStaticParams. Add a new industry by appending
 * to apps/web/app/solutions/_data/industries.ts.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight, Check, Headphones } from '@/components/ui/Icon';
import {
  INDUSTRIES,
  INDUSTRY_SLUGS,
  getIndustry,
} from '../_data/industries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return { title: 'Solution · Vought' };

  return {
    title: `${industry.name} · ${industry.headline}`,
    description: industry.subhead,
    alternates: { canonical: `https://vought.com/solutions/${slug}` },
    openGraph: {
      title: `Vought for ${industry.name}`,
      description: industry.subhead,
      url: `https://vought.com/solutions/${slug}`,
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Vought for ${industry.name}`,
      description: industry.subhead,
    },
  };
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function Hero({ industry }: { industry: ReturnType<typeof getIndustry> }) {
  if (!industry) return null;
  return (
    <section
      aria-labelledby="solution-hero-heading"
      className="relative px-6 pb-24 pt-40"
    >
      <Container width="marketing" padX={0}>
        <Link
          href="/"
          className="reveal label-small mb-6 inline-flex items-center gap-2 text-text-muted-dark transition-colors duration-quick ease-quick hover:text-text-secondary-dark"
        >
          <span>Solutions</span>
          <span aria-hidden>/</span>
          <span className="text-accent-amber">{industry.eyebrow}</span>
        </Link>

        <h1
          id="solution-hero-heading"
          className="reveal display-1 max-w-[18ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          {industry.headline}
        </h1>

        <p
          className="reveal mt-6 max-w-[60ch] text-lg text-text-secondary-dark"
          style={{ transitionDelay: '160ms' }}
        >
          {industry.subhead}
        </p>

        <div
          className="reveal mt-10 flex flex-wrap items-center gap-3"
          style={{ transitionDelay: '240ms' }}
        >
          <Link
            href="/demo"
            className="pill-cta inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-marketing-ink"
          >
            <span>Try Vought for {industry.name}</span>
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
          <Link
            href={`/${industry.primaryProduct}`}
            className="text-sm text-text-secondary-dark transition-colors duration-quick ease-quick hover:text-text-primary-dark"
          >
            See the underlying product →
          </Link>
        </div>
      </Container>
    </section>
  );
}

function VignetteBlock({
  industry,
}: {
  industry: ReturnType<typeof getIndustry>;
}) {
  if (!industry) return null;
  return (
    <section
      aria-labelledby="vignette-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          The whisper, in motion
        </div>
        <h2
          id="vignette-heading"
          className="reveal display-2 max-w-[20ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          One scenario, three seconds.
        </h2>

        <figure
          className="reveal mt-12 max-w-[68ch] rounded-3xl border border-hairline-dark/60 bg-elevated-dark p-10 md:p-14"
          style={{ transitionDelay: '160ms' }}
        >
          <span aria-hidden className="block text-5xl leading-none text-accent-amber">
            &ldquo;
          </span>
          <blockquote className="mt-2 text-2xl font-medium leading-snug text-text-primary-dark md:text-3xl">
            {industry.vignette.quote}
          </blockquote>
          <figcaption className="mt-8 text-sm text-text-muted-dark">
            — {industry.vignette.attribution}
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}

function EarbudBlock({
  industry,
}: {
  industry: ReturnType<typeof getIndustry>;
}) {
  if (!industry) return null;
  return (
    <section
      aria-labelledby="earbud-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={48} className="items-center">
          <GridItem
            span={12}
            className="reveal lg:!col-span-7"
          >
            <div className="label-small mb-5 flex items-center gap-2 text-accent-amber">
              <Headphones size={14} />
              <span>The earbud</span>
            </div>
            <h2
              id="earbud-heading"
              className="display-2 max-w-[20ch] text-text-primary-dark"
            >
              The integration the customer never notices.
            </h2>
            <p className="mt-6 max-w-[56ch] text-lg text-text-secondary-dark">
              Vought lives in your earbud. The whisper plays through whatever
              you’re already wearing — and only when output is on headphones.
              On speakers, audio is muted automatically. The person across the
              table sees you, hears you, trusts you.
            </p>
            <p className="mt-4 max-w-[56ch] text-sm text-text-muted-dark">
              {industry.earbud}
            </p>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-5"
            style={{ transitionDelay: '120ms' }}
          >
            <div className="rounded-3xl border border-hairline-dark/60 bg-surface-dark p-8">
              <div className="label-small mb-4 text-text-muted-dark">
                Latency budget
              </div>
              <ul className="space-y-3 text-sm text-text-secondary-dark">
                <li className="flex items-baseline justify-between gap-6">
                  <span>End-of-turn detection</span>
                  <span className="font-mono text-accent-amber">· 250 ms</span>
                </li>
                <li className="flex items-baseline justify-between gap-6">
                  <span>LLM first token</span>
                  <span className="font-mono text-accent-amber">· 320 ms</span>
                </li>
                <li className="flex items-baseline justify-between gap-6">
                  <span>TTS first byte (ElevenLabs)</span>
                  <span className="font-mono text-accent-amber">· 260 ms</span>
                </li>
                <li className="flex items-baseline justify-between gap-6">
                  <span>To the earbud</span>
                  <span className="font-mono text-accent-amber">· 200 ms</span>
                </li>
                <li className="mt-2 flex items-baseline justify-between gap-6 border-t border-hairline-dark/60 pt-3 text-text-primary-dark">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono font-semibold text-text-primary-dark">
                    · 1,030 ms
                  </span>
                </li>
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-text-muted-dark">
                Median, measured end-to-end on the live loop. Under the natural
                conversational pause, every time.
              </p>
            </div>
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

function ElevenLabsBlock({
  industry,
}: {
  industry: ReturnType<typeof getIndustry>;
}) {
  if (!industry) return null;
  return (
    <section
      aria-labelledby="el-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          ElevenLabs × Vought
        </div>
        <h2
          id="el-heading"
          className="reveal display-2 max-w-[22ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          Unleash the part of ElevenLabs that matters in {industry.name.toLowerCase()}.
        </h2>
        <p
          className="reveal mt-6 max-w-[64ch] text-lg text-text-secondary-dark"
          style={{ transitionDelay: '160ms' }}
        >
          {industry.elevenLabs}
        </p>
        <p
          className="reveal mt-4 max-w-[64ch] text-sm text-text-muted-dark"
          style={{ transitionDelay: '200ms' }}
        >
          The plumbing is the same across every Vought deployment: Speech
          Engine on one socket, a Vought Echo Engine orchestrating the LLM,
          and a diarization sidecar gating on “other speaker.” What changes
          per industry is the playbook RAG, the compliance posture, and the
          earbud.
        </p>
        <Link
          href="/customers"
          className="reveal mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-amber transition-colors duration-quick ease-quick hover:text-text-primary-dark"
          style={{ transitionDelay: '240ms' }}
        >
          See the architecture <ArrowRight size={12} strokeWidth={1.5} />
        </Link>
      </Container>
    </section>
  );
}

function CapabilitiesBlock({
  industry,
}: {
  industry: ReturnType<typeof getIndustry>;
}) {
  if (!industry) return null;
  return (
    <section
      aria-labelledby="cap-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          What the operator gets
        </div>
        <h2
          id="cap-heading"
          className="reveal display-2 max-w-[20ch] text-text-primary-dark"
          style={{ transitionDelay: '80ms' }}
        >
          Four capabilities, tuned for {industry.name.toLowerCase()}.
        </h2>

        <Grid columns={12} gutter={32} className="mt-16">
          {industry.capabilities.map((c, i) => (
            <GridItem
              key={c.title}
              span={12}
              className="reveal md:!col-span-6"
              style={{ transitionDelay: `${80 + i * 60}ms` }}
            >
              <article className="h-full rounded-2xl border border-hairline-dark/60 bg-elevated-dark p-8">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-accent-amber-soft text-accent-amber">
                  <Check size={14} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary-dark">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary-dark">
                  {c.body}
                </p>
              </article>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

function CTABlock({
  industry,
}: {
  industry: ReturnType<typeof getIndustry>;
}) {
  if (!industry) return null;
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative border-t border-hairline-dark/40 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal flex flex-col items-start gap-8 rounded-3xl border border-hairline-dark/60 bg-elevated-dark p-12 md:p-16">
          <div className="label-small text-accent-amber">
            Implement it now
          </div>
          <h2
            id="cta-heading"
            className="display-2 max-w-[22ch] text-text-primary-dark"
          >
            See Vought run on your {industry.name.toLowerCase()} workflow.
          </h2>
          <p className="max-w-[56ch] text-lg text-text-secondary-dark">
            Thirty seconds to clone your voice. Five minutes to wire your
            playbook. The first whisper lands by the end of the demo.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="pill-cta inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-marketing-ink"
            >
              Book a demo <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
            <Link
              href="/contact"
              className="text-sm text-text-secondary-dark transition-colors duration-quick ease-quick hover:text-text-primary-dark"
            >
              Talk to the team →
            </Link>
          </div>
        </div>

        {/* Related industries — quick links to the other 6 */}
        <div className="reveal mt-20">
          <div className="label-small mb-6 text-text-muted-dark">
            Other industries
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {INDUSTRIES.filter((i) => i.slug !== industry.slug).map((i) => (
              <li key={i.slug}>
                <Link
                  href={`/solutions/${i.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline-dark/60 bg-surface-dark px-4 py-2 text-sm text-text-secondary-dark transition-colors duration-quick ease-quick hover:border-accent-amber/60 hover:text-text-primary-dark"
                >
                  {i.name}
                  <ArrowRight size={10} strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  return (
    <>
      <Hero industry={industry} />
      <VignetteBlock industry={industry} />
      <EarbudBlock industry={industry} />
      <ElevenLabsBlock industry={industry} />
      <CapabilitiesBlock industry={industry} />
      <CTABlock industry={industry} />
    </>
  );
}
