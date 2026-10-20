import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { EmptyState, StatusBadge } from '@/components/site/ui';
import { publications } from '@/content/publications';

export const metadata: Metadata = {
  title: 'Publications and presentations',
  description:
    'Record of Cerebral publications, preprints, technical reports, posters, competitions and talks. Currently empty.',
};

export default function PublicationsPage() {
  return (
    <PageShell>
      <PageHeader
        index="P"
        label="Publications & presentations"
        title="Nothing here yet."
        lede="This page exists so the first real entry has somewhere to go. It will record publications, preprints, technical reports, posters, competitions and talks — each with its venue, status and artifacts, and each kept distinct from the others."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(36px, 5vw, 72px)' }}>
        <hr className="rule" />
        <div style={{ paddingTop: 'clamp(36px, 5vw, 64px)' }}>
          {publications.length === 0 ? (
            <EmptyState title="No publications, preprints, posters or talks to date.">
              <p style={{ margin: 0 }}>
                Cerebral has not published, presented or submitted anything. When that changes, entries
                will appear here with an explicit status — preprint, working paper, technical report,
                competition submission and peer-reviewed publication are different things, and this
                page will keep them apart rather than merging them into a single list of achievements.
              </p>
            </EmptyState>
          ) : (
            <div className="rows">
              {publications.map((p) => (
                <div className="row row-3" key={p.title}>
                  <span className="mono dimmer">{p.year}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 8 }}>{p.title}</span>
                    <span className="dim">{p.venue}</span>
                  </span>
                  <span style={{ justifySelf: 'start' }}><StatusBadge status={p.status} /></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
