'use client';

import { useEffect, useRef, useState } from 'react';

import type { JourneyHandle } from './journey/engine';

/**
 * Mounts the WebGL journey behind the homepage and feeds it scroll progress.
 *
 * The scene is a presentation layer and nothing more: if WebGL is unavailable,
 * the module fails to load, or the device is too weak, this renders nothing and
 * the page below still reads completely (PRD §18, FR-01).
 */
export function JourneyCanvas({
  scrollRef,
  onReady,
}: {
  /** Element whose scroll extent drives the timeline. */
  scrollRef: React.RefObject<HTMLElement | null>;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<JourneyHandle | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let raf = 0;
    let onResize: (() => void) | null = null;
    let onVisibility: (() => void) | null = null;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    import('./journey/engine')
      .then(({ createJourney }) => {
        if (disposed) return;

        const handle = createJourney(canvas, { reducedMotion: reduced, onReady });
        handleRef.current = handle;

        // Read scroll every frame rather than on the scroll event: with smooth
        // scrolling the position keeps easing after the last event fires.
        const tick = () => {
          raf = requestAnimationFrame(tick);
          const el = scrollRef.current;
          if (!el) return;
          const total = el.scrollHeight - window.innerHeight;
          const y = -el.getBoundingClientRect().top;
          handle.setProgress(total > 0 ? y / total : 0);
        };
        raf = requestAnimationFrame(tick);

        onResize = () => handle.resize();
        window.addEventListener('resize', onResize, { passive: true });

        onVisibility = () => handle.setPaused(document.hidden);
        document.addEventListener('visibilitychange', onVisibility);
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (onResize) window.removeEventListener('resize', onResize);
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [scrollRef, onReady]);

  if (failed) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        contain: 'strict',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
