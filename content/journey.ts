import type { JourneyAct } from '@/lib/types';

/**
 * The homepage scroll narrative.
 *
 * Nine beats, each pinned to a stretch of the 3D timeline in
 * components/three/journey/engine.ts.
 *
 * Written for someone who has never heard of a BCI. Short sentences, no jargon
 * without a definition attached, and no claim that Cerebral has found anything,
 * because it has not yet. Everything here is either general background or an
 * explicit statement that something does not exist.
 */
export const journeyActs: JourneyAct[] = [
  {
    index: '00',
    label: 'Cerebral',
    heading: 'Think Beyond.',
    subheading: 'What if you could control technology with nothing but a thought?',
    body: [
      'Cerebral is exploring whether brain\u2013computer interfaces can become small, wearable and practical enough to live around the ear.',
    ],
    readout: [
      { k: 'phase', v: 'research' },
      { k: 'study 01', v: 'being designed' },
      { k: 'results so far', v: 'none' },
    ],
    link: { href: '/research/', label: 'Enter the research' },
  },
  {
    index: '01',
    label: 'The basics',
    heading: 'Your brain runs on electricity.',
    body: [
      'When you think, brain cells fire. That activity is electrical, and a faint trace of it reaches the surface of your head.',
      'A brain-computer interface puts sensors on the skin, picks up that trace, and lets a computer react to it. Nothing goes inside you. It does not read your mind. It measures electrical patterns that may correspond to particular intentions or actions.',
    ],
    readout: [
      { k: 'sensors sit on', v: 'the skin' },
      { k: 'signal size', v: 'millionths of a volt' },
      { k: 'what it reads', v: 'patterns, not thoughts' },
    ],
  },
  {
    index: '02',
    label: 'The problem',
    heading: 'The equipment works. Nobody wants to wear it.',
    body: [
      'Recording brain signals properly means a cap covered in sensors, held on with sticky gel, usually fitted by someone trained to do it.',
      'The data it produces is good. But no one is wearing that to school, to work, or on a train. That single fact is why most of this technology never leaves the lab.',
    ],
    readout: [
      { k: 'sensors', v: '32 to 256' },
      { k: 'setup time', v: 'minutes to an hour' },
      { k: 'wearable daily', v: 'no' },
    ],
    caveat: 'The array shown is a rough illustration, not a real sensor layout.',
  },
  {
    index: '03',
    label: 'The idea',
    heading: 'So put it in your ear.',
    body: [
      'People already wear electronics in their ears all day. Nobody looks twice at a pair of earbuds.',
      'The idea is to shrink the whole system into a small band that sits around one ear. Comfortable, invisible, and wearable for hours. The catch is real though. Far fewer sensors, packed into a small space, sitting further away from most of the brain.',
    ],
    readout: [
      { k: 'sensors', v: 'roughly 4 to 12' },
      { k: 'placement', v: 'around one ear' },
      { k: 'the question', v: 'how much signal survives' },
    ],
    caveat: 'Placement shown is illustrative. Sensors near the ear are not the same as sensors inside it.',
  },
  {
    index: '04',
    label: 'The catch',
    heading: 'Your jaw is louder than your brain.',
    body: [
      'There is a problem with sensing near the ear. Your jaw and face muscles are right there, and the electricity they produce is far stronger than the brain signal underneath.',
      'So what actually arrives at the sensor is a mixture. Brain activity, muscle activity, eye movement, your heartbeat, and the hum of the mains supply in the walls, all stacked on top of each other.',
    ],
    readout: [
      { k: 'brain signal', v: 'small and slow' },
      { k: 'muscle signal', v: 'large and fast' },
      { k: 'also in there', v: 'eyes, heart, movement, mains hum' },
    ],
    caveat: 'These traces are drawn for illustration. They are not recorded data.',
  },
  {
    index: '05',
    label: 'The question',
    heading: 'Everyone throws the muscle away. Should they?',
    body: [
      'The standard approach treats muscle activity as junk and filters it out to leave a cleaner brain signal.',
      'Cerebral is testing whether that is the wrong move for a device worn on the ear. If some of that muscle activity is telling you what the person is trying to do, then deleting it is not cleaning up the signal. It is throwing away half the answer.',
    ],
    readout: [
      { k: 'common practice', v: 'filter the muscle out' },
      { k: 'the hypothesis', v: 'muscle may carry intent' },
      { k: 'study 01', v: 'separate both, then use both' },
    ],
    link: { href: '/research/ear-eeg-emg-separation/', label: 'Read the study design' },
  },
  {
    index: '06',
    label: 'The software',
    heading: 'Teaching software to read the mixture.',
    body: [
      'A model is trained on many examples. It learns to match a short slice of messy signal to whatever the person was doing at the time.',
      'Fewer sensors means less for it to learn from. Two things need measuring. How quickly performance drops as sensors are removed, and whether treating brain and muscle as two separate inputs slows that drop down.',
    ],
    readout: [
      { k: 'input', v: 'a short slice of signal' },
      { k: 'compared', v: 'brain only, muscle only, both' },
      { k: 'measured', v: 'how fast accuracy falls' },
    ],
    caveat: 'This is a diagram of how a layered model is arranged. It is not a trained network.',
  },
  {
    index: '07',
    label: 'The device',
    heading: 'Nothing has been built yet.',
    body: [
      'The goal is something the size of an earbud. A few sensors on the tip that touch the skin inside the ear, a chip to clean up the signal, and enough computing power to be useful on its own.',
      'The shape here is a sketch. It exists to work out what has to fit where, and how far apart the sensors can sit. No hardware has been made, and no number anywhere on this site came from a real device.',
    ],
    readout: [
      { k: 'status', v: 'planned, not built' },
      { k: 'sensor count', v: 'not decided' },
      { k: 'stage', v: 'four on the roadmap' },
    ],
    caveat: 'No working prototype exists. This shape is illustrative.',
    link: { href: '/build/', label: 'See the build section' },
  },
  {
    index: '08',
    label: 'The other half',
    heading: 'Working in a lab is the easy part.',
    body: [
      'A device can be technically perfect and still fail. People will not wear something uncomfortable. They will not trust an app with data from their head. They will not spend twenty minutes setting it up every morning.',
      'So the second study asks people directly. What would you put up with, what would you pay, and how much accuracy would you give up to stop looking like a lab subject?',
    ],
    readout: [
      { k: 'study 02', v: 'planned' },
      { k: 'focus', v: 'mostly people, some technology' },
      { k: 'built on', v: 'results from study 01' },
    ],
    link: { href: '/roadmap/', label: 'See the roadmap' },
  },
];
