'use client';

/**
 * EngineCore3D · the "Speech Engine core" centrepiece for the /about lab.
 *
 * A glowing wireframe icosahedron core wrapped in counter-rotating gyro
 * rings and a particle shell — the visual metaphor for the realtime voice
 * engine. Mouse parallax, slow auto-rotation, transparent background.
 * DPR-capped, pauses offscreen, disposes on unmount, static under
 * prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BLUE = 0x3358ff;

export function EngineCore3D() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 7.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(dpr);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    scene.add(new THREE.AmbientLight(0x88a0ff, 0.7));
    const key = new THREE.PointLight(BLUE, 3, 50);
    key.position.set(4, 3, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xffffff, 1.4, 40);
    rim.position.set(-5, -3, 4);
    scene.add(rim);

    const core = new THREE.Group();
    scene.add(core);

    // Inner solid
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 1),
      new THREE.MeshStandardMaterial({ color: 0x0b1130, metalness: 0.6, roughness: 0.2, emissive: BLUE, emissiveIntensity: 0.35 }),
    );
    core.add(inner);
    // Wireframe shell
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.7, 1)),
      new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.5 }),
    );
    core.add(wire);

    // Gyro rings
    const rings: THREE.Mesh[] = [];
    const ringMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.45 });
    [2.4, 2.8, 3.2].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 12, 120), ringMat.clone());
      ring.rotation.x = Math.PI / 2 + i * 0.7;
      ring.rotation.y = i * 0.5;
      scene.add(ring);
      rings.push(ring);
    });

    // Particle shell
    const N = 420;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(3.6 + Math.random() * 1.8);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xa9b8ff, size: 0.03, transparent: true, opacity: 0.55 }));
    scene.add(dust);

    let w = 0, h = 0;
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let tx = 0, ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf = 0, running = true, t = 0;
    const frame = () => {
      t += 0.016;
      core.rotation.y += 0.004;
      core.rotation.x += 0.0016;
      const pulse = 1 + Math.sin(t * 1.4) * 0.04;
      inner.scale.setScalar(pulse);
      (inner.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(t * 1.4) * 0.18;
      rings[0].rotation.z += 0.006;
      rings[1].rotation.z -= 0.004;
      rings[2].rotation.x += 0.005;
      dust.rotation.y += 0.0008;
      scene.rotation.y += (tx * 0.3 - scene.rotation.y) * 0.04;
      scene.rotation.x += (ty * 0.2 - scene.rotation.x) * 0.04;
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };
    if (reduce) renderer.render(scene, camera);
    else raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting && !reduce;
      if (running) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    }, { threshold: 0 });
    io.observe(el);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      io.disconnect();
      renderer.dispose();
      dustGeo.dispose();
    };
  }, []);

  return <div ref={mount} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
