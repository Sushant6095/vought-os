'use client';

/**
 * NavPill · Observe-style black pill nav with mega-menus.
 *
 * Centered translucent black capsule, lime waveform mark, five nav items
 * (two with mega dropdowns), white "Get a demo" CTA. Hover-opens with a
 * short delay; keyboard focus opens immediately; Esc / outside-click close.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

type MegaKey = 'products' | 'solutions' | null;

const PRODUCTS: { title: string; blurb: string; href: string }[] = [
  {
    title: 'For Revenue Teams',
    blurb: 'Live whisper coaching that closes the deal on the call.',
    href: '/copilot',
  },
  {
    title: 'For the Front Desk',
    blurb: 'An autonomous receptionist that answers every inbound call.',
    href: '/receptionist',
  },
  {
    title: 'For Individuals',
    blurb: 'The line you would have said, in your own cloned voice.',
    href: '/copilot',
  },
];

const SOLUTIONS: { title: string; href: string }[] = [
  { title: 'Sales & Revenue', href: '/copilot' },
  { title: 'Customer Support', href: '/copilot' },
  { title: 'Healthcare', href: '/receptionist' },
  { title: 'Legal', href: '/receptionist' },
  { title: 'Real Estate', href: '/receptionist' },
  { title: 'Financial Services', href: '/copilot' },
  { title: 'Home Services', href: '/receptionist' },
  { title: 'Customer Stories', href: '/customers' },
];

export function NavPill() {
  const [open, setOpen] = useState<MegaKey>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const openMega = (key: MegaKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div className="relative w-full max-w-[1320px]">
        <nav
          aria-label="Main navigation"
          className="ob-nav flex items-center justify-between gap-6 rounded-full py-3 pl-6 pr-3"
        >
          <Logo />

          <div className="hidden items-center gap-1 lg:flex">
            <MegaTrigger
              label="Products"
              active={open === 'products'}
              onOpen={() => openMega('products')}
              onClose={scheduleClose}
            />
            <MegaTrigger
              label="Solutions"
              active={open === 'solutions'}
              onOpen={() => openMega('solutions')}
              onClose={scheduleClose}
            />
            <NavLink href="/customers" onFocus={() => setOpen(null)}>
              Partners
            </NavLink>
            <NavLink href="/docs" onFocus={() => setOpen(null)}>
              Developers
            </NavLink>
            <NavLink href="/about" onFocus={() => setOpen(null)}>
              Engine
            </NavLink>
          </div>

          <Link
            href="/contact"
            className="ob-btn-white whitespace-nowrap px-6 py-3 text-[15px]"
          >
            Get a demo
          </Link>
        </nav>

        {open === 'products' && (
          <MegaPanel onOpen={() => openMega('products')} onClose={scheduleClose}>
            <div className="grid gap-3 md:grid-cols-3">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.title}
                  href={p.href}
                  className="ob-mega-card group flex flex-col gap-2 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-white">
                      {p.title}
                    </span>
                    <span className="text-white/40 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                  <span className="text-sm leading-relaxed text-white/55">
                    {p.blurb}
                  </span>
                </Link>
              ))}
            </div>
          </MegaPanel>
        )}

        {open === 'solutions' && (
          <MegaPanel onOpen={() => openMega('solutions')} onClose={scheduleClose}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="ob-mega-card group flex items-center justify-between p-4"
                >
                  <span className="text-sm font-medium text-white">{s.title}</span>
                  <span className="text-white/40 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </MegaPanel>
        )}
      </div>
    </header>
  );
}

function MegaTrigger({
  label,
  active,
  onOpen,
  onClose,
}: {
  label: string;
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      aria-expanded={active}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] transition-colors ${
        active ? 'text-[var(--ob-lime)]' : 'text-white/85 hover:text-white'
      }`}
    >
      {label}
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className={active ? 'rotate-180 transition-transform' : 'transition-transform'}
      >
        <path
          d="M2.5 4.5L6 8l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function NavLink({
  href,
  children,
  onFocus,
}: {
  href: string;
  children: React.ReactNode;
  onFocus?: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className="rounded-full px-4 py-2 text-[15px] text-white/85 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}

function MegaPanel({
  children,
  onOpen,
  onClose,
}: {
  children: React.ReactNode;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      className="ob-mega absolute inset-x-0 top-[calc(100%+10px)] rounded-[28px] p-4"
    >
      {children}
    </div>
  );
}

