import type { Milestone } from '@/lib/types';

/**
 * Evidence-building stages (PRD §9.1). Deliberately framed as a sequence of
 * things that have to be demonstrated, not a funding timeline.
 */
export const milestones: Milestone[] = [
  {
    stage: 1,
    title: 'Technical study: reduced-sensor EEG-EMG decoding',
    dateOrRange: '2026 —',
    status: 'in-progress',
    description:
      'Fix the research question, select datasets, build the pipeline, and measure how decoding degrades as the array shrinks toward an ear-based configuration.',
  },
  {
    stage: 2,
    title: 'Adoption-focused follow-up study',
    dateOrRange: 'After stage 1',
    status: 'planned',
    description:
      'Take the measured trade-offs into a study of what people will accept: calibration burden, comfort, visibility, privacy, price.',
  },
  {
    stage: 3,
    title: 'Non-invasive BCI monograph',
    dateOrRange: '2026–28',
    status: 'exploratory',
    description:
      'A long-form synthesis of the field, released in parts. Doubles as the citation backbone for the rest of the project.',
  },
  {
    stage: 4,
    title: 'Prototype architecture and component testing',
    dateOrRange: 'Not started',
    status: 'planned',
    description:
      'Specify and bench-test the sensing path: contacts, amplifier, ADC, power. No enclosure, no wearing, just whether the electronics can see anything.',
  },
  {
    stage: 5,
    title: 'Ear-based prototype iteration',
    dateOrRange: 'Not started',
    status: 'planned',
    description:
      'Physical builds with version pages, each preserving what the previous one got wrong.',
  },
  {
    stage: 6,
    title: 'Competitions, symposiums, external validation',
    dateOrRange: 'Ongoing where relevant',
    status: 'planned',
    description:
      'Put the work in front of people who are paid to find holes in it.',
  },
  {
    stage: 7,
    title: 'Usability and real-world testing',
    dateOrRange: 'Not started',
    status: 'planned',
    description:
      'Only after there is hardware worth testing, and only within whatever ethics and safety review applies.',
  },
  {
    stage: 8,
    title: 'Product definition',
    dateOrRange: 'Conditional',
    status: 'exploratory',
    description:
      'Reached only if the evidence supports it. A technically interesting result is not a product.',
  },
  {
    stage: 9,
    title: 'Funding and accelerator exploration',
    dateOrRange: 'Conditional',
    status: 'exploratory',
    description:
      'Last, not first. Deliberately placed after evidence rather than before it.',
  },
];
