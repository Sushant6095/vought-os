/**
 * Scene 12 · Footer
 *
 * Five-column footer with wordmark + social on the left, four link
 * columns on the right, bottom row for legal.
 *
 * Slightly darker than canvas to ground the page at the bottom.
 */

import Link from 'next/link';
import { Container } from '@vought/ui';
import { Wordmark, XMark, LinkedIn } from '@/components/ui/Icon';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Products',
    links: [
      { label: 'Copilot', href: '/copilot' },
      { label: 'Receptionist', href: '/receptionist' },
      { label: 'Insights', href: '/insights' },
      { label: 'Platform', href: '/platform' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Sales', href: '/solutions/sales' },
      { label: 'Support', href: '/solutions/support' },
      { label: 'SMB', href: '/solutions/smb' },
      { label: 'Healthcare', href: '/solutions/healthcare' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Customers', href: '/customers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Blog', href: '/blog' },
      { label: 'Security', href: '/security' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="border-t border-white/5 px-6 py-16"
      style={{ background: '#0C0C0E' }}
    >
      <Container width="marketing" padX={0}>
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-12">
          {/* Wordmark + social */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="mb-4 flex items-center gap-2.5" aria-label="Vought home">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-marketing-ink">
                <Wordmark size={13} className="text-marketing-ink" />
              </span>
              <span className="text-[15px] font-bold tracking-tight text-white">
                VOUGHT
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/50">
              Intelligence for live conversations. Made by Vought Inc. in San
              Francisco.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://x.com/voughthq"
                aria-label="Vought on X"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors duration-quick ease-quick hover:bg-white/10"
              >
                <XMark size={14} color="white" className="opacity-70" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/voughthq"
                aria-label="Vought on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors duration-quick ease-quick hover:bg-white/10"
              >
                <LinkedIn size={14} color="white" className="opacity-70" />
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav
              key={col.title}
              aria-labelledby={`footer-${col.title.toLowerCase()}`}
              className="col-span-1 md:col-span-2"
            >
              <div
                id={`footer-${col.title.toLowerCase()}`}
                className="label-tiny mb-4 text-white/30"
              >
                {col.title}
              </div>
              <ul className="space-y-2 text-sm text-white/60">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-quick ease-quick hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <div>© 2026 Vought Inc. · All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/security" className="hover:text-white">
              Trust
            </Link>
            <Link href="/legal/dpa" className="hover:text-white">
              DPA
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
