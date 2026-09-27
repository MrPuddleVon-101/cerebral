import type { Study } from '@/lib/types';

/**
 * Research entries.
 *
 * Nothing in `results` is populated until a verified project result exists.
 * Artifacts with `available: false` render as labelled placeholders — never as
 * dead links, and never as if the artifact already exists.
 */
export const studies: Study[] = [
  {
    slug: 'ear-eeg-emg-separation',
    title: 'Separating and jointly modelling EEG and EMG under reduced, ear-based sensor configurations',
    subtitle: 'Study 01 · flagship technical study',
    status: 'in-progress',
    type: 'technical',
    year: '2026',
    tags: ['EEG', 'EMG', 'AI/ML', 'Signal processing', 'Wearability', 'Technical'],
    summary:
      'Measures how decoding performance changes when EEG- and EMG-related information are separated and then modelled together, as the sensor array is reduced toward an ear-based configuration.',
    researchQuestion:
      'How does separating and jointly modelling EEG- and EMG-related information affect decoding performance under reduced, ear-based wearable sensor configurations?',
    whyItMatters:
      'A wearable BCI cannot carry a full scalp montage, so the practical question is not whether decoding works with 64 electrodes but how fast it degrades on the way down to four or eight. Standard pipelines remove muscle activity as an artefact. On a device sitting beside the jaw, that activity is both unavoidable and possibly informative, which makes "remove it" an assumption worth testing rather than a default worth inheriting.',
    academicContext:
      'Around-ear and in-ear EEG has an established literature covering electrode design, achievable signal quality and the tasks that survive reduced coverage. Separately, there is work on silent-speech and articulation-related decoding where facial EMG carries substantial information. The gap this study addresses sits between them: reduced ear-proximal configurations evaluated with EEG and EMG contributions deliberately separated and then recombined, rather than one treated as noise in the other.',
    methods: [
      { label: 'Data', value: 'Public EEG/EMG datasets. Specific datasets to be fixed at pre-registration.' },
      { label: 'Channel configurations', value: 'Full montage baseline, progressively reduced subsets, ear-proximal subset.' },
      { label: 'Preprocessing', value: 'Band-pass filtering, re-referencing, artefact handling with and without EMG suppression.' },
      { label: 'Separation', value: 'Source-separation and band-limited decomposition to isolate EEG- and EMG-dominant components.' },
      { label: 'Models', value: 'Classical baseline, convolutional baseline, and a fusion model over the separated streams.' },
      { label: 'Evaluation', value: 'Subject-dependent and subject-independent splits, reported separately.' },
      { label: 'Ablations', value: 'EEG-only, EMG-only, naive-combined, separated-and-fused, across each channel configuration.' },
    ],
    experimentDesign: [
      'Fix task, datasets and metrics before any modelling.',
      'Establish a full-montage baseline for each model family.',
      'Reduce the channel set in stages, re-evaluating at each step.',
      'Repeat with EMG suppressed, EMG retained, and EMG modelled as a separate stream.',
      'Report the performance-versus-sensor-count curve for each condition.',
    ],
    results: [],
    limitations: [
      'Ear-proximal scalp electrodes in a public dataset are not the same as true in-ear or cEEGrid recordings. Any finding transfers to real ear hardware only as an upper bound.',
      'Secondary analysis of existing datasets inherits their tasks, populations and recording conditions.',
      'Separation methods do not cleanly partition physiological sources; residual mixing is expected and will be reported rather than assumed away.',
      'Subject-independent performance is the number that matters for a real device and is usually much worse than subject-dependent performance.',
    ],
    implications: [
      'A measured degradation curve gives the Build section a defensible target for how few contacts an ear device can carry.',
      'If separated EMG contributes, the hardware requirement changes: contacts have to be placed for muscle as well as cortex.',
      'Whatever curve emerges becomes a realistic attribute set for the adoption study rather than an invented trade-off.',
    ],
    artifacts: [
      { label: 'Pre-registration', kind: 'pdf', available: false, note: 'before analysis begins' },
      { label: 'Paper (PDF)', kind: 'pdf', available: false, note: 'after manuscript completion' },
      { label: 'Analysis code', kind: 'code', available: false, note: 'released with the manuscript' },
      { label: 'Result figures', kind: 'figure', available: false, note: 'after analysis' },
      { label: 'DOI', kind: 'doi', available: false, note: 'on publication' },
    ],
    citations: [],
    related: ['adoption-of-ear-worn-neurotech', 'noninvasive-bci-monograph'],
    versionHistory: [
      { date: '2026-09', note: 'Research question fixed. Dataset selection in progress.' },
    ],
  },
  {
    slug: 'adoption-of-ear-worn-neurotech',
    title: 'What people will actually accept from an ear-worn neural interface',
    subtitle: 'Study 02 · adoption-weighted follow-up',
    status: 'planned',
    type: 'adoption',
    year: '2026–27',
    tags: ['Adoption', 'Economics/Adoption', 'HCI', 'Privacy', 'Planned'],
    summary:
      'Planned study on willingness to adopt ear-worn neurotechnology, using the technical trade-offs measured in Study 01 as the attributes people are asked to choose between.',
    researchQuestion:
      'Which attributes of an ear-worn non-invasive BCI — accuracy, calibration burden, comfort, visibility, price and data handling — most affect willingness to adopt, and how much accuracy would people trade for a reduction in burden?',
    whyItMatters:
      'Most neurotechnology that fails does not fail on accuracy. It fails because the setup is tedious, the device is visible, the data feels sensitive, or the value does not justify the routine. Asking that question with realistic attribute levels, taken from a technical study rather than invented, is what makes the answer worth anything.',
    academicContext:
      'Technology acceptance and discrete-choice methods are well established. Applying them to neural interfaces raises specific issues — perceived sensitivity of neural data, fear of inference beyond what the system can do, and the gap between what a BCI actually decodes and what people assume it decodes.',
    methods: [
      { label: 'Design', value: 'Survey with a discrete-choice or conjoint component. To be finalised.' },
      { label: 'Attributes', value: 'Drawn from Study 01 results so the levels presented are achievable, not hypothetical.' },
      { label: 'Analysis', value: 'Descriptive results, choice modelling, and segmentation if the sample supports it.' },
      { label: 'Ethics', value: 'Aggregate reporting only. No participant-level data published.' },
    ],
    results: [],
    limitations: [
      'Stated preference is not revealed preference. People routinely say they would adopt things they then do not adopt.',
      'Cannot begin in a meaningful form until Study 01 produces attribute levels.',
      'Sample composition will constrain how far any result generalises, and will be reported plainly.',
    ],
    implications: [
      'Sets which technical trade-offs are worth optimising and which are irrelevant to a user.',
      'Informs whether calibration time or accuracy is the binding constraint on the device roadmap.',
    ],
    artifacts: [
      { label: 'Instrument', kind: 'pdf', available: false, note: 'drafted after Study 01' },
      { label: 'Aggregated dataset', kind: 'data', available: false, note: 'subject to ethics approval' },
    ],
    related: ['ear-eeg-emg-separation'],
  },
  {
    slug: 'noninvasive-bci-monograph',
    title: 'Non-invasive brain-computer interfaces: a technical synthesis',
    subtitle: 'Long-form monograph',
    status: 'exploratory',
    type: 'monograph',
    year: '2026–28',
    tags: ['Review/Monograph', 'EEG', 'Signal processing', 'AI/ML', 'Planned'],
    summary:
      'A planned long-form synthesis covering EEG and EMG sensing, ear-EEG, electrode design, signal processing, machine learning, hardware, the commercial landscape and regulation.',
    researchQuestion:
      'What is actually established in non-invasive BCI, what is contested, and where does the field consistently overstate what has been demonstrated?',
    whyItMatters:
      'The literature is scattered across neuroscience, signal processing, machine learning, materials and human factors, and the claims made in each do not always survive being read next to each other. Writing the synthesis is also how the rest of Cerebral gets its citations straight.',
    limitations: [
      'Scope is large enough that it will be released in parts rather than as a single finished document.',
      'A synthesis reflects the literature available to its author; coverage gaps will be stated rather than smoothed over.',
    ],
    artifacts: [
      { label: 'Draft chapters', kind: 'pdf', available: false, note: 'released progressively' },
    ],
    related: ['ear-eeg-emg-separation'],
  },
];

export function getStudy(slug: string): Study | undefined {
  return studies.find((s) => s.slug === slug);
}

/** Every tag in use, for the research filter bar. */
export const allTags: string[] = Array.from(
  new Set(studies.flatMap((s) => s.tags)),
).sort();
