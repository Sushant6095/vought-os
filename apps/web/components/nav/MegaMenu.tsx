/**
 * MegaMenu · the "Products" dropdown that opens from a nav link.
 *
 * Behavior:
 *   - Opens on hover with a 120ms delay so an accidental drag-through
 *     doesn't flash the panel.
 *   - Opens on focus immediately (no delay) so keyboard users get an
 *     instant response.
 *   - Closes on mouse leave with a 200ms grace window so the user can
 *     traverse the gap between trigger and panel without it snapping shut.
 *   - Esc closes; arrow keys are intentionally not trapped — the items
 *     are real links and the browser's tab order is the right model.
 *
 * The panel itself is glass over the page canvas (Blueprint §6).
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from '@/components/ui/Icon';

interface MegaMenuItem {
  title: string;
  description: string;
  href: string;
}

const PRODUCTS: MegaMenuItem[] = [
  {
    title: 'Vought Copilot',
    description: 'Whisper coaching in your own cloned voice.',
    href: '/copilot',
  },
  {
    title: 'Vought Receptionist',
    description: 'Autonomous AI for inbound calls.',
    href: '/receptionist',
  },
  {
    title: 'Vought Insights',
    description: 'Every objection, every deal, surfaced.',
    href: '/insights',
  },
  {
    title: 'Vought Personal',
    description: 'For the conversations that change your life.',
    href: '/personal',
  },
];

const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 200;

interface MegaMenuProps {
  label: string;
}

export function MegaMenu({ label }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const scheduleOpen = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_MS);
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Close on outside click for keyboard users who haven't pressed Esc.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        clearTimers();
        setOpen(true);
      }}
      onBlur={(e) => {
        // Only close when focus leaves the whole subtree.
        if (!rootRef.current?.contains(e.relatedTarget as Node)) scheduleClose();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 text-sm font-medium text-white/70 transition-colors duration-quick ease-quick hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown
          size={10}
          className={`transition-transform duration-quick ease-quick ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="nav-pill absolute left-1/2 top-full mt-3 w-[360px] -translate-x-1/2 rounded-xl p-2"
          style={{ borderRadius: 16 }}
        >
          <ul className="flex flex-col">
            {PRODUCTS.map((item) => (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  className="group flex items-center justify-between gap-4 rounded-md px-3 py-3 transition-colors duration-quick ease-quick hover:bg-white/5"
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="text-xs text-white/50">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-white/30 transition-all duration-quick ease-quick group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
