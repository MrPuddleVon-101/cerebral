import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { Caveat, SectionLabel } from '@/components/site/ui';

export const metadata: Metadata = {
  title: 'Technology',
  description:
    'How Cerebral thinks about sensing and computation: EEG, EMG, around-ear configurations, and what a decoder can and cannot infer from a low-channel recording.',
};

export default function TechnologyPage() {
  return (
    <PageShell>
      <PageHeader
        index="T"
        label="Technology"
        title="What the sensors can see, and what a model can do with it."
        lede="Two layers. The signal layer is physics and physiology: what reaches an electrode and in what state. The model layer is what can be recovered from it. Conflating the two is how neurotechnology gets oversold."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(50px, 8vw, 110px)' }}>
        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="01">Signal layer</SectionLabel>
          <div className="rows">
            {[
              {
                k: 'EEG',
                t: 'Cortical activity, measured through skull and skin',
                d: 'Electrodes on the scalp pick up summed electrical activity from large populations of neurons. By the time it reaches the surface it is small — commonly tens of microvolts — spatially blurred by the tissue in between, and sitting in a world of larger electrical noise.',
              },
              {
                k: 'EMG',
                t: 'Muscle activity, much larger and much closer',
                d: 'Jaw, facial and neck muscles generate their own electrical activity, typically far larger than EEG and concentrated in higher frequencies. Near the ear it is unavoidable. Whether it is only interference, or also a source of intent, is an open question Cerebral treats as a question rather than a settled matter.',
              },
              {
                k: 'Around-ear',
                t: 'Discreet placement, heavily reduced coverage',
                d: 'Putting electrodes in and around the ear buys comfort, discretion and the possibility of all-day wear. It costs spatial coverage: a small number of closely spaced contacts, positioned far from much of the cortex, with a different noise profile from a scalp montage.',
              },
              {
                k: 'The mixture',
                t: 'What actually reaches the amplifier',
                d: 'A real recording is a superposition: cortical activity, muscle activity, eye movement, cardiac artefact, electrode and cable movement, and mains interference. Separating these is a large part of the problem, not a preprocessing footnote.',
              },
            ].map((x) => (
              <div className="row row-3" key={x.k}>
                <span className="mono dimmer">{x.k}</span>
                <span>
                  <span style={{ display: 'block', fontSize: 'var(--step-1)', marginBottom: 10, maxWidth: '40ch' }}>{x.t}</span>
                  <span className="dim" style={{ display: 'block', maxWidth: '64ch' }}>{x.d}</span>
                </span>
                <span />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'clamp(26px, 3.4vw, 40px)' }}>
            <Caveat>
              Amplitude ranges above are general background from the EEG literature, not Cerebral
              measurements. Exact figures depend on electrode type, reference, montage and task.
            </Caveat>
          </div>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="02">What a decoder is, precisely</SectionLabel>
          <p className="lede" style={{ marginBottom: 'clamp(24px, 3vw, 38px)' }}>
            A decoder maps a short window of multichannel voltage onto a label. That is the whole
            operation. It is not reading language, and it is not reading thought.
          </p>
          <p className="dim" style={{ maxWidth: '64ch' }}>
            Different BCI tasks are routinely spoken about as if they were one capability. They are
            not. Silent speech, attempted articulation, motor imagery, evoked-potential selection and
            cognitive-state estimation differ in what the user does, what the signal contains, how much
            training data is needed, and how well any of it transfers to a new person. Cerebral names
            the task wherever it makes a claim.
          </p>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="03">Models</SectionLabel>
          <p className="dim" style={{ marginBottom: 'clamp(22px, 3vw, 34px)', maxWidth: '58ch' }}>
            Every significant computational model gets a model card with the same fields, including
            the uncomfortable ones.
          </p>
          <Link className="link mono" href="/technology/models/">
            Model cards and experiments <span className="arrow" aria-hidden>→</span>
          </Link>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(40px, 5.5vw, 80px)' }}>
          <SectionLabel index="04">Interactive demos</SectionLabel>
          <div className="empty mono">
            <p style={{ color: 'var(--bone-70)', margin: 0 }}>Planned, not built.</p>
            <p className="dimmer" style={{ textTransform: 'none', letterSpacing: '0.03em', marginTop: 14, marginBottom: 0, maxWidth: '58ch' }}>
              The architecture reserves room for an electrode-configuration explorer, an annotated
              signal viewer, a performance-versus-sensor-count chart and a model comparison. None of
              them can exist honestly before there is data to put in them.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
