import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { ArtifactList, SectionLabel, StatusBadge } from '@/components/site/ui';
import { experiments, models } from '@/content/models';

export const metadata: Metadata = {
  title: 'Models and experiments',
  description:
    'Model cards and planned experiments for Cerebral: classical baseline, convolutional decoder, and a separated-stream fusion model over reduced ear-based channel sets.',
};

export default function ModelsPage() {
  return (
    <PageShell>
      <PageHeader
        index="M"
        label="Models & experiments"
        title="Three models, one protocol, no results yet."
        lede="Each card carries the same fields whether or not the answer is flattering. All three are planned: nothing has been trained, and no metric on this page is filled in."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(36px, 5vw, 72px)' }}>
        <hr className="rule" />

        {models.map((m, i) => (
          <section key={m.id} style={{ paddingBlock: 'clamp(28px, 3.8vw, 54px)', borderBottom: '1px solid var(--rule)' }}>
            <SectionLabel index={String(i + 1).padStart(2, '0')}>Model card</SectionLabel>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 'var(--step-2)' }}>{m.name}</h2>
              <span className="badge mono">{m.version}</span>
              <StatusBadge status={m.status} />
            </div>

            <p className="dim" style={{ maxWidth: '62ch', marginBottom: 'clamp(22px, 3vw, 32px)' }}>{m.purpose}</p>

            <dl className="defs mono">
              {[
                ['Inputs', m.inputs],
                ['Architecture', m.architecture],
                ['Training data', m.trainingData],
                ['Evaluation', m.evaluation],
                ['Ablations', m.ablations],
                ['Limitations', m.limitations],
              ].map(([k, v]) => (
                <div className="def" key={k}>
                  <dt>{k}</dt>
                  <dd style={{ textTransform: 'none', letterSpacing: '0.02em' }}>{v}</dd>
                </div>
              ))}
            </dl>

            <div style={{ marginTop: 'clamp(18px, 2.4vw, 28px)' }}>
              <p className="mono dimmer" style={{ marginBottom: 6 }}>Reproducibility</p>
              <ArtifactList artifacts={m.reproducibility} />
            </div>
          </section>
        ))}

        <section style={{ paddingBlock: 'clamp(30px, 4vw, 58px)' }}>
          <SectionLabel index="E">Experiments</SectionLabel>
          <div className="rows">
            {experiments.map((e) => (
              <div className="row row-3" key={e.id}>
                <span className="mono dimmer">{e.id}</span>
                <span>
                  <span className="dim" style={{ display: 'block', maxWidth: '58ch', marginBottom: 10 }}>{e.hypothesis}</span>
                  <span className="mono faint">
                    {e.configuration} · {e.model} · {e.dataset}
                  </span>
                </span>
                <span style={{ justifySelf: 'start' }}><StatusBadge status={e.status} /></span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
