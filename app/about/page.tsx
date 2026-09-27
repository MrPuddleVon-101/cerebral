import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { SectionLabel } from '@/components/site/ui';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Cerebral is a long-term research project on non-invasive brain-computer interfaces, run in the open, with evidence kept separate from ambition.',
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        index="A"
        label="About"
        title="A research project, run in the open, that may one day be something more."
        lede={site.shortDescription}
      />

      <div className="shell" style={{ paddingBottom: 'clamp(50px, 8vw, 110px)' }}>
        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="01">Mission</SectionLabel>
          <p className="lede">
            Find out whether non-invasive neurotechnology can become small, intelligent and practical
            enough for everyday use — and say so plainly if it cannot.
          </p>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="02">Research philosophy</SectionLabel>
          <div className="rows">
            {[
              ['Signal first', 'Ask what information is physically present before asking what a model can do with it. A great decoder on an empty signal is still nothing.'],
              ['Miniaturisation has a price', 'The question is never whether a device can be built. It is what gets lost on the way down to something wearable, measured rather than assumed.'],
              ['Usefulness is part of the problem', 'A system nobody will wear has not solved anything. Adoption sits inside the research, not after it.'],
              ['Separate evidence from ambition', 'Literature findings, project results, hypotheses and aspirations are four different things and are labelled as four different things.'],
              ['Negative results count', 'If joint EEG-EMG modelling turns out not to help, that is a finding worth publishing, and it changes the roadmap.'],
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
          <SectionLabel index="03">The interdisciplinary chain</SectionLabel>
          <p className="dim" style={{ maxWidth: '64ch' }}>
            Neural engineering leads to AI, which leads to engineering, which leads to adoption, which
            only then leads to any question about a product. Each link has to be justified by the one
            before it. Cerebral is deliberately structured so a result at any stage can invalidate the
            stages after it, rather than being routed around.
          </p>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="04">Who</SectionLabel>
          <dl className="defs mono">
            <div className="def"><dt>Project</dt><dd>{site.name}</dd></div>
            <div className="def"><dt>Author</dt><dd>{site.author}</dd></div>
            <div className="def"><dt>Phase</dt><dd>{site.phase} — {site.phaseDetail}</dd></div>
            <div className="def"><dt>Started</dt><dd>2026</dd></div>
          </dl>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="05">What this site is not</SectionLabel>
          <div className="rows">
            {[
              'A product page. There is no product.',
              'A company site. There is no company.',
              'A medical resource. Nothing here diagnoses, treats or advises.',
              'A claim that a prototype exists. None does.',
            ].map((x) => (
              <div className="row row-2" key={x}>
                <span className="mono dimmer">—</span>
                <span className="dim">{x}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
