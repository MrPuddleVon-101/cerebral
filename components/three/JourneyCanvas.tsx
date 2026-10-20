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
  progressRef,
  onReady,
}: {
  /** Normalised 0..1 scroll position, written by the Journey loop. */
  progressRef: React.RefObject<number>;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<JourneyHandle | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let onResize: (() => void) | null = null;
    let onVisibility: (() => void) | null = null;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    import('./journey/engine')
      .then(({ createJourney }) => {
        if (disposed) return;

        // The engine pulls scroll position from the ref on its own frame, so
        // there is one rAF loop here rather than two, and no layout read.
        const handle = createJourney(canvas, {
          reducedMotion: reduced,
          onReady,
          getProgress: () => progressRef.current,
        });
        handleRef.current = handle;

        onResize = () => handle.resize();
        window.addEventListener('resize', onResize, { passive: true });

        onVisibility = () => handle.setPaused(document.hidden);
        document.addEventListener('visibilitychange', onVisibility);
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      if (onResize) window.removeEventListener('resize', onResize);
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [progressRef, onReady]);

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
