import Link from 'next/link';

import { Journey } from '@/components/three/Journey';
import { Reveal, SectionLabel, StatusBadge } from '@/components/site/ui';
import { milestones } from '@/content/roadmap';
import { site } from '@/content/site';
import { studies } from '@/content/research';
import { updates } from '@/content/updates';

export default function HomePage() {
  const flagship = studies[0];
  const preview = studies.slice(0, 3);
  const latest = updates[0];
  const roadmapPreview = milestones.slice(0, 4);

  return (
    <>
      <Journey />

      <div className="after-journey">
        <hr className="rule" />

        {/* ---------------------------------------------- flagship study ---- */}
        <section className="shell" style={{ paddingBlock: 'clamp(64px, 9vw, 130px)' }}>
          <SectionLabel index="01">Current flagship study</SectionLabel>

          <Reveal>
            <div style={{ display: 'grid', gap: 'clamp(28px, 4vw, 64px)', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)' }} className="home-split">
              <div className="stack-m">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <StatusBadge status={flagship.status} />
                  <span className="badge mono">{flagship.year}</span>
                  <span className="badge mono">Technical · 80/20</span>
                </div>
                <h2 style={{ maxWidth: '20ch' }}>{flagship.subtitle}</h2>
                <p className="lede">{flagship.researchQuestion}</p>
                <Link className="link mono" href={`/research/${flagship.slug}/`}>
                  Study design, methods and limitations <span className="arrow" aria-hidden>→</span>
                </Link>
              </div>

              <dl className="defs mono" style={{ alignSelf: 'start' }}>
                <div className="def"><dt>Status</dt><dd>Research design</dd></div>
                <div className="def"><dt>Results</dt><dd>None published</dd></div>
                <div className="def"><dt>Data</dt><dd>Public datasets, not yet fixed</dd></div>
                <div className="def"><dt>Next</dt><dd>Pre-registration</dd></div>
              </dl>
            </div>
          </Reveal>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------- how it links ---- */}
        <section className="shell" style={{ paddingBlock: 'clamp(64px, 9vw, 130px)' }}>
          <SectionLabel index="02">How the parts connect</SectionLabel>
          <Reveal>
            <p className="lede" style={{ marginBottom: 'clamp(30px, 4vw, 54px)' }}>
              One investigation, four dependent questions. Each stage constrains the next, and a
              result that undermines an earlier stage is supposed to change what gets built.
            </p>
          </Reveal>

          <div className="rows">
            {[
              { n: 'I',   t: 'Biosignals',  href: '/technology/', d: 'What can compact, non-invasive sensors around the ear actually pick up — and how much of it is muscle rather than cortex?' },
              { n: 'II',  t: 'AI decoding', href: '/technology/models/', d: 'Can signal processing and machine learning recover useful structure from a short, noisy, low-channel recording?' },
              { n: 'III', t: 'Engineering', href: '/build/', d: 'How small and unobtrusive can the sensing system get before the performance cost stops being worth it?' },
              { n: 'IV',  t: 'Adoption',    href: '/adoption/', d: 'At what point would someone outside a lab trust the thing, wear it daily, and pay for it?' },
            ].map((x, i) => (
              <Reveal as="div" key={x.n} delay={i * 70}>
                <Link className="row row-3" href={x.href}>
                  <span className="mono dimmer">{x.n}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 8 }}>{x.t}</span>
                    <span className="dim" style={{ maxWidth: '58ch', display: 'block' }}>{x.d}</span>
                  </span>
                  <span className="mono dimmer" style={{ justifySelf: 'start' }}>Open →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <hr className="rule" />

        {/* -------------------------------------------- research library ----- */}
        <section className="shell" style={{ paddingBlock: 'clamp(64px, 9vw, 130px)' }}>
          <SectionLabel index="03">Research library</SectionLabel>
          <div className="rows">
            {preview.map((s, i) => (
              <Reveal as="div" key={s.slug} delay={i * 70}>
                <Link className="row row-3" href={`/research/${s.slug}/`}>
                  <span className="mono dimmer">{s.year}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 10, maxWidth: '44ch' }}>{s.title}</span>
                    <span className="dim" style={{ maxWidth: '62ch', display: 'block', marginBottom: 12 }}>{s.summary}</span>
                    <span className="tags mono">
                      {s.tags.slice(0, 4).map((t) => <span className="tag-chip" key={t}>{t}</span>)}
                    </span>
                  </span>
                  <span style={{ justifySelf: 'start' }}><StatusBadge status={s.status} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p style={{ marginTop: 'clamp(28px, 3.5vw, 44px)' }}>
            <Link className="link mono" href="/research/">All research <span className="arrow" aria-hidden>→</span></Link>
          </p>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------ roadmap preview -- */}
        <section className="shell" style={{ paddingBlock: 'clamp(64px, 9vw, 130px)' }}>
          <SectionLabel index="04">Roadmap</SectionLabel>
          <div className="rows">
            {roadmapPreview.map((m, i) => (
              <Reveal as="div" key={m.stage} delay={i * 60}>
                <div className="row row-3">
                  <span className="mono dimmer">Stage {String(m.stage).padStart(2, '0')}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 8 }}>{m.title}</span>
                    <span className="dim" style={{ maxWidth: '58ch', display: 'block' }}>{m.description}</span>
                  </span>
                  <span style={{ justifySelf: 'start' }}><StatusBadge status={m.status} /></span>
                </div>
              </Reveal>
            ))}
          </div>
          <p style={{ marginTop: 'clamp(28px, 3.5vw, 44px)' }}>
            <Link className="link mono" href="/roadmap/">Full roadmap <span className="arrow" aria-hidden>→</span></Link>
          </p>
        </section>

        <hr className="rule" />

        {/* -------------------------------------------------- latest note ---- */}
        {latest ? (
          <section className="shell" style={{ paddingBlock: 'clamp(64px, 9vw, 130px)' }}>
            <SectionLabel index="05">Latest lab note</SectionLabel>
            <Reveal>
              <div className="stack-m">
                <div className="mono dimmer">{latest.date} · {latest.category.replace('-', ' ')}</div>
                <h3 style={{ maxWidth: '24ch' }}>{latest.title}</h3>
                <p className="dim">{latest.excerpt}</p>
                <Link className="link mono" href="/updates/">All lab notes <span className="arrow" aria-hidden>→</span></Link>
              </div>
            </Reveal>
          </section>
        ) : null}

        <hr className="rule" />

        {/* -------------------------------------------------- collaborate ---- */}
        <section className="shell" style={{ paddingBlock: 'clamp(72px, 11vw, 160px)' }}>
          <Reveal>
            <p className="mono dimmer" style={{ marginBottom: 20 }}>Collaborate</p>
            <h2 style={{ maxWidth: '17ch', marginBottom: 'clamp(22px, 3vw, 36px)' }}>
              Most of this is unfinished, which is the interesting part.
            </h2>
            <p className="lede" style={{ marginBottom: 'clamp(26px, 3.4vw, 40px)' }}>
              If you work on ear-EEG, biosignal separation, low-channel decoding, wearable
              electronics or technology adoption — or you think something here is wrong — that is
              a useful conversation.
            </p>
            <Link className="link mono" href="/contact/">
              Get in touch <span className="arrow" aria-hidden>→</span>
            </Link>
          </Reveal>
        </section>
      </div>
    </>
  );
}
