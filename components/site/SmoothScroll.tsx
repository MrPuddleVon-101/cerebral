'use client';

import { useEffect } from 'react';

/**
 * Weighted scrolling. The journey is driven by scroll position, so the scroll
 * itself needs inertia — otherwise the camera snaps and the whole thing reads
 * as a slideshow rather than a move through space.
 *
 * Skipped entirely under prefers-reduced-motion, where native scrolling is the
 * correct behaviour.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let cancelled = false;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({
        // Heavy and slow on purpose: the camera is driven by scroll position,
        // so the weight of the scroll is the weight of the journey.
        duration: 1.6,
        easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
        wheelMultiplier: 0.68,
        touchMultiplier: 1.15,
      });
      lenis = instance;
      const loop = (time: number) => {
        instance.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
