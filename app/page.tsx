import Link from 'next/link';

import { AuthorPortrait } from '@/components/three/AuthorPortrait';
import { Journey } from '@/components/three/Journey';
import { Reveal, SectionLabel, StatusBadge } from '@/components/site/ui';
import { site } from '@/content/site';
import { studies } from '@/content/research';

/**
 * The homepage is the journey. Everything below it is a short landing strip:
 * what is being worked on, where the research lives, who is behind it.
 * The detail belongs on the section pages, not stacked here.
 */
export default function HomePage() {
  const flagship = studies[0];
  const preview = studies.slice(0, 3);

  return (
    <>
      <Journey />

      <div className="after-journey">
        <hr className="rule" />

        {/* ---------------------------------------------- flagship study ---- */}
        <section className="shell" style={{ paddingBlock: 'clamp(42px, 5.6vw, 78px)' }}>
          <SectionLabel index="01">Currently</SectionLabel>
          <Reveal>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 'clamp(18px, 2.4vw, 28px)' }}>
              <StatusBadge status={flagship.status} />
              <span className="badge mono">{flagship.year}</span>
              <span className="badge mono">Study 01</span>
            </div>
            <p className="lede" style={{ fontSize: 'var(--step-2)', fontWeight: 300, maxWidth: '26ch', color: 'var(--bone)' }}>
              {flagship.researchQuestion}
            </p>
            <p style={{ marginTop: 'clamp(24px, 3vw, 36px)' }}>
              <Link className="link mono" href={`/research/${flagship.slug}/`}>
                Study design, methods and limitations <span className="arrow" aria-hidden>→</span>
              </Link>
            </p>
          </Reveal>
        </section>

        <hr className="rule" />

        {/* -------------------------------------------- research library ----- */}
        <section className="shell" style={{ paddingBlock: 'clamp(42px, 5.6vw, 78px)' }}>
          <SectionLabel index="02">Research</SectionLabel>
          <div className="rows">
            {preview.map((s, i) => (
              <Reveal as="div" key={s.slug} delay={i * 70}>
                <Link className="row row-3" href={`/research/${s.slug}/`}>
                  <span className="mono dimmer">{s.year}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 'var(--step-1)', maxWidth: '46ch' }}>{s.title}</span>
                  </span>
                  <span style={{ justifySelf: 'start' }}><StatusBadge status={s.status} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p style={{ marginTop: 'clamp(26px, 3.4vw, 40px)' }}>
            <Link className="link mono" href="/research/">All research <span className="arrow" aria-hidden>→</span></Link>
          </p>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------------- author ---- */}
        <section className="shell author-section">
          <SectionLabel index="03">Founder</SectionLabel>
          <Reveal>
            <div className="founder-grid">
              <div className="founder-portrait">
                <a
                  className="portrait-link"
                  href={site.founder.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${site.author} on LinkedIn`}
                >
                  <AuthorPortrait alt={`${site.author}, founder of Cerebral`} />
                  <span className="portrait-cue mono" aria-hidden>LinkedIn ↗</span>
                </a>
              </div>

              <div className="founder-copy">
                <h2 className="founder-name"><span className="mark">{site.author}</span></h2>
                <p className="mono dimmer founder-role">
                  Founder · {site.affiliation}
                </p>

                {site.founder.intro.map((para) => (
                  <p className="dim" key={para.slice(0, 32)}>{para}</p>
                ))}

                <dl className="defs mono founder-facts">
                  <div className="def">
                    <dt>Current focus</dt>
                    <dd>{site.founder.focus}</dd>
                  </div>
                  <div className="def">
                    <dt>Status</dt>
                    <dd>{site.founder.status}</dd>
                  </div>
                  {site.founder.background ? (
                    <div className="def"><dt>Background</dt><dd>{site.founder.background}</dd></div>
                  ) : null}
                  {site.founder.location ? (
                    <div className="def"><dt>Based in</dt><dd>{site.founder.location}</dd></div>
                  ) : null}
                </dl>

                <div className="founder-links mono">
                  <a href={site.founder.linkedin} target="_blank" rel="noreferrer noopener" className="link">
                    LinkedIn <span className="arrow" aria-hidden>↗</span>
                  </a>
                  <a href={site.founder.github} target="_blank" rel="noreferrer noopener" className="link">
                    GitHub <span className="arrow" aria-hidden>↗</span>
                  </a>
                  <Link href="/about/" className="link">
                    About the project <span className="arrow" aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

      </div>
    </>
  );
}
