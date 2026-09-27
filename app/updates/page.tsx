import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { updates } from '@/content/updates';

export const metadata: Metadata = {
  title: 'Lab notes',
  description:
    'Chronological research log for Cerebral: what changed, what was learned, what failed, and what happens next.',
};

export default function UpdatesPage() {
  return (
    <PageShell>
      <PageHeader
        index="L"
        label="Lab notes"
        title="What changed, what was learned, what failed."
        lede="Short and dated. Posted when there is something to say rather than on a schedule, and allowed to record dead ends — a log that only contains progress is not a log."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(50px, 8vw, 110px)' }}>
        <hr className="rule" />
        {updates.map((u) => (
          <article key={u.date} style={{ paddingBlock: 'clamp(34px, 4.5vw, 66px)', borderBottom: '1px solid var(--rule)' }}>
            <div className="mono dimmer" style={{ marginBottom: 16 }}>
              {u.date} <span className="faint">·</span> {u.category.replace('-', ' ')}
            </div>
            <h2 style={{ fontSize: 'var(--step-2)', maxWidth: '26ch', marginBottom: 'clamp(16px, 2.2vw, 24px)' }}>
              {u.title}
            </h2>
            <div className="stack-s" style={{ maxWidth: '64ch' }}>
              {u.body.map((para) => <p className="dim" key={para}>{para}</p>)}
            </div>
            <div className="tags mono" style={{ marginTop: 'clamp(18px, 2.4vw, 26px)' }}>
              {u.tags.map((t) => <span className="tag-chip" key={t}>{t}</span>)}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
