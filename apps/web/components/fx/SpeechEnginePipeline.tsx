'use client';

/**
 * SpeechEnginePipeline · custom animated laser architecture (no React Flow).
 *
 * Seven stage cards pop in + float; beams ignite and draw between them, then
 * stream multiple laser pulses continuously toward the output; the Echo
 * Engine core pulses; an asteroid/star field drifts behind. The ElevenLabs
 * STT/TTS legs beam brightest blue. Triggered on scroll-into-view; reduced-
 * motion collapses to a clean static diagram (keyframes in globals.css).
 */

import { useEffect, useRef } from 'react';

type Stage = {
  id: string;
  idx: string;
  title: string;
  sub: string;
  latency?: string;
  x: number; // % of stage
  y: number;
  eleven?: boolean;
  hub?: boolean;
};

const STAGES: Stage[] = [
  { id: 'mic', idx: '01', title: 'Operator mic', sub: '16 kHz mono PCM', x: 7, y: 56 },
  { id: 'stt', idx: '02', title: 'ElevenLabs STT', sub: 'streaming · end-of-turn', latency: '≤350ms', x: 22, y: 56, eleven: true },
  { id: 'diar', idx: '03', title: 'Diarization', sub: 'diart · self-voice gate', x: 38, y: 22 },
  { id: 'engine', idx: '04', title: 'Echo Engine', sub: 'persona · RAG · memory', x: 42, y: 84, hub: true },
  { id: 'llm', idx: '05', title: 'LLM stream', sub: 'gpt-4o-mini / claude', latency: '≤250ms', x: 61, y: 56 },
  { id: 'tts', idx: '06', title: 'ElevenLabs TTS', sub: 'Flash v2 · cloned voice', latency: '≤200ms', x: 78, y: 56, eleven: true },
  { id: 'ear', idx: '07', title: 'AirPods', sub: '· 412ms total', x: 93, y: 56 },
];

const BEAMS: [string, string, boolean?][] = [
  ['mic', 'stt', true],
  ['stt', 'diar'],
  ['stt', 'engine'],
  ['diar', 'engine'],
  ['engine', 'llm'],
  ['llm', 'tts', true],
  ['tts', 'ear', true],
];

const BY = Object.fromEntries(STAGES.map((s) => [s.id, s]));

function AsteroidField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, running = true;
    type P = { x: number; y: number; z: number; r: number; vx: number; rot: number; vr: number; rock: boolean };
    let parts: P[] = [];
    const seed = () => {
      parts = [];
      const n = Math.round((w * h) / 13000);
      for (let i = 0; i < n; i++) {
        const rock = Math.random() < 0.13;
        parts.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), r: rock ? 3 + Math.random() * 7 : 0.5 + Math.random() * 1.5, vx: -(0.12 + Math.random() * 0.6), rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.012, rock });
      }
    };
    const resize = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); seed(); };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx * (0.4 + p.z); p.rot += p.vr;
        if (p.x < -12) { p.x = w + 12; p.y = Math.random() * h; }
        if (p.rock) {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath();
          for (let s = 0; s <= 6; s++) { const a = (s / 6) * Math.PI * 2; const rr = p.r * (0.7 + ((s * 13) % 5) / 10); ctx[s ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
          ctx.fillStyle = `rgba(120,135,170,${0.05 + p.z * 0.08})`; ctx.fill(); ctx.restore();
        } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(180,195,255,${0.2 + p.z * 0.55})`; ctx.fill(); }
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    const io = new IntersectionObserver(([e]) => { running = e.isIntersecting && !reduce; if (running) raf = requestAnimationFrame(draw); else cancelAnimationFrame(raf); }, { threshold: 0 });
    io.observe(c);
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); io.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

export function SpeechEnginePipeline() {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('live'); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={stage} className="int-stage relative mx-auto h-[460px] w-full max-w-[1180px] overflow-hidden rounded-[28px] border border-white/10 md:h-[440px]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(51,88,255,0.05), transparent 70%)' }}>
      <AsteroidField />

      {/* Laser beams */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {BEAMS.map(([a, b, eleven], i) => {
          const A = BY[a], B = BY[b];
          const d = `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
          const core = eleven ? '#6f8cff' : 'rgba(255,255,255,0.5)';
          const halo = eleven ? '#3358ff' : '#7e8aa0';
          const base = i * 80;
          return (
            <g key={`${a}-${b}`}>
              {/* glow halo */}
              <path d={d} fill="none" stroke={halo} strokeWidth={eleven ? 6 : 3.5} strokeOpacity={eleven ? 0.4 : 0.18} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {/* core, draws on entrance */}
              <path className="int-line" d={d} pathLength={1} fill="none" stroke={core} strokeWidth={eleven ? 1.8 : 1.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ ['--int-d' as string]: `${base}ms` }} />
              {/* three staggered laser pulses streaming along the beam */}
              {[0, 0.85, 1.7].map((off, j) => (
                <path
                  key={j}
                  className="int-pulse"
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={eleven ? 2.6 : 1.8}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ animationDelay: `${base + off * 870}ms`, filter: `drop-shadow(0 0 4px ${halo})` }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Stage cards */}
      {STAGES.map((s, i) => (
        <div key={s.id} className="int-tile absolute z-10" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)', ['--int-d' as string]: `${i * 80}ms` }}>
          <div className="int-floater" style={{ ['--int-dur' as string]: `${5.5 + (i % 4) * 0.7}s`, ['--int-d' as string]: `${i * 120}ms` }}>
            {s.hub && (
              <>
                {[0, 1, 2].map((r) => (
                  <span key={r} className="int-ring absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ borderColor: 'rgba(51,88,255,0.5)', animationDelay: `${r * 1.1}s` }} />
                ))}
              </>
            )}
            <div
              className={`int-card relative rounded-2xl border px-5 py-3.5 ${s.hub ? 'w-[210px]' : 'w-[178px]'}`}
              style={{
                background: s.eleven ? 'rgba(51,88,255,0.16)' : 'rgba(14,17,28,0.9)',
                borderColor: s.eleven ? 'rgba(51,88,255,0.65)' : 'var(--ob-line)',
                boxShadow: s.eleven ? '0 0 40px rgba(51,88,255,0.45)' : s.hub ? '0 0 36px rgba(255,255,255,0.07)' : '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-[var(--font-mono)] text-[10px] text-white/30">{s.idx}</span>
                {s.eleven && <span className="rounded-full px-2 py-0.5 text-[8px] font-bold tracking-[0.12em]" style={{ background: 'var(--ob-blue)', color: '#fff' }}>ELEVENLABS</span>}
              </div>
              <div className="text-[14px] font-semibold text-white">{s.title}</div>
              <div className="mt-0.5 font-[var(--font-mono)] text-[10px] text-white/45">{s.sub}</div>
              {s.latency && <div className="mt-1.5 font-[var(--font-mono)] text-[11px]" style={{ color: 'var(--ob-blue-soft)' }}>· {s.latency}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
