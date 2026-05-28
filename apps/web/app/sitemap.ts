import { MetadataRoute } from 'next';
import { INDUSTRY_SLUGS } from './solutions/_data/industries';

const BASE = 'https://vought.com';

const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'monthly', priority: 1.0 },
  { path: '/copilot', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/receptionist', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/platform', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/customers', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/security', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/docs', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/solutions', changeFrequency: 'monthly', priority: 0.8 },
  ...INDUSTRY_SLUGS.map((slug) => ({
    path: `/solutions/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
