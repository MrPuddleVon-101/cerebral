import Link from 'next/link';

import { site } from '@/content/site';

export function Footer() {
  return (
    <footer style={{ position: 'relative', zIndex: 2, background: 'var(--void)', marginTop: 'clamp(80px, 12vw, 180px)' }}>
      <hr className="rule" />
      <div className="shell" style={{ paddingBlock: 'clamp(40px, 6vw, 80px)' }}>
        <div
          style={{
            display: 'grid',
            gap: 'clamp(32px, 5vw, 72px)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          }}
        >
          <div className="stack-s">
            <p className="mono dimmer">Sections</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link className="link-muted" href={item.href} style={{ borderBottom: 0 }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="stack-s">
            <p className="mono dimmer">Elsewhere</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
              {site.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a className="link-muted" href={l.href} style={{ borderBottom: 0 }} rel="me noreferrer">
                      {l.label}
                    </a>
                  ) : (
                    <span className="dimmer">
                      {l.label} <span className="mono faint">· not yet</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="stack-s">
            <p className="mono dimmer">Status</p>
            <p className="dim" style={{ margin: 0 }}>{site.phase}</p>
            <p className="dimmer" style={{ margin: 0, fontSize: 'var(--step--1)' }}>{site.phaseDetail}</p>
          </div>

          <div className="stack-s">
            <p className="mono dimmer">Contact</p>
            <Link className="link" href="/contact/">
              Collaborate <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <hr className="rule" style={{ marginBlock: 'clamp(32px, 4vw, 56px)' }} />

        <div
          className="mono dimmer"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 36px', justifyContent: 'space-between' }}
        >
          <span>{site.wordmark} · {site.author}</span>
          <span style={{ maxWidth: '56ch', textTransform: 'none', letterSpacing: '0.04em' }}>
            {site.disclaimer}
          </span>
        </div>
      </div>
    </footer>
  );
}
