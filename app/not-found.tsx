import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell page-top" style={{ paddingBottom: 'clamp(56px, 9vw, 120px)' }}>
      <p className="mono dimmer" style={{ marginBottom: 20 }}>404 — no such route</p>
      <h1 style={{ maxWidth: '16ch' }}>Nothing is recorded at this address.</h1>
      <p className="lede" style={{ marginTop: 'clamp(20px, 2.6vw, 32px)' }}>
        Routes on this site are meant to be stable, so this is either a typo or something that has
        not been written yet.
      </p>
      <p style={{ marginTop: 'clamp(26px, 3.4vw, 40px)' }}>
        <Link className="link mono" href="/">Back to the start <span className="arrow" aria-hidden>→</span></Link>
      </p>
    </div>
  );
}
