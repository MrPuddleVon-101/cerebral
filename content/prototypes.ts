import type { Prototype } from '@/lib/types';

/**
 * Prototype log. No hardware exists yet; v0 is a specification, and the page
 * says so rather than dressing a concept up as a build.
 */
export const prototypes: Prototype[] = [
  {
    version: 'v0',
    slug: 'v0',
    date: 'Planned',
    objective:
      'Turn the constraints into a specification: how many contacts, where they can physically sit on an around-ear hook, and what the amplifier and power budget have to be.',
    status: 'planned',
    hardware: 'Not built. Around-ear hook form factor under consideration.',
    sensors: 'Contact count to be set by the sensor-reduction curve from Study 01.',
    electronics: 'Amplifier, ADC, microcontroller and wireless link — not yet specified.',
    software: 'Companion interface, calibration flow and privacy controls — concept stage.',
    testResults: 'None. No hardware has been tested.',
    limitations:
      'Every dimension on this page is indicative. Nothing here has been fabricated, worn or measured.',
    nextIteration:
      'Component selection and bench testing of the amplifier path, once the target contact count is known.',
  },
];
