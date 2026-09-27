'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { StatusBadge } from '@/components/site/ui';
import type { Study } from '@/lib/types';

/**
 * Filterable research index (PRD §5.1, FR-06). Filtering is client-side over a
 * static list — there is no search backend and does not need to be one until
 * the library is much larger.
 */
export function ResearchIndex({ studies, tags }: { studies: Study[]; tags: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  const shown = useMemo(
    () => (active ? studies.filter((s) => s.tags.includes(active)) : studies),
    [studies, active],
  );

  return (
    <>
      <div
        className="mono"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'clamp(26px, 3.4vw, 44px)' }}
      >
        <button type="button" className="filter" data-on={active === null} onClick={() => setActive(null)}>
          All ({studies.length})
        </button>
        {tags.map((t) => {
          const n = studies.filter((s) => s.tags.includes(t)).length;
          return (
            <button
              key={t}
              type="button"
              className="filter"
              data-on={active === t}
              onClick={() => setActive(active === t ? null : t)}
            >
              {t} ({n})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="empty mono">Nothing tagged {active} yet.</div>
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
