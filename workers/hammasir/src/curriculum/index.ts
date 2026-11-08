import type { Department, Module, Question, Track } from './types';
import { strategyTrack } from './strategy';
import { managementTrack } from './management';
import { hrTrack } from './hr';
import { technicalTrack } from './technical';
import { financeTrack } from './finance';
import { salesTrack } from './sales';
import { aiTrack } from './ai';

export * from './types';

/** FNV-1a string hash, used as a stable seed. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Authors tend to put the right answer in the same slot, which makes quizzes guessable.
 * Shuffle each question's options with a seed from its id so the order is random-looking
 * but identical on every request (the served order is the one answers are graded against).
 */
function shuffleOptions(question: Question, seedKey: string): Question {
  let seed = hash(seedKey);
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = question.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer),
  };
}

function withShuffledOptions(track: Track): Track {
  return {
    ...track,
    modules: track.modules.map((module) => ({
      ...module,
      quiz: module.quiz.map((question, i) => shuffleOptions(question, `${module.id}:${i}`)),
    })),
  };
}

/** Display order: the shared strategy track, the department tracks, then AI. */
export const TRACKS: Track[] = [
  strategyTrack,
  managementTrack,
  hrTrack,
  technicalTrack,
  financeTrack,
  salesTrack,
  aiTrack,
].map(withShuffledOptions);

/** Points for a perfect first attempt at a module quiz. */
export const MODULE_POINTS = 40;
/** Share of correct answers needed to pass a module. */
export const PASS_RATIO = 0.7;

const trackById = new Map(TRACKS.map((track) => [track.id, track]));

export function findTrack(id: string): Track | undefined {
  return trackById.get(id);
}

export function findModule(track: Track, moduleId: string): Module | undefined {
  return track.modules.find((module) => module.id === moduleId);
}

/** Shared tracks for everyone, plus the employee's own department track. */
export function canAccess(track: Track, department: Department | null): boolean {
  return track.audience === 'all' || track.audience === department;
}
