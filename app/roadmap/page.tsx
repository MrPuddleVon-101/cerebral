import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { StatusBadge } from '@/components/site/ui';
import { milestones } from '@/content/roadmap';

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Cerebral as a sequence of things that have to be demonstrated: research, adoption study, monograph, prototype, external validation, and only then a product question.',
};

export default function RoadmapPage() {
  return (
    <PageShell>
      <PageHeader
        index="R"
        label="Roadmap"
        title="A sequence of things that have to be shown, in order."
        lede="Not a funding timeline. Each stage exists because the previous one produced a reason for it, and the later stages are explicitly conditional — a technically interesting result is not a product, and a product is not a company."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(50px, 8vw, 110px)' }}>
        <hr className="rule" />
        <ol className="rows" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {milestones.map((m) => (
            <li className="row row-3" key={m.stage}>
              <span className="mono dimmer">Stage {String(m.stage).padStart(2, '0')}</span>
              <span>
                <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 10, maxWidth: '42ch' }}>{m.title}</span>
                <span className="dim" style={{ display: 'block', maxWidth: '62ch', marginBottom: 10 }}>{m.description}</span>
                <span className="mono faint">{m.dateOrRange}</span>
              </span>
              <span style={{ justifySelf: 'start' }}><StatusBadge status={m.status} /></span>
            </li>
          ))}
        </ol>

        <div className="mono dimmer" style={{ marginTop: 'clamp(30px, 4vw, 52px)', display: 'grid', gap: 8, maxWidth: '64ch' }}>
          <p style={{ margin: 0, textTransform: 'none', letterSpacing: '0.04em' }}>
            <strong style={{ color: 'var(--bone-70)' }}>Completed</strong> — evidence exists and is linked.
            <br />
            <strong style={{ color: 'var(--bone-70)' }}>In progress</strong> — active, with a defined next milestone.
            <br />
            <strong style={{ color: 'var(--bone-70)' }}>Planned</strong> — intended, not started.
            <br />
            <strong style={{ color: 'var(--bone-70)' }}>Exploratory</strong> — an interesting direction, not a commitment.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
