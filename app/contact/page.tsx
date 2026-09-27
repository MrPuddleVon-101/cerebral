import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { SectionLabel } from '@/components/site/ui';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Collaborate',
  description:
    'Get in touch about research collaboration, dataset access, technical feedback, hardware or design work on Cerebral.',
};

const REASONS: [string, string][] = [
  ['Research collaboration', 'Ear-EEG, biosignal separation, low-channel decoding, or adoption methods.'],
  ['Dataset access', 'Pointers to public EEG/EMG datasets suitable for reduced-channel work.'],
  ['Technical feedback', 'Especially if you think something here is wrong. That is the most useful message to send.'],
  ['Hardware & electronics', 'Amplifier design, electrode materials, low-power compute, mechanical design.'],
  ['Design & HCI', 'Calibration flows, interaction design, how any of this should feel to use.'],
  ['Competitions & symposiums', 'Invitations or suggestions for where this work should be presented.'],
];

export default function ContactPage() {
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent('Cerebral — collaboration')}`;

  return (
    <PageShell>
      <PageHeader
        index="C"
        label="Collaborate"
        title="Corrections are as welcome as collaborations."
        lede="Cerebral is early enough that an outside opinion still changes the direction. If you work on any part of this — or you think a claim on this site does not hold — that is worth an email."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(50px, 8vw, 110px)' }}>
        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="01">Reasons to get in touch</SectionLabel>
          <div className="rows">
            {REASONS.map(([k, d]) => (
              <div className="row row-2" key={k}>
                <span className="mono dimmer">{k}</span>
                <span className="dim" style={{ maxWidth: '62ch' }}>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(44px, 6vw, 90px)' }}>
          <SectionLabel index="02">Direct</SectionLabel>
          <p className="dim" style={{ marginBottom: 'clamp(22px, 3vw, 32px)', maxWidth: '54ch' }}>
            Email is the whole contact system for now. A form would need a backend and spam handling
            to work properly, and there is no reason to build that before there is traffic to justify
            it.
          </p>
          <a className="link" href={mailto} style={{ fontSize: 'var(--step-2)' }}>
            {site.email} <span className="arrow" aria-hidden>→</span>
          </a>
          <p className="mono faint" style={{ marginTop: 'clamp(24px, 3vw, 36px)', textTransform: 'none', letterSpacing: '0.04em', maxWidth: '52ch' }}>
            Replace this address in content/site.ts with a real one before publishing.
          </p>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="03">Open problems</SectionLabel>
          <div className="empty mono">
            <p style={{ color: 'var(--bone-70)', margin: 0 }}>Coming with Study 01.</p>
            <p className="dimmer" style={{ textTransform: 'none', letterSpacing: '0.03em', marginTop: 14, marginBottom: 0, maxWidth: '58ch' }}>
              A contribute page listing specific unsolved research and engineering problems, so an
              offer of help has something concrete to attach to.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
