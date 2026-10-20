import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { Caveat, PlannedNote, SectionLabel } from '@/components/site/ui';

export const metadata: Metadata = {
  title: 'Adoption',
  description:
    'Whether a technically viable ear-worn BCI is practical enough for real use: comfort, calibration burden, privacy, price, trust and social acceptability.',
};

const DIMENSIONS: [string, string][] = [
  ['Accuracy', 'How often the system is right, and what happens when it is not.'],
  ['Latency', 'How long between intent and response before the interaction stops feeling like control.'],
  ['Calibration', 'How much setup per session, and how often it has to be repeated.'],
  ['Comfort', 'How many hours it can be worn before someone takes it off for reasons unrelated to performance.'],
  ['Discretion', 'Whether it is visible, and whether being seen wearing it carries a cost.'],
  ['Price', 'What someone would pay, against what the device would cost to build.'],
  ['Privacy', 'How people feel about biosignal data leaving their head, and what they believe can be inferred from it.'],
  ['Trust in inference', 'Whether someone believes the model, including when it disagrees with them.'],
  ['Battery', 'Charging burden across a day of continuous wear.'],
  ['Setup', 'Whether a non-expert can put it on correctly without help.'],
  ['Personalisation', 'How much per-user tuning is required, and who does it.'],
  ['Use-case value', 'Communication, accessibility, control, monitoring, productivity — and whether the value clears the burden.'],
  ['Regulation', 'What claims can legally be made, and what changes if any of them become medical.'],
];

export default function AdoptionPage() {
  return (
    <PageShell>
      <PageHeader
        index="A"
        label="Adoption"
        title="Even if it works, does anyone want it?"
        lede="Cerebral is not only a signal-processing project. A system can clear every technical bar and still fail, because the setup is tedious, the device is visible, the data feels sensitive, or the value does not justify the routine."
      />

      <div className="shell" style={{ paddingBottom: 'clamp(36px, 5vw, 72px)' }}>
        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(30px, 4vw, 58px)' }}>
          <SectionLabel index="01">Dimensions under consideration</SectionLabel>
          <div className="rows">
            {DIMENSIONS.map(([k, d]) => (
              <div className="row row-2" key={k}>
                <span className="mono dimmer">{k}</span>
                <span className="dim" style={{ maxWidth: '62ch' }}>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(30px, 4vw, 58px)' }}>
          <SectionLabel index="02">Technical-to-adoption bridge</SectionLabel>
          <p className="lede" style={{ marginBottom: 'clamp(22px, 3vw, 34px)' }}>
            The point of running the technical study first is that the adoption study can then ask
            about real trade-offs instead of invented ones.
          </p>
          <p className="dim" style={{ maxWidth: '64ch' }}>
            Once Study 01 produces a performance-versus-sensor-count curve, that curve becomes the
            attribute levels people are asked to choose between: this much accuracy for this much
            setup time, this many contacts for this much comfort. Until then there is nothing
            defensible to put in front of a participant, which is why this section has structure and
            no findings.
          </p>
          <div style={{ marginTop: 'clamp(22px, 3vw, 32px)' }}>
            <Caveat>
              No survey has been run. No willingness-to-pay, trust or comfort figure appears anywhere
              on this site, and none will until there is data behind it.
            </Caveat>
          </div>
        </section>

        <hr className="rule" />

        <section style={{ paddingBlock: 'clamp(30px, 4vw, 58px)' }}>
          <SectionLabel index="03">Survey dashboard</SectionLabel>
          <PlannedNote>
            A dashboard reporting sample size, participant characteristics, question wording,
            conditions, results, statistics and limitations, in aggregate only. Participant-level
            data will not be published.
          </PlannedNote>
          <p style={{ marginTop: 'clamp(26px, 3.4vw, 40px)' }}>
            <Link className="link mono" href="/research/adoption-of-ear-worn-neurotech/">
              Study 02 design <span className="arrow" aria-hidden>→</span>
            </Link>
          </p>
        </section>
      </div>
    </PageShell>
  );
}
