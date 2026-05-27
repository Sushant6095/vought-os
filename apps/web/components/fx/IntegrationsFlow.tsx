'use client';

/**
 * IntegrationsFlow · dynamic integration constellation (Cresta-style).
 *
 * Brand tiles orbit a pulsing Vought core. On scroll-into-view the tiles pop
 * in with stagger, connector lines draw outward, a coloured pulse flows along
 * each line to the core, and every tile floats. Real brand marks come from
 * `simple-icons` where available; brands simple-icons no longer ships (for
 * trademark reasons) render as brand-coloured wordmarks. Reduced-motion
 * collapses to a clean static diagram.
 */

import { useEffect, useRef } from 'react';
import {
  siAircall,
  siHubspot,
  siGooglecalendar,
  siAnthropic,
  siZoom,
  siElevenlabs,
} from 'simple-icons';

type SI = { path: string; hex: string };

const ICON: Record<string, SI> = {
  aircall: siAircall,
  hubspot: siHubspot,
  gcal: siGooglecalendar,
  anthropic: siAnthropic,
  zoom: siZoom,
  elevenlabs: siElevenlabs,
};

type Tile = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  color: string; // brand colour (line + accent + wordmark)
  fill?: boolean; // filled brand tile (logo/text reversed white)
  flagship?: boolean;
};

const TILES: Tile[] = [
  // Left — telephony / CCaaS / CRM
  { id: 'aircall', label: 'Aircall', x: 25, y: 12, color: '#00b388' },
  { id: 'five9', label: 'Five9', x: 9, y: 26, color: '#3b4ea8', fill: true },
  { id: 'salesforce', label: 'Salesforce', x: 27, y: 35, color: '#00a1e0' },
  { id: 'genesys', label: 'Genesys', x: 5, y: 55, color: '#ff4f1f' },
  { id: 'hubspot', label: 'HubSpot', x: 25, y: 70, color: '#ff7a59' },
  { id: 'ringcentral', label: 'RingCentral', x: 11, y: 85, color: '#0b82c2' },
  { id: 'gcal', label: 'Google Calendar', x: 31, y: 95, color: '#4285f4' },
  // Right — comms / LLM / voice
  { id: 'amazonconnect', label: 'Amazon Connect', x: 90, y: 14, color: '#ff9900' },
  { id: 'openai', label: 'OpenAI', x: 73, y: 20, color: '#0b0b0d' },
  { id: 'elevenlabs', label: 'ElevenLabs', sub: 'Speech Engine', x: 71, y: 40, color: '#3358ff', fill: true, flagship: true },
  { id: 'twilio', label: 'Twilio', x: 93, y: 42, color: '#f22f46', fill: true },
  { id: 'anthropic', label: 'Anthropic', x: 95, y: 64, color: '#d97757' },
  { id: 'slack', label: 'Slack', x: 72, y: 72, color: '#4a154b' },
  { id: 'zoom', label: 'Zoom', x: 91, y: 84, color: '#2d8cff' },
];

const CX = 500;
const CY = 300;

function BrandIcon({ id, color }: { id: string; color: string }) {
  const icon = ICON[id];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill={color} aria-hidden className="shrink-0">
      <path d={icon.path} />
    </svg>
  );
}

export function IntegrationsFlow() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('live');
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={stage} className="int-stage relative mx-auto h-[600px] w-full max-w-[1080px] md:h-[680px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden>
        {TILES.map((t, i) => {
          const x = (t.x / 100) * 1000;
          const y = (t.y / 100) * 600;
          return (
            <g key={t.id}>
              <line className="int-line" x1={x} y1={y} x2={CX} y2={CY} pathLength={1}
                stroke="rgba(255,255,255,0.12)" strokeWidth={1} vectorEffect="non-scaling-stroke"
                style={{ ['--int-d' as string]: `${i * 70}ms` }} />
              <line className="int-pulse" x1={x} y1={y} x2={CX} y2={CY} pathLength={1}
                stroke={t.color === '#0b0b0d' ? '#8a8f98' : t.color} strokeWidth={t.flagship ? 2 : 1.4}
                strokeLinecap="round" vectorEffect="non-scaling-stroke"
                style={{ ['--int-d' as string]: `${i * 70 + 400}ms`, opacity: 0.8 }} />
            </g>
          );
        })}
      </svg>

      {TILES.map((t, i) => {
        const filled = t.fill;
        const hasIcon = !!ICON[t.id];
        return (
          <div key={t.id} className="int-tile absolute"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)', ['--int-d' as string]: `${i * 70}ms` }}>
            <div className="int-floater" style={{ ['--int-dur' as string]: `${5.5 + (i % 4) * 0.8}s`, ['--int-d' as string]: `${i * 130}ms` }}>
              <div
                className={`int-card flex items-center gap-2 rounded-2xl border px-4 ${t.flagship ? 'h-[60px]' : 'h-[52px]'}`}
                style={{
                  background: filled ? t.color : 'rgba(255,255,255,0.96)',
                  borderColor: filled ? 'transparent' : 'rgba(0,0,0,0.06)',
                  boxShadow: t.flagship ? `0 0 34px ${t.color}80` : `0 10px 30px rgba(0,0,0,0.35)`,
                }}
              >
                <BrandIcon id={t.id} color={filled ? '#fff' : t.color} />
                <div className="text-left leading-tight">
                  <span
                    className="block text-[13px] font-bold"
                    style={{ color: filled ? '#fff' : hasIcon ? '#15171c' : t.color }}
                  >
                    {t.label}
                  </span>
                  {t.sub && (
                    <span className="block text-[10px] font-medium" style={{ color: filled ? 'rgba(255,255,255,0.75)' : '#6b7280' }}>
                      {t.sub}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Pulsing core */}
      <div className="int-tile absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ['--int-d' as string]: '120ms' }}>
        <div className="relative flex h-[160px] w-[160px] items-center justify-center">
          {[0, 1, 2].map((r) => (
            <span key={r} className="int-ring absolute h-[110px] w-[110px] rounded-full border"
              style={{ borderColor: 'rgba(51,88,255,0.5)', animationDelay: `${r * 1.1}s` }} />
          ))}
          <div className="absolute h-[150px] w-[150px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(51,88,255,0.4), transparent 70%)' }} />
          <div className="relative flex h-[116px] w-[116px] items-center justify-center rounded-full" style={{ background: '#fff', boxShadow: '0 0 60px rgba(51,88,255,0.55)' }}>
            <svg width="46" height="46" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="5" width="1.7" height="6" rx="0.8" fill="#0a0a0a" />
              <rect x="5" y="2" width="1.7" height="12" rx="0.8" fill="#0a0a0a" />
              <rect x="8" y="3.5" width="1.7" height="9" rx="0.8" fill="#0a0a0a" />
              <rect x="11" y="6" width="1.7" height="4" rx="0.8" fill="#0a0a0a" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
