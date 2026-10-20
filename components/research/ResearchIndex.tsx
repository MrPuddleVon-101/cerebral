'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { StatusBadge } from '@/components/site/ui';
import type { Status, Study } from '@/lib/types';

/**
 * Filterable research index (PRD §5.1, FR-06).
 *
 * Deliberately five filters rather than one per tag. With three outputs in the
 * library, a tag-per-filter bar advertised far more structure than there is
 * content; the full tag vocabulary still lives on each entry and the bar can
 * grow back when the library justifies it.
 */
const ACTIVE: Status[] = ['in-progress', 'analysis', 'manuscript', 'submitted'];
const UPCOMING: Status[] = ['planned', 'exploratory'];

const FILTERS: { id: string; label: string; match: (s: Study) => boolean }[] = [
  { id: 'active',    label: 'Active',    match: (s) => ACTIVE.includes(s.status) },
  { id: 'planned',   label: 'Planned',   match: (s) => UPCOMING.includes(s.status) },
  { id: 'technical', label: 'Technical', match: (s) => s.type === 'technical' },
  { id: 'adoption',  label: 'Adoption',  match: (s) => s.type === 'adoption' },
];

export function ResearchIndex({ studies }: { studies: Study[] }) {
  const [active, setActive] = useState<string | null>(null);

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === active);
    return f ? studies.filter(f.match) : studies;
  }, [studies, active]);

  const activeLabel = FILTERS.find((f) => f.id === active)?.label;

  return (
    <>
      <div
        className="mono"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'clamp(24px, 3vw, 40px)' }}
      >
        <button type="button" className="filter" data-on={active === null} onClick={() => setActive(null)}>
          All ({studies.length})
        </button>
        {FILTERS.map((f) => {
          const n = studies.filter(f.match).length;
          if (n === 0) return null;
          return (
            <button
              key={f.id}
              type="button"
              className="filter"
              data-on={active === f.id}
              onClick={() => setActive(active === f.id ? null : f.id)}
            >
              {f.label} ({n})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="empty mono">Nothing under {activeLabel} yet.</div>
      ) : (
        <div className="rows">
          {shown.map((s) => (
            <Link className="row row-3" key={s.slug} href={`/research/${s.slug}/`}>
              <span className="mono dimmer">{s.year}</span>
              <span>
                <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 10, maxWidth: '46ch' }}>
                  {s.title}
                </span>
                <span className="dim" style={{ display: 'block', maxWidth: '64ch', marginBottom: 12 }}>
                  {s.summary}
                </span>
                <span className="tags mono">
                  {s.tags.map((t) => <span className="tag-chip" key={t}>{t}</span>)}
                </span>
              </span>
              <span style={{ justifySelf: 'start' }}><StatusBadge status={s.status} /></span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
