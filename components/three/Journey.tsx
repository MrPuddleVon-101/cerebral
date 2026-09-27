'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { JourneyCanvas } from '@/components/three/JourneyCanvas';
import { journeyActs } from '@/content/journey';
import { site } from '@/content/site';

/** Composition of each beat: which side the copy sits on, and how high. */
const PLACEMENT: { side: 'left' | 'right'; align: 'start' | 'center' | 'end' }[] = [
  { side: 'left',  align: 'end'    }, // 00 hero
  { side: 'left',  align: 'center' }, // 01 definition
  { side: 'right', align: 'center' }, // 02 the cap
  { side: 'left',  align: 'end'    }, // 03 the ear
  { side: 'right', align: 'start'  }, // 04 what arrives
  { side: 'left',  align: 'center' }, // 05 separation
  { side: 'right', align: 'center' }, // 06 decoding
  { side: 'left',  align: 'end'    }, // 07 the device
  { side: 'left',  align: 'center' }, // 08 adoption
];

export function Journey() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const actRefs = useRef<(HTMLElement | null)[]>([]);
  const meterRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  const onReady = useCallback(() => setReady(true), []);

  /**
   * One rAF loop drives every beat's opacity and drift, plus the rail and the
   * progress meter. Doing this per frame rather than on scroll events keeps the
   * copy in step with the smooth-scrolled camera.
   */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      let current = 0;
      let best = Infinity;

      actRefs.current.forEach((el, i) => {
        if (!el) return;
        const body = el.querySelector<HTMLElement>('.act-body');
        if (!body) return;

        const r = el.getBoundingClientRect();
        // 0 as the beat enters the viewport, 1 as it leaves.
        const p = (vh - r.top) / (r.height + vh);

        const fadeIn = Math.min(1, Math.max(0, (p - 0.10) / 0.16));
        const fadeOut = 1 - Math.min(1, Math.max(0, (p - 0.62) / 0.18));
        const o = reduced ? 1 : Math.min(fadeIn, fadeOut);

        body.style.opacity = String(o);
        body.style.transform = reduced ? '' : `translate3d(0, ${(0.42 - p) * 54}px, 0)`;

        const d = Math.abs(p - 0.45);
        if (d < best) { best = d; current = i; }
      });

      setActive((a) => (a === current ? a : current));

      const host = scrollRef.current;
      const meter = meterRef.current;
      if (host && meter) {
        const total = host.scrollHeight - vh;
        const y = -host.getBoundingClientRect().top;
        const f = total > 0 ? Math.min(1, Math.max(0, y / total)) : 0;
        meter.style.transform = `scaleY(${f})`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="journey" ref={scrollRef}>
      <JourneyCanvas scrollRef={scrollRef} onReady={onReady} />

      <div className="rail-index" aria-hidden>
        {journeyActs.map((a, i) => (
          <span key={a.index} data-on={i === active}>{a.index}</span>
        ))}
      </div>

      <div className="meter" aria-hidden>
        <i ref={meterRef} />
      </div>

      {journeyActs.map((act, i) => {
        const place = PLACEMENT[i] ?? { side: 'left', align: 'center' };
        const isHero = i === 0;

        return (
          <section
            key={act.index}
            className={`act${isHero ? ' act--hero' : ''}`}
            data-side={place.side}
            data-align={place.align}
            ref={(el) => { actRefs.current[i] = el; }}
            aria-labelledby={`act-${act.index}`}
          >
            <div className="act-pin">
              <div className="act-body" style={{ opacity: isHero ? 1 : 0 }}>
                <div className="act-index mono">
                  <span>{act.index}</span>
                  <span className="bar" aria-hidden />
                  <span>{act.label}</span>
                </div>

                <h2
                  id={`act-${act.index}`}
                  className="act-heading"
                  style={isHero ? undefined : undefined}
                >
                  {act.heading}
                </h2>

                {act.body.map((para, k) => (
                  <p key={k} className={isHero && k === 0 ? 'lede' : undefined}>{para}</p>
                ))}

                {act.readout ? (
                  <dl className="readout mono">
                    {act.readout.map((r) => (
                      <div className="readout-line" key={r.k}>
                        <dt>{r.k}</dt>
                        <dd>{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {act.caveat ? (
                  <p
                    className="mono"
                    style={{
                      marginTop: 18,
                      color: 'var(--bone-28)',
                      textTransform: 'none',
                      letterSpacing: '0.05em',
                      borderLeft: '1px solid var(--rule)',
                      paddingLeft: 11,
                      maxWidth: '44ch',
                    }}
                  >
                    {act.caveat}
                  </p>
                ) : null}

                {act.link ? (
                  <p style={{ marginTop: 'clamp(22px, 3vw, 34px)' }}>
                    <Link className="link mono" href={act.link.href}>
                      {act.link.label} <span className="arrow" aria-hidden>→</span>
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>

            {isHero ? (
              <div className="cue mono" aria-hidden style={{ opacity: ready ? 1 : 0, transition: 'opacity 1.2s var(--ease)' }}>
                <span>Scroll</span>
                <span className="track" />
              </div>
            ) : null}
          </section>
        );
      })}

      <span className="sr-only">
        {site.name}: {site.thesis} The animated sequence above is decorative; the
        same material is written out in full across the Research, Technology,
        Build and Adoption sections.
      </span>
    </div>
  );
}
