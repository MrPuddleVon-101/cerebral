'use client';

import { useEffect, useRef } from 'react';

/**
 * A soft light that trails the cursor.
 *
 * Two layers with different lag — a small bright core and a large slow halo —
 * composited with `screen` so it only ever adds light and never dims the page
 * underneath. Fine pointers only, and off under reduced motion.
 */
export function CursorGlow() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrap = wrapRef.current;
    const halo = haloRef.current;
    const core = coreRef.current;
    if (!wrap || !halo || !core) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let hx = tx, hy = ty, cx = tx, cy = ty;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const el = e.target as Element | null;
      const hot = !!el?.closest?.('a, button, [role="button"], input, summary');
      if (hot !== wrap.dataset.hot?.startsWith('t')) {
        wrap.dataset.hot = String(hot);
      }
      if (!visible) {
        visible = true;
        hx = cx = tx;
        hy = cy = ty;
        halo.style.opacity = '1';
        core.style.opacity = '1';
      }
    };
    const onLeave = () => {
      visible = false;
      halo.style.opacity = '0';
      core.style.opacity = '0';
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      hx += (tx - hx) * 0.032;
      hy += (ty - hy) * 0.032;
      cx += (tx - cx) * 0.105;
      cy += (ty - cy) * 0.105;
      halo.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%)`;
      core.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return (
    <div className="cursor-glow" aria-hidden ref={wrapRef} data-hot="false">
      <div className="cursor-glow-halo" ref={haloRef}><i /></div>
      <div className="cursor-glow-core" ref={coreRef}><i /></div>
    </div>
  );
}
