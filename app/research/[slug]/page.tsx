import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageShell } from '@/components/site/PageShell';
import { ArtifactList, Caveat, SectionLabel, StatusBadge } from '@/components/site/ui';
import { getStudy, studies } from '@/content/research';

export function generateStaticParams() {
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) return { title: 'Study not found' };
  return {
    title: study.title,
    description: study.summary,
    openGraph: { title: study.title, description: study.summary },
  };
}

/** Reusable block so every study page has the same shape (PRD §5.2). */
function Block({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return (
    <section style={{ paddingBlock: 'clamp(34px, 4.5vw, 66px)' }}>
      <SectionLabel index={index}>{label}</SectionLabel>
      {children}
    </section>
  );
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) notFound();

  const hasResults = (study.results?.length ?? 0) > 0;

  return (
    <PageShell>
      <div className="shell page-top">
        <p className="mono dimmer" style={{ marginBottom: 22 }}>
          <Link href="/research/" className="link-muted" style={{ borderBottom: 0 }}>Research</Link>
          <span className="faint"> / {study.slug}</span>
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 'clamp(22px, 3vw, 32px)' }}>
          <StatusBadge status={study.status} />
          <span className="badge mono">{study.year}</span>
          <span className="badge mono">{study.type}</span>
        </div>

        <h1 style={{ maxWidth: '22ch' }}>{study.title}</h1>
        <p className="lede" style={{ marginTop: 'clamp(20px, 2.6vw, 32px)' }}>{study.summary}</p>

        <div className="tags mono" style={{ marginTop: 'clamp(20px, 2.6vw, 30px)' }}>
          {study.tags.map((t) => <span className="tag-chip" key={t}>{t}</span>)}
        </div>

        <hr className="rule" style={{ marginTop: 'clamp(36px, 5vw, 66px)' }} />

        <Block index="01" label="Research question">
          <p style={{ fontSize: 'var(--step-1)', fontWeight: 200, maxWidth: '52ch' }}>
            {study.researchQuestion}
          </p>
        </Block>

        <hr className="rule" />

        <Block index="02" label="Why this matters">
          <p className="dim">{study.whyItMatters}</p>
        </Block>

        {study.academicContext ? (
          <>
            <hr className="rule" />
            <Block index="03" label="Academic context">
              <p className="dim">{study.academicContext}</p>
              {(study.citations?.length ?? 0) === 0 ? (
                <div className="placeholder mono" style={{ marginTop: 20 }}>
                  <span className="tag">Not yet</span>
                  <span>Formal citations — added as the research library is compiled</span>
                </div>
              ) : (
                <ul className="stack-s" style={{ marginTop: 20, paddingLeft: 18 }}>
                  {study.citations?.map((c) => (
                    <li key={c.text} className="dim">
                      {c.href ? <a className="link-muted" href={c.href} rel="noreferrer">{c.text}</a> : c.text}
                    </li>
                  ))}
                </ul>
              )}
            </Block>
          </>
        ) : null}

        {study.methods ? (
          <>
            <hr className="rule" />
            <Block index="04" label="Methods">
              <dl className="defs mono">
                {study.methods.map((m) => (
                  <div className="def" key={m.label}>
                    <dt>{m.label}</dt>
                    <dd style={{ textTransform: 'none', letterSpacing: '0.02em' }}>{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          </>
        ) : null}

        {study.experimentDesign ? (
          <>
            <hr className="rule" />
            <Block index="05" label="Experiment design">
              <ol className="rows" style={{ listStyle: 'none', margin: 0, padding: 0, counterReset: 'step' }}>
                {study.experimentDesign.map((step, i) => (
                  <li className="row row-2" key={step}>
                    <span className="mono dimmer">Step {String(i + 1).padStart(2, '0')}</span>
                    <span className="dim">{step}</span>
                  </li>
                ))}
              </ol>
            </Block>
          </>
        ) : null}

        <hr className="rule" />

        <Block index="06" label="Results">
          {hasResults ? (
            <dl className="defs mono">
              {study.results?.map((r) => (
                <div className="def" key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}{r.note ? <span className="faint"> — {r.note}</span> : null}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="stack-m">
              <div className="empty mono">
                <p style={{ color: 'var(--bone-70)', margin: 0 }}>No results.</p>
                <p className="dimmer" style={{ textTransform: 'none', letterSpacing: '0.03em', marginTop: 12, marginBottom: 0 }}>
                  This study has not produced data. Figures, tables and statistics will appear here
                  once analysis is complete and only then.
                </p>
              </div>
              <Caveat>
                Cerebral does not publish placeholder numbers. An empty results section is the
                honest state of a study in design.
              </Caveat>
            </div>
          )}
        </Block>

        <hr className="rule" />

        <Block index="07" label="Limitations">
          <ul className="rows" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {study.limitations.map((l, i) => (
              <li className="row row-2" key={l}>
                <span className="mono dimmer">L{String(i + 1).padStart(2, '0')}</span>
                <span className="dim">{l}</span>
              </li>
            ))}
          </ul>
        </Block>

        {study.implications ? (
          <>
            <hr className="rule" />
            <Block index="08" label="Implications for Cerebral">
              <ul className="rows" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {study.implications.map((im, i) => (
                  <li className="row row-2" key={im}>
                    <span className="mono dimmer">{String(i + 1).padStart(2, '0')}</span>
                    <span className="dim">{im}</span>
                  </li>
                ))}
              </ul>
            </Block>
          </>
        ) : null}

        <hr className="rule" />

        <Block index="09" label="Artifacts">
          <ArtifactList artifacts={study.artifacts} />
        </Block>

        {study.versionHistory ? (
          <>
            <hr className="rule" />
            <Block index="10" label="Version history">
              <dl className="defs mono">
                {study.versionHistory.map((v) => (
                  <div className="def" key={v.date}>
                    <dt>{v.date}</dt>
                    <dd style={{ textTransform: 'none', letterSpacing: '0.02em' }}>{v.note}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          </>
        ) : null}

        {study.related?.length ? (
          <>
            <hr className="rule" />
            <Block index="11" label="Related">
              <div className="rows">
                {study.related.map((slug2) => {
                  const r = getStudy(slug2);
                  if (!r) return null;
                  return (
                    <Link className="row row-3" href={`/research/${r.slug}/`} key={r.slug}>
                      <span className="mono dimmer">{r.year}</span>
                      <span style={{ maxWidth: '48ch' }}>{r.title}</span>
                      <span style={{ justifySelf: 'start' }}><StatusBadge status={r.status} /></span>
                    </Link>
                  );
                })}
              </div>
            </Block>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
