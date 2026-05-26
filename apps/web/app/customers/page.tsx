/**
 * apps/web · /customers
 *
 * Logo wall + case study grid (Blueprint §2.1, /customers route).
 *
 * Six sections in order:
 *   1. Hero — headline + single-sentence outcome line
 *   2. Logo wall — same six wordmarks as the landing strip, 3x2 grid
 *   3. Featured case study — TripleByte (CustomerStory pattern: quote + metrics)
 *   4. Case study grid — six cards, headline metric + summary
 *   5. Outcomes by industry — four-column metric grid
 *   6. CTA strip
 *
 * Reuses CustomerStory and CTAStrip from the landing rather than
 * re-implementing. All other section markup lives inline because it is
 * unique to this surface (logo grid as a primary block, case study card
 * grid, industry outcomes). Every motion is a `.reveal` with the
 * canonical 80/240/360 ms delay scale from packages/motion.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight } from '@/components/ui/Icon';
import { CountUp } from '@/components/ui/CountUp';
import { CustomerStory } from '@/components/marketing/CustomerStory';
import { CTAStrip } from '@/components/marketing/CTAStrip';

export function generateMetadata(): Metadata {
  return {
    title: 'Customers · Built for the conversations that move revenue.',
    description:
      'How revenue teams use Vought to ship $1.4M in incremental pipeline, triple suggestion acceptance, and reach first ROI in twelve days.',
    alternates: { canonical: 'https://vought.com/customers' },
    openGraph: {
      title: 'Customers · Built for the conversations that move revenue.',
      description:
        'Named case studies from the revenue teams scaling fastest on Vought.',
      url: 'https://vought.com/customers',
      type: 'website',
    },
  };
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function CustomersHero() {
  return (
    <section
      aria-labelledby="customers-hero-heading"
      className="relative px-6 pb-24 pt-40"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          Customers
        </div>
        <h1
          id="customers-hero-heading"
          className="reveal display-3xl mb-7 max-w-4xl text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Built for the conversations<br />that move revenue.
        </h1>
        <p
          className="reveal max-w-2xl text-xl leading-relaxed text-white/60"
          style={{ transitionDelay: '240ms' }}
        >
          Six teams. Twelve hundred operators. $4.2M in incremental pipeline
          influenced last quarter — measured against control cohorts, not
          attributed to vibes.
        </p>

        <div
          className="reveal mt-16 flex flex-wrap items-center gap-10 text-xs text-white/40"
          style={{ transitionDelay: '360ms' }}
        >
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <CountUp target={4.2} prefix="$" suffix="M" decimals={1} />
            </div>
            <div>incremental pipeline · Q1</div>
          </div>
          <div aria-hidden className="h-12 w-px bg-white/10" />
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <CountUp target={1287} />
            </div>
            <div>operators whispered to</div>
          </div>
          <div aria-hidden className="h-12 w-px bg-white/10" />
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <CountUp target={73} suffix="%" />
            </div>
            <div>suggestion accept · median</div>
          </div>
          <div aria-hidden className="h-12 w-px bg-white/10" />
          <div>
            <div className="mb-1 text-3xl font-medium text-white">
              <span className="mono text-accent-amber">·</span>{' '}
              <CountUp target={412} suffix="ms" />
            </div>
            <div>whisper latency · median</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Logo wall — 3 x 2 grid
// ---------------------------------------------------------------------------

interface LogoTile {
  label: string;
  className: string;
  style?: React.CSSProperties;
  slug: string;
  industry: string;
}

const LOGO_TILES: LogoTile[] = [
  {
    label: 'acme/',
    className: 'text-5xl font-black tracking-tight',
    slug: 'acme',
    industry: 'Cybersecurity',
  },
  {
    label: 'PARALLEL',
    className: 'text-4xl font-light',
    style: { letterSpacing: '0.2em' },
    slug: 'parallel',
    industry: 'B2B fintech',
  },
  {
    label: 'Cobalt.',
    className: 'text-5xl font-black italic',
    slug: 'cobalt',
    industry: 'Healthcare ops',
  },
  {
    label: '▲ Northwind',
    className: 'text-4xl font-bold',
    slug: 'northwind',
    industry: 'Real estate',
  },
  {
    label: '{tripleByte}',
    className: 'text-4xl mono',
    slug: 'triplebyte',
    industry: 'Developer hiring',
  },
  {
    label: 'runway',
    className: 'text-5xl font-extrabold',
    style: { letterSpacing: '-0.05em' },
    slug: 'runway',
    industry: 'Series B sales',
  },
];

function LogoWall() {
  return (
    <section
      aria-label="Customer logo wall"
      className="border-y border-white/5 px-6 py-24"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-12 text-center text-white/40">
          Six named teams · zero anonymous logos
        </div>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] md:grid-cols-3">
          {LOGO_TILES.map((logo, index) => (
            <li
              key={logo.slug}
              className="reveal bg-canvas-dark"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <Link
                href={`/customers/${logo.slug}`}
                className="group flex h-44 flex-col items-center justify-center gap-3 px-8 transition-colors duration-quick ease-quick hover:bg-surface-dark"
              >
                <span
                  className={`text-white/40 transition-colors duration-quick ease-quick group-hover:text-white ${logo.className}`}
                  style={logo.style}
                >
                  {logo.label}
                </span>
                <span className="label-tiny text-white/30 transition-colors duration-quick ease-quick group-hover:text-white/60">
                  {logo.industry} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Case study grid — six cards
// ---------------------------------------------------------------------------

interface CaseCard {
  slug: string;
  customer: string;
  customerClass: string;
  customerStyle?: React.CSSProperties;
  industry: string;
  metric: string;
  metricLabel: string;
  summary: string;
  delayMs: number;
}

const CASE_CARDS: CaseCard[] = [
  {
    slug: 'triplebyte',
    customer: '{tripleByte}',
    customerClass: 'mono text-xl',
    industry: 'Developer hiring · Series C',
    metric: '$1.4M',
    metricLabel: 'incremental revenue · Q1 vs Q4',
    summary:
      'Forty AEs moved from a desktop overlay to AirPods whispers. Acceptance tripled and average deal cycle dropped from 41 to 28 days.',
    delayMs: 0,
  },
  {
    slug: 'acme',
    customer: 'acme/',
    customerClass: 'text-xl font-black tracking-tight',
    industry: 'Cybersecurity · Series B',
    metric: '+218',
    metricLabel: 'qualified meetings · 60 days',
    summary:
      'Outbound team scaled from twelve to thirty SDRs without adding a single coach. Live objection handling closed the ramp gap in three weeks.',
    delayMs: 80,
  },
  {
    slug: 'parallel',
    customer: 'PARALLEL',
    customerClass: 'text-xl font-light',
    customerStyle: { letterSpacing: '0.2em' },
    industry: 'B2B fintech · Series A',
    metric: '47%',
    metricLabel: 'objection-handling acceptance',
    summary:
      'Replaced post-call scorecards with live whispers on every demo. Junior reps now close at parity with seniors on the procurement objection set.',
    delayMs: 160,
  },
  {
    slug: 'cobalt',
    customer: 'Cobalt.',
    customerClass: 'text-xl font-black italic',
    industry: 'Healthcare ops · 480 staff',
    metric: '38%',
    metricLabel: 'inbound deflection on Receptionist',
    summary:
      'Six clinics, one Vought Receptionist deployment. Front desk freed up four hours per day; appointment no-show rate cut from 19% to 11%.',
    delayMs: 240,
  },
  {
    slug: 'northwind',
    customer: '▲ Northwind',
    customerClass: 'text-xl font-bold',
    industry: 'Commercial real estate',
    metric: '11 min',
    metricLabel: 'saved per buyer call',
    summary:
      'Agents stopped typing comps mid-conversation. Vought surfaces matching units, financing scenarios, and the next showing slot — read aloud in their own voice.',
    delayMs: 320,
  },
  {
    slug: 'runway',
    customer: 'runway',
    customerClass: 'text-xl font-extrabold',
    customerStyle: { letterSpacing: '-0.05em' },
    industry: 'Series B sales · 90 reps',
    metric: '2.4×',
    metricLabel: 'multi-thread close rate',
    summary:
      'Vought Insights flagged single-threaded deals in flight. Reps now reach a second stakeholder before the call ends — pipeline coverage doubled.',
    delayMs: 400,
  },
];

function CaseStudyGrid() {
  return (
    <section
      aria-labelledby="case-grid-heading"
      className="px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          Case studies
        </div>
        <h2
          id="case-grid-heading"
          className="reveal display-xl mb-4 max-w-3xl text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Specific numbers from named teams.
        </h2>
        <p
          className="reveal mb-16 max-w-2xl text-lg text-white/60"
          style={{ transitionDelay: '160ms' }}
        >
          Every number below was measured against a control cohort that ran
          the same playbook without whispers. No vibes, no extrapolation.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CASE_CARDS.map((card) => (
            <CaseStudyCard key={card.slug} card={card} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function CaseStudyCard({ card }: { card: CaseCard }) {
  return (
    <article
      className="reveal group relative flex h-full flex-col rounded-2xl border border-white/[0.08] bg-surface-dark p-7 transition-colors duration-quick ease-quick hover:border-white/20"
      style={{ transitionDelay: `${card.delayMs}ms` }}
    >
      <div className="mb-7 flex items-baseline justify-between gap-4">
        <span
          className={`text-white/70 ${card.customerClass}`}
          style={card.customerStyle}
        >
          {card.customer}
        </span>
        <span className="label-tiny text-white/30">{card.industry}</span>
      </div>

      <div className="mb-3">
        <div className="mono text-5xl font-bold leading-none text-white">
          {card.metric}
        </div>
        <div className="mt-2 text-xs text-white/50">{card.metricLabel}</div>
      </div>

      <p className="mb-8 mt-6 flex-1 text-sm leading-relaxed text-white/70">
        {card.summary}
      </p>

      <Link
        href={`/customers/${card.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-amber transition-all duration-quick ease-quick group-hover:gap-2.5"
      >
        Read story
        <ArrowRight size={14} />
      </Link>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Outcomes by industry — 4-column grid
// ---------------------------------------------------------------------------

interface IndustryOutcome {
  industry: string;
  metric: React.ReactNode;
  label: string;
  detail: string;
  delayMs: number;
}

const INDUSTRIES: IndustryOutcome[] = [
  {
    industry: 'Sales',
    metric: <CountUp target={73} suffix="%" />,
    label: 'suggestion acceptance',
    detail:
      'Median across forty B2B SaaS teams running Vought Copilot on outbound calls.',
    delayMs: 0,
  },
  {
    industry: 'Support',
    metric: <CountUp target={38} suffix="%" />,
    label: 'inbound deflection',
    detail:
      'Vought Receptionist handling appointment booking, status checks, and routine FAQ end-to-end.',
    delayMs: 80,
  },
  {
    industry: 'Real estate',
    metric: (
      <>
        <CountUp target={11} />
        <span className="text-2xl text-white/60"> min</span>
      </>
    ),
    label: 'saved per buyer call',
    detail:
      'Agents stop typing mid-conversation. Comps, financing scenarios, and showings surface as whispers.',
    delayMs: 160,
  },
  {
    industry: 'Medical',
    metric: <CountUp target={41} suffix="%" />,
    label: 'follow-up adherence lift',
    detail:
      'Receptionist re-engages no-shows and follow-ups in the patient’s preferred language, in the practice’s voice.',
    delayMs: 240,
  },
];

function OutcomesByIndustry() {
  return (
    <section
      aria-labelledby="outcomes-heading"
      className="border-y border-white/5 px-6 py-32"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-center text-accent-amber">
          Outcomes by industry
        </div>
        <h2
          id="outcomes-heading"
          className="reveal display-xl mb-20 text-center text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Same engine. Different conversations.
        </h2>

        <Grid columns={12} gutter={24}>
          {INDUSTRIES.map((item) => (
            <GridItem
              key={item.industry}
              span={12}
              className="reveal md:!col-span-6 lg:!col-span-3"
              style={{ transitionDelay: `${item.delayMs}ms` }}
            >
              <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-surface-dark p-7">
                <div className="label-tiny mb-6 text-white/40">
                  {item.industry}
                </div>
                <div className="mono mb-2 text-5xl font-bold leading-none text-white">
                  {item.metric}
                </div>
                <div className="mb-5 text-xs text-white/50">{item.label}</div>
                <p className="mt-auto text-sm leading-relaxed text-white/60">
                  {item.detail}
                </p>
              </div>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomersPage() {
  return (
    <>
      <CustomersHero />
      <LogoWall />
      <CustomerStory />
      <CaseStudyGrid />
      <OutcomesByIndustry />
      <CTAStrip />
    </>
  );
}
