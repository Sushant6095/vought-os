/**
 * Footer · Observe-style mega footer.
 *
 * Pure-black, five link columns + brand block, Pulse Core mark, award
 * badges, bottom legal row. Shared across every marketing route.
 */

import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Products',
    links: [
      { label: 'Copilot', href: '/copilot' },
      { label: 'Receptionist', href: '/receptionist' },
      { label: 'Platform', href: '/platform' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Sales & Revenue', href: '/copilot' },
      { label: 'Customer Support', href: '/copilot' },
      { label: 'Healthcare', href: '/receptionist' },
      { label: 'Legal', href: '/receptionist' },
      { label: 'Real Estate', href: '/receptionist' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Customers', href: '/customers' },
      { label: 'Security', href: '/security' },
      { label: 'Docs', href: '/platform' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Engine', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/about' },
      { label: 'Customers', href: '/customers' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black px-6 pb-12 pt-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand block */}
          <div>
            <Logo className="mb-5" />
            <p className="max-w-xs text-sm leading-relaxed text-white/45">
              Intelligence for live conversations. Vought whispers the next line
              in your ear, in your own cloned voice, in under a second.
            </p>
            <div className="mt-6 flex gap-2">
              {['SOC 2', 'HIPAA', 'GDPR'].map((b) => (
                <span
                  key={b}
                  className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/45"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-sm font-semibold text-white">{col.heading}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-8 text-sm text-white/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Vought, Inc. · San Francisco</span>
          <div className="flex gap-6">
            <Link href="/security" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/security" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/security" className="transition-colors hover:text-white">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
