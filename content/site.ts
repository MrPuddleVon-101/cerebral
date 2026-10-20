/** Project-level facts. Everything here is meant to be edited directly. */

export const site = {
  name: 'Cerebral',
  wordmark: 'CEREBRAL',
  tagline: 'Think Beyond.',
  thesis:
    'A long-term investigation into whether non-invasive brain-computer interfaces can be made small enough, smart enough and ordinary enough to actually use.',
  shortDescription:
    'Cerebral is a research programme on compact, non-invasive ear-based brain-computer interfaces — EEG and EMG sensing, AI decoding, wearable engineering, and whether any of it survives contact with real life.',
  author: 'Vedant Rastogi',
  affiliation: 'Cerebral Intelligence',
  /** Shown as the live status chip in the header and hero. */
  phase: 'Research phase',
  phaseDetail: 'Study 01 in research design. No results yet.',
  url: 'https://mrpuddlevon-101.github.io/cerebral',
  email: 'research@cerebral.example',
  repo: '',
  /** Secondary links. Empty href renders as a disabled placeholder. */
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vedant-rastogi-a9959938b' },
    { label: 'GitHub', href: 'https://github.com/MrPuddleVon-101' },
    { label: 'Google Scholar', href: '' },
    { label: 'ORCID', href: '' },
  ],
  nav: [
    { href: '/research/', label: 'Research' },
    { href: '/technology/', label: 'Technology' },
    { href: '/build/', label: 'Build' },
    { href: '/adoption/', label: 'Adoption' },
    { href: '/roadmap/', label: 'Roadmap' },
    { href: '/about/', label: 'About' },
  ],
  footerNav: [
    { href: '/research/', label: 'Research' },
    { href: '/technology/', label: 'Technology' },
    { href: '/technology/models/', label: 'Models' },
    { href: '/build/', label: 'Build' },
    { href: '/adoption/', label: 'Adoption' },
    { href: '/roadmap/', label: 'Roadmap' },
    { href: '/publications/', label: 'Publications' },
    { href: '/updates/', label: 'Lab notes' },
    { href: '/about/', label: 'About' },
    { href: '/contact/', label: 'Collaborate' },
  ],
  /**
   * Founder section.
   *
   * `location` and `background` are deliberately empty. Neither the linked
   * LinkedIn profile (login-walled) nor the GitHub profile (no bio, no
   * location, no affiliation) states them publicly, so nothing is filled in
   * here on guesswork. Set them and they appear; leave them and the rows are
   * omitted rather than shown blank.
   */
  founder: {
    linkedin: 'https://www.linkedin.com/in/vedant-rastogi-a9959938b',
    github: 'https://github.com/MrPuddleVon-101',
    location: '',
    background: '',
    focus: 'Study 01 — EEG and EMG under reduced, ear-based sensor configurations',
    status: 'Research design. No results yet.',
    intro: [
      'I am a student researcher working across neural engineering, machine learning and technology adoption. I started Cerebral because of a gap that kept turning up in the reading: EEG setups that produce good data need a cap, gel and someone trained to fit them, and the ones you could actually wear produce far less.',
      'How steep that trade-off gets once the array shrinks to what fits around one ear is not something I could find measured. Study 01 asks whether separating brain and muscle signals, then modelling them together, survives that reduction. It is in research design, with no results yet.',
      'The reading, the models, the hardware plan and this site are all mine. That is the constraint the roadmap is built around, and the reason nothing here claims more than it can show.',
    ],
  },

  disclaimer:
    'Cerebral is a research and education project. Nothing on this site is a medical device, a diagnosis, or a treatment claim.',
} as const;
