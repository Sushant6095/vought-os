'use client';

/**
 * Hero3D · a small Three.js scene of floating geometric objects behind the
 * hero. Solids + wireframes in electric blue / white on a transparent
 * canvas (the scroll-bg colour shows through). Objects rotate continuously,
 * parallax toward the pointer, and drift on scroll. DPR-capped, pauses when
 * offscreen, disposes on unmount, and renders a single static frame under
 * prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BLUE = 0x3358ff;

export function Hero3D() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(dpr);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // Lights
    scene.add(new THREE.AmbientLight(0x8090ff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(-4, 6, 8);
    scene.add(dir);
    const pt = new THREE.PointLight(BLUE, 2.2, 40);
    pt.position.set(5, -2, 6);
    scene.add(pt);

    const group = new THREE.Group();
    scene.add(group);

    type Floater = { mesh: THREE.Object3D; spin: THREE.Vector3; floatPhase: number; floatAmp: number; baseY: number };
    const floaters: Floater[] = [];

    const addSolid = (geo: THREE.BufferGeometry, pos: [number, number, number], wire: boolean) => {
      const mat = wire
        ? new THREE.MeshBasicMaterial({ color: BLUE, wireframe: true, transparent: true, opacity: 0.55 })
        : new THREE.MeshStandardMaterial({ color: 0x0d1326, metalness: 0.4, roughness: 0.25, emissive: BLUE, emissiveIntensity: 0.12 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      group.add(mesh);
      floaters.push({
        mesh,
        spin: new THREE.Vector3((Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.003),
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.2 + Math.random() * 0.3,
        baseY: pos[1],
      });
    };

    addSolid(new THREE.IcosahedronGeometry(1.7, 0), [-3.4, 0.8, 0], true);
    addSolid(new THREE.IcosahedronGeometry(1.2, 0), [3.6, -0.6, -1], false);
    addSolid(new THREE.TorusGeometry(0.9, 0.32, 16, 60), [2.4, 1.8, 1], true);
    addSolid(new THREE.OctahedronGeometry(0.8, 0), [-2.2, -1.8, 1.5], false);
    addSolid(new THREE.DodecahedronGeometry(0.55, 0), [0.4, -2.2, 2], true);

    // Floating particle dust
    const dustGeo = new THREE.BufferGeometry();
    const N = 140;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0x9fb0ff, size: 0.035, transparent: true, opacity: 0.6 }),
    );
    scene.add(dust);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // Pointer parallax
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf = 0;
    let running = true;
    let t = 0;

    const frame = () => {
      t += 0.016;
      for (const f of floaters) {
        f.mesh.rotation.x += f.spin.x;
        f.mesh.rotation.y += f.spin.y;
        f.mesh.rotation.z += f.spin.z;
        f.mesh.position.y = f.baseY + Math.sin(t * 0.6 + f.floatPhase) * f.floatAmp;
      }
      dust.rotation.y += 0.0006;
      // parallax toward pointer + scroll drift
      const scrollDrift = window.scrollY * 0.0012;
      group.rotation.y += (tx * 0.4 - group.rotation.y) * 0.05;
      group.rotation.x += (ty * 0.25 - group.rotation.x) * 0.05;
      group.position.y = scrollDrift * 2;
      camera.position.x += (tx * 0.6 - camera.position.x) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting && !reduce;
        if (running) raf = requestAnimationFrame(frame);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 },
    );
    io.observe(el);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      io.disconnect();
      renderer.dispose();
      dustGeo.dispose();
      floaters.forEach((f) => {
        const m = f.mesh as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material)?.dispose();
      });
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
