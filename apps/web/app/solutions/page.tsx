/**
 * /solutions · index for the seven industry-specific solution pages.
 *
 * Marketing entry point that lets visitors choose their vertical. Cards link
 * into /solutions/[slug], one per industry. Content lives in
 * apps/web/app/solutions/_data/industries.ts.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight } from '@/components/ui/Icon';
import { INDUSTRIES } from './_data/industries';

export const metadata: Metadata = {
  title: 'Solutions · Vought for every conversation that matters.',
  description:
    'Industry-specific Vought deployments — sales, customer support, healthcare, legal, real estate, financial services, home services. Same engine, different playbooks.',
  alternates: { canonical: 'https://vought.com/solutions' },
  openGraph: {
    title: 'Vought · Solutions for every industry.',
    description:
      'Seven industries. Seven playbooks. One Speech Engine. One cloned voice.',
    url: 'https://vought.com/solutions',
    type: 'website',
    siteName: 'Vought',
  },
};

export default function SolutionsIndex() {
  return (
    <>
      <section
        aria-labelledby="solutions-hero-heading"
        className="relative px-6 pb-24 pt-40"
      >
        <Container width="marketing" padX={0}>
          <div className="reveal label-small mb-5 text-accent-amber">
            Solutions
          </div>
          <h1
            id="solutions-hero-heading"
            className="reveal display-1 max-w-[20ch] text-text-primary-dark"
            style={{ transitionDelay: '80ms' }}
          >
            Same engine. Seven playbooks.
          </h1>
          <p
            className="reveal mt-6 max-w-[64ch] text-lg text-text-secondary-dark"
            style={{ transitionDelay: '160ms' }}
          >
            Vought runs the same live whisper loop in every deployment — but
            what gets whispered is tuned to your work. Pick the version of
            Vought that maps to your role.
          </p>
        </Container>
      </section>

      <section className="relative border-t border-hairline-dark/40 px-6 py-24">
        <Container width="marketing" padX={0}>
          <Grid columns={12} gutter={32}>
            {INDUSTRIES.map((i, idx) => (
              <GridItem
                key={i.slug}
                span={12}
                className="reveal md:!col-span-6 lg:!col-span-4"
                style={{ transitionDelay: `${80 + idx * 50}ms` }}
              >
                <Link
                  href={`/solutions/${i.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-hairline-dark/60 bg-elevated-dark p-8 transition-colors duration-quick ease-quick hover:border-accent-amber/60"
                >
                  <div className="label-small mb-3 text-accent-amber">
                    {i.eyebrow}
                  </div>
                  <h2 className="text-2xl font-semibold leading-tight text-text-primary-dark">
                    {i.name}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary-dark">
                    {i.subhead}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-amber transition-colors duration-quick ease-quick group-hover:text-text-primary-dark">
                    See how it lands{' '}
                    <ArrowRight size={12} strokeWidth={1.5} />
                  </span>
                </Link>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </section>
    </>
  );
}
