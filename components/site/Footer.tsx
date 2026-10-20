import Link from 'next/link';

import { publications } from '@/content/publications';
import { site } from '@/content/site';

export function Footer() {
  // Sections with nothing in them yet are left out of the footer rather than
  // advertised as empty. The routes stay live so links elsewhere keep working.
  const footerNav = site.footerNav.filter(
    (item) => !(item.href === '/publications/' && publications.length === 0),
  );

  return (
    <footer style={{ position: 'relative', zIndex: 2, background: 'var(--void)', marginTop: 'clamp(36px, 5vw, 76px)' }}>
      <hr className="rule" />

      {/* The contact call sits here rather than as its own section: it was
          costing a full screen of empty page above the footer. */}
      <div className="shell footer-cta">
        <div>
          <p className="mono dimmer" style={{ marginBottom: 14 }}>Collaborate</p>
          <h2 className="footer-cta-head">Most of this is unfinished, which is the interesting part.</h2>
        </div>
        <div className="footer-cta-side">
          <p className="dim">
            If you work on ear-EEG, biosignal separation, low-channel decoding, wearable
            electronics or technology adoption, or you think something here is wrong, that is a
            useful conversation.
          </p>
          <Link className="link mono" href="/contact/">
            Get in touch <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <hr className="rule" />
      <div className="shell" style={{ paddingBlock: 'clamp(36px, 5vw, 68px)' }}>
        <div
          className="footer-cols"
        >
          <div className="stack-s">
            <p className="mono dimmer">Sections</p>
            <ul className="footer-sections">
              {footerNav.map((item) => (
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
            <ul className="footer-list">
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

        <hr className="rule" style={{ marginBlock: 'clamp(24px, 3vw, 38px)' }} />

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
