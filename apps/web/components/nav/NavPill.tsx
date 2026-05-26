/**
 * NavPill · the sticky floating glass nav above the marketing canvas.
 *
 * Structure (Blueprint §6, Scene 0):
 *   - Top utility pill announcing the latest release.
 *   - A glass-blur capsule below with wordmark, primary nav, and CTA.
 *
 * Hover behavior for the products link uses <MegaMenu>.
 */

import Link from 'next/link';
import { ArrowRight, Wordmark } from '@/components/ui/Icon';
import { MegaMenu } from './MegaMenu';

export function NavPill() {
  return (
    <>
      {/* Top utility pill */}
      <div className="fixed left-1/2 top-4 z-nav -translate-x-1/2">
        <Link
          href="/changelog"
          className="pill-cta inline-flex items-center gap-2 rounded-full bg-accent-amber px-5 py-2 text-xs font-bold text-marketing-ink hover:opacity-90"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-marketing-ink" />
          <span>New · Vought 2.0 is live</span>
          <ArrowRight size={12} className="text-marketing-ink" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Sticky nav */}
      <nav
        aria-label="Main navigation"
        className="fixed left-1/2 top-16 z-nav w-[min(1180px,calc(100vw-48px))] -translate-x-1/2"
      >
        <div className="nav-pill flex items-center justify-between gap-6 rounded-full px-7 py-3">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Vought home">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-marketing-ink">
              <Wordmark size={13} className="text-marketing-ink" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-white">
              VOUGHT
            </span>
          </Link>

          {/* Primary nav (hidden on small screens; the CTA still anchors the bar) */}
          <ul className="hidden items-center gap-7 md:flex">
            <li>
              <MegaMenu label="Products" />
            </li>
            <li>
              <Link
                href="/copilot"
                className="text-sm font-medium text-white/70 transition-colors duration-quick ease-quick hover:text-white"
              >
                Copilot
              </Link>
            </li>
            <li>
              <Link
                href="/receptionist"
                className="text-sm font-medium text-white/70 transition-colors duration-quick ease-quick hover:text-white"
              >
                Receptionist
              </Link>
            </li>
            <li>
              <Link
                href="/customers"
                className="text-sm font-medium text-white/70 transition-colors duration-quick ease-quick hover:text-white"
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="text-sm font-medium text-white/70 transition-colors duration-quick ease-quick hover:text-white"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-sm font-medium text-white/70 transition-colors duration-quick ease-quick hover:text-white"
              >
                Docs
              </Link>
            </li>
          </ul>

          {/* CTA */}
          <Link
            href="/demo"
            className="pill-cta inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-marketing-ink"
          >
            Get a demo
            <ArrowRight size={12} className="text-marketing-ink" strokeWidth={1.5} />
          </Link>
        </div>
      </nav>
    </>
  );
}
