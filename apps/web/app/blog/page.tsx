/**
 * apps/web · /blog (index)
 *
 * Blog index per VOUGHT-DESIGN-BLUEPRINT.md §11 — single-column long-form
 * template, reverse-chronological list with featured image, four
 * categories (Engineering · Customer stories · Voice AI · Company), and
 * a newsletter signup. No /blog/[slug] this wave — every card href is
 * a placeholder anchor.
 *
 * Filtering is driven by the `?cat=` URL search param so the page can
 * stay a pure Server Component. The chip row is a row of <Link>s — the
 * active chip is computed server-side from `searchParams.cat`, default
 * "All". This means no client-side JS for filtering, no hydration cost
 * for what is essentially a marketing index, and shareable filter URLs.
 *
 * Sections (in order):
 *   1. Hero          — tiny header, eyebrow + headline
 *   2. CategoryRow   — four chips + All, anchored to ?cat=
 *   3. FeaturedPost  — oversized hero card (hidden when filtered)
 *   4. PostGrid      — 3-column · post cards, gradient thumbnails
 *   5. Newsletter    — subscribe block (declarative, no toast)
 *   6. RSSNote       — "Subscribe via RSS" footer note
 *
 * Reuses NavPill + Footer from layout. No custom CTA strip — the blog
 * page lands on the global Footer instead, per Blueprint §11 (single-
 * column long-form, calm exit). All motion uses .reveal with the
 * canonical 80/160/240/360ms stagger from packages/motion.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Grid, GridItem } from '@vought/ui';
import { ArrowRight } from '@/components/ui/Icon';

export function generateMetadata(): Metadata {
  return {
    title: 'Blog · Notes from the conversation.',
    description:
      'Engineering, customer stories, and voice-AI essays from the team building Vought. One essay a month. No newsletter chaff.',
    alternates: { canonical: 'https://vought.com/blog' },
    openGraph: {
      title: 'Vought Blog · Notes from the conversation.',
      description:
        'Engineering, customer stories, and voice-AI essays from the team building Vought.',
      url: 'https://vought.com/blog',
      type: 'website',
      siteName: 'Vought',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vought Blog · Notes from the conversation.',
      description: 'Engineering, customer stories, and voice-AI essays from the team building Vought. One essay a month.',
    },
  };
}

// ---------------------------------------------------------------------------
// Data — stub posts. Real CMS arrives V2; this set matches the brief.
// ---------------------------------------------------------------------------

type Category =
  | 'Engineering'
  | 'Customer stories'
  | 'Voice AI'
  | 'Company';

const CATEGORIES: { label: 'All' | Category; slug: string }[] = [
  { label: 'All', slug: 'all' },
  { label: 'Engineering', slug: 'engineering' },
  { label: 'Customer stories', slug: 'customer-stories' },
  { label: 'Voice AI', slug: 'voice-ai' },
  { label: 'Company', slug: 'company' },
];

function categoryToSlug(category: Category): string {
  switch (category) {
    case 'Engineering':
      return 'engineering';
    case 'Customer stories':
      return 'customer-stories';
    case 'Voice AI':
      return 'voice-ai';
    case 'Company':
      return 'company';
  }
}

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  date: string;
  readingMinutes: number;
  /** Inline gradient for the placeholder thumbnail. */
  gradient: string;
}

const FEATURED_POST: Post = {
  slug: 'sub-second-whisper-latency-elevenlabs',
  title:
    'How we shipped sub-second whisper latency on ElevenLabs Speech Engine.',
  excerpt:
    'Sub-second whisper latency was not a single optimization — it was twelve. We cut median end-to-end from 1.4 seconds down to 412 milliseconds across eighty live calls, and the path there ran through chunked diarization, streaming token boundaries, and a brutal opinion about what counts as "ready to speak."',
  category: 'Engineering',
  author: 'Dani Park',
  date: 'May 22, 2026',
  readingMinutes: 12,
  gradient:
    'linear-gradient(135deg, #0c1230 0%, #3358ff 55%, #0A0A0B 100%)',
};

