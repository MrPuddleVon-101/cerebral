/**
 * Content schema for Cerebral (PRD §13).
 *
 * Everything the site displays lives in /content as plain data. Pages read from
 * these types and never hard-code research content, so new studies, models,
 * prototypes and updates can be added without touching layout code.
 */

export type Status =
  | 'planned'
  | 'exploratory'
  | 'in-progress'
  | 'analysis'
  | 'manuscript'
  | 'submitted'
  | 'published'
  | 'completed';

export type StudyType =
  | 'technical'
  | 'adoption'
  | 'review'
  | 'monograph'
  | 'experiment';

export type PublicationKind =
  | 'publication'
  | 'preprint'
  | 'report'
  | 'poster'
  | 'competition'
  | 'talk'
  | 'press';

/** A link to a paper, dataset, repo or figure. `available: false` renders as a labelled placeholder. */
export interface Artifact {
  label: string;
  href?: string;
  kind: 'pdf' | 'code' | 'data' | 'poster' | 'slides' | 'doi' | 'notebook' | 'figure';
  available: boolean;
  /** Shown instead of a link when unavailable, e.g. "after manuscript completion". */
  note?: string;
}

export interface Citation {
  text: string;
  href?: string;
}

export interface Study {
  slug: string;
  title: string;
  subtitle?: string;
  status: Status;
  type: StudyType;
  year: string;
  tags: string[];
  /** One sentence: the purpose, or the finding once there is one. */
  summary: string;
  researchQuestion: string;
  whyItMatters: string;
  academicContext?: string;
  methods?: { label: string; value: string }[];
  experimentDesign?: string[];
  /** Only ever populated with verified project results. */
  results?: { label: string; value: string; note?: string }[];
  interpretation?: string;
  limitations: string[];
  implications?: string[];
  artifacts: Artifact[];
  citations?: Citation[];
  related?: string[];
  versionHistory?: { date: string; note: string }[];
}

export interface ModelCard {
  id: string;
  name: string;
  version: string;
  purpose: string;
  inputs: string;
  architecture: string;
  trainingData: string;
  evaluation: string;
  ablations: string;
  limitations: string;
  reproducibility: Artifact[];
  status: Status;
  relatedStudy?: string;
}

export interface Experiment {
  id: string;
  studySlug: string;
  hypothesis: string;
  dataset: string;
  configuration: string;
  model: string;
  metrics: string;
  status: Status;
  date: string;
}

export interface Prototype {
  version: string;
  slug: string;
  date: string;
  objective: string;
  status: Status;
  hardware: string;
  sensors: string;
  electronics: string;
  software: string;
  testResults: string;
  limitations: string;
  nextIteration: string;
}

export interface Update {
  date: string;
  title: string;
  category:
    | 'reading-note' | 'experiment' | 'model' | 'hardware'
    | 'adoption' | 'milestone' | 'competition' | 'publication';
  excerpt: string;
  body: string[];
  tags: string[];
  related?: string[];
}

export interface Milestone {
  stage: number;
  title: string;
  dateOrRange: string;
  status: Status;
  description: string;
  evidence?: Artifact;
}

export interface PublicationEntry {
  kind: PublicationKind;
  title: string;
  venue: string;
  year: string;
  status: Status;
  authors?: string;
  artifacts: Artifact[];
  note?: string;
}

/** One beat of the homepage scroll journey. */
export interface JourneyAct {
  index: string;
  label: string;
  heading: string;
  body: string[];
  /** Small technical annotation rendered in mono beside the act. */
  readout?: { k: string; v: string }[];
  /** Explicit honesty marker where the visual could be mistaken for data. */
  caveat?: string;
  link?: { href: string; label: string };
}
