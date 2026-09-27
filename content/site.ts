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
  url: 'https://cerebral.example',
  email: 'research@cerebral.example',
  repo: '',
  /** Secondary links. Empty href renders as a disabled placeholder. */
  links: [
    { label: 'GitHub', href: '' },
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
  disclaimer:
    'Cerebral is a research and education project. Nothing on this site is a medical device, a diagnosis, or a treatment claim.',
} as const;
