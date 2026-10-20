import type { Metadata } from 'next';

import { PageHeader } from '@/components/site/PageHeader';
import { PageShell } from '@/components/site/PageShell';
import { ResearchIndex } from '@/components/research/ResearchIndex';
import { studies } from '@/content/research';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Studies, reports and research questions behind Cerebral: reduced-sensor EEG-EMG decoding, adoption of ear-worn neurotechnology, and a planned technical synthesis.',
};

export default function ResearchPage() {
  return (
    <PageShell>
      <PageHeader
        index="R"
        label="Research"
        title="Every claim here traces to a question, a method, or a labelled gap."
        lede="Three research outputs are in play. One is active, two are planned. Nothing below reports a result, because no result has been produced yet — and a page that pretended otherwise would be worthless to everyone who reads it."
      />
      <div className="shell" style={{ paddingBottom: 'clamp(36px, 5vw, 72px)' }}>
        <ResearchIndex studies={studies} />
      </div>
    </PageShell>
  );
}
