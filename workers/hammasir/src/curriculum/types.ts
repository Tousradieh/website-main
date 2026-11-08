/**
 * Learning-track content. Lessons and quiz answers live in the Worker (not the public static
 * site) so internal strategy material and answers are only served to signed-in personnel.
 */

/**
 * The eight organisational units of the campaign document (v2).
 * Keep in sync with website-main/lib/hammasir.ts DEPARTMENTS.
 */
export const DEPARTMENTS = ['technical', 'plants', 'machinery', 'finance', 'sales', 'hr', 'rnd', 'strategy'] as const;
export type Department = (typeof DEPARTMENTS)[number];

/** Who a track is for: everyone, managers/supervisors (a role), or one unit. */
export type Audience = 'all' | 'managers' | Department;

/** Wallet share a track's points count towards (document v2: 20% / 20% / 60%). */
export type Share = 'knowledge' | 'ai';

export type Perspective = 'learning' | 'process' | 'customer' | 'financial';

export interface Question {
  q: string;
  options: string[];
  /** 0-based index of the correct option */
  answer: number;
  /** Shown after submission: why the answer is right. */
  explain: string;
}

export interface Section {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Module {
  id: string;
  title: string;
  /** Campaign week the module unlocks (1–13). */
  week: number;
  minutes: number;
  summary: string;
  sections: Section[];
  keyPoints: string[];
  /** One concrete thing to do at work this week. */
  action: string;
  quiz: Question[];
}

export interface Capstone {
  title: string;
  brief: string;
  steps: string[];
  points: number;
}

export interface Track {
  id: string;
  title: string;
  audience: Audience;
  share: Share;
  icon:
    | 'compass'
    | 'briefcase'
    | 'users'
    | 'hard-hat'
    | 'calculator'
    | 'handshake'
    | 'sparkles'
    | 'factory'
    | 'truck'
    | 'flask'
    | 'target';
  description: string;
  /** "After this track you can…" — the strategy-execution outcomes. */
  outcomes: string[];
  /** Cause-and-effect chain from the unit's daily work up to the company's results (Sears learning map). */
  learningMap?: { perspective: Perspective; text: string }[];
  /** The unit's real-system tasks that earn mission points (60% share), entered by admins. */
  operationalTasks?: string[];
  sources: string[];
  modules: Module[];
  capstone: Capstone;
  /** Alternative final assignment per unit or for managers (used by the AI track). */
  capstoneVariants?: Partial<Record<Department | 'managers', Omit<Capstone, 'points'>>>;
}
