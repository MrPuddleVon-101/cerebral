import type { Update } from '@/lib/types';

/** Research log. Short, dated, and allowed to record things that did not work. */
export const updates: Update[] = [
  {
    date: '2026-09-27',
    title: 'Research question fixed; site foundation built',
    category: 'milestone',
    excerpt:
      'Study 01’s question is now settled, and this site exists to hold the work as it accumulates.',
    body: [
      'The research question for Study 01 is fixed: how separating and jointly modelling EEG- and EMG-related information affects decoding performance under reduced, ear-based sensor configurations.',
      'This site went up as a structure rather than a showcase. Most sections are scaffolding with labelled placeholders, because there is nothing verified to put in them yet. The intent is that adding a result later is a content change, not a rebuild.',
      'Next: fix the dataset selection, then write the pre-registration before touching a model.',
    ],
    tags: ['milestone', 'site'],
    related: ['ear-eeg-emg-separation'],
  },
  {
    date: '2026-09-20',
    title: 'Reading note: ear-proximal is not ear-EEG',
    category: 'reading-note',
    excerpt:
      'A distinction worth making early, because conflating the two would quietly inflate everything downstream.',
    body: [
      'A recurring temptation in reduced-channel work is to take a handful of scalp electrodes that happen to sit near the ear and describe the result as ear-EEG. The electrode type, the skin contact, the reference placement and the achievable inter-electrode distance are all different in a real around-ear or in-ear array.',
      'Treating a scalp subset as a stand-in gives an upper bound at best. Cerebral will label the distinction everywhere it appears, including on this site.',
    ],
    tags: ['EEG', 'methods'],
    related: ['ear-eeg-emg-separation'],
  },
];
