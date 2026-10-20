'use client';

import { useEffect, useRef, useState } from 'react';
import type { Artifact, Status } from '@/lib/types';

/* ------------------------------------------------------------ status badge */

const STATUS_COPY: Record<Status, { label: string; tone: 'live' | 'done' | 'planned' | 'neutral' }> = {
  planned:      { label: 'Planned',      tone: 'planned' },
  exploratory:  { label: 'Exploratory',  tone: 'planned' },
  'in-progress':{ label: 'In progress',  tone: 'live' },
  analysis:     { label: 'Analysis',     tone: 'live' },
  manuscript:   { label: 'Manuscript',   tone: 'live' },
  submitted:    { label: 'Submitted',    tone: 'neutral' },
  published:    { label: 'Published',    tone: 'done' },
  completed:    { label: 'Completed',    tone: 'done' },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_COPY[status];
  return <span className="badge mono" data-tone={s.tone}>{s.label}</span>;
}

/* -------------------------------------------------------------- section label */

export function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="section-label mono">
      <span className="idx">{index}</span>
      <span className="dim">{children}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- artifacts */

/**
 * Renders a link when the artifact exists and an explicitly labelled
 * placeholder when it does not. Never a dead link (PRD FR-05, FR-14).
 */
export function ArtifactRow({ artifact }: { artifact: Artifact }) {
  if (artifact.available && artifact.href) {
    return (
      <a className="row row-2" href={artifact.href} rel="noreferrer">
        <span className="mono dimmer">{artifact.kind}</span>
        <span className="link" style={{ borderBottom: 0 }}>
          {artifact.label} <span className="arrow" aria-hidden>↗</span>
        </span>
      </a>
    );
  }
  return (
    <div className="placeholder mono">
      <span className="tag">Not yet</span>
      <span>
        {artifact.label}
        {artifact.note ? <span className="faint"> — {artifact.note}</span> : null}
      </span>
    </div>
  );
}

export function ArtifactList({ artifacts }: { artifacts: Artifact[] }) {
  if (artifacts.length === 0) {
    return <p className="dimmer">No artifacts yet.</p>;
  }
  return <div>{artifacts.map((a) => <ArtifactRow key={a.label} artifact={a} />)}</div>;
}

/* ------------------------------------------------------------------- reveal */

/**
 * Fade-and-lift on entry, as a progressive enhancement.
 *
 * Content is visible by default. It is only hidden once JavaScript has
 * confirmed the element starts below the fold, so a failed script, a missing
 * IntersectionObserver or a restored scroll position can never leave a section
 * blank. Inert under prefers-reduced-motion via CSS.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setState('shown'); return; }

    // Already on screen, or the browser restored a position past it: show it
    // now and never animate.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      setState('shown');
      return;
    }

    setState('hidden');
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setState('shown'); io.disconnect(); } },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${className}`}
      data-reveal={state}
      style={{ transitionDelay: state === 'hidden' ? '0ms' : `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------- planned note ---- */

/**
 * A single line standing in for a section that has nothing in it yet. The
 * large dashed panels this replaces made the site look like scaffolding; one
 * labelled line says the same thing without dominating the page.
 */
export function PlannedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="planned-note mono">
      <span className="tag">Planned</span>
      <span>{children}</span>
    </p>
  );
}

/* -------------------------------------------------------------------- empty */

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty stack-s">
      <p className="mono" style={{ color: 'var(--bone-70)' }}>{title}</p>
      {children ? <div className="dimmer" style={{ maxWidth: '58ch' }}>{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------- caveat note */

/** An inline scientific-integrity note. Used wherever a visual could be read as data. */
export function Caveat({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mono"
      style={{
        color: 'var(--bone-46)',
        textTransform: 'none',
        letterSpacing: '0.05em',
        borderLeft: '1px solid var(--rule-strong)',
        paddingLeft: 12,
        margin: 0,
        maxWidth: '52ch',
      }}
    >
      {children}
    </p>
  );
}
