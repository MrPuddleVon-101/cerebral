import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { Caveat, SectionLabel, StatusBadge } from '@/components/site/ui';
import { prototypes } from '@/content/prototypes';

export const metadata: Metadata = {
  title: 'Build',
  description:
    'Hardware concepts for a compact around-ear non-invasive BCI. No prototype has been built; this section documents the specification as it is constrained by the research.',
};

export default function BuildPage() {
  return (
    <PageShell>
      <PageHeader
        index="B"
        label="Build"
        title="No hardware exists. This is the specification taking shape."
        lede="The Build section is where research turns into constraints: how many contacts, where they can physically go, what the electronics have to do. Every prototype will get its own permanent version page, including the ones that fail."
        meta={<Caveat>Early prototypes, when they exist, will be research devices. Not medical products, and not diagnostic tools.</Caveat>}
      />

      <div className="shell" style={{ paddingBottom: 'clamp(50px, 8vw, 110px)' }}>
        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="01">Why around-ear</SectionLabel>
          <div className="rows">
            {[
              ['Discretion', 'Ear-worn electronics are already socially invisible. A scalp cap never will be, and that alone rules out most daily use.'],
              ['Stability', 'The ear gives mechanical anchoring, which matters because electrode movement is one of the largest artefact sources in wearable recording.'],
              ['Continuity', 'A device someone will wear for hours produces a fundamentally different kind of data from one worn for a twenty-minute session.'],
              ['The cost', 'Few contacts, close together, far from most of the cortex. That is the trade being measured in Study 01 rather than assumed away here.'],
            ].map(([k, d]) => (
              <div className="row row-2" key={k}>
                <span className="mono dimmer">{k}</span>
                <span className="dim" style={{ maxWidth: '62ch' }}>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="02">Prototype log</SectionLabel>
          {prototypes.map((p) => (
            <div key={p.slug} style={{ marginBottom: 'clamp(28px, 4vw, 48px)' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 'var(--step-2)' }}>{p.version}</h2>
                <StatusBadge status={p.status} />
                <span className="badge mono">{p.date}</span>
              </div>
              <p className="dim" style={{ maxWidth: '62ch', marginBottom: 24 }}>{p.objective}</p>
              <dl className="defs mono">
                {[
                  ['Hardware', p.hardware],
                  ['Sensors', p.sensors],
                  ['Electronics', p.electronics],
                  ['Software', p.software],
                  ['Test results', p.testResults],
                  ['Limitations', p.limitations],
                  ['Next iteration', p.nextIteration],
                ].map(([k, v]) => (
                  <div className="def" key={k}>
                    <dt>{k}</dt>
                    <dd style={{ textTransform: 'none', letterSpacing: '0.02em' }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="03">Industrial design</SectionLabel>
          <div className="empty mono">
            <p style={{ color: 'var(--bone-70)', margin: 0 }}>No renders yet.</p>
            <p className="dimmer" style={{ textTransform: 'none', letterSpacing: '0.03em', marginTop: 14, marginBottom: 0, maxWidth: '58ch' }}>
              CAD and render galleries will be versioned (V0, V1, …) with old versions preserved, so
              this page becomes an engineering history rather than a showcase of the latest shape.
              The hook geometry on the homepage is an illustration of the constraint, not a design.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
