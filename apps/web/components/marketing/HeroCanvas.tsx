'use client';

/**
 * HeroCanvas · live animated backdrop for the hero.
 *
 * A flowing field of stacked sine "ribbons" rendered on a 2D canvas —
 * approximates the Observe-style 3D wavy render without WebGL or assets.
 * One rAF loop, DPR-aware, pauses when offscreen, and honors
 * prefers-reduced-motion (renders a single static frame).
 */

import { useEffect, useRef } from 'react';

const LINES = 28;
const POINTS = 90;

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const baseY = h * 0.46;

      for (let i = 0; i < LINES; i++) {
        const depth = i / LINES; // 0 (front) → 1 (back)
        const yOffset = (i - LINES / 2) * (h * 0.012);
        const amp = (h * 0.10) * (1 - depth * 0.35);
        const speed = 0.00018 + depth * 0.00006;
        const phase = t * speed + i * 0.32;
        const isLime = i === Math.floor(LINES * 0.42);

        ctx.beginPath();
        for (let p = 0; p <= POINTS; p++) {
          const x = (p / POINTS) * w;
          const nx = (p / POINTS - 0.5) * 3.2;
          // layered sines → silky ribbon
          const y =
            baseY +
            yOffset +
            Math.sin(nx * 1.6 + phase) * amp +
            Math.sin(nx * 3.1 - phase * 1.3) * amp * 0.28 +
            Math.cos(nx * 0.7 + phase * 0.6) * amp * 0.4;
          // gentle horizontal vignette so the field fades at the edges
          const edge = 1 - Math.min(1, Math.abs(x - cx) / (w * 0.62)) ** 2;
          const yy = baseY + yOffset + (y - baseY - yOffset) * (0.25 + edge * 0.75);
          if (p === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }

        if (isLime) {
          ctx.strokeStyle = 'rgba(222, 249, 77, 0.45)';
          ctx.lineWidth = 1.4;
          ctx.shadowColor = 'rgba(222, 249, 77, 0.5)';
          ctx.shadowBlur = 12;
        } else {
          const alpha = 0.04 + (1 - depth) * 0.10;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    if (reduce) {
      draw(0);
    } else {
      const loop = (t: number) => {
        if (!running) return;
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Pause when the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting;
        if (running && !reduce) raf = requestAnimationFrame(function l(t) {
          if (!running) return;
          draw(t);
          raf = requestAnimationFrame(l);
        });
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
