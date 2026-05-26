/**
 * Scene 2 · Customer logos
 *
 * Type-set wordmarks (no images). The mockup intentionally avoids stock
 * logo SVGs — every wordmark is rendered as text and styled to feel
 * like a different identity system. Hairline-separated band.
 */

import { Container } from '@vought/ui';

interface Logo {
  label: string;
  className: string;
  /** Optional inline style for ligature-specific tracking that Tailwind can't express cleanly. */
  style?: React.CSSProperties;
}

const LOGOS: Logo[] = [
  { label: 'acme/', className: 'text-2xl font-black tracking-tight' },
  { label: 'PARALLEL', className: 'text-2xl font-light', style: { letterSpacing: '0.2em' } },
  { label: 'Cobalt.', className: 'text-2xl font-black italic' },
  { label: '▲ Northwind', className: 'text-xl font-bold' },
  { label: '{tripleByte}', className: 'text-xl mono' },
  { label: 'runway', className: 'text-xl font-extrabold', style: { letterSpacing: '-0.05em' } },
];

export function CustomerLogos() {
  return (
    <section
      aria-label="Customers"
      className="border-y border-white/5 py-16"
    >
      <Container width="marketing" padX={24}>
        <div className="reveal label-small mb-10 text-center text-white/40">
          Trusted by the revenue teams scaling fastest
        </div>
        <ul
          className="reveal grid grid-cols-2 items-center gap-8 md:grid-cols-6"
          style={{ transitionDelay: '80ms' }}
        >
          {LOGOS.map((logo) => (
            <li
              key={logo.label}
              className={`text-center text-white/30 ${logo.className}`}
              style={logo.style}
            >
              {logo.label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