const POSTS: Post[] = [
  {
    slug: 'triplebyte-revenue-lift',
    title: "TripleByte's revenue lift after switching to Vought.",
    excerpt:
      'Forty AEs moved from a desktop overlay to AirPods whispers. Acceptance tripled. Cycle dropped from 41 to 28 days.',
    category: 'Customer stories',
    author: 'Maya Goldberg',
    date: 'May 18, 2026',
    readingMinutes: 7,
    gradient:
      'linear-gradient(140deg, #1A2422 0%, #10B981 60%, #0A0A0B 100%)',
  },
  {
    slug: 'voice-clone-consent-flow',
    title: 'The voice-clone consent flow we built — and why.',
    excerpt:
      'Consent is the product. We designed a four-step capture that respects sovereignty without breaking the cinematic arc.',
    category: 'Company',
    author: 'Wren Kobayashi',
    date: 'May 14, 2026',
    readingMinutes: 9,
    gradient:
      'linear-gradient(135deg, #131316 0%, #2A2418 45%, #3358ff 100%)',
  },
  {
    slug: 'real-time-diarization-single-mic',
    title: 'Real-time speaker diarization on a single mic, explained.',
    excerpt:
      'One microphone. Two speakers. Zero training data per call. How diart, pyannote, and a 240ms window do the work.',
    category: 'Voice AI',
    author: 'Dani Park',
    date: 'May 9, 2026',
    readingMinutes: 11,
    gradient:
      'linear-gradient(160deg, #0F1A24 0%, #3B82F6 50%, #0A0A0B 100%)',
  },
  {
    slug: 'why-elevenlabs-over-building-tts',
    title: 'Why we chose ElevenLabs over building our own TTS.',
    excerpt:
      'A six-week spike. A 28-engineer estimate. A vendor that already shipped. The math on build-vs-buy was not close.',
    category: 'Engineering',
    author: 'Theo Mensah',
    date: 'May 4, 2026',
    readingMinutes: 8,
    gradient:
      'linear-gradient(145deg, #0c1230 0%, #3358ff 40%, #131316 100%)',
  },
  {
    slug: 'brand-voice-rules-ai-powered',
    title: "Our brand-voice rules — and why 'AI-powered' is banned.",
    excerpt:
      'Declarative sentences. Mono numerics. No celebratory UI. Why the words we don’t use shape the product more than the ones we do.',
    category: 'Company',
    author: 'Maya Goldberg',
    date: 'Apr 28, 2026',
    readingMinutes: 6,
    gradient:
      'linear-gradient(135deg, #FAF8F3 0%, #3358ff 50%, #0c1230 100%)',
  },
  {
    slug: 'whisper-bloom-motion-design',
    title:
      'The whisper bloom: motion design for a UI that should not exist.',
    excerpt:
      'The AI is invisible. So how do you animate it? Four signature motions, 240ms each, and a discipline about negative space.',
    category: 'Voice AI',
    author: 'Wren Kobayashi',
    date: 'Apr 21, 2026',
    readingMinutes: 10,
    gradient:
      'linear-gradient(135deg, #0A0A0B 0%, #0c1230 60%, #3358ff 100%)',
  },
];

