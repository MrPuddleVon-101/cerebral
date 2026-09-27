import type { Experiment, ModelCard } from '@/lib/types';

/**
 * Model cards (PRD §6.2). Every field is present even when the answer is
 * "not decided yet" — an empty field would read as an omission, and a
 * fabricated one would be worse.
 */
export const models: ModelCard[] = [
  {
    id: 'baseline-csp-lda',
    name: 'Classical baseline',
    version: 'v0 · planned',
    purpose:
      'Reference point for every other model. Spatial filtering followed by a linear classifier, on the full montage and on each reduced configuration.',
    inputs: 'Band-pass filtered epochs. Channel set varies by condition. Window length to be fixed at pre-registration.',
    architecture: 'Spatial filtering (CSP-family) into a linear discriminant classifier.',
    trainingData: 'Public EEG/EMG datasets, not yet selected.',
    evaluation: 'Subject-dependent and subject-independent splits reported separately.',
    ablations: 'Channel count sweep; EMG suppressed versus retained.',
    limitations:
      'Linear methods set a floor, not a ceiling. A weak baseline would make every later model look better than it is, so this one is tuned honestly.',
    reproducibility: [
      { label: 'Code', kind: 'code', available: false, note: 'with the manuscript' },
    ],
    status: 'planned',
    relatedStudy: 'ear-eeg-emg-separation',
  },
  {
    id: 'conv-decoder',
    name: 'Convolutional decoder',
    version: 'v0 · planned',
    purpose:
      'Learns spatial and temporal filters directly from the epoch rather than relying on hand-designed features.',
    inputs: 'Raw or minimally filtered multichannel epochs.',
    architecture: 'Compact convolutional network in the EEGNet/ShallowNet family. Exact configuration to be fixed before training.',
    trainingData: 'Same datasets and splits as the classical baseline.',
    evaluation: 'Identical protocol to the baseline so the comparison means something.',
    ablations: 'Channel count sweep; with and without EMG-dominant components.',
    limitations:
      'Deep models on small EEG datasets overfit readily and are sensitive to preprocessing choices. Subject-independent results are the ones that will be believed.',
    reproducibility: [
      { label: 'Code', kind: 'code', available: false, note: 'with the manuscript' },
    ],
    status: 'planned',
    relatedStudy: 'ear-eeg-emg-separation',
  },
  {
    id: 'separated-fusion',
    name: 'Separated-stream fusion model',
    version: 'v0 · planned',
    purpose:
      'The model the study exists to test. Takes separated EEG-dominant and EMG-dominant streams as distinct inputs and learns to combine them, instead of treating one as noise in the other.',
    inputs: 'Two streams produced by the separation stage, aligned in time.',
    architecture: 'Per-stream encoders with a learned fusion stage. Encoder choice inherited from whichever single-stream model performs best.',
    trainingData: 'Same datasets and splits as the other two models.',
    evaluation: 'Compared against EEG-only, EMG-only and naive-combined at every channel configuration.',
    ablations:
      'Fusion removed; one stream zeroed at inference; separation quality degraded deliberately to test sensitivity.',
    limitations:
      'If separation leaks, the fusion model can appear to benefit from information the streams were supposed to isolate. Leakage checks are part of the protocol rather than an afterthought.',
    reproducibility: [
      { label: 'Code', kind: 'code', available: false, note: 'with the manuscript' },
      { label: 'Notebook', kind: 'notebook', available: false, note: 'after analysis' },
    ],
    status: 'planned',
    relatedStudy: 'ear-eeg-emg-separation',
  },
];

export const experiments: Experiment[] = [
  {
    id: 'exp-01-baseline',
    studySlug: 'ear-eeg-emg-separation',
    hypothesis: 'Full-montage decoding reproduces published performance on the selected dataset within a reasonable margin.',
    dataset: 'To be selected',
    configuration: 'Full montage',
    model: 'Classical baseline',
    metrics: 'Pending',
    status: 'planned',
    date: 'Planned',
  },
  {
    id: 'exp-02-reduction',
    studySlug: 'ear-eeg-emg-separation',
    hypothesis: 'Performance degrades monotonically as channels are removed, with a steeper fall below a small channel count.',
    dataset: 'To be selected',
    configuration: 'Channel sweep down to ear-proximal subset',
    model: 'All three',
    metrics: 'Pending',
    status: 'planned',
    date: 'Planned',
  },
  {
    id: 'exp-03-separation',
    studySlug: 'ear-eeg-emg-separation',
    hypothesis: 'Modelling separated EEG and EMG streams jointly outperforms suppressing EMG, and the gap widens as the array shrinks.',
    dataset: 'To be selected',
    configuration: 'Ear-proximal subset',
    model: 'Separated-stream fusion',
    metrics: 'Pending',
    status: 'planned',
    date: 'Planned',
  },
];
