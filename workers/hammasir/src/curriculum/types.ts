/**
 * Learning-track content. Lessons and quiz answers live in the Worker (not the public static
 * site) so internal strategy material and answers are only served to signed-in personnel.
 */

/** Keep in sync with website-main/lib/hammasir.ts DEPARTMENTS */
export const DEPARTMENTS = ['management', 'hr', 'technical', 'finance', 'sales'] as const;
export type Department = (typeof DEPARTMENTS)[number];

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

export interface Track {
  id: string;
  title: string;
  /** 'all' = every employee; otherwise only that department. */
  audience: 'all' | Department;
  icon: 'compass' | 'briefcase' | 'users' | 'hard-hat' | 'calculator' | 'handshake' | 'sparkles';
  description: string;
  /** "After this track you can…" — the strategy-execution outcomes. */
  outcomes: string[];
  sources: string[];
  modules: Module[];
  capstone: {
    title: string;
    brief: string;
    steps: string[];
    points: number;
  };
}
