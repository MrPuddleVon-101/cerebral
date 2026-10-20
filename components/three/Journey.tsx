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
  const progressRef = useRef(0);

  const onReady = useCallback(() => setReady(true), []);

  /**
   * One rAF loop drives every beat's opacity and drift, the rail, the progress
   * meter and the 3D timeline.
   *
   * Element geometry is measured once and cached. Calling getBoundingClientRect
   * per element per frame, interleaved with style writes, forces a full layout
   * on every frame, and that was the single largest source of scroll judder.
   * Everything below reads window.scrollY only, and writes nothing but
   * compositor properties.
   */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    interface Beat {
      body: HTMLElement;
      kids: HTMLElement[];
      heading: HTMLElement | null;
      top: number;
      height: number;
    }
    let beats: Beat[] = [];
    let hostTop = 0;
    let hostSpan = 1;

    const measure = () => {
      const host = scrollRef.current;
      if (!host) return;
      hostTop = host.offsetTop;
      hostSpan = Math.max(1, host.offsetHeight - window.innerHeight);
      beats = actRefs.current.flatMap((el) => {
        const body = el?.querySelector<HTMLElement>('.act-body');
        if (!el || !body) return [];
        return [{
          body,
          kids: Array.from(body.children) as HTMLElement[],
          heading: body.querySelector<HTMLElement>('.act-heading'),
          top: el.offsetTop,
          height: el.offsetHeight,
        }];
      });
    };

    measure();

    // The cache has to survive everything that can change the layout after
    // first paint: fonts landing, images loading, and above all a viewport
    // resize, since the beats are sized in svh. A stale cache here runs the
    // timeline past its end.
    const ro = new ResizeObserver(measure);
    if (scrollRef.current) ro.observe(scrollRef.current);
    document.fonts?.ready.then(measure).catch(() => undefined);

    let resizeTimer = 0;
    const onResize = () => {
      measure();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 180);
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('load', measure);
    const settle = window.setTimeout(measure, 400);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      let current = 0;
      let best = Infinity;

      for (let i = 0; i < beats.length; i++) {
        const { body, kids, heading, top, height } = beats[i];
        // 0 as the beat enters the viewport, 1 as it leaves.
        const p = (vh - (top - scrollY)) / (height + vh);

        // The beat as a whole only ever fades out; the entrance is carried by
        // the children, staggered, so lines arrive rather than the block
        // appearing all at once.
        const exit = 1 - Math.min(1, Math.max(0, (p - 0.62) / 0.18));
        const enter = Math.min(1, Math.max(0, (p - 0.08) / 0.30));

        body.style.opacity = String(reduced ? 1 : exit);
        body.style.transform = reduced ? '' : `translate3d(0, ${(0.42 - p) * 34}px, 0)`;

        if (!reduced) {
          for (let k = 0; k < kids.length; k++) {
            const raw = (enter - k * 0.065) / 0.34;
            const e = Math.min(1, Math.max(0, raw));
            const eased = e * e * (3 - 2 * e);
            const kid = kids[k];
            if (kid === heading) {
              kid.style.setProperty('--w', String(eased));
            } else {
              kid.style.opacity = String(eased);
              kid.style.transform = `translate3d(0, ${(1 - eased) * 26}px, 0)`;
            }
          }
        }

        const d = Math.abs(p - 0.45);
        if (d < best) { best = d; current = i; }
      }

      setActive((a) => (a === current ? a : current));

      const f = Math.min(1, Math.max(0, (scrollY - hostTop) / hostSpan));
      progressRef.current = f;
      const meter = meterRef.current;
      if (meter) meter.style.transform = `scaleY(${f})`;
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', measure);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(settle);
    };
  }, []);

  return (
    <div className="journey" ref={scrollRef}>
      <JourneyCanvas progressRef={progressRef} onReady={onReady} />

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
            className={`act${isHero ? ' act--hero' : ''}${i === journeyActs.length - 1 ? ' act--last' : ''}`}
            data-side={place.side}
            data-align={place.align}
            ref={(el) => { actRefs.current[i] = el; }}
            aria-labelledby={`act-${act.index}`}
          >
            <div className="act-pin">
              <div className="act-body" style={{ opacity: 1 }}>
                <div className="act-index mono">
                  <span>{act.index}</span>
                  <span className="bar" aria-hidden />
                  <span>{act.label}</span>
                </div>

                <h2 id={`act-${act.index}`} className="act-heading">
                  {isHero ? act.heading : <span className="mark">{act.heading}</span>}
                </h2>

                {act.subheading ? (
                  <p className="act-subheading">{act.subheading}</p>
                ) : null}

                {act.body.map((para, k) => (
                  <p key={k}>{para}</p>
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