const ALL_POSTS: Post[] = [FEATURED_POST, ...POSTS];

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function BlogHero() {
  return (
    <section
      aria-labelledby="blog-hero-heading"
      className="relative px-6 pb-12 pt-40"
    >
      <Container width="marketing" padX={0}>
        <div className="reveal label-small mb-5 text-accent-amber">
          The Vought blog
        </div>
        <h1
          id="blog-hero-heading"
          className="reveal display-2xl mb-7 max-w-3xl text-white"
          style={{ transitionDelay: '80ms' }}
        >
          Notes from the conversation.
        </h1>
        <p
          className="reveal max-w-2xl text-lg leading-relaxed text-white/60"
          style={{ transitionDelay: '240ms' }}
        >
          Engineering, customer stories, and voice-AI essays from the team
          building Vought. Written by the operators who ship it.
        </p>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Category chip row — anchor-based, no client JS
// ---------------------------------------------------------------------------

function CategoryRow({ active }: { active: string }) {
  return (
    <section
      aria-label="Filter posts by category"
      className="px-6 pb-12 pt-4"
    >
      <Container width="marketing" padX={0}>
        <nav
          className="reveal flex flex-wrap gap-2.5"
          style={{ transitionDelay: '360ms' }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.slug;
            const href = cat.slug === 'all' ? '/blog' : `/blog?cat=${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                href={href}
                scroll={false}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-quick ease-quick',
                  isActive
                    ? 'border-accent-amber bg-accent-amber text-marketing-ink'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white',
                ].join(' ')}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Featured post — oversized hero card
// ---------------------------------------------------------------------------

function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <section aria-label="Featured post" className="px-6 pb-24 pt-4">
      <Container width="marketing" padX={0}>
        <a
          href="#"
          className="reveal group relative block overflow-hidden rounded-3xl border border-white/[0.08] bg-surface-dark transition-colors duration-quick ease-quick hover:border-white/20"
        >
          <Grid columns={12} gutter={0}>
            {/* Image */}
            <GridItem
              span={12}
              className="relative h-72 overflow-hidden lg:!col-span-7 lg:h-[420px]"
            >
              <div
                aria-hidden
                className="absolute inset-0 transition-transform duration-cinematic ease-cinematic group-hover:scale-[1.02]"
                style={{ background: post.gradient }}
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-30 mix-blend-soft-light"
                style={{
                  background:
                    'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4), transparent 50%)',
                }}
              />
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-marketing-ink/40 px-3 py-1 backdrop-blur">
                <span className="label-tiny text-white">Featured</span>
              </div>
            </GridItem>

            {/* Copy */}
            <GridItem
              span={12}
              className="flex flex-col justify-center p-8 lg:!col-span-5 lg:p-12"
            >
              <div className="label-small mb-5 text-accent-amber">
                {post.category}
              </div>
              <h2 className="display-md mb-5 text-white">{post.title}</h2>
              <p className="mb-8 text-base leading-relaxed text-white/65">
                {post.excerpt}
              </p>
              <div className="mb-7 flex items-center gap-3 text-xs text-white/50">
                <span className="font-medium text-white/80">{post.author}</span>
                <span aria-hidden className="h-3 w-px bg-white/15" />
                <span>{post.date}</span>
                <span aria-hidden className="h-3 w-px bg-white/15" />
                <span className="mono text-accent-amber">
                  · {post.readingMinutes}m read
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-amber transition-all duration-quick ease-quick group-hover:gap-2.5">
                Read the essay
                <ArrowRight size={14} />
              </span>
            </GridItem>
          </Grid>
        </a>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Post grid — 3 columns
// ---------------------------------------------------------------------------

function PostGrid({ posts, label }: { posts: Post[]; label: string }) {
  return (
    <section aria-labelledby="post-grid-heading" className="px-6 pb-32">
      <Container width="marketing" padX={0}>
        <div className="reveal mb-12 flex items-baseline justify-between gap-6">
          <h2 id="post-grid-heading" className="display-sm text-white">
            {label}
          </h2>
          <span className="mono text-xs text-white/40">
            · {posts.length} {posts.length === 1 ? 'essay' : 'essays'}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="reveal rounded-2xl border border-dashed border-white/10 bg-surface-dark p-12 text-center">
            <p className="text-base text-white/60">
              No essays here yet.{' '}
              <Link
                href="/blog"
                className="font-semibold text-accent-amber hover:opacity-80"
              >
                See every category →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                delayMs={(index % 3) * 80}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function PostCard({ post, delayMs }: { post: Post; delayMs: number }) {
  return (
    <article
      className="reveal h-full"
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <a
        href="#"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-dark transition-colors duration-quick ease-quick hover:border-white/20"
      >
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 transition-transform duration-cinematic ease-cinematic group-hover:scale-[1.04]"
            style={{ background: post.gradient }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-25 mix-blend-soft-light"
            style={{
              background:
                'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4), transparent 55%)',
            }}
          />
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-6">
          <div className="label-tiny mb-3 text-accent-amber">
            {post.category}
          </div>
          <h3 className="mb-3 text-lg font-bold leading-snug text-white">
            {post.title}
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            {post.excerpt}
          </p>
          <div className="mt-auto flex items-center gap-2 text-xs text-white/45">
            <span className="font-medium text-white/75">{post.author}</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span>{post.date}</span>
            <span
              aria-hidden
              className="ml-auto mono text-[10px] text-accent-amber"
            >
              · {post.readingMinutes}m
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Newsletter signup
// ---------------------------------------------------------------------------

function NewsletterBlock() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-y border-white/5 px-6 py-28"
    >
      <Container width="marketing" padX={0}>
        <Grid columns={12} gutter={32} className="items-center">
          <GridItem span={12} className="reveal lg:!col-span-7">
            <div className="label-small mb-5 text-accent-amber">Subscribe</div>
            <h2 id="newsletter-heading" className="display-md mb-4 text-white">
              One essay a month.
              <br />
              No newsletter chaff.
            </h2>
            <p className="max-w-lg text-base text-white/60">
              The engineering deep-dives, customer numbers, and voice-AI essays
              we publish here — delivered once a month. Unsubscribe inline.
            </p>
          </GridItem>

          <GridItem
            span={12}
            className="reveal lg:!col-span-5"
            style={{ transitionDelay: '160ms' }}
          >
            <form
              aria-label="Subscribe to the Vought essays newsletter"
              action="#"
              method="post"
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-white/35 focus:border-accent-amber focus:outline-none focus:ring-1 focus:ring-accent-amber"
              />
              <button
                type="submit"
                className="pill-cta inline-flex items-center justify-center gap-2 rounded-full bg-accent-amber px-7 py-4 text-sm font-bold text-marketing-ink hover:opacity-90"
              >
                Subscribe
                <ArrowRight size={14} className="text-marketing-ink" />
              </button>
            </form>
            <p className="mt-3 text-xs text-white/40">
              <span className="mono text-accent-amber">· 412</span>{' '}
              subscribers · one essay every fourth Tuesday.
            </p>
          </GridItem>
        </Grid>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RSS note
// ---------------------------------------------------------------------------

function RSSNote() {
  return (
    <section aria-label="RSS" className="px-6 py-20">
      <Container width="marketing" padX={0}>
        <div className="reveal flex flex-col items-start justify-between gap-3 text-sm text-white/50 sm:flex-row sm:items-center">
          <span>Prefer your reader?</span>
          <a
            href="/blog/rss.xml"
            className="inline-flex items-center gap-2 text-white/80 transition-colors duration-quick ease-quick hover:text-accent-amber"
          >
            Subscribe via RSS
            <ArrowRight size={12} />
          </a>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface BlogPageProps {
  searchParams?: Promise<{ cat?: string }>;
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const requested = resolvedParams?.cat?.toLowerCase();
  const activeSlug =
    requested && CATEGORIES.some((c) => c.slug === requested)
      ? requested
      : 'all';

  const isAll = activeSlug === 'all';
  const filteredPosts = isAll
    ? POSTS
    : ALL_POSTS.filter((p) => categoryToSlug(p.category) === activeSlug);

  const activeLabel =
    CATEGORIES.find((c) => c.slug === activeSlug)?.label ?? 'All';

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Vought Blog · Notes from the conversation.',
    url: 'https://vought.com/blog',
    description: 'Engineering, customer stories, and voice-AI essays from the team building Vought.',
    publisher: { '@type': 'Organization', name: 'Vought', url: 'https://vought.com' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogHero />
      <CategoryRow active={activeSlug} />
      {isAll && <FeaturedPostCard post={FEATURED_POST} />}
      <PostGrid
        posts={filteredPosts}
        label={isAll ? 'Recent essays.' : `${activeLabel}.`}
      />
      <NewsletterBlock />
      <RSSNote />
    </>
  );
}
